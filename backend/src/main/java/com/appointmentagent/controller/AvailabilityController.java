package com.appointmentagent.controller;

import com.appointmentagent.dto.response.ApiResponse;
import com.appointmentagent.dto.response.AvailabilityResponse;
import com.appointmentagent.service.AvailabilityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/availability")
@RequiredArgsConstructor
@Tag(name = "Availability", description = "Check available appointment slots")
@SecurityRequirement(name = "Bearer Authentication")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    @GetMapping("/provider/{providerId}")
    @Operation(summary = "Get available slots for a provider on a given date")
    public ResponseEntity<ApiResponse<AvailabilityResponse>> getAvailability(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long serviceId) {
        return ResponseEntity.ok(ApiResponse.success(
                availabilityService.getAvailability(providerId, date, serviceId)));
    }
}
