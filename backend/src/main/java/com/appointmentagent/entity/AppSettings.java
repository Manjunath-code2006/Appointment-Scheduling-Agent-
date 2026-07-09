package com.appointmentagent.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "app_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String businessName;

    @Column(length = 500)
    private String businessLogoUrl;

    @Column(length = 500)
    private String businessAddress;

    @Column(length = 20)
    private String businessPhone;

    @Column(length = 255)
    private String businessEmail;

    @Column(nullable = false)
    @Builder.Default
    private String timezone = "UTC";

    // Default appointment duration in minutes
    @Column(nullable = false)
    @Builder.Default
    private Integer defaultAppointmentDuration = 30;

    // Default slot interval in minutes
    @Column(nullable = false)
    @Builder.Default
    private Integer slotIntervalMinutes = 30;

    // Global office start/end times (overridden by provider working hours)
    @Column(nullable = false)
    @Builder.Default
    private LocalTime officeStartTime = LocalTime.of(9, 0);

    @Column(nullable = false)
    @Builder.Default
    private LocalTime officeEndTime = LocalTime.of(17, 0);

    // Max days in advance that an appointment can be booked
    @Column(nullable = false)
    @Builder.Default
    private Integer maxAdvanceBookingDays = 60;

    // Min hours before appointment that cancellation is allowed
    @Column(nullable = false)
    @Builder.Default
    private Integer minCancellationHours = 24;

    // Reminder hours before appointment
    @Column(nullable = false)
    @Builder.Default
    private Integer reminderHoursBefore = 24;

    @Column(nullable = false)
    @Builder.Default
    private boolean emailNotificationsEnabled = true;

    @Column(nullable = false)
    @Builder.Default
    private boolean smsNotificationsEnabled = false;

    @Column(nullable = false)
    @Builder.Default
    private boolean browserNotificationsEnabled = true;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
