package com.appointmentagent.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Sends email notifications.
 * All public methods accept plain primitives/strings — NO JPA entities —
 * so Hibernate lazy proxies are never accessed in the async thread.
 */
@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.mail.from:noreply@appointmentagent.com}")
    private String fromEmail;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // ── Public helpers called by services ──────────────────────────────────

    @Async("asyncExecutor")
    public void sendVerificationEmail(String toEmail, String name, String token) {
        String link = frontendUrl + "/verify-email?token=" + token;
        String body = "Hello " + name + ",\n\n"
                + "Please verify your email by clicking:\n\n" + link
                + "\n\nThis link expires in 24 hours.\n\nAppointment Agent Team";
        sendEmail(toEmail, "Verify your Appointment Agent account", body);
    }

    @Async("asyncExecutor")
    public void sendPasswordResetEmail(String toEmail, String name, String token) {
        String link = frontendUrl + "/reset-password?token=" + token;
        String body = "Hello " + name + ",\n\n"
                + "Reset your password:\n\n" + link
                + "\n\nExpires in 1 hour.\n\nAppointment Agent Team";
        sendEmail(toEmail, "Reset your Appointment Agent password", body);
    }

    @Async("asyncExecutor")
    public void sendAppointmentConfirmation(
            String toEmail, String customerName, String appointmentNumber,
            LocalDate date, LocalTime startTime, LocalTime endTime,
            String serviceName, String providerName) {
        String body = "Hello " + customerName + ",\n\n"
                + "Your appointment is confirmed.\n\n"
                + "Reference : " + appointmentNumber + "\n"
                + "Date      : " + date + "\n"
                + "Time      : " + startTime + " – " + endTime + "\n"
                + "Service   : " + serviceName + "\n"
                + "Provider  : " + providerName + "\n\n"
                + "Please arrive 5 minutes early.\n\nAppointment Agent Team";
        sendEmail(toEmail, "Appointment Confirmed – " + appointmentNumber, body);
    }

    @Async("asyncExecutor")
    public void sendAppointmentReminder(
            String toEmail, String customerName, String appointmentNumber,
            LocalDate date, LocalTime startTime, String serviceName, String providerName) {
        String body = "Hello " + customerName + ",\n\n"
                + "Reminder for your appointment.\n\n"
                + "Reference : " + appointmentNumber + "\n"
                + "Date      : " + date + "\n"
                + "Time      : " + startTime + "\n"
                + "Service   : " + serviceName + "\n"
                + "Provider  : " + providerName + "\n\n"
                + "Appointment Agent Team";
        sendEmail(toEmail, "Appointment Reminder – Tomorrow at " + startTime, body);
    }

    @Async("asyncExecutor")
    public void sendCancellationEmail(
            String toEmail, String customerName, String appointmentNumber,
            LocalDate date, LocalTime startTime) {
        String body = "Hello " + customerName + ",\n\n"
                + "Your appointment has been cancelled.\n\n"
                + "Reference : " + appointmentNumber + "\n"
                + "Date      : " + date + "\n"
                + "Time      : " + startTime + "\n\n"
                + "Contact us if you didn't request this.\n\nAppointment Agent Team";
        sendEmail(toEmail, "Appointment Cancelled – " + appointmentNumber, body);
    }

    @Async("asyncExecutor")
    public void sendRescheduleEmail(
            String toEmail, String customerName, String appointmentNumber,
            LocalDate date, LocalTime startTime, LocalTime endTime, String serviceName) {
        String body = "Hello " + customerName + ",\n\n"
                + "Your appointment has been rescheduled.\n\n"
                + "Reference : " + appointmentNumber + "\n"
                + "New Date  : " + date + "\n"
                + "New Time  : " + startTime + " – " + endTime + "\n"
                + "Service   : " + serviceName + "\n\n"
                + "Appointment Agent Team";
        sendEmail(toEmail, "Appointment Rescheduled – " + appointmentNumber, body);
    }

    // ── Private helper ─────────────────────────────────────────────────────

    private void sendEmail(String to, String subject, String body) {
        if (mailSender == null) {
            log.info("[MAIL-DISABLED] To: {} | Subject: {}", to, subject);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.info("Email sent → {} | {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}
