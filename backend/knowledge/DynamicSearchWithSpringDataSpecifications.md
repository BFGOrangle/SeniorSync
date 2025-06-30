# Dynamic Search with Spring Data Specifications

This guide covers how to implement a single, flexible **Specification**-based search for your `senior_requests` table in Spring Boot, enabling any combination of filters without proliferating repository methods.

---

## 1. **Enable Specifications in the Repository**

```java
@Repository
public interface SeniorRequestRepository
    extends JpaRepository<SeniorRequest, Long>,
            JpaSpecificationExecutor<SeniorRequest> {
  
  // Optional: return projections directly
  List<SeniorRequestView> findAll(Specification<SeniorRequest> spec);
}
```

* \`\` adds `findAll(Specification)`, `count()`, paging, etc.
* You can combine it with interface projections (`SeniorRequestView`) for lean reads.

---

## 2. **Define a Filter DTO**

A record (or class) encapsulating all possible search criteria:

```java
package your.package.dto;

import jakarta.validation.constraints.Min;
import java.time.OffsetDateTime;
import lombok.Builder;

@Builder
public record SeniorRequestFilter(
    RequestStatus status,
    Long seniorId,
    Long assignedStaffId,
    @Min(1) Short minPriority,
    @Min(1) Short maxPriority,
    OffsetDateTime createdAfter,
    OffsetDateTime createdBefore
) {}
```

* Clients pass filter parameters as query strings (e.g. `?status=TODO&minPriority=2`).
* Use `@Builder` to simplify tests and service calls.

---

## 3. **Create Specification Factories**

Utility methods that return `Specification<SeniorRequest>` depending on non-null inputs:

```java
package your.package.spec;

import org.springframework.data.jpa.domain.Specification;
import java.time.OffsetDateTime;

public class SeniorRequestSpecs {

  public static Specification<SeniorRequest> hasStatus(RequestStatus status) {
    return (root, query, cb) ->
      status == null
        ? cb.conjunction()
        : cb.equal(root.get("status"), status);
  }

  public static Specification<SeniorRequest> hasSeniorId(Long seniorId) {
    return (root, query, cb) ->
      seniorId == null
        ? cb.conjunction()
        : cb.equal(root.get("senior").get("id"), seniorId);
  }

  public static Specification<SeniorRequest> priorityBetween(Short min, Short max) {
    return (root, query, cb) -> {
      if (min == null && max == null) return cb.conjunction();
      if (min != null && max != null) return cb.between(root.get("priority"), min, max);
      if (min != null) return cb.greaterThanOrEqualTo(root.get("priority"), min);
      return cb.lessThanOrEqualTo(root.get("priority"), max);
    };
  }

  public static Specification<SeniorRequest> createdInRange(OffsetDateTime after, OffsetDateTime before) {
    return (root, query, cb) -> {
      if (after == null && before == null) return cb.conjunction();
      if (after != null && before != null) return cb.between(root.get("createdAt"), after, before);
      if (after != null) return cb.greaterThanOrEqualTo(root.get("createdAt"), after);
      return cb.lessThanOrEqualTo(root.get("createdAt"), before);
    };
  }

  // Add more specs for other filters as needed
}
```

* \`\` produces a no-op predicate when the filter is absent.
* Each spec is composable via `.and()` / `.or()`.

In each of these `Specification` methods you see the pattern:

```java
return (root, query, cb) ->
    status == null
      ? cb.conjunction()
      : cb.equal(root.get("status"), status);
```

Here’s what’s going on:

1. **Null check (`status == null ? … : …`)**

   * **Purpose**: Only apply a filter when the client actually provided a value. If your `filter.status()` is `null`, you want “no constraint” on that field.
   * **Without it**: If you simply returned `cb.equal(root.get("status"), status)` when `status` is `null`, Hibernate would generate `WHERE status = null`, which in SQL always evaluates to false (`NULL` comparisons are never true), returning an empty result set.

2. **`cb.conjunction()`**

   * **What it returns**: A `Predicate` that always evaluates to true (essentially the SQL equivalent of `1 = 1`).
   * **Why use it**: It’s the neutral element for combining predicates with `AND`—adding an `AND (1=1)` clause changes nothing.
   * **How it works under the hood**: Hibernate turns `cb.conjunction()` into either an empty `WHERE` or a tautology in SQL, ensuring that this part of the `Specification` doesn’t filter anything out.

---

### Putting it together

When you compose multiple specs with:

```java
Specification.where(hasStatus(filter.status()))
             .and(hasSeniorId(filter.seniorId()))
             .and(priorityBetween(filter.minPriority(), filter.maxPriority()));
```

each part:

* Returns a real filtering predicate if its parameter is non-null, e.g. `status = 'TODO'`.
* Returns `cb.conjunction()` (a no-op true predicate) if its parameter is `null`.

So your final SQL `WHERE` clause ends up including only the clauses for which the user actually passed a value, without having to write separate `if`/`else` logic around the entire query.

### Follow up:

```sql
WHERE status = NULL
```

does **not** match rows where `status` is `NULL`. Instead, `status = NULL` yields `UNKNOWN` (not `TRUE`), and only rows for which the predicate is `TRUE` pass the filter. So:

* **`status = NULL`** ⇒ `UNKNOWN` ⇒ row is **excluded**, even if `status` is `NULL`.
* To match `NULL` values you’d have to write **`status IS NULL`** explicitly.

That’s why in our `Specification` we guard against `null` like this:

```java
status == null 
  ? cb.conjunction()                         // no filter at all
  : cb.equal(root.get("status"), status);    // generates "status = ?" only if status!=null
```

If we instead always did `cb.equal(root.get("status"), status)` with `status == null`, Hibernate would generate:

```sql
WHERE status = NULL
```

and return **zero** rows—because even actual `NULL` values don’t satisfy `= NULL`.

---

### Key takeaway

* **`=` vs. `IS NULL`**: `=` never matches `NULL` in SQL.
* **`cb.conjunction()`** is our way of saying “skip this filter entirely” when the parameter is `null`, rather than accidentally generating a filter that always fails.

---

## 4. **Compose Specifications in the Service**

```java
@Service
public class RequestManagementService {
  private final SeniorRequestRepository repo;

  public RequestManagementService(SeniorRequestRepository repo) {
    this.repo = repo;
  }

  public List<SeniorRequestView> searchRequests(SeniorRequestFilter f) {
    Specification<SeniorRequest> spec = Specification
      .where(SeniorRequestSpecs.hasStatus(f.status()))
      .and(SeniorRequestSpecs.hasSeniorId(f.seniorId()))
      .and(SeniorRequestSpecs.priorityBetween(f.minPriority(), f.maxPriority()))
      .and(SeniorRequestSpecs.createdInRange(f.createdAfter(), f.createdBefore()));

    return repo.findAll(spec);
  }
}
```

* **Single method** handles all filters.
* Leverages interface projections for maximum read throughput.

---

## 5. **Expose via Controller**

```java
@RestController
@RequestMapping("/api/senior-requests")
public class SeniorRequestController {
  private final RequestManagementService service;

  @GetMapping
  public List<SeniorRequestView> search(
      @Valid SeniorRequestFilter filter
  ) {
    return service.searchRequests(filter);
  }
}
```

* Spring binds query parameters to `SeniorRequestFilter` automatically.
* One endpoint, infinite filter combinations.

---

## Why Use Specifications?

* **Avoids method explosion**: no need for dozens of `findByXAndY` methods.
* **Flexible**: clients mix any subset of filters.
* **Type-safe**: compile-time checks on field names.
* **Database-driven**: SQL `WHERE` clauses built server-side, efficient pushdown.
* **High-QPS friendly**: when combined with projections, you fetch only needed columns and skip entity overhead.

---

*This pattern is widely used in large-scale Java codebases for clean, maintainable, and performant query APIs.*

---

## Geek Corner: Under the Hood

When you call `repo.findAll(spec)`, Spring Data JPA:

1. **Builds a `CriteriaQuery`**: Internally invokes `entityManager.getCriteriaBuilder()` to obtain a `CriteriaBuilder`, then creates a `CriteriaQuery<SeniorRequest>` and a `Root<SeniorRequest>`.

2. **Invokes your `toPredicate` implementations**: Spring Data recognizes `Specification` as a **functional interface** (exactly one abstract method: `toPredicate(...)`), so you can provide it as a **lambda**:

   ```java
   (root, query, cb) -> cb.equal(root.get("status"), status)
   ```

   or as an **anonymous inner class**:

   ```java
   new Specification<SeniorRequest>() {
     @Override
     public Predicate toPredicate(Root<SeniorRequest> root,
                                  CriteriaQuery<?> query,
                                  CriteriaBuilder cb) {
       return cb.equal(root.get("status"), status);
     }
   }
   ```

   Spring Data will call that `toPredicate` method for each spec, passing in:

   * **`root`**: the query root (`FROM SeniorRequest r`),
   * **`query`**: the `CriteriaQuery` builder,
   * **`cb`**: the `CriteriaBuilder` factory.

   Each call returns a `Predicate`; these are then merged into one `WHERE` clause.

3. **Combines Predicates**: Uses `cb.and(...)` / `cb.or(...)` to merge individual predicates into a single `WHERE` clause expression tree.

4. **SQL Generation**: The JPA provider (e.g. Hibernate) traverses the `CriteriaQuery` tree and generates a parameterized SQL statement, binding filter values via `PreparedStatement` to avoid SQL injection.

5. **Execution & Mapping**: Executes the query, streams the `ResultSet`, and constructs either:

   * **Entity instances** (if not using projections), or
   * **JDK dynamic proxies** / **DTO constructor calls** for interface/constructor projections, minimizing object graph hydration.

### Key API Types

* `CriteriaBuilder` (`cb`): factory for SQL expressions.
* `Root<T>` (`root`): entry point for entity attributes.
* `Predicate`: represents a boolean SQL expression.
* `CriteriaQuery`: encapsulates the full query blueprint.

---

## Performance & Best Practices

* **Predicate short-circuit**: Early `null` checks (`cb.conjunction()`) minimize tree complexity when filters are absent.
* **Index-friendly queries**: Align your `WHERE` predicates (`status`, `created_at` range) with existing DB indexes to leverage index scans or seeks.
* **Paging & sorting**: Always combine Specifications with `PageRequest` to limit result sets and avoid full table scans in high-QPS environments.
* **Benchmarking**: Use Hibernate’s SQL logging and database query plans (`EXPLAIN ANALYZE`) to confirm your dynamically-generated queries remain performant.
* **Avoid N+1 traps**: When mixing Specifications with projections, ensure lazy associations aren’t accidentally triggered; use projections to fetch only scalars.
* **Cache compiled Criteria**: For ultra-hot queries, consider caching the compiled `CriteriaQuery` or using a second‐level query cache to reduce JPA parsing overhead.

*Bring these tips together to master dynamic, efficient search in Spring Data JPA.*

---

## FAQ: Custom Functional Interfaces and Lambdas

**Q:** I see `Specification<T>` is a functional interface so I can write:

```java
(root, query, cb) -> /* predicate logic */
```

Will this lambda syntax work for *any* of my own interfaces?

**A:** Yes—**any Java interface** with exactly one abstract method (a *functional interface*) can be implemented using a lambda or method reference. Behind the scenes:

1. **Functional Interface Contract**: The interface must have a single unimplemented method. You can mark it with `@FunctionalInterface`, but it’s not mandatory.
2. **Lambda Expression Matching**: The compiler matches your lambda’s parameter list and return type to that single method’s signature.
3. **No Lambdas for Multiple Abstract Methods**: Interfaces with more than one abstract method cannot be implemented via lambda and will cause a compile‑time error.
4. **Anonymous Class Alternative**: You can always fall back to:

   ```java
   new MyFilterInterface() {
     @Override
     public boolean test(Foo f) { /* logic */ }
   }
   ```

**Example**: Custom functional interface:

```java
@FunctionalInterface
public interface ValueChecker {
  boolean isValid(String input);
}
```

Lambda implementation:

```java
ValueChecker checker = input -> input != null && input.length() > 0;
```

or anonymous class:

```java
ValueChecker checker = new ValueChecker() {
  @Override
  public boolean isValid(String input) {
    return input != null && !input.isEmpty();
  }
};
```

This same pattern enables Spring Data’s `Specification<T>` lambdas and can be used throughout your own code for concise, inline implementations of any single-method interface.
