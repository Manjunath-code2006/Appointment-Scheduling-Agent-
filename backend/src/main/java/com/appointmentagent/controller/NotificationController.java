package com.appointmentagent.controller;

import com.appointmentagent.dto.response.ApiResponse;
import com.appointmentagent.dto.response.NotificationResponse;
import com.appointmentagent.entity.User;
import com.appointmentagent.security.UserDetailsImpl;
import com.appointmentagent.service.NotificationService;
import com.appointmentagent.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "User notification management")
@SecurityRequirement(name = "Bearer Authentication")
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    @Operation(summary = "Get all notifications for current user")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAll(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        User user = userService.findUserById(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUserNotifications(user)));
    }

    @GetMapping("/unread")
    @Operation(summary = "Get unread notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUnread(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        User user = userService.findUserById(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(notificationService.getUnreadNotifications(user)));
    }

    @GetMapping("/unread/count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        User user = userService.findUserById(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(
                Map.of("count", notificationService.getUnreadCount(user))));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        User user = userService.findUserById(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(notificationService.markAsRead(id, user)));
    }

    @PatchMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead(
            @AuthenticationPrincipal UserDetailsImpl currentUser) {
        User user = userService.findUserById(currentUser.getId());
        int count = notificationService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.success(Map.of("updated", count)));
    }
}
