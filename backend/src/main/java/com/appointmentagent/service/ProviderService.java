package com.appointmentagent.service;

import com.appointmentagent.dto.request.ProviderRequest;
import com.appointmentagent.dto.request.WorkingHoursRequest;
import com.appointmentagent.dto.response.ProviderResponse;
import com.appointmentagent.dto.response.ServiceResponse;
import com.appointmentagent.entity.Provider;
import com.appointmentagent.entity.ServiceType;
import com.appointmentagent.entity.User;
import com.appointmentagent.entity.WorkingHours;
import com.appointmentagent.exception.ResourceNotFoundException;
import com.appointmentagent.repository.ProviderRepository;
import com.appointmentagent.repository.WorkingHoursRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderService {

    private final ProviderRepository providerRepository;
    private final WorkingHoursRepository workingHoursRepository;
    private final UserService userService;
    private final ServiceTypeService serviceTypeService;

    @Transactional(readOnly = true)
    public List<ProviderResponse> getAllProviders() {
        return providerRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProviderResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional(readOnly = true)
    public ProviderResponse getByUserId(Long userId) {
        User user = userService.findUserById(userId);
        Provider provider = providerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Provider", "userId", userId));
        return toResponse(provider);
    }

    @Transactional
    public ProviderResponse create(ProviderRequest request) {
        User user = userService.findUserById(request.getUserId());

        Set<ServiceType> services = new HashSet<>();
        if (request.getServiceIds() != null) {
            services = request.getServiceIds().stream()
                    .map(serviceTypeService::findById)
                    .collect(Collectors.toSet());
        }

        Provider provider = Provider.builder()
                .user(user)
                .specialization(request.getSpecialization())
                .bio(request.getBio())
                .location(request.getLocation())
                .bufferMinutes(request.getBufferMinutes())
                .maxAppointmentsPerDay(request.getMaxAppointmentsPerDay())
                .services(services)
                .active(true)
                .build();

        Provider saved = providerRepository.save(provider);

        // Initialize default working hours Mon-Fri 9am-5pm
        initDefaultWorkingHours(saved);

        return toResponse(saved);
    }

    @Transactional
    public ProviderResponse update(Long id, ProviderRequest request) {
        Provider provider = findById(id);
        provider.setSpecialization(request.getSpecialization());
        provider.setBio(request.getBio());
        provider.setLocation(request.getLocation());
        provider.setBufferMinutes(request.getBufferMinutes());
        provider.setMaxAppointmentsPerDay(request.getMaxAppointmentsPerDay());

        if (request.getServiceIds() != null) {
            Set<ServiceType> services = request.getServiceIds().stream()
                    .map(serviceTypeService::findById)
                    .collect(Collectors.toSet());
            provider.setServices(services);
        }

        return toResponse(providerRepository.save(provider));
    }

    @Transactional
    public void updateWorkingHours(Long providerId, List<WorkingHoursRequest> requests) {
        Provider provider = findById(providerId);
        for (WorkingHoursRequest req : requests) {
            WorkingHours wh = workingHoursRepository
                    .findByProviderAndDayOfWeek(provider, req.getDayOfWeek())
                    .orElse(WorkingHours.builder().provider(provider).build());
            wh.setDayOfWeek(req.getDayOfWeek());
            wh.setStartTime(req.getStartTime());
            wh.setEndTime(req.getEndTime());
            wh.setLunchStart(req.getLunchStart());
            wh.setLunchEnd(req.getLunchEnd());
            wh.setWorking(req.isWorking());
            workingHoursRepository.save(wh);
        }
    }

    @Transactional
    public void delete(Long id) {
        Provider provider = findById(id);
        provider.setActive(false);
        providerRepository.save(provider);
    }

    public Provider findById(Long id) {
        return providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider", "id", id));
    }

    private void initDefaultWorkingHours(Provider provider) {
        Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY).forEach(day -> {
            WorkingHours wh = WorkingHours.builder()
                    .provider(provider)
                    .dayOfWeek(day)
                    .startTime(java.time.LocalTime.of(9, 0))
                    .endTime(java.time.LocalTime.of(17, 0))
                    .lunchStart(java.time.LocalTime.of(12, 0))
                    .lunchEnd(java.time.LocalTime.of(13, 0))
                    .isWorking(true)
                    .build();
            workingHoursRepository.save(wh);
        });
        Arrays.asList(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY).forEach(day -> {
            WorkingHours wh = WorkingHours.builder()
                    .provider(provider)
                    .dayOfWeek(day)
                    .startTime(java.time.LocalTime.of(9, 0))
                    .endTime(java.time.LocalTime.of(17, 0))
                    .isWorking(false)
                    .build();
            workingHoursRepository.save(wh);
        });
    }

    public ProviderResponse toResponse(Provider p) {
        List<ServiceResponse> services = p.getServices().stream()
                .map(serviceTypeService::toResponse)
                .collect(Collectors.toList());

        return ProviderResponse.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .fullName(p.getUser().getFullName())
                .email(p.getUser().getEmail())
                .specialization(p.getSpecialization())
                .bio(p.getBio())
                .location(p.getLocation())
                .bufferMinutes(p.getBufferMinutes())
                .maxAppointmentsPerDay(p.getMaxAppointmentsPerDay())
                .services(services)
                .active(p.isActive())
                .build();
    }
}
