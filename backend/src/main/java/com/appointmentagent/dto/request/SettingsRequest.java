package com.appointmentagent.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalTime;

@Data
public class SettingsRequest {

    @NotBlank(message = "Business name is required")
    @Size(max = 200)
    private String businessName;

    @Size(max = 500)
    private String businessLogoUrl;

    @Size(max = 500)
    private String businessAddress;

    @Pattern(regexp = "^[+]?[0-9]{7,15}$", message = "Invalid phone number")
    private String businessPhone;

    @Email(message = "Invalid email address")
    private String businessEmail;

    @NotBlank
    private String timezone;

    @Min(5) @Max(480)
    private Integer defaultAppointmentDuration;

    @Min(5) @Max(120)
    private Integer slotIntervalMinutes;

    private LocalTime officeStartTime;

    private LocalTime officeEndTime;

    @Min(1) @Max(365)
    private Integer maxAdvanceBookingDays;

    @Min(0) @Max(168)
    private Integer minCancellationHours;

    @Min(1) @Max(72)
    private Integer reminderHoursBefore;

    private boolean emailNotificationsEnabled;
    private boolean smsNotificationsEnabled;
    private boolean browserNotificationsEnabled;
}
