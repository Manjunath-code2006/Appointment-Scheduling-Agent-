package com.appointmentagent.chatbot;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * In-memory session state for ongoing chatbot conversations.
 * Tracks collected booking parameters across conversation turns.
 */
@Data
public class ChatSession {

    private String sessionId;
    private Long userId;

    // Collected booking parameters
    private Long providerId;
    private String providerName;
    private Long serviceId;
    private String serviceName;
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private String reason;

    // State machine
    private ChatState state = ChatState.IDLE;
    private String pendingAction;

    // Conversation history (role, message)
    private List<String[]> history = new ArrayList<>();

    public void addMessage(String role, String message) {
        history.add(new String[]{role, message});
        // Keep last 20 messages to avoid memory growth
        if (history.size() > 20) {
            history.remove(0);
        }
    }

    public void reset() {
        providerId = null;
        providerName = null;
        serviceId = null;
        serviceName = null;
        appointmentDate = null;
        appointmentTime = null;
        reason = null;
        state = ChatState.IDLE;
        pendingAction = null;
    }

    public enum ChatState {
        IDLE,
        COLLECTING_SERVICE,
        COLLECTING_PROVIDER,
        COLLECTING_DATE,
        COLLECTING_TIME,
        CONFIRMING_BOOKING,
        COLLECTING_CANCEL_ID,
        COLLECTING_RESCHEDULE_DATE,
        COLLECTING_RESCHEDULE_TIME,
        CONFIRMING_RESCHEDULE
    }
}
