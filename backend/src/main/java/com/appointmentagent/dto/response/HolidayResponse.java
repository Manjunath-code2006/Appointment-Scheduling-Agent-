package com.appointmentagent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HolidayResponse {
    private Long id;
    private String name;
    private LocalDate date;
    private String description;
    private Long providerId;
    private String providerName;
    private boolean recurring;
    private LocalDateTime createdAt;
}
