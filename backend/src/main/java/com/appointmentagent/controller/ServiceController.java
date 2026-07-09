package com.appointmentagent.controller;

import com.appointmentagent.dto.request.ServiceRequest;
import com.appointmentagent.dto.response.ApiResponse;
import com.appointmentagent.dto.response.ServiceResponse;
import com.appointmentagent.service.ServiceTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
@Tag(name = "Services", description = "Appointment service type management")
@SecurityRequirement(name = "Bearer Authentication")
public class ServiceController {

    private final ServiceTypeService serviceTypeService;

    @GetMapping
    @Operation(summary = "Get all services")
    public ResponseEntity<ApiResponse<List<ServiceResponse>>> getAll(
            @RequestParam(defaultValue = "true") boolean activeOnly) {
        return ResponseEntity.ok(ApiResponse.success(serviceTypeService.getAllServices(activeOnly)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get service by ID")
    public ResponseEntity<ApiResponse<ServiceResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(serviceTypeService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new service (Admin only)")
    public ResponseEntity<ApiResponse<ServiceResponse>> create(
            @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service created", serviceTypeService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update service (Admin only)")
    public ResponseEntity<ApiResponse<ServiceResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ServiceRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Service updated", serviceTypeService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate service (Admin only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        serviceTypeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Service deactivated"));
    }
}
