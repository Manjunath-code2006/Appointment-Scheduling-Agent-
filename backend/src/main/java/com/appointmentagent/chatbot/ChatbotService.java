package com.appointmentagent.chatbot;

import com.appointmentagent.dto.request.AppointmentRequest;
import com.appointmentagent.dto.request.ChatRequest;
import com.appointmentagent.dto.response.*;
import com.appointmentagent.dto.response.ChatResponse.ChatIntent;
import com.appointmentagent.entity.Provider;
import com.appointmentagent.entity.ServiceType;
import com.appointmentagent.repository.ProviderRepository;
import com.appointmentagent.repository.ServiceTypeRepository;
import com.appointmentagent.security.UserDetailsImpl;
import com.appointmentagent.service.AppointmentService;
import com.appointmentagent.service.AvailabilityService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotService {

    private final IntentDetector intentDetector;
    private final AppointmentService appointmentService;
    private final AvailabilityService availabilityService;
    private final ServiceTypeRepository serviceTypeRepository;
    private final ProviderRepository providerRepository;

    // In-memory session store (for production, use Redis)
    private final Map<String, ChatSession> sessions = new ConcurrentHashMap<>();

    public ChatResponse processMessage(ChatRequest request) {
        UserDetailsImpl principal = getCurrentPrincipal();

        // Get or create session
        String sessionId = request.getSessionId();
        if (sessionId == null || !sessions.containsKey(sessionId)) {
            sessionId = UUID.randomUUID().toString();
            ChatSession session = new ChatSession();
            session.setSessionId(sessionId);
            session.setUserId(principal.getId());
            sessions.put(sessionId, session);
        }

        ChatSession session = sessions.get(sessionId);
        session.addMessage("user", request.getMessage());

        ChatResponse response = handleMessage(request.getMessage(), session);
        response.setSessionId(sessionId);
        session.addMessage("assistant", response.getMessage());

        return response;
    }

    private ChatResponse handleMessage(String message, ChatSession session) {
        // If we're mid-flow, continue collection
        if (session.getState() != ChatSession.ChatState.IDLE) {
            return continueFlow(message, session);
        }

        // Detect intent from scratch
        ChatIntent intent = intentDetector.detectIntent(message);

        return switch (intent) {
            case BOOK_APPOINTMENT -> startBookingFlow(message, session);
            case CANCEL_APPOINTMENT -> startCancelFlow(session);
            case RESCHEDULE_APPOINTMENT -> startRescheduleFlow(message, session);
            case VIEW_APPOINTMENTS -> handleViewAppointments();
            case CHECK_AVAILABILITY -> handleCheckAvailability(message, session);
            default -> handleGeneralInquiry(message);
        };
    }

    private ChatResponse startBookingFlow(String message, ChatSession session) {
        session.reset();

        // Try to extract date/time from initial message
        LocalDate date = intentDetector.extractDate(message);
        LocalTime time = intentDetector.extractTime(message);
        if (date != null) session.setAppointmentDate(date);
        if (time != null) session.setAppointmentTime(time);

        // Pick a service from message keywords
        List<ServiceType> services = serviceTypeRepository.findByActiveTrue();
        for (ServiceType svc : services) {
            if (message.toLowerCase().contains(svc.getName().toLowerCase())) {
                session.setServiceId(svc.getId());
                session.setServiceName(svc.getName());
                break;
            }
        }

        // If service not found, ask for it
        if (session.getServiceId() == null) {
            session.setState(ChatSession.ChatState.COLLECTING_SERVICE);
            List<String> serviceNames = services.stream()
                    .map(ServiceType::getName).collect(Collectors.toList());
            return ChatResponse.builder()
                    .message("I'd be happy to help you book an appointment! Which service are you looking for?\n\nAvailable services:\n" +
                            serviceNames.stream().map(s -> "• " + s).collect(Collectors.joining("\n")))
                    .intent(ChatIntent.BOOK_APPOINTMENT)
                    .quickReplies(serviceNames)
                    .build();
        }

        return continueBookingFlow(session);
    }

    private ChatResponse continueFlow(String message, ChatSession session) {
        return switch (session.getState()) {
            case COLLECTING_SERVICE -> handleServiceSelection(message, session);
            case COLLECTING_PROVIDER -> handleProviderSelection(message, session);
            case COLLECTING_DATE -> handleDateInput(message, session);
            case COLLECTING_TIME -> handleTimeInput(message, session);
            case CONFIRMING_BOOKING -> handleBookingConfirmation(message, session);
            case COLLECTING_CANCEL_ID -> handleCancelConfirmation(message, session);
            case COLLECTING_RESCHEDULE_DATE -> handleRescheduleDateInput(message, session);
            case COLLECTING_RESCHEDULE_TIME -> handleRescheduleTimeInput(message, session);
            default -> handleGeneralInquiry(message);
        };
    }

    private ChatResponse handleServiceSelection(String message, ChatSession session) {
        List<ServiceType> services = serviceTypeRepository.findByActiveTrue();
        ServiceType matched = services.stream()
                .filter(s -> message.toLowerCase().contains(s.getName().toLowerCase()))
                .findFirst()
                .orElse(null);

        if (matched == null) {
            // Try by index (1, 2, 3...)
            try {
                int idx = Integer.parseInt(message.trim()) - 1;
                if (idx >= 0 && idx < services.size()) matched = services.get(idx);
            } catch (NumberFormatException ignored) {}
        }

        if (matched == null) {
            return ChatResponse.builder()
                    .message("I didn't quite catch that. Please select one of the available services:\n" +
                            services.stream().map(s -> "• " + s.getName()).collect(Collectors.joining("\n")))
                    .intent(ChatIntent.BOOK_APPOINTMENT)
                    .quickReplies(services.stream().map(ServiceType::getName).collect(Collectors.toList()))
                    .build();
        }

        session.setServiceId(matched.getId());
        session.setServiceName(matched.getName());
        return continueBookingFlow(session);
    }

    private ChatResponse continueBookingFlow(ChatSession session) {
        // Need provider?
        if (session.getProviderId() == null) {
            List<Provider> providers = providerRepository.findByServiceId(session.getServiceId());
            if (providers.isEmpty()) {
                session.reset();
                return ChatResponse.builder()
                        .message("Sorry, there are no providers available for " + session.getServiceName() + " at the moment.")
                        .intent(ChatIntent.BOOK_APPOINTMENT)
                        .build();
            }
            if (providers.size() == 1) {
                session.setProviderId(providers.get(0).getId());
                session.setProviderName(providers.get(0).getUser().getFullName());
            } else {
                session.setState(ChatSession.ChatState.COLLECTING_PROVIDER);
                List<String> names = providers.stream()
                        .map(p -> p.getUser().getFullName()).collect(Collectors.toList());
                return ChatResponse.builder()
                        .message("Which provider would you prefer?\n" +
                                names.stream().map(n -> "• " + n).collect(Collectors.joining("\n")))
                        .intent(ChatIntent.BOOK_APPOINTMENT)
                        .quickReplies(names)
                        .build();
            }
        }

        // Need date?
        if (session.getAppointmentDate() == null) {
            session.setState(ChatSession.ChatState.COLLECTING_DATE);
            return ChatResponse.builder()
                    .message("What date would you like your " + session.getServiceName() + " appointment? " +
                            "You can say 'tomorrow', 'next Monday', or a specific date.")
                    .intent(ChatIntent.BOOK_APPOINTMENT)
                    .quickReplies(List.of("Today", "Tomorrow", "Next Monday", "Next Friday"))
                    .build();
        }

        // Need time — show available slots
        if (session.getAppointmentTime() == null) {
            return offerTimeSlots(session);
        }

        // All info collected — confirm
        return presentConfirmation(session);
    }

    private ChatResponse handleProviderSelection(String message, ChatSession session) {
        List<Provider> providers = providerRepository.findByServiceId(session.getServiceId());
        Provider matched = providers.stream()
                .filter(p -> message.toLowerCase().contains(
                        p.getUser().getFirstName().toLowerCase()) ||
                        message.toLowerCase().contains(p.getUser().getFullName().toLowerCase()))
                .findFirst().orElse(null);

        if (matched == null) {
            try {
                int idx = Integer.parseInt(message.trim()) - 1;
                if (idx >= 0 && idx < providers.size()) matched = providers.get(idx);
            } catch (NumberFormatException ignored) {}
        }

        if (matched == null) {
            return ChatResponse.builder()
                    .message("Please select a provider from the list.")
                    .intent(ChatIntent.BOOK_APPOINTMENT)
                    .build();
        }

        session.setProviderId(matched.getId());
        session.setProviderName(matched.getUser().getFullName());
        return continueBookingFlow(session);
    }

    private ChatResponse handleDateInput(String message, ChatSession session) {
        LocalDate date = intentDetector.extractDate(message);
        if (date == null || date.isBefore(LocalDate.now())) {
            return ChatResponse.builder()
                    .message("Please provide a valid future date. For example: 'tomorrow', 'next Monday', or '2026-07-10'.")
                    .intent(ChatIntent.BOOK_APPOINTMENT)
                    .quickReplies(List.of("Tomorrow", "Next Monday", "Next Friday"))
                    .build();
        }
        session.setAppointmentDate(date);
        return continueBookingFlow(session);
    }

    private ChatResponse offerTimeSlots(ChatSession session) {
        AvailabilityResponse availability = availabilityService.getAvailability(
                session.getProviderId(), session.getAppointmentDate(), session.getServiceId());

        if (!availability.isWorkingDay() || availability.isHoliday()) {
            LocalDate unavailableDate = session.getAppointmentDate();
            session.setAppointmentDate(null);
            session.setState(ChatSession.ChatState.COLLECTING_DATE);
            return ChatResponse.builder()
                    .message("Unfortunately " + unavailableDate +
                            " is not available (holiday or non-working day). Please choose another date.")
                    .intent(ChatIntent.BOOK_APPOINTMENT)
                    .quickReplies(List.of("Tomorrow", "Next Monday", "Next Friday"))
                    .build();
        }

        List<AvailabilityResponse.TimeSlot> available = availability.getAvailableSlots().stream()
                .filter(AvailabilityResponse.TimeSlot::isAvailable)
                .limit(8)
                .collect(Collectors.toList());

        if (available.isEmpty()) {
            session.setAppointmentDate(null);
            session.setState(ChatSession.ChatState.COLLECTING_DATE);
            return ChatResponse.builder()
                    .message("No slots available on " + session.getAppointmentDate() +
                            ". Would you like to try another date?")
                    .intent(ChatIntent.BOOK_APPOINTMENT)
                    .suggestedSlots(availability.getAvailableSlots())
                    .quickReplies(List.of("Tomorrow", "Next Monday", "Next Friday"))
                    .build();
        }

        session.setState(ChatSession.ChatState.COLLECTING_TIME);
        List<String> times = available.stream()
                .map(s -> s.getStartTime().format(DateTimeFormatter.ofPattern("hh:mm a")))
                .collect(Collectors.toList());

        return ChatResponse.builder()
                .message("Here are the available time slots for " + session.getAppointmentDate() +
                        ":\n" + times.stream().map(t -> "• " + t).collect(Collectors.joining("\n")) +
                        "\n\nWhich time works best for you?")
                .intent(ChatIntent.BOOK_APPOINTMENT)
                .suggestedSlots(available)
                .quickReplies(times)
                .build();
    }

    private ChatResponse handleTimeInput(String message, ChatSession session) {
        LocalTime time = intentDetector.extractTime(message);

        // Also try matching against slot text like "9:00 AM"
        if (time == null) {
            AvailabilityResponse availability = availabilityService.getAvailability(
                    session.getProviderId(), session.getAppointmentDate(), session.getServiceId());
            for (AvailabilityResponse.TimeSlot slot : availability.getAvailableSlots()) {
                String formatted = slot.getStartTime().format(DateTimeFormatter.ofPattern("h:mm a")).toLowerCase();
                if (message.toLowerCase().contains(formatted) ||
                        message.contains(slot.getStartTime().toString())) {
                    time = slot.getStartTime();
                    break;
                }
            }
        }

        if (time == null) {
            return ChatResponse.builder()
                    .message("I couldn't understand that time. Please try something like '10:00 AM' or '2 PM'.")
                    .intent(ChatIntent.BOOK_APPOINTMENT)
                    .build();
        }

        session.setAppointmentTime(time);
        return presentConfirmation(session);
    }

    private ChatResponse presentConfirmation(ChatSession session) {
        session.setState(ChatSession.ChatState.CONFIRMING_BOOKING);
        String summary = String.format(
                "Here's your appointment summary:\n\n" +
                "📋 Service: %s\n" +
                "👤 Provider: %s\n" +
                "📅 Date: %s\n" +
                "⏰ Time: %s\n\n" +
                "Shall I confirm this booking?",
                session.getServiceName(),
                session.getProviderName(),
                session.getAppointmentDate(),
                session.getAppointmentTime().format(DateTimeFormatter.ofPattern("hh:mm a"))
        );
        return ChatResponse.builder()
                .message(summary)
                .intent(ChatIntent.BOOK_APPOINTMENT)
                .requiresConfirmation(true)
                .quickReplies(List.of("Yes, confirm", "No, cancel"))
                .build();
    }

    private ChatResponse handleBookingConfirmation(String message, ChatSession session) {
        ChatIntent intent = intentDetector.detectIntent(message);

        if (intent == ChatIntent.CONFIRMATION || message.toLowerCase().contains("yes")) {
            try {
                AppointmentRequest req = new AppointmentRequest();
                req.setProviderId(session.getProviderId());
                req.setServiceId(session.getServiceId());
                req.setAppointmentDate(session.getAppointmentDate());
                req.setStartTime(session.getAppointmentTime());

                AppointmentResponse appt = appointmentService.book(req);
                session.reset();

                return ChatResponse.builder()
                        .message("Your appointment has been confirmed!\n\n" +
                                "📋 Booking Reference: " + appt.getAppointmentNumber() + "\n" +
                                "📅 Date: " + appt.getAppointmentDate() + "\n" +
                                "⏰ Time: " + appt.getStartTime() + "\n\n" +
                                "A confirmation email has been sent to you. Is there anything else I can help with?")
                        .intent(ChatIntent.BOOK_APPOINTMENT)
                        .appointmentDetails(appt)
                        .quickReplies(List.of("View my appointments", "Book another appointment"))
                        .build();
            } catch (Exception e) {
                session.setState(ChatSession.ChatState.IDLE);
                return ChatResponse.builder()
                        .message("I wasn't able to complete the booking: " + e.getMessage() +
                                "\n\nWould you like to try a different time slot?")
                        .intent(ChatIntent.BOOK_APPOINTMENT)
                        .quickReplies(List.of("Try another time", "Try another date"))
                        .build();
            }
        } else {
            session.reset();
            return ChatResponse.builder()
                    .message("No problem! Your booking has been cancelled. Is there anything else I can help you with?")
                    .intent(ChatIntent.BOOK_APPOINTMENT)
                    .quickReplies(List.of("Book a new appointment", "View my appointments"))
                    .build();
        }
    }

    private ChatResponse startCancelFlow(ChatSession session) {
        try {
            List<AppointmentResponse> upcoming = appointmentService.getUpcomingAppointments();
            if (upcoming.isEmpty()) {
                return ChatResponse.builder()
                        .message("You don't have any upcoming appointments to cancel.")
                        .intent(ChatIntent.CANCEL_APPOINTMENT)
                        .quickReplies(List.of("Book a new appointment"))
                        .build();
            }
            session.setState(ChatSession.ChatState.COLLECTING_CANCEL_ID);
            StringBuilder sb = new StringBuilder("Which appointment would you like to cancel?\n\n");
            upcoming.forEach(a -> sb.append(String.format("• %s – %s at %s\n",
                    a.getAppointmentNumber(), a.getAppointmentDate(), a.getStartTime())));
            sb.append("\nPlease reply with the appointment number.");
            return ChatResponse.builder()
                    .message(sb.toString())
                    .intent(ChatIntent.CANCEL_APPOINTMENT)
                    .build();
        } catch (Exception e) {
            return ChatResponse.builder()
                    .message("Please log in to view and manage your appointments.")
                    .intent(ChatIntent.CANCEL_APPOINTMENT)
                    .build();
        }
    }

    private ChatResponse handleCancelConfirmation(String message, ChatSession session) {
        session.setState(ChatSession.ChatState.IDLE);
        return ChatResponse.builder()
                .message("To cancel appointment " + message.trim() +
                        ", please use the Appointments page or click the cancel button on your appointment. " +
                        "Is there anything else I can help with?")
                .intent(ChatIntent.CANCEL_APPOINTMENT)
                .quickReplies(List.of("View my appointments", "Book new appointment"))
                .build();
    }

    private ChatResponse startRescheduleFlow(String message, ChatSession session) {
        session.reset();
        session.setState(ChatSession.ChatState.COLLECTING_RESCHEDULE_DATE);
        return ChatResponse.builder()
                .message("I can help you reschedule. What new date would you like for your appointment?")
                .intent(ChatIntent.RESCHEDULE_APPOINTMENT)
                .quickReplies(List.of("Tomorrow", "Next Monday", "Next Friday"))
                .build();
    }

    private ChatResponse handleRescheduleDateInput(String message, ChatSession session) {
        LocalDate date = intentDetector.extractDate(message);
        if (date == null || date.isBefore(LocalDate.now())) {
            return ChatResponse.builder()
                    .message("Please provide a valid future date.")
                    .intent(ChatIntent.RESCHEDULE_APPOINTMENT)
                    .build();
        }
        session.setAppointmentDate(date);
        session.setState(ChatSession.ChatState.COLLECTING_RESCHEDULE_TIME);
        return ChatResponse.builder()
                .message("What time would you prefer on " + date + "?")
                .intent(ChatIntent.RESCHEDULE_APPOINTMENT)
                .quickReplies(List.of("9:00 AM", "10:00 AM", "2:00 PM", "3:00 PM"))
                .build();
    }

    private ChatResponse handleRescheduleTimeInput(String message, ChatSession session) {
        session.setState(ChatSession.ChatState.IDLE);
        return ChatResponse.builder()
                .message("To complete the reschedule, please go to your Appointments page, " +
                        "select the appointment you want to change, and choose the new date and time. " +
                        "Is there anything else I can help you with?")
                .intent(ChatIntent.RESCHEDULE_APPOINTMENT)
                .quickReplies(List.of("View my appointments"))
                .build();
    }

    private ChatResponse handleViewAppointments() {
        return ChatResponse.builder()
                .message("You can view all your appointments on the Appointments page. " +
                        "Your upcoming appointments are displayed on your dashboard.")
                .intent(ChatIntent.VIEW_APPOINTMENTS)
                .quickReplies(List.of("Book a new appointment", "Cancel an appointment"))
                .build();
    }

    private ChatResponse handleCheckAvailability(String message, ChatSession session) {
        LocalDate date = intentDetector.extractDate(message);
        if (date == null) {
            return ChatResponse.builder()
                    .message("For which date would you like to check availability?")
                    .intent(ChatIntent.CHECK_AVAILABILITY)
                    .quickReplies(List.of("Today", "Tomorrow", "Next Monday"))
                    .build();
        }

        List<Provider> providers = providerRepository.findByActiveTrue();
        if (providers.isEmpty()) {
            return ChatResponse.builder()
                    .message("There are no active providers available at the moment.")
                    .intent(ChatIntent.CHECK_AVAILABILITY)
                    .build();
        }

        AvailabilityResponse av = availabilityService.getAvailability(
                providers.get(0).getId(), date, null);

        if (!av.isWorkingDay() || av.isHoliday()) {
            return ChatResponse.builder()
                    .message(date + " is not a working day. Would you like to check another date?")
                    .intent(ChatIntent.CHECK_AVAILABILITY)
                    .quickReplies(List.of("Tomorrow", "Next Monday"))
                    .build();
        }

        long count = av.getAvailableSlots().stream().filter(AvailabilityResponse.TimeSlot::isAvailable).count();
        return ChatResponse.builder()
                .message("There are " + count + " available slots on " + date + ". " +
                        "Would you like to book an appointment?")
                .intent(ChatIntent.CHECK_AVAILABILITY)
                .suggestedSlots(av.getAvailableSlots().stream()
                        .filter(AvailabilityResponse.TimeSlot::isAvailable)
                        .limit(5).collect(Collectors.toList()))
                .quickReplies(List.of("Yes, book now", "Check another date"))
                .build();
    }

    private ChatResponse handleGeneralInquiry(String message) {
        return ChatResponse.builder()
                .message("Hello! I'm your appointment assistant. I can help you:\n\n" +
                        "📅 Book a new appointment\n" +
                        "❌ Cancel an appointment\n" +
                        "🔄 Reschedule an appointment\n" +
                        "👀 View your appointments\n" +
                        "🕐 Check available slots\n\n" +
                        "What would you like to do?")
                .intent(ChatIntent.GENERAL_INQUIRY)
                .quickReplies(List.of(
                        "Book an appointment",
                        "View my appointments",
                        "Cancel an appointment",
                        "Check availability"))
                .build();
    }

    private UserDetailsImpl getCurrentPrincipal() {
        return (UserDetailsImpl) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
