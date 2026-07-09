package com.appointmentagent.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class RescheduleRequest {

    @NotNull(message = "New appointment date is required")
    @Future(message = "Appointment date must be in the future")
    private LocalDate newDate;

    @NotNull(message = "New start time is required")
    private LocalTime newStartTime;

    @Size(max = 500, message = "Reason cannot exceed 500 characters")
    private String reason;
}
