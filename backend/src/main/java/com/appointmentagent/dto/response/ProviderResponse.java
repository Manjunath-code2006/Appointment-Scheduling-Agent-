package com.appointmentagent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String specialization;
    private String bio;
    private String location;
    private Integer bufferMinutes;
    private Integer maxAppointmentsPerDay;
    private List<ServiceResponse> services;
    private boolean active;
}
