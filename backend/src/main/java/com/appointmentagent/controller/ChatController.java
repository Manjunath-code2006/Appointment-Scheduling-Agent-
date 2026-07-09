package com.appointmentagent.controller;

import com.appointmentagent.chatbot.ChatbotService;
import com.appointmentagent.dto.request.ChatRequest;
import com.appointmentagent.dto.response.ApiResponse;
import com.appointmentagent.dto.response.ChatResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
@Tag(name = "Chat", description = "AI Appointment Assistant chatbot")
@SecurityRequirement(name = "Bearer Authentication")
public class ChatController {

    private final ChatbotService chatbotService;

    @PostMapping("/message")
    @Operation(summary = "Send a message to the AI appointment assistant")
    public ResponseEntity<ApiResponse<ChatResponse>> sendMessage(
            @Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(ApiResponse.success(chatbotService.processMessage(request)));
    }
}
