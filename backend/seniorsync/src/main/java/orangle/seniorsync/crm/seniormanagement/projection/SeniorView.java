package orangle.seniorsync.crm.seniormanagement.projection;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * This is a lightweight view of Senior, used for interface-based projections.
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
public interface SeniorView {
    Long getId();
    String getFirstName();
    String getLastName();
    LocalDate getDateOfBirth();
    String getContactPhone();
    String getContactEmail();
    String getAddress();
    OffsetDateTime getCreatedAt();
    OffsetDateTime getUpdatedAt();
}