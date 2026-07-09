package com.appointmentagent.service;

import com.appointmentagent.entity.Appointment;
import com.appointmentagent.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;
    private final AppSettingsService settingsService;

    /**
     * Runs every hour to send reminders for appointments coming up within reminderHoursBefore hours.
     */
    @Scheduled(fixedDelay = 3600000)
    @Transactional
    public void sendReminders() {
        int reminderHours = settingsService.getSettings().getReminderHoursBefore();
        LocalDate reminderDate = LocalDate.now().plusDays(reminderHours / 24);
        LocalTime windowStart = LocalTime.now();
        LocalTime windowEnd = LocalTime.now().plusHours(1);

        List<Appointment> appointments = appointmentRepository.findUpcomingReminders(
                reminderDate, windowStart, windowEnd);

        for (Appointment appointment : appointments) {
            try {
                emailService.sendAppointmentReminder(
                        appointment.getCustomer().getEmail(),
                        appointment.getCustomer().getFullName(),
                        appointment.getAppointmentNumber(),
                        appointment.getAppointmentDate(),
                        appointment.getStartTime(),
                        appointment.getService().getName(),
                        appointment.getProvider().getUser().getFullName()
                );
                appointment.setReminderSent(true);
                appointmentRepository.save(appointment);
                log.info("Reminder sent for appointment: {}", appointment.getAppointmentNumber());
            } catch (Exception e) {
                log.error("Failed to send reminder for {}: {}", appointment.getAppointmentNumber(), e.getMessage());
            }
        }
    }

    /**
     * Runs daily at midnight to auto-complete past confirmed appointments.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void autoCompleteAppointments() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        List<Appointment> pastConfirmed = appointmentRepository
                .findByDateRange(yesterday.minusDays(30), yesterday)
                .stream()
                .filter(a -> a.getStatus() == Appointment.AppointmentStatus.CONFIRMED)
                .toList();

        for (Appointment a : pastConfirmed) {
            a.setStatus(Appointment.AppointmentStatus.COMPLETED);
            appointmentRepository.save(a);
        }
        log.info("Auto-completed {} past appointments", pastConfirmed.size());
    }
}
