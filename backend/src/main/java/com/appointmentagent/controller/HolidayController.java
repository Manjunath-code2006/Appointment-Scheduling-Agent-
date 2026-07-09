package com.appointmentagent.controller;

import com.appointmentagent.dto.request.HolidayRequest;
import com.appointmentagent.dto.response.ApiResponse;
import com.appointmentagent.dto.response.HolidayResponse;
import com.appointmentagent.service.HolidayService;
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
@RequestMapping("/holidays")
@RequiredArgsConstructor
@Tag(name = "Holidays", description = "Holiday management")
@SecurityRequirement(name = "Bearer Authentication")
public class HolidayController {

    private final HolidayService holidayService;

    @GetMapping
    @Operation(summary = "Get all holidays")
    public ResponseEntity<ApiResponse<List<HolidayResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(holidayService.getAllHolidays()));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a holiday (Admin only)")
    public ResponseEntity<ApiResponse<HolidayResponse>> create(
            @Valid @RequestBody HolidayRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Holiday added", holidayService.create(request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a holiday (Admin only)")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        holidayService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Holiday deleted"));
    }
}
