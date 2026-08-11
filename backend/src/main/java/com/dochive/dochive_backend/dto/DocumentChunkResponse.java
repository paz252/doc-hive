package com.dochive.dochive_backend.dto;

import java.util.Map;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Represents an individual text chunk stored in the vector database")
public class DocumentChunkResponse {
    @Schema(description = "Vector Store Record UUID")
    private String id;

    @Schema(description = "Raw extracted text chunk content")
    private String content;

    @Schema(description = "Metadata attributes associated with this chunk (e.g., documentId, fileName)")
    private Map<String, Object> metadata;
}
