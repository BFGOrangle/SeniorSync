# Mapping Strategies: Interface Projections & MapStruct

This README focuses on two complementary data-mapping techniques optimized for performance and maintainability in high-QPS Spring Boot applications:

1. **Interface Projections**
2. **MapStruct Mappers**

---

## 1. Interface Projections

### What is it?

Spring Data JPA’s interface projection lets you define a Java interface with getter methods matching the columns you need. When you declare a repository method returning that interface, Spring Data generates a lightweight proxy that fetches only those columns and exposes them via the interface.

```java
public interface SeniorRequestView {
  Integer getId();
  Integer getSeniorId();
  String  getTitle();
  RequestStatus getStatus();
}

@Repository
public interface SeniorRequestRepository
    extends JpaRepository<SeniorRequest, Integer> {

  List<SeniorRequestView> findByStatus(RequestStatus status);
}
```

### Why it works

* **SQL-Level Efficiency**: JPA translates the projection into a `SELECT id, senior_id, title, status FROM senior_requests ...`, loading only needed columns.
* **Zero Mapping Code**: No manual `map()` loop or generated code—Spring Data handles proxy creation.
* **Minimal Object Overhead**: Proxy instances are small and contain no unnecessary fields or associations.


## Example
Taking
```java
List<SeniorRequestView> seniorRequests = requestManagementService.findRequestsByStatus(status);
```
as an example, switching your hot read paths from loading full `SeniorRequest` entities to using interface (or constructor) projections can yield **substantially** better throughput and lower latency. Here’s why:

---

## 1. **Reduced SQL payload**

* **Entity load**:

  ```sql
  SELECT 
    r.id, r.senior_id, r.assigned_staff_id, r.request_type_id,
    r.title, r.description, r.priority,
    r.created_at, r.updated_at, r.completed_at, r.status,
    s.*, t.*, /* plus any lazy proxies or joined tables */ …
  FROM senior_requests r
  LEFT JOIN seniors s ON r.senior_id = s.id
  LEFT JOIN request_types t ON r.request_type_id = t.id
  /* Hibernate may also issue separate selects for each lazy association */
  ```
* **Projection**:

  ```sql
  SELECT 
    r.id, r.senior_id, r.assigned_staff_id, r.request_type_id,
    r.title, r.description, r.priority,
    r.created_at, r.updated_at, r.completed_at, r.status
  FROM senior_requests r
  WHERE r.status = ?;
  ```

  **Only** the columns you actually need are sent over the wire, reducing I/O and parsing cost.

---

## 2. **No entity instantiation or change-tracking**

* **Entity**: Hibernate must

  1. Instantiate a `SeniorRequest` object,
  2. Populate *all* its fields via reflection or bytecode-enhanced setters,
  3. Register it in the persistence context,
  4. Take a snapshot for dirty-checking,
  5. Create proxy objects for each lazy association.
* **Projection**: Spring Data hands you a small JDK proxy (or directly constructs a DTO). There’s **no** persistence context entry, **no** dirty-checking, **no** lazy-load proxies.

---

## 3. **Lower GC pressure**

* Full entities + proxies allocate quite a few objects per row.
* Projections allocate exactly one tiny proxy (with a handful of fields) or one DTO record per row.
* Fewer objects means shorter GC pauses and better overall throughput under heavy load.

---

## 4. **Faster in-JVM mapping**

* If you returned entities and then mapped to DTOs via MapStruct or manual loops, you’d pay the full hydration cost **plus** the mapping cost.
* Interface projections **bake the mapping into the SQL result**, so you skip that extra Java-level mapping step entirely.

---

### Bottom line

For **read-only**, **high-QPS** endpoints like `findRequestsByStatus`:

* **Use interface or constructor projections** to push as much work as possible into the database.
* **Avoid full JPA entities** when you don’t need updates or associations.

That pattern is common in large-scale architectures because it measurably **improves throughput**, **reduces latency**, and **lowers resource usage** compared to naively returning entities.


### Best Use Cases

* **Read-Only Endpoints**: Public lists, dashboards, or summary views.
* **High-QPS Queries**: Hot paths where every nanosecond and CPU cycle counts.

### Pros & Cons

| Pros                          | Cons                                       |
| ----------------------------- | ------------------------------------------ |
| Zero boilerplate mapping code | Limited to simple getter projections       |
| Only fetches required columns | Not suitable for nested or computed fields |
| Very low runtime overhead     | Harder to include complex logic            |

---

## 2. MapStruct Mappers

### What is it?

MapStruct is a compile-time code generator for Java bean mappings. You define a mapper interface, and MapStruct generates an implementation with simple getter-to-setter assignments—no reflection at runtime.

```java
@Mapper(componentModel = "spring")
public interface SeniorRequestMapper {
  SeniorRequestDto toDto(SeniorRequest entity);
  SeniorRequest fromCreateCmd(CreateSeniorRequestCmd cmd);
  void updateFromCmd(UpdateSeniorRequestCmd cmd,
                     @MappingTarget SeniorRequest entity);
}
```

### Why it works

* **Compile-Time Generation**: Mappers are generated during build, producing plain Java methods.
* **No Reflection**: Runtime code is identical to hand-written mapping—fast, JIT-friendly, inlineable.
* **Type Safety**: Missing or incompatible mappings surface as compile warnings or errors.

### Best Use Cases

* **Create/Update Workflows**: Converting incoming DTOs (`Create…Cmd`, `Update…Cmd`) into entities for persistence.
* **Complex Mappings**: Combining multiple entities into one DTO or custom field translations.
* **Partial Updates**: Merging DTO payloads into an existing entity instance.

### Pros & Cons

| Pros                                        | Cons                                   |
| ------------------------------------------- | -------------------------------------- |
| High performance (no reflection)            | Requires build-time generation         |
| Compile-time checking of mappings           | Additional dependency and plugin setup |
| Fine-grained customizations via annotations | Overkill for trivial mappings          |

---

## 🚫 Why Not ModelMapper

While **ModelMapper** provides convenient, reflection-based mapping with minimal upfront configuration, it falls short in high-QPS production environments:

* **Runtime Reflection Overhead**: Each `map()` invocation triggers introspection, which can add tens to hundreds of nanoseconds per object—amplified under heavy load.
* **Hidden Mapping Logic**: Implicit conventions can silently skip fields if names change, leading to subtle bugs instead of compile-time errors.
* **Less Predictable Performance**: Reflection-based mapping can vary in speed across JVM versions and heap states, making it harder to optimize and benchmark.
* **Lower Transparency**: When debugging, you can’t easily step through generated code; with MapStruct, the code is plain Java you can inspect and profile.

By contrast, **Interface Projections** and **MapStruct** both produce explicit, reflection-free code paths that are:

* **Deterministic**: Execution time is fixed and measurable.
* **Compile-Time Checked**: Missing or mismatched fields produce build warnings or errors.
* **JIT-Friendly**: Generated methods are candidates for inlining, yielding near-zero mapping overhead.

## Basically (Why use map struct over stuff like object mapper/model mapper or even coding our mapping yourself):
MapStruct sits in a sweet spot between “zero-config reflection mappers” and “hand-rolled boilerplate”:

1. Compile-time code generation vs. reflection
MapStruct generates plain Java mapping methods at build time. There’s no reflection at runtime—just direct field‐to‐field assignments that the JIT can inline.

ModelMapper / Jackson’s ObjectMapper rely on reflection or byte-code tricks at runtime, costing tens–hundreds of nanoseconds per object and making performance unpredictable under load.

2. Type safety & maintainability
MapStruct surfaces unmapped properties as compile-time warnings or errors. If you add a new field to your DTO or entity, the compiler tells you exactly which mappings need updating.

Reflection-based mappers silently skip fields if names don’t match, leading to hard-to-find bugs. Hand-written mapping is type-safe, but every new field means more boilerplate to write and maintain.

3. Boilerplate reduction vs. manual mapping
Manual mapping (dto.setX(entity.getX()); …) is the fastest at runtime and crystal clear, but quickly becomes tedious when you have lots of fields or dozens of DTOs.

MapStruct gives you nearly the same performance profile as manual code (it generates the same setters/getters), but you write only the interface—no tedious copy-paste for every field.

4. Flexibility for complex scenarios
With MapStruct you get easy custom conversions (@Mapping, qualified methods) for special cases without losing performance.

Manual gives ultimate control but at the cost of verbosity.

ModelMapper can handle deep graphs and ad-hoc conversions, but it’s hard to audit or profile.

### TL;DR
>Use MapStruct when you want the performance and clarity of hand-coded mapping without the boilerplate, but also need compile-time checks to keep your mappings in sync as your models evolve.

---

## Hybrid Pattern

Use **Interface Projections** for hot read-only paths, and **MapStruct** for richer create/update flows. This hybrid approach delivers:

* **Raw Throughput**: Read paths avoid entity and mapping overhead entirely.
* **Maintainable Code**: Write paths remain clear, type-safe, and easy to evolve.
* **Scalable Architecture**: Separate simple data retrieval from business-logic mapping.

---

*Optimized for high-performance, type-safe, and maintainable data mapping in Spring Boot services.*
