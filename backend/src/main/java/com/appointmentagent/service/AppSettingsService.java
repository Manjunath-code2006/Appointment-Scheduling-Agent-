package com.appointmentagent.service;

import com.appointmentagent.dto.request.SettingsRequest;
import com.appointmentagent.dto.response.SettingsResponse;
import com.appointmentagent.entity.AppSettings;
import com.appointmentagent.repository.AppSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppSettingsService {

    private final AppSettingsRepository settingsRepository;

    @Cacheable("settings")
    public AppSettings getSettings() {
        return settingsRepository.findFirstByOrderByIdAsc()
                .orElseGet(() -> settingsRepository.save(AppSettings.builder()
                        .businessName("Appointment Agent")
                        .timezone("UTC")
                        .build()));
    }

    public SettingsResponse getSettingsResponse() {
        return toResponse(getSettings());
    }

    @Transactional
    @CacheEvict(value = "settings", allEntries = true)
    public SettingsResponse updateSettings(SettingsRequest request) {
        AppSettings settings = getSettings();
        settings.setBusinessName(request.getBusinessName());
        settings.setBusinessLogoUrl(request.getBusinessLogoUrl());
        settings.setBusinessAddress(request.getBusinessAddress());
        settings.setBusinessPhone(request.getBusinessPhone());
        settings.setBusinessEmail(request.getBusinessEmail());
        settings.setTimezone(request.getTimezone());
        settings.setDefaultAppointmentDuration(request.getDefaultAppointmentDuration());
        settings.setSlotIntervalMinutes(request.getSlotIntervalMinutes());
        settings.setOfficeStartTime(request.getOfficeStartTime());
        settings.setOfficeEndTime(request.getOfficeEndTime());
        settings.setMaxAdvanceBookingDays(request.getMaxAdvanceBookingDays());
        settings.setMinCancellationHours(request.getMinCancellationHours());
        settings.setReminderHoursBefore(request.getReminderHoursBefore());
        settings.setEmailNotificationsEnabled(request.isEmailNotificationsEnabled());
        settings.setSmsNotificationsEnabled(request.isSmsNotificationsEnabled());
        settings.setBrowserNotificationsEnabled(request.isBrowserNotificationsEnabled());
        return toResponse(settingsRepository.save(settings));
    }

    private SettingsResponse toResponse(AppSettings s) {
        return SettingsResponse.builder()
                .id(s.getId())
                .businessName(s.getBusinessName())
                .businessLogoUrl(s.getBusinessLogoUrl())
                .businessAddress(s.getBusinessAddress())
                .businessPhone(s.getBusinessPhone())
                .businessEmail(s.getBusinessEmail())
                .timezone(s.getTimezone())
                .defaultAppointmentDuration(s.getDefaultAppointmentDuration())
                .slotIntervalMinutes(s.getSlotIntervalMinutes())
                .officeStartTime(s.getOfficeStartTime())
                .officeEndTime(s.getOfficeEndTime())
                .maxAdvanceBookingDays(s.getMaxAdvanceBookingDays())
                .minCancellationHours(s.getMinCancellationHours())
                .reminderHoursBefore(s.getReminderHoursBefore())
                .emailNotificationsEnabled(s.isEmailNotificationsEnabled())
                .smsNotificationsEnabled(s.isSmsNotificationsEnabled())
                .browserNotificationsEnabled(s.isBrowserNotificationsEnabled())
                .build();
    }
}
