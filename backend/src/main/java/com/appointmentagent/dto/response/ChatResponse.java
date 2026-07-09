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
public class ChatResponse {

    private String message;
    private String sessionId;
    private ChatIntent intent;
    private List<AvailabilityResponse.TimeSlot> suggestedSlots;
    private AppointmentResponse appointmentDetails;
    private boolean requiresConfirmation;
    private List<String> quickReplies;

    public enum ChatIntent {
        BOOK_APPOINTMENT,
        CANCEL_APPOINTMENT,
        RESCHEDULE_APPOINTMENT,
        VIEW_APPOINTMENTS,
        CHECK_AVAILABILITY,
        GENERAL_INQUIRY,
        CONFIRMATION,
        UNKNOWN
    }
}
