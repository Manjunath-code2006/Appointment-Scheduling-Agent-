package com.appointmentagent.service;

import com.appointmentagent.dto.response.AvailabilityResponse;
import com.appointmentagent.entity.*;
import com.appointmentagent.repository.AppointmentRepository;
import com.appointmentagent.repository.HolidayRepository;
import com.appointmentagent.repository.WorkingHoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailabilityService {

    private final WorkingHoursRepository workingHoursRepository;
    private final HolidayRepository holidayRepository;
    private final AppointmentRepository appointmentRepository;
    private final ProviderService providerService;

    @Transactional(readOnly = true)
    public AvailabilityResponse getAvailability(Long providerId, LocalDate date, Long serviceId) {
        Provider provider = providerService.findById(providerId);

        // Check if holiday
        List<Holiday> holidays = holidayRepository.findByDateAndProviderOrGlobal(date, provider);
        if (!holidays.isEmpty()) {
            return AvailabilityResponse.builder()
                    .providerId(providerId)
                    .providerName(provider.getUser().getFullName())
                    .date(date)
                    .isHoliday(true)
                    .isWorkingDay(false)
                    .availableSlots(List.of())
                    .build();
        }

        // Check working hours for this day
        WorkingHours workingHours = workingHoursRepository
                .findByProviderAndDayOfWeek(provider, date.getDayOfWeek())
                .orElse(null);

        if (workingHours == null || !workingHours.isWorking()) {
            return AvailabilityResponse.builder()
                    .providerId(providerId)
                    .providerName(provider.getUser().getFullName())
                    .date(date)
                    .isHoliday(false)
                    .isWorkingDay(false)
                    .availableSlots(List.of())
                    .build();
        }

        // Get service duration (default 30 min if no service specified)
        int durationMinutes = 30;
        if (serviceId != null) {
            durationMinutes = provider.getServices().stream()
                    .filter(s -> s.getId().equals(serviceId))
                    .findFirst()
                    .map(ServiceType::getDurationMinutes)
                    .orElse(30);
        }

        // Check daily max
        long existingCount = appointmentRepository.countByProviderAndDate(provider, date);
        if (existingCount >= provider.getMaxAppointmentsPerDay()) {
            return AvailabilityResponse.builder()
                    .providerId(providerId)
                    .providerName(provider.getUser().getFullName())
                    .date(date)
                    .isWorkingDay(true)
                    .availableSlots(List.of())
                    .build();
        }

        // Get existing appointments for that day
        List<Appointment> existing = appointmentRepository.findByProviderAndAppointmentDate(provider, date)
                .stream()
                .filter(a -> a.getStatus() != Appointment.AppointmentStatus.CANCELLED
                        && a.getStatus() != Appointment.AppointmentStatus.NO_SHOW)
                .toList();

        // Generate slots
        List<AvailabilityResponse.TimeSlot> slots = generateSlots(
                workingHours, durationMinutes, provider.getBufferMinutes(), existing, date);

        return AvailabilityResponse.builder()
                .providerId(providerId)
                .providerName(provider.getUser().getFullName())
                .date(date)
                .isHoliday(false)
                .isWorkingDay(true)
                .availableSlots(slots)
                .build();
    }

    private List<AvailabilityResponse.TimeSlot> generateSlots(
            WorkingHours wh, int durationMinutes, int bufferMinutes,
            List<Appointment> existing, LocalDate date) {

        List<AvailabilityResponse.TimeSlot> slots = new ArrayList<>();
        LocalTime cursor = wh.getStartTime();
        LocalTime workEnd = wh.getEndTime();
        LocalTime now = LocalTime.now();
        boolean isToday = date.isEqual(LocalDate.now());

        while (!cursor.plusMinutes(durationMinutes).isAfter(workEnd)) {
            LocalTime slotEnd = cursor.plusMinutes(durationMinutes);

            // Skip lunch break overlap
            boolean duringLunch = wh.getLunchStart() != null && wh.getLunchEnd() != null
                    && cursor.isBefore(wh.getLunchEnd()) && slotEnd.isAfter(wh.getLunchStart());

            // Skip past slots for today
            boolean isPast = isToday && cursor.isBefore(now.plusMinutes(30));

            boolean conflicting = isConflicting(cursor, slotEnd, existing, bufferMinutes);

            boolean available = !duringLunch && !isPast && !conflicting;

            slots.add(AvailabilityResponse.TimeSlot.builder()
                    .startTime(cursor)
                    .endTime(slotEnd)
                    .available(available)
                    .build());

            cursor = cursor.plusMinutes(durationMinutes + bufferMinutes);
        }

        return slots;
    }

    private boolean isConflicting(LocalTime start, LocalTime end,
                                   List<Appointment> existing, int bufferMinutes) {
        for (Appointment a : existing) {
            LocalTime existStart = a.getStartTime().minusMinutes(bufferMinutes);
            LocalTime existEnd = a.getEndTime().plusMinutes(bufferMinutes);
            if (start.isBefore(existEnd) && end.isAfter(existStart)) {
                return true;
            }
        }
        return false;
    }
}
