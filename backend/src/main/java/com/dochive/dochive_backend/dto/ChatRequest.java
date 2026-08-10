package com.dochive.dochive_backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request body payload for streaming RAG responses")
public class ChatRequest {

    @Schema(description = "RAG strategy engine to execute: DOCHIVE or PORTFOLIO", defaultValue = "PORTFOLIO", example = "PORTFOLIO")
    @Builder.Default
    private String engine = "PORTFOLIO";

    // requiredMode: NOT_REQUIRED by default
    @Schema(description = "Document UUID (required for DOCHIVE engine, optional/ignored for PORTFOLIO)")
    private String documentId;

    @NotBlank(message = "Prompt query message cannot be empty or blank")
    @Size(max = 1000, message = "Maximum 1000 characters allowed in the prompt.")
    @Schema(description = "User query prompt message", example = "What are Aman's technical skills?", requiredMode = Schema.RequiredMode.REQUIRED)
    private String query;
}
