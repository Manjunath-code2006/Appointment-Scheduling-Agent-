package com.appointmentagent.service;

import com.appointmentagent.dto.response.AppointmentResponse;
import com.appointmentagent.dto.response.DashboardResponse;
import com.appointmentagent.entity.Appointment.AppointmentStatus;
import com.appointmentagent.repository.AppointmentRepository;
import com.appointmentagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Month;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final AppointmentService appointmentService;

    @Transactional(readOnly = true)
    public DashboardResponse getAdminDashboard() {
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        // Monthly stats for current year
        List<Object[]> monthlyCounts = appointmentRepository.countByMonthAndYear(today.getYear());
        List<DashboardResponse.MonthlyStats> monthlyStats = buildMonthlyStats(monthlyCounts);

        // Service breakdown
        List<Object[]> serviceData = appointmentRepository.countByService();
        Map<String, Long> byService = new LinkedHashMap<>();
        serviceData.forEach(row -> byService.put((String) row[0], (Long) row[1]));

        // Status breakdown
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (AppointmentStatus status : AppointmentStatus.values()) {
            byStatus.put(status.name(), appointmentRepository.countByStatus(status));
        }

        // Recent appointments
        List<AppointmentResponse> recent = appointmentRepository
                .findByDateRange(today.minusDays(7), today)
                .stream()
                .limit(10)
                .map(appointmentService::toResponse)
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .totalAppointments(appointmentRepository.count())
                .todayAppointments(appointmentRepository.countByDate(today))
                .tomorrowAppointments(appointmentRepository.countByDate(tomorrow))
                .upcomingAppointments(appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED))
                .completedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED))
                .cancelledAppointments(appointmentRepository.countByStatus(AppointmentStatus.CANCELLED))
                .pendingAppointments(appointmentRepository.countByStatus(AppointmentStatus.PENDING))
                .totalCustomers(userRepository.countActiveUsers())
                .monthlyStats(monthlyStats)
                .appointmentsByService(byService)
                .appointmentsByStatus(byStatus)
                .recentAppointments(recent)
                .build();
    }

    private List<DashboardResponse.MonthlyStats> buildMonthlyStats(List<Object[]> data) {
        Map<Integer, Long> dataMap = new HashMap<>();
        data.forEach(row -> dataMap.put(((Number) row[0]).intValue(), (Long) row[1]));

        List<DashboardResponse.MonthlyStats> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            result.add(DashboardResponse.MonthlyStats.builder()
                    .month(m)
                    .monthName(Month.of(m).name())
                    .count(dataMap.getOrDefault(m, 0L))
                    .build());
        }
        return result;
    }
}
