package com.appointmentagent.controller;

import com.appointmentagent.dto.request.ProviderRequest;
import com.appointmentagent.dto.request.WorkingHoursRequest;
import com.appointmentagent.dto.response.ApiResponse;
import com.appointmentagent.dto.response.ProviderResponse;
import com.appointmentagent.service.ProviderService;
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
@RequestMapping("/providers")
@RequiredArgsConstructor
@Tag(name = "Providers", description = "Provider management endpoints")
@SecurityRequirement(name = "Bearer Authentication")
public class ProviderController {

    private final ProviderService providerService;

    @GetMapping
    @Operation(summary = "Get all active providers")
    public ResponseEntity<ApiResponse<List<ProviderResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(providerService.getAllProviders()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get provider by ID")
    public ResponseEntity<ApiResponse<ProviderResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(providerService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create provider profile (Admin only)")
    public ResponseEntity<ApiResponse<ProviderResponse>> create(
            @Valid @RequestBody ProviderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Provider created", providerService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update provider (Admin only)")
    public ResponseEntity<ApiResponse<ProviderResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ProviderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Provider updated", providerService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate provider (Admin only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        providerService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Provider deactivated"));
    }

    @PutMapping("/{id}/working-hours")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update provider working hours (Admin only)")
    public ResponseEntity<ApiResponse<Void>> updateWorkingHours(
            @PathVariable Long id,
            @Valid @RequestBody List<WorkingHoursRequest> requests) {
        providerService.updateWorkingHours(id, requests);
        return ResponseEntity.ok(ApiResponse.success("Working hours updated"));
    }
}
