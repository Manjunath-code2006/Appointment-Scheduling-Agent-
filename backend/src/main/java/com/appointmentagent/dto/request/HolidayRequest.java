package com.appointmentagent.dto.request;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class HolidayRequest {

    @NotBlank(message = "Holiday name is required")
    @Size(max = 150)
    private String name;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Holiday date must be today or in the future")
    private LocalDate date;

    @Size(max = 500)
    private String description;

    private Long providerId; // null = global

    private boolean recurring = false;
}
