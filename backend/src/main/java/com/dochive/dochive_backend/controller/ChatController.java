package com.dochive.dochive_backend.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.dochive.dochive_backend.service.PolymorphicRagService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Polymorphic RAG Engine", description = "Endpoint supporting DocHive and Portfolio chat pipelines")
public class ChatController {

    private final PolymorphicRagService ragService;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "Stream SSE response using selected RAG engine (DOCHIVE or PORTFOLIO)")
    public SseEmitter streamChat(
            @RequestParam(defaultValue = "PORTFOLIO") String engine,
            @RequestParam(required = false) String documentId,
            @RequestParam String query) {
        return ragService.streamResponse(engine, documentId, query);
    }
}
