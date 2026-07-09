package com.appointmentagent.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {

    // Counters
    private long totalAppointments;
    private long todayAppointments;
    private long tomorrowAppointments;
    private long upcomingAppointments;
    private long completedAppointments;
    private long cancelledAppointments;
    private long pendingAppointments;
    private long totalCustomers;
    private long totalProviders;

    // Charts
    private List<MonthlyStats> monthlyStats;
    private Map<String, Long> appointmentsByService;
    private Map<String, Long> appointmentsByStatus;

    // Recent
    private List<AppointmentResponse> recentAppointments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStats {
        private int month;
        private String monthName;
        private long count;
    }
}
