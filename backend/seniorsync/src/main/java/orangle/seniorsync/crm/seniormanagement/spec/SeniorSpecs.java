package orangle.seniorsync.crm.seniormanagement.spec;

import orangle.seniorsync.common.model.Senior;

import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;


/**
 * Specification class for filtering Senior entities based on various criteria.
 * This class provides static methods to create specifications for different fields of the Senior entity.
 */
public class SeniorSpecs {

    /**
     * Filter seniors by center ID for multi-tenant isolation
     * 
     * @param centerId The center ID to filter by
     * @return Specification for center filtering
     */
    public static Specification<Senior> belongsToCenter(Long centerId) {
        return (root, query, cb) ->
                centerId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("center").get("id"), centerId);
    }

    public static Specification<Senior> hasFirstNameLike(String firstName) {
        return (root, query, cb) ->
                firstName == null || firstName.isEmpty()
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("firstName")), "%" + firstName.toLowerCase() + "%");
    }

    public static Specification<Senior> hasLastNameLike(String lastName) {
        return (root, query, cb) ->
                lastName == null || lastName.isEmpty()
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("lastName")), "%" + lastName.toLowerCase() + "%");
    }

    public static Specification<Senior> hasContactPhoneLike(String contactPhone) {
        return (root, query, cb) ->
                contactPhone == null || contactPhone.isEmpty()
                        ? cb.conjunction()
                        : cb.like(root.get("contactPhone"), "%" + contactPhone + "%");
    }

    public static Specification<Senior> hasContactEmailLike(String contactEmail) {
        return (root, query, cb) ->
                contactEmail == null || contactEmail.isEmpty()
                        ? cb.conjunction()
                        : cb.like(cb.lower(root.get("contactEmail")), "%" + contactEmail.toLowerCase() + "%");
    }

    public static Specification<Senior> dateOfBirthBetween(LocalDate minDateOfBirth, LocalDate maxDateOfBirth) {
        return (root, query, cb) -> {
            if (minDateOfBirth == null && maxDateOfBirth == null) {
                return cb.conjunction();
            }
            if (minDateOfBirth != null && maxDateOfBirth != null) {
                return cb.between(root.get("dateOfBirth"), minDateOfBirth, maxDateOfBirth);
            }
            if (minDateOfBirth != null) {
                return cb.greaterThanOrEqualTo(root.get("dateOfBirth"), minDateOfBirth);
            }
            return cb.lessThanOrEqualTo(root.get("dateOfBirth"), maxDateOfBirth);
        };
    }
    public static Specification<Senior> hasCareLevelId(Long careLevelId) {
        return (root, query, cb) ->
                careLevelId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("careLevelId"), careLevelId);
    }

    public static Specification<Senior> hasCharacteristics(String[] characteristics) {
        return (root, query, cb) -> {
            if (characteristics == null || characteristics.length == 0) {
                return cb.conjunction();
            }
            
            // Build OR conditions for each characteristic - a senior matches if they have ANY of the specified characteristics
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            
            for (String characteristic : characteristics) {
                if (characteristic != null && !characteristic.trim().isEmpty()) {
                    String trimmedCharacteristic = characteristic.trim().replaceAll("'", "''");
                    
                    // Use PostgreSQL's JSONB ? operator for exact matching
                    // This is the most reliable approach for JSONB arrays
                    predicates.add(
                        cb.isTrue(
                            cb.function("jsonb_exists", Boolean.class,
                                root.get("characteristics"),
                                cb.literal(trimmedCharacteristic)
                            )
                        )
                    );
                    
                    // Also check for different case variations
                    if (!trimmedCharacteristic.equals(trimmedCharacteristic.toLowerCase())) {
                        predicates.add(
                            cb.isTrue(
                                cb.function("jsonb_exists", Boolean.class,
                                    root.get("characteristics"),
                                    cb.literal(trimmedCharacteristic.toLowerCase())
                                )
                            )
                        );
                    }
                    
                    if (!trimmedCharacteristic.equals(trimmedCharacteristic.toUpperCase())) {
                        predicates.add(
                            cb.isTrue(
                                cb.function("jsonb_exists", Boolean.class,
                                    root.get("characteristics"),
                                    cb.literal(trimmedCharacteristic.toUpperCase())
                                )
                            )
                        );
                    }
                }
            }
            
            return predicates.isEmpty() 
                ? cb.conjunction() 
                : cb.or(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }

    /**
     * Alternative implementation using PostgreSQL's JSONB array functions for more precise matching.
     * This version uses jsonb_array_elements_text to iterate through array elements.
     */
    public static Specification<Senior> hasCharacteristicsExact(String[] characteristics) {
        return (root, query, cb) -> {
            if (characteristics == null || characteristics.length == 0) {
                return cb.conjunction();
            }
            
            var predicates = new java.util.ArrayList<jakarta.persistence.criteria.Predicate>();
            
            for (String characteristic : characteristics) {
                if (characteristic != null && !characteristic.trim().isEmpty()) {
                    // Use EXISTS with jsonb_array_elements_text for precise matching
                    jakarta.persistence.criteria.Expression<Boolean> existsExpression = 
                        cb.function("exists", Boolean.class,
                            cb.literal("(SELECT 1 FROM jsonb_array_elements_text(characteristics) AS elem WHERE LOWER(elem) = LOWER('" + characteristic.trim().replaceAll("'", "''") + "'))")
                        );
                    
                    predicates.add(cb.isTrue(existsExpression));
                }
            }
            
            return predicates.isEmpty() 
                ? cb.conjunction() 
                : cb.or(predicates.toArray(jakarta.persistence.criteria.Predicate[]::new));
        };
    }
}