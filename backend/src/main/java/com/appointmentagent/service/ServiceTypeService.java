package com.appointmentagent.service;

import com.appointmentagent.dto.request.ServiceRequest;
import com.appointmentagent.dto.response.ServiceResponse;
import com.appointmentagent.entity.ServiceType;
import com.appointmentagent.exception.ConflictException;
import com.appointmentagent.exception.ResourceNotFoundException;
import com.appointmentagent.repository.ServiceTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceTypeService {

    private final ServiceTypeRepository serviceTypeRepository;

    public List<ServiceResponse> getAllServices(boolean activeOnly) {
        List<ServiceType> services = activeOnly
                ? serviceTypeRepository.findByActiveTrue()
                : serviceTypeRepository.findAll();
        return services.stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ServiceResponse getById(Long id) {
        return toResponse(findById(id));
    }

    @Transactional
    public ServiceResponse create(ServiceRequest request) {
        if (serviceTypeRepository.existsByNameIgnoreCase(request.getName())) {
            throw new ConflictException("A service with this name already exists");
        }
        ServiceType service = ServiceType.builder()
                .name(request.getName())
                .description(request.getDescription())
                .durationMinutes(request.getDurationMinutes())
                .price(request.getPrice())
                .color(request.getColor())
                .mode(request.getMode())
                .active(true)
                .build();
        return toResponse(serviceTypeRepository.save(service));
    }

    @Transactional
    public ServiceResponse update(Long id, ServiceRequest request) {
        ServiceType service = findById(id);
        service.setName(request.getName());
        service.setDescription(request.getDescription());
        service.setDurationMinutes(request.getDurationMinutes());
        service.setPrice(request.getPrice());
        service.setColor(request.getColor());
        service.setMode(request.getMode());
        return toResponse(serviceTypeRepository.save(service));
    }

    @Transactional
    public void delete(Long id) {
        ServiceType service = findById(id);
        service.setActive(false);
        serviceTypeRepository.save(service);
    }

    public ServiceType findById(Long id) {
        return serviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service", "id", id));
    }

    public ServiceResponse toResponse(ServiceType s) {
        return ServiceResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .description(s.getDescription())
                .durationMinutes(s.getDurationMinutes())
                .price(s.getPrice())
                .color(s.getColor())
                .active(s.isActive())
                .mode(s.getMode())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
