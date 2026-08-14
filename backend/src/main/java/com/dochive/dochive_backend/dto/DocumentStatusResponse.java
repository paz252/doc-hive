package com.dochive.dochive_backend.dto;

import com.dochive.dochive_backend.enums.IngestionStatus;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Ingestion progress for an uploaded document")
public class DocumentStatusResponse {
    private String id;
    private String fileName;
    private IngestionStatus status;
    private Integer totalChunks;
    private String errorMessage;
}
