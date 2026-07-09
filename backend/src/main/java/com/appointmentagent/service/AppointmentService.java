package com.appointmentagent.service;

import com.appointmentagent.dto.request.AppointmentRequest;
import com.appointmentagent.dto.request.CancelRequest;
import com.appointmentagent.dto.request.RescheduleRequest;
import com.appointmentagent.dto.response.AppointmentResponse;
import com.appointmentagent.entity.*;
import com.appointmentagent.entity.Appointment.AppointmentStatus;
import com.appointmentagent.exception.BadRequestException;
import com.appointmentagent.exception.ConflictException;
import com.appointmentagent.exception.ResourceNotFoundException;
import com.appointmentagent.repository.AppointmentRepository;
import com.appointmentagent.repository.HolidayRepository;
import com.appointmentagent.repository.WorkingHoursRepository;
import com.appointmentagent.security.UserDetailsImpl;
import com.appointmentagent.utils.AppNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserService userService;
    private final ProviderService providerService;
    private final ServiceTypeService serviceTypeService;
    private final WorkingHoursRepository workingHoursRepository;
    private final HolidayRepository holidayRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final AppNumberGenerator numberGenerator;
    private final AppSettingsService settingsService;

    @Transactional
    public AppointmentResponse book(AppointmentRequest request) {
        UserDetailsImpl principal = getCurrentPrincipal();

        // Determine customer
        User customer;
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (isAdmin && request.getCustomerId() != null) {
            customer = userService.findUserById(request.getCustomerId());
        } else {
            customer = userService.findUserById(principal.getId());
        }

        Provider provider = providerService.findById(request.getProviderId());
        ServiceType service = serviceTypeService.findById(request.getServiceId());

        validateBooking(request, provider, service, customer);

        LocalTime endTime = request.getStartTime().plusMinutes(service.getDurationMinutes());

        // Generate meeting link for video appointments
        String meetingLink = null;
        if (service.getMode() == ServiceType.AppointmentMode.VIDEO && request.getMeetingPlatform() != null) {
            meetingLink = generateMeetingLink(request.getMeetingPlatform());
        }

        Appointment appointment = Appointment.builder()
                .appointmentNumber(numberGenerator.generateAppointmentNumber())
                .customer(customer)
                .provider(provider)
                .service(service)
                .appointmentDate(request.getAppointmentDate())
                .startTime(request.getStartTime())
                .endTime(endTime)
                .status(AppointmentStatus.CONFIRMED)
                .type(request.getType())
                .notes(request.getNotes())
                .reason(request.getReason())
                .meetingLink(meetingLink)
                .meetingPlatform(request.getMeetingPlatform())
                .build();

        Appointment saved = appointmentRepository.save(appointment);

        // Send notifications — extract all values inside the transaction before async call
        emailService.sendAppointmentConfirmation(
                saved.getCustomer().getEmail(),
                saved.getCustomer().getFullName(),
                saved.getAppointmentNumber(),
                saved.getAppointmentDate(),
                saved.getStartTime(),
                saved.getEndTime(),
                saved.getService().getName(),
                saved.getProvider().getUser().getFullName()
        );
        notificationService.createAppointmentNotification(
                customer, saved,
                Notification.NotificationType.APPOINTMENT_CONFIRMATION,
                "Appointment Confirmed",
                "Your appointment " + saved.getAppointmentNumber() + " has been confirmed for " +
                        saved.getAppointmentDate() + " at " + saved.getStartTime()
        );

        log.info("Appointment booked: {} for customer {}", saved.getAppointmentNumber(), customer.getEmail());
        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse reschedule(Long id, RescheduleRequest request) {
        Appointment appointment = findById(id);
        validateOwnershipOrAdmin(appointment);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Cannot reschedule a cancelled appointment");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot reschedule a completed appointment");
        }

        // Validate new slot
        AppointmentRequest newReq = new AppointmentRequest();
        newReq.setProviderId(appointment.getProvider().getId());
        newReq.setServiceId(appointment.getService().getId());
        newReq.setAppointmentDate(request.getNewDate());
        newReq.setStartTime(request.getNewStartTime());
        validateBooking(newReq, appointment.getProvider(), appointment.getService(),
                appointment.getCustomer(), appointment.getId());

        appointment.setRescheduledFrom(appointment);
        appointment.setAppointmentDate(request.getNewDate());
        appointment.setStartTime(request.getNewStartTime());
        appointment.setEndTime(request.getNewStartTime()
                .plusMinutes(appointment.getService().getDurationMinutes()));
        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointment.setNotes(request.getReason() != null
                ? (appointment.getNotes() != null ? appointment.getNotes() + "\nRescheduled: " : "Rescheduled: ")
                  + request.getReason()
                : appointment.getNotes());

        Appointment saved = appointmentRepository.save(appointment);
        emailService.sendRescheduleEmail(
                saved.getCustomer().getEmail(),
                saved.getCustomer().getFullName(),
                saved.getAppointmentNumber(),
                saved.getAppointmentDate(),
                saved.getStartTime(),
                saved.getEndTime(),
                saved.getService().getName()
        );
        notificationService.createAppointmentNotification(
                saved.getCustomer(), saved,
                Notification.NotificationType.APPOINTMENT_RESCHEDULED,
                "Appointment Rescheduled",
                "Your appointment has been rescheduled to " + saved.getAppointmentDate() + " at " + saved.getStartTime()
        );

        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse cancel(Long id, CancelRequest request) {
        Appointment appointment = findById(id);
        validateOwnershipOrAdmin(appointment);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("Appointment is already cancelled");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel a completed appointment");
        }

        // Check minimum cancellation hours
        AppSettings settings = settingsService.getSettings();
        LocalDateTime appointmentDateTime = appointment.getAppointmentDate()
                .atTime(appointment.getStartTime());
        if (LocalDateTime.now().plusHours(settings.getMinCancellationHours())
                .isAfter(appointmentDateTime)) {
            throw new BadRequestException(
                    "Cancellation must be made at least " + settings.getMinCancellationHours() +
                    " hours before the appointment");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setCancelledAt(LocalDateTime.now());
        appointment.setCancellationReason(request.getReason());

        Appointment saved = appointmentRepository.save(appointment);
        emailService.sendCancellationEmail(
                saved.getCustomer().getEmail(),
                saved.getCustomer().getFullName(),
                saved.getAppointmentNumber(),
                saved.getAppointmentDate(),
                saved.getStartTime()
        );
        notificationService.createAppointmentNotification(
                saved.getCustomer(), saved,
                Notification.NotificationType.APPOINTMENT_CANCELLED,
                "Appointment Cancelled",
                "Your appointment " + saved.getAppointmentNumber() + " has been cancelled"
        );

        return toResponse(saved);
    }

    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatus status) {
        Appointment appointment = findById(id);
        appointment.setStatus(status);
        return toResponse(appointmentRepository.save(appointment));
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getById(Long id) {
        Appointment appointment = findById(id);
        validateOwnershipOrAdmin(appointment);
        return toResponse(appointment);
    }

    @Transactional(readOnly = true)
    public Page<AppointmentResponse> getAllAppointments(Pageable pageable) {
        return appointmentRepository.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getMyAppointments() {
        UserDetailsImpl principal = getCurrentPrincipal();
        User customer = userService.findUserById(principal.getId());
        return appointmentRepository.findByCustomerOrderByAppointmentDateDescStartTimeDesc(customer)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getUpcomingAppointments() {
        UserDetailsImpl principal = getCurrentPrincipal();
        return appointmentRepository.findUpcomingByCustomer(principal.getId(), LocalDate.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getByDateRange(LocalDate start, LocalDate end) {
        return appointmentRepository.findByDateRange(start, end)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getByDate(LocalDate date) {
        return appointmentRepository.findByDateRange(date, date)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ---- Validation Helpers ----

    private void validateBooking(AppointmentRequest request, Provider provider,
                                  ServiceType service, User customer) {
        validateBooking(request, provider, service, customer, null);
    }

    private void validateBooking(AppointmentRequest request, Provider provider,
                                  ServiceType service, User customer, Long excludeId) {
        LocalDate date = request.getAppointmentDate();
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = startTime.plusMinutes(service.getDurationMinutes());

        // Past date
        if (date.isBefore(LocalDate.now())) {
            throw new BadRequestException("Appointment date cannot be in the past");
        }

        // Max advance booking
        AppSettings settings = settingsService.getSettings();
        if (date.isAfter(LocalDate.now().plusDays(settings.getMaxAdvanceBookingDays()))) {
            throw new BadRequestException(
                    "Cannot book more than " + settings.getMaxAdvanceBookingDays() + " days in advance");
        }

        // Holiday check
        if (!holidayRepository.findByDateAndProviderOrGlobal(date, provider).isEmpty()) {
            throw new BadRequestException("Cannot book on a holiday");
        }

        // Working hours check
        WorkingHours wh = workingHoursRepository
                .findByProviderAndDayOfWeek(provider, date.getDayOfWeek())
                .orElseThrow(() -> new BadRequestException("No working hours configured for this day"));

        if (!wh.isWorking()) {
            throw new BadRequestException("Provider does not work on this day");
        }
        if (startTime.isBefore(wh.getStartTime()) || endTime.isAfter(wh.getEndTime())) {
            throw new BadRequestException(
                    "Appointment must be within working hours: " + wh.getStartTime() + " - " + wh.getEndTime());
        }

        // Lunch break check
        if (wh.getLunchStart() != null && wh.getLunchEnd() != null) {
            if (startTime.isBefore(wh.getLunchEnd()) && endTime.isAfter(wh.getLunchStart())) {
                throw new BadRequestException("Cannot book during lunch break: "
                        + wh.getLunchStart() + " - " + wh.getLunchEnd());
            }
        }

        // Max appointments per day
        long dayCount = appointmentRepository.countByProviderAndDate(provider, date);
        if (dayCount >= provider.getMaxAppointmentsPerDay()) {
            throw new BadRequestException("Provider has reached maximum appointments for this day");
        }

        // Duplicate booking for same customer
        List<Appointment> customerSameDayAppts = appointmentRepository
                .findByProviderAndAppointmentDate(provider, date).stream()
                .filter(a -> a.getCustomer().getId().equals(customer.getId())
                        && a.getStatus() != AppointmentStatus.CANCELLED
                        && (excludeId == null || !a.getId().equals(excludeId)))
                .toList();
        if (!customerSameDayAppts.isEmpty()) {
            throw new ConflictException("You already have an appointment with this provider on this date");
        }

        // Conflict check
        List<Appointment> conflicts = appointmentRepository.findConflicting(provider, date, startTime, endTime)
                .stream()
                .filter(a -> excludeId == null || !a.getId().equals(excludeId))
                .toList();
        if (!conflicts.isEmpty()) {
            throw new ConflictException("The selected time slot is no longer available");
        }
    }

    private void validateOwnershipOrAdmin(Appointment appointment) {
        UserDetailsImpl principal = getCurrentPrincipal();
        boolean isAdmin = principal.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin && !appointment.getCustomer().getId().equals(principal.getId())) {
            throw new BadRequestException("You do not have permission to access this appointment");
        }
    }

    private String generateMeetingLink(Appointment.MeetingPlatform platform) {
        String meetingId = java.util.UUID.randomUUID().toString().substring(0, 10);
        return switch (platform) {
            case GOOGLE_MEET -> "https://meet.google.com/" + meetingId;
            case ZOOM -> "https://zoom.us/j/" + meetingId.replace("-", "");
            case TEAMS -> "https://teams.microsoft.com/l/meetup-join/" + meetingId;
        };
    }

    public Appointment findById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
    }

    private UserDetailsImpl getCurrentPrincipal() {
        return (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }

    public AppointmentResponse toResponse(Appointment a) {
        return AppointmentResponse.builder()
                .id(a.getId())
                .appointmentNumber(a.getAppointmentNumber())
                .customer(AppointmentResponse.CustomerSummary.builder()
                        .id(a.getCustomer().getId())
                        .fullName(a.getCustomer().getFullName())
                        .email(a.getCustomer().getEmail())
                        .phone(a.getCustomer().getPhone())
                        .build())
                .provider(AppointmentResponse.ProviderSummary.builder()
                        .id(a.getProvider().getId())
                        .fullName(a.getProvider().getUser().getFullName())
                        .specialization(a.getProvider().getSpecialization())
                        .location(a.getProvider().getLocation())
                        .build())
                .service(AppointmentResponse.ServiceSummary.builder()
                        .id(a.getService().getId())
                        .name(a.getService().getName())
                        .durationMinutes(a.getService().getDurationMinutes())
                        .color(a.getService().getColor())
                        .build())
                .appointmentDate(a.getAppointmentDate())
                .startTime(a.getStartTime())
                .endTime(a.getEndTime())
                .status(a.getStatus())
                .type(a.getType())
                .notes(a.getNotes())
                .reason(a.getReason())
                .meetingLink(a.getMeetingLink())
                .meetingPlatform(a.getMeetingPlatform())
                .cancellationReason(a.getCancellationReason())
                .cancelledAt(a.getCancelledAt())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
