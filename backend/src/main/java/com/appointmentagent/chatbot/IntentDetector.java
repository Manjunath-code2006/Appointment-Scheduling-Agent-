package com.appointmentagent.chatbot;

import com.appointmentagent.dto.response.ChatResponse.ChatIntent;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Rule-based NLP intent detector that classifies user messages and extracts
 * date/time entities without requiring an external AI API.
 */
@Component
public class IntentDetector {

    public ChatIntent detectIntent(String message) {
        String lower = message.toLowerCase().trim();

        if (matchesAny(lower, "book", "schedule", "make an appointment", "set up", "arrange",
                "i need an appointment", "i'd like to book", "can i book", "want to book")) {
            return ChatIntent.BOOK_APPOINTMENT;
        }
        if (matchesAny(lower, "cancel", "delete appointment", "remove appointment", "don't need")) {
            return ChatIntent.CANCEL_APPOINTMENT;
        }
        if (matchesAny(lower, "reschedule", "move appointment", "change appointment",
                "change my appointment", "move to", "shift to")) {
            return ChatIntent.RESCHEDULE_APPOINTMENT;
        }
        if (matchesAny(lower, "show my appointment", "view my appointment", "my appointment",
                "list appointment", "upcoming appointment", "what appointment")) {
            return ChatIntent.VIEW_APPOINTMENTS;
        }
        if (matchesAny(lower, "available", "availability", "free slot", "open slot",
                "when can", "what time", "any opening")) {
            return ChatIntent.CHECK_AVAILABILITY;
        }
        if (matchesAny(lower, "yes", "confirm", "that's right", "correct", "go ahead",
                "sure", "ok", "okay", "sounds good", "perfect", "book it")) {
            return ChatIntent.CONFIRMATION;
        }

        return ChatIntent.GENERAL_INQUIRY;
    }

    /**
     * Extracts a LocalDate from natural language. Handles:
     * today, tomorrow, day after tomorrow, next Monday, this Friday,
     * weekdays by name, and ISO date patterns (2026-07-04 or 04/07/2026).
     */
    public LocalDate extractDate(String message) {
        String lower = message.toLowerCase().trim();
        LocalDate today = LocalDate.now();

        if (lower.contains("today")) return today;
        if (lower.contains("tomorrow")) return today.plusDays(1);
        if (lower.contains("day after tomorrow")) return today.plusDays(2);

        // "next Monday" / "this Friday"
        String[] days = {"monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"};
        for (int i = 0; i < days.length; i++) {
            if (lower.contains(days[i])) {
                int targetDow = i + 1; // DayOfWeek: MON=1
                int currentDow = today.getDayOfWeek().getValue();
                int daysUntil = (targetDow - currentDow + 7) % 7;
                if (daysUntil == 0) daysUntil = 7; // "next" implies future
                if (lower.contains("next")) daysUntil += 7;
                return today.plusDays(daysUntil);
            }
        }

        // ISO format: 2026-07-04
        Matcher iso = Pattern.compile("(\\d{4})-(\\d{2})-(\\d{2})").matcher(message);
        if (iso.find()) {
            return LocalDate.parse(iso.group());
        }

        // DD/MM/YYYY or MM/DD/YYYY
        Matcher slash = Pattern.compile("(\\d{1,2})/(\\d{1,2})/(\\d{4})").matcher(message);
        if (slash.find()) {
            int d = Integer.parseInt(slash.group(1));
            int m = Integer.parseInt(slash.group(2));
            int y = Integer.parseInt(slash.group(3));
            try {
                return LocalDate.of(y, m, d);
            } catch (Exception ignored) {}
        }

        // In N days
        Matcher inDays = Pattern.compile("in (\\d+) days?").matcher(lower);
        if (inDays.find()) {
            return today.plusDays(Long.parseLong(inDays.group(1)));
        }

        return null;
    }

    /**
     * Extracts a LocalTime from natural language. Handles:
     * "3 PM", "15:30", "3:30 pm", "morning", "afternoon", "evening".
     */
    public LocalTime extractTime(String message) {
        String lower = message.toLowerCase().trim();

        // morning / afternoon / evening defaults
        if (lower.matches(".*(^|\\s)morning(\\s|$).*") && !lower.contains(":") && !lower.matches(".*\\d+\\s*(am|pm).*")) {
            return LocalTime.of(9, 0);
        }
        if (lower.matches(".*(^|\\s)afternoon(\\s|$).*") && !lower.contains(":") && !lower.matches(".*\\d+\\s*(am|pm).*")) {
            return LocalTime.of(14, 0);
        }
        if (lower.matches(".*(^|\\s)evening(\\s|$).*") && !lower.contains(":") && !lower.matches(".*\\d+\\s*(am|pm).*")) {
            return LocalTime.of(17, 0);
        }

        // HH:MM am/pm
        Matcher hmAmPm = Pattern.compile("(\\d{1,2}):(\\d{2})\\s*(am|pm)").matcher(lower);
        if (hmAmPm.find()) {
            int hour = Integer.parseInt(hmAmPm.group(1));
            int min = Integer.parseInt(hmAmPm.group(2));
            if (hmAmPm.group(3).equals("pm") && hour != 12) hour += 12;
            if (hmAmPm.group(3).equals("am") && hour == 12) hour = 0;
            return LocalTime.of(hour, min);
        }

        // H am/pm
        Matcher hAmPm = Pattern.compile("(\\d{1,2})\\s*(am|pm)").matcher(lower);
        if (hAmPm.find()) {
            int hour = Integer.parseInt(hAmPm.group(1));
            if (hAmPm.group(2).equals("pm") && hour != 12) hour += 12;
            if (hAmPm.group(2).equals("am") && hour == 12) hour = 0;
            return LocalTime.of(hour, 0);
        }

        // 24-hour HH:MM
        Matcher hm = Pattern.compile("(\\d{1,2}):(\\d{2})").matcher(message);
        if (hm.find()) {
            int hour = Integer.parseInt(hm.group(1));
            int min = Integer.parseInt(hm.group(2));
            if (hour < 24 && min < 60) return LocalTime.of(hour, min);
        }

        // "after 3 PM" — return time + 30 min
        Matcher after = Pattern.compile("after (\\d{1,2})\\s*(am|pm)?").matcher(lower);
        if (after.find()) {
            int hour = Integer.parseInt(after.group(1));
            String period = after.group(2);
            if (period != null && period.equals("pm") && hour != 12) hour += 12;
            return LocalTime.of(hour, 30); // 30 min after
        }

        return null;
    }

    private boolean matchesAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }
}
