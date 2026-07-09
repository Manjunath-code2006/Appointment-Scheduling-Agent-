package com.appointmentagent.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.Set;

@Data
public class ProviderRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @Size(max = 150)
    private String specialization;

    @Size(max = 500)
    private String bio;

    @Size(max = 255)
    private String location;

    @Min(value = 0, message = "Buffer minutes cannot be negative")
    @Max(value = 60, message = "Buffer minutes cannot exceed 60")
    private Integer bufferMinutes = 0;

    @Min(value = 1, message = "Max appointments per day must be at least 1")
    @Max(value = 100, message = "Max appointments per day cannot exceed 100")
    private Integer maxAppointmentsPerDay = 20;

    private Set<Long> serviceIds;
}
