package com.dochive.dochive_backend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.dochive.dochive_backend.dto.ChatRequest;
import com.dochive.dochive_backend.service.PolymorphicRagService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Polymorphic RAG Engine", description = "Endpoint supporting DocHive and Portfolio chat pipelines")
public class ChatController {

    private final PolymorphicRagService ragService;

    @PostMapping(value = "/stream", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream SSE response using selected RAG engine (DOCHIVE or PORTFOLIO)")
    public SseEmitter streamChat(@Valid @RequestBody ChatRequest request) {
        return ragService.streamResponse(
                request.getEngine() != null ? request.getEngine() : "PORTFOLIO",
                request.getDocumentIds(),
                request.getQuery());
    }
}
