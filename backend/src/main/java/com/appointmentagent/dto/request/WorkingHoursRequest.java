package com.appointmentagent.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Data
public class WorkingHoursRequest {

    @NotNull(message = "Day of week is required")
    private DayOfWeek dayOfWeek;

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    private LocalTime lunchStart;

    private LocalTime lunchEnd;

    /** Use 'working' (not 'isWorking') to avoid Lombok boolean naming ambiguity */
    private boolean working = true;
}
