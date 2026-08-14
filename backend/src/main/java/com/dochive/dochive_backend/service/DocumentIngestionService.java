package com.dochive.dochive_backend.service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dochive.dochive_backend.dto.DocumentChunkResponse;
import com.dochive.dochive_backend.entity.DocumentMetaData;
import com.dochive.dochive_backend.enums.IngestionStatus;
import com.dochive.dochive_backend.repository.DocumentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final DocumentRepository documentRepository;
    private final AsyncIngestionProcessor asyncProcessor;

    /**
     * Saves metadata synchronously (fast, so the client gets an ID immediately),
     * then hands parsing/chunking/embedding off to the async executor.
     */
    public DocumentMetaData submitDocument(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();

        // Check for duplicates
        if (filename != null && documentRepository.existsByFileName(filename)) {
            throw new IllegalArgumentException("A document with the name '" + filename + "' already exists.");
        }

        byte[] fileBytes = file.getBytes();
        String contentType = file.getContentType();

        DocumentMetaData metadata = DocumentMetaData.builder()
                .fileName(filename)
                .contentType(contentType)
                .fileSize(file.getSize())
                .status(IngestionStatus.PENDING)
                .totalChunks(0)
                .build();

        DocumentMetaData saved = documentRepository.save(metadata);
        asyncProcessor.process(saved.getId(), fileBytes, contentType, filename);

        return saved;
    }

    public List<DocumentMetaData> getAllDocuments() {
        return documentRepository.findAllByOrderByUploadedAtDesc();
    }

    public DocumentMetaData getDocumentById(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + id));
    }

    // Retrieves raw text chunks using Spring AI's VectorStore &
    // FilterExpressionBuilder
    @Cacheable(value = "documentChunks", key = "#documentId")
    public List<DocumentChunkResponse> getDocumentChunks(String documentId) {
        // Verify document existence
        DocumentMetaData metadata = getDocumentById(documentId);

        if (metadata.getTotalChunks() == 0) {
            return Collections.emptyList();
        }

        // Build Spring AI filter expression targeting metadata.documentId = documentId
        FilterExpressionBuilder builder = new FilterExpressionBuilder();
        SearchRequest searchRequest = SearchRequest.builder()
                .query("*")
                .topK(100) // Retrieve up to 100 chunks for this document
                .filterExpression(builder.eq("documentId", documentId).build())
                .build();

        List<Document> matchedDocuments = vectorStore.similaritySearch(searchRequest);

        return matchedDocuments.stream()
                .map(doc -> DocumentChunkResponse.builder()
                        .id(doc.getId())
                        .content(doc.getText())
                        .metadata(doc.getMetadata())
                        .build())
                .toList();
    }

    @CacheEvict(value = "documentChunks", key = "#id")
    @Transactional
    public void deleteDocument(String id) {
        DocumentMetaData metadata = getDocumentById(id);

        // Delete associated vectors from PgVector Store
        FilterExpressionBuilder b = new FilterExpressionBuilder();
        vectorStore.delete(b.eq("documentId", id).build());

        // Delete metadata entity from PostgreSQL
        documentRepository.delete(metadata);
        System.out.printf("Successfully deleted document and vector embeddings for ID: {}", id);
    }
}
