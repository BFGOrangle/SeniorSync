package orangle.seniorsync.common.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "staff", schema = "senior_sync")
public class Staff {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @NotBlank
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank
    @Column(name = "last_name", nullable = false)
    private String lastName;

    // Job title (Care Coordinator, Nurse, Administrator, etc.)
    @NotBlank
    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @NotBlank
    @Email
    @Column(name = "contact_email", nullable = false, unique = true)
    private String contactEmail;

    // Authentication fields
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "role_type", nullable = false)
    @ColumnDefault("'STAFF'")
    private RoleType roleType = RoleType.STAFF;

    @NotNull
    @Column(name = "is_active", nullable = false)
    @ColumnDefault("true")
    private Boolean isActive = true;

    @Column(name = "last_login_at")
    private OffsetDateTime lastLoginAt;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime updatedAt;

    // Helper methods for role checking
    public boolean isAdmin() {
        return RoleType.ADMIN == this.roleType;
    }

    public boolean isStaff() {
        return RoleType.STAFF == this.roleType;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}