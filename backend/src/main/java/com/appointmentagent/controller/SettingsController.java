package com.appointmentagent.controller;

import com.appointmentagent.dto.request.SettingsRequest;
import com.appointmentagent.dto.response.ApiResponse;
import com.appointmentagent.dto.response.SettingsResponse;
import com.appointmentagent.service.AppSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
@Tag(name = "Settings", description = "Application settings management")
@SecurityRequirement(name = "Bearer Authentication")
public class SettingsController {

    private final AppSettingsService settingsService;

    @GetMapping
    @Operation(summary = "Get application settings")
    public ResponseEntity<ApiResponse<SettingsResponse>> getSettings() {
        return ResponseEntity.ok(ApiResponse.success(settingsService.getSettingsResponse()));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update application settings (Admin only)")
    public ResponseEntity<ApiResponse<SettingsResponse>> updateSettings(
            @Valid @RequestBody SettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Settings updated", settingsService.updateSettings(request)));
    }
}
