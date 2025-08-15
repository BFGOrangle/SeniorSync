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

    /**
     * Filter senior requests by center ID for multi-tenant isolation
     * 
     * @param centerId The center ID to filter by
     * @return Specification for center filtering
     */
    public static Specification<SeniorRequest> belongsToCenter(Long centerId) {
        return (root, query, cb) ->
                centerId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("centerId"), centerId);
    }

    public static Specification<SeniorRequest> hasStatus(RequestStatus status) {
        return (root, query, cb) ->
                status == null
                        ? cb.conjunction()
                        :cb.equal(root.get("status"), status);
    }
    public static Specification<SeniorRequest> hasSeniorId(Long seniorId) {
    // NOTE: SeniorRequest stores the foreign key as a scalar field "seniorId" (Long) – there is
    // no JPA association named "senior". Attempting root.get("senior").get("id") caused
    // PathElementException: Could not resolve attribute 'senior'. Use the scalar column instead.
    return (root, query, cb) ->
        seniorId == null
            ? cb.conjunction()
            : cb.equal(root.get("seniorId"), seniorId);
    }

    public static Specification<SeniorRequest> hasAssignedStaffId(Long staffId) {
    // Same reasoning as hasSeniorId: field is stored as scalar "assignedStaffId"
    return (root, query, cb) ->
        staffId == null
            ? cb.conjunction()
            : cb.equal(root.get("assignedStaffId"), staffId);
    }

    public static Specification<SeniorRequest> hasRequestTypeId(Long requestTypeId) {
        return (root, query, cb) ->
                requestTypeId == null
                        ? cb.conjunction()
                        : cb.equal(root.get("requestTypeId"), requestTypeId);
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