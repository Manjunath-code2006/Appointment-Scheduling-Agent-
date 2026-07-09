package com.appointmentagent.dto.request;

import com.appointmentagent.entity.Appointment.AppointmentType;
import com.appointmentagent.entity.Appointment.MeetingPlatform;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class AppointmentRequest {

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Appointment date is required")
    @Future(message = "Appointment date must be in the future")
    private LocalDate appointmentDate;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @Size(max = 1000, message = "Notes cannot exceed 1000 characters")
    private String notes;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;

    private AppointmentType type = AppointmentType.REGULAR;

    private MeetingPlatform meetingPlatform;

    // Customer ID — used by admins; ignored for CUSTOMER role (derived from JWT)
    private Long customerId;
}
