package orangle.seniorsync.crm.requestmanagement.spec;

import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;
import orangle.seniorsync.crm.requestmanagement.model.SeniorRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.OffsetDateTime;

/**
 * Specification class for filtering SeniorRequest entities based on various criteria.
 * This class provides static methods to create specifications for different fields of the SeniorRequest entity.
 */
public class SeniorRequestSpecs {

    public static Specification<SeniorRequest> hasStatus(RequestStatus status) {
        return (root, query, cb) ->
                status == null
                        ? cb.conjunction()
                        :cb.equal(root.get("status"), status);
    }
    public static Specification<SeniorRequest> hasSeniorId(Long seniorId) {
        return (root, query, cb) ->
                seniorId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("senior").get("id"), seniorId);
    }

    public static Specification<SeniorRequest> hasAssignedStaffId(Long staffId) {
        return (root, query, cb) ->
                staffId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("assignedStaff").get("id"), staffId);
    }

    public static Specification<SeniorRequest> priorityBetween(Short min, Short max) {
        return (root, query, cb) -> {
            if (min == null && max == null) {
                return cb.conjunction();
            }
            if (min != null && max != null) {
                return cb.between(root.get("priority"), min, max);
            }
            if (min != null) {
                return cb.greaterThanOrEqualTo(root.get("priority"), min);
            }
            return cb.lessThanOrEqualTo(root.get("priority"), max);
        };
    }

    public static Specification<SeniorRequest> createdInRange(OffsetDateTime after, OffsetDateTime before) {
        return (root, query, cb) -> {
            if (after == null && before == null) {
                return cb.conjunction();
            }
            if (after != null && before != null) {
                return cb.between(root.get("createdAt"), after, before);
            }
            if (after != null) {
                return cb.greaterThanOrEqualTo(root.get("createdAt"), after);
            }
            return cb.lessThanOrEqualTo(root.get("createdAt"), before);
        };
    }
}