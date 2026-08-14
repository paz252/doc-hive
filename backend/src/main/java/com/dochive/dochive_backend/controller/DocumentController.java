package com.dochive.dochive_backend.controller;

import java.io.IOException;
import java.net.URI;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import com.dochive.dochive_backend.dto.DocumentChunkResponse;
import com.dochive.dochive_backend.dto.DocumentStatusResponse;
import com.dochive.dochive_backend.entity.DocumentMetaData;
import com.dochive.dochive_backend.service.DocumentIngestionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Tag(name = "Document Management", description = "Endpoints for uploading, retrieving, and deleting ingestion metadata")
public class DocumentController {

    private final DocumentIngestionService ingestionService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Submit document (PDF, DOCX, TXT, MD, image) for ingestion into Vector Store")
    public ResponseEntity<DocumentMetaData> uploadDocument(@RequestParam("file") MultipartFile file, UriComponentsBuilder uriBuilder)
            throws IOException {
        DocumentMetaData metadata = ingestionService.submitDocument(file);

        URI statusUri = uriBuilder.path("/api/v1/documents/{id}/status")
                .buildAndExpand(metadata.getId())
                .toUri();
        
        return ResponseEntity.status(HttpStatus.ACCEPTED).location(statusUri).body(metadata);
    }

    @GetMapping("/{id}/status")
    @Operation(summary = "Poll ingestion status for an uploaded document")
    public ResponseEntity<DocumentStatusResponse> getStatus(@PathVariable String id) {
        DocumentMetaData m = ingestionService.getDocumentById(id);
        return ResponseEntity.ok(DocumentStatusResponse.builder()
                .id(m.getId())
                .fileName(m.getFileName())
                .status(m.getStatus())
                .totalChunks(m.getTotalChunks())
                .errorMessage(m.getErrorMessage())
                .build());
    }

    @GetMapping
    @Operation(summary = "Get all uploaded documents list")
    public ResponseEntity<List<DocumentMetaData>> getAllDocuments() {
        return ResponseEntity.ok(ingestionService.getAllDocuments());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get metadata of specific document")
    public ResponseEntity<DocumentMetaData> getDocumentById(@PathVariable String id) {
        return ResponseEntity.ok(ingestionService.getDocumentById(id));
    }

    @GetMapping("/{id}/chunks")
    @Operation(summary = "Get all raw text chunks and metadata stored in vector store for a specific document")
    public ResponseEntity<List<DocumentChunkResponse>> getDocumentChunks(@PathVariable String id) {
        return ResponseEntity.ok(ingestionService.getDocumentChunks(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete document metadata and associated vector store embeddings")
    public ResponseEntity<Void> deleteDocument(@PathVariable String id) {
        ingestionService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
