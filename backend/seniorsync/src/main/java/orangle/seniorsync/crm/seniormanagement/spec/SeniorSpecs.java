package orangle.seniorsync.crm.seniormanagement.spec;

import orangle.seniorsync.common.model.Senior;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

/**
 * Specification class for filtering Senior entities based on various criteria.
 * This class provides static methods to create specifications for different fields of the Senior entity.
 */
public class SeniorSpecs {

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
}