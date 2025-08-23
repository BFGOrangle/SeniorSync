package orangle.seniorsync.crm.seniormanagement.spec;

import orangle.seniorsync.common.model.CareLevel;
import org.springframework.data.jpa.domain.Specification;

/**
 * JPA Specifications for CareLevel entity filtering
 */
public class CareLevelSpecs {

    /**
     * Filter care levels by center ID for multi-tenancy
     */
    public static Specification<CareLevel> belongsToCenter(Long centerId) {
        return (root, query, criteriaBuilder) -> {
            if (centerId == null) {
                return criteriaBuilder.conjunction(); // No filter if centerId is null
            }
            return criteriaBuilder.equal(root.get("center").get("id"), centerId);
        };
    }

    /**
     * Filter care levels by care level name (case-insensitive)
     */
    public static Specification<CareLevel> hasCareLevelName(String careLevel) {
        return (root, query, criteriaBuilder) -> {
            if (careLevel == null || careLevel.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.like(
                criteriaBuilder.lower(root.get("careLevel")), 
                "%" + careLevel.toLowerCase().trim() + "%"
            );
        };
    }

    /**
     * Filter care levels by exact care level name (case-insensitive)
     */
    public static Specification<CareLevel> hasExactCareLevelName(String careLevel) {
        return (root, query, criteriaBuilder) -> {
            if (careLevel == null || careLevel.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(
                criteriaBuilder.lower(root.get("careLevel")), 
                careLevel.toLowerCase().trim()
            );
        };
    }

    /**
     * Filter care levels by color
     */
    public static Specification<CareLevel> hasColor(String color) {
        return (root, query, criteriaBuilder) -> {
            if (color == null || color.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("careLevelColor"), color.trim());
        };
    }

    /**
     * Exclude specific care level by ID (useful for update validation)
     */
    public static Specification<CareLevel> excludeId(Long id) {
        return (root, query, criteriaBuilder) -> {
            if (id == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.notEqual(root.get("id"), id);
        };
    }
}
