package orangle.seniorsync.crm.requestmanagement.projection;


import orangle.seniorsync.crm.requestmanagement.enums.RequestStatus;

import java.time.OffsetDateTime;

/**
 * This is a lightweight view of SeniorRequest, used for interface-based projections.
 *
 * <p>This interface‐based projection ensures that only the fields
 * defined by its getters are selected in the SQL query, which:</p>
 * <ul>
 *   <li>Reduces the number of columns fetched from the database,</li>
 *   <li>Avoids full entity instantiation and expensive ORM mapping,</li>
 *   <li>Minimizes object creation overhead,</li>
 *   <li>Improves throughput and latency on hot read paths in high-QPS services.</li>
 * </ul>
 */
public interface SeniorRequestView {
    Long getId();
    Long getSeniorId();
    Long getAssignedStaffId();
    Long getRequestTypeId();
    String  getTitle();
    String  getDescription();
    Short   getPriority();
    OffsetDateTime getCreatedAt();
    OffsetDateTime getUpdatedAt();
    OffsetDateTime getCompletedAt();
    OffsetDateTime getDueDate();
    RequestStatus getStatus();
}
