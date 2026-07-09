package com.appointmentagent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsResponse {
    private Long id;
    private String businessName;
    private String businessLogoUrl;
    private String businessAddress;
    private String businessPhone;
    private String businessEmail;
    private String timezone;
    private Integer defaultAppointmentDuration;
    private Integer slotIntervalMinutes;
    private LocalTime officeStartTime;
    private LocalTime officeEndTime;
    private Integer maxAdvanceBookingDays;
    private Integer minCancellationHours;
    private Integer reminderHoursBefore;
    private boolean emailNotificationsEnabled;
    private boolean smsNotificationsEnabled;
    private boolean browserNotificationsEnabled;
}
