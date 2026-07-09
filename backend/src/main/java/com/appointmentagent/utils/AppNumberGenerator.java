package com.appointmentagent.utils;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.concurrent.atomic.AtomicLong;

@Component
public class AppNumberGenerator {

    private final AtomicLong counter = new AtomicLong(System.currentTimeMillis() % 100000);

    /**
     * Generates a unique appointment number like APT-20260704-00001
     */
    public String generateAppointmentNumber() {
        String date = LocalDate.now().toString().replace("-", "");
        long seq = counter.incrementAndGet() % 100000;
        return String.format("APT-%s-%05d", date, seq);
    }
}
