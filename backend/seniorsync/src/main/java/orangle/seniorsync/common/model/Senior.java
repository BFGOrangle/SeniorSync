package orangle.seniorsync.common.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import orangle.seniorsync.common.converter.StringArrayConverter;

@Getter
@Setter
@Entity
@Table(name = "seniors", schema = "senior_sync")
public class Senior {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "first_name", nullable = false, length = Integer.MAX_VALUE)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = Integer.MAX_VALUE)
    private String lastName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "contact_email")
    private String contactEmail;

    @Column(name = "address", length = Integer.MAX_VALUE)
    private String address;

    @Column(name = "care_level")
    private String careLevel;

    @Column(name = "care_level_color", length = 7)
    private String careLevelColor;

    @Column(name = "characteristics")
    @JdbcTypeCode(SqlTypes.JSON)
    @Convert(converter = StringArrayConverter.class)
    private String[] characteristics;

    @ColumnDefault("now()")
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime createdAt;

    @ColumnDefault("now()")
    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime updatedAt;



}