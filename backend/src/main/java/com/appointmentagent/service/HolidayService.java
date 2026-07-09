package com.appointmentagent.service;

import com.appointmentagent.dto.request.HolidayRequest;
import com.appointmentagent.dto.response.HolidayResponse;
import com.appointmentagent.entity.Holiday;
import com.appointmentagent.entity.Provider;
import com.appointmentagent.exception.ResourceNotFoundException;
import com.appointmentagent.repository.HolidayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HolidayService {

    private final HolidayRepository holidayRepository;
    private final ProviderService providerService;

    public List<HolidayResponse> getAllHolidays() {
        return holidayRepository.findAll().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    public List<HolidayResponse> getGlobalHolidays() {
        return holidayRepository.findByProviderIsNull().stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public HolidayResponse create(HolidayRequest request) {
        Provider provider = null;
        if (request.getProviderId() != null) {
            provider = providerService.findById(request.getProviderId());
        }

        Holiday holiday = Holiday.builder()
                .name(request.getName())
                .date(request.getDate())
                .description(request.getDescription())
                .provider(provider)
                .recurring(request.isRecurring())
                .build();

        return toResponse(holidayRepository.save(holiday));
    }

    @Transactional
    public void delete(Long id) {
        if (!holidayRepository.existsById(id)) {
            throw new ResourceNotFoundException("Holiday", "id", id);
        }
        holidayRepository.deleteById(id);
    }

    private HolidayResponse toResponse(Holiday h) {
        return HolidayResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .date(h.getDate())
                .description(h.getDescription())
                .providerId(h.getProvider() != null ? h.getProvider().getId() : null)
                .providerName(h.getProvider() != null ? h.getProvider().getUser().getFullName() : null)
                .recurring(h.isRecurring())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
