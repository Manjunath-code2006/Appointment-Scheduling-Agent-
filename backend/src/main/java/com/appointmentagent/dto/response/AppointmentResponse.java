package com.appointmentagent.dto.response;

import com.appointmentagent.entity.Appointment.AppointmentStatus;
import com.appointmentagent.entity.Appointment.AppointmentType;
import com.appointmentagent.entity.Appointment.MeetingPlatform;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AppointmentResponse {

    private Long id;
    private String appointmentNumber;
    private CustomerSummary customer;
    private ProviderSummary provider;
    private ServiceSummary service;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private AppointmentStatus status;
    private AppointmentType type;
    private String notes;
    private String reason;
    private String meetingLink;
    private MeetingPlatform meetingPlatform;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CustomerSummary {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProviderSummary {
        private Long id;
        private String fullName;
        private String specialization;
        private String location;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ServiceSummary {
        private Long id;
        private String name;
        private Integer durationMinutes;
        private String color;
    }
}
