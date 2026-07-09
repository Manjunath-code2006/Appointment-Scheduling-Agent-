package com.appointmentagent.controller;

import com.appointmentagent.dto.request.AppointmentRequest;
import com.appointmentagent.dto.request.CancelRequest;
import com.appointmentagent.dto.request.RescheduleRequest;
import com.appointmentagent.dto.response.ApiResponse;
import com.appointmentagent.dto.response.AppointmentResponse;
import com.appointmentagent.dto.response.PageResponse;
import com.appointmentagent.entity.Appointment.AppointmentStatus;
import com.appointmentagent.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
@Tag(name = "Appointments", description = "Appointment booking, cancellation, and management")
@SecurityRequirement(name = "Bearer Authentication")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    @Operation(summary = "Book a new appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> book(
            @Valid @RequestBody AppointmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Appointment booked successfully", appointmentService.book(request)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getById(id)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all appointments (Admin only)")
    public ResponseEntity<ApiResponse<PageResponse<AppointmentResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, size,
                Sort.by("appointmentDate").descending().and(Sort.by("startTime").descending()));
        return ResponseEntity.ok(ApiResponse.success(
                PageResponse.of(appointmentService.getAllAppointments(pageable))));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getMyAppointments()));
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get current user's upcoming appointments")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getUpcoming() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getUpcomingAppointments()));
    }

    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get appointments by date (Admin only)")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getByDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getByDate(date)));
    }

    @GetMapping("/range")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get appointments in date range (Admin only)")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getByDateRange(start, end)));
    }

    @PutMapping("/{id}/reschedule")
    @Operation(summary = "Reschedule an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> reschedule(
            @PathVariable Long id, @Valid @RequestBody RescheduleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Appointment rescheduled",
                appointmentService.reschedule(id, request)));
    }

    @PutMapping("/{id}/cancel")
    @Operation(summary = "Cancel an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancel(
            @PathVariable Long id, @RequestBody(required = false) CancelRequest request) {
        if (request == null) request = new CancelRequest();
        return ResponseEntity.ok(ApiResponse.success("Appointment cancelled",
                appointmentService.cancel(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update appointment status (Admin only)")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateStatus(
            @PathVariable Long id, @RequestParam AppointmentStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Status updated",
                appointmentService.updateStatus(id, status)));
    }
}
