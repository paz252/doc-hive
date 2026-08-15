package com.dochive.dochive_backend.service;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.dochive.dochive_backend.enums.IngestionStatus;
import com.dochive.dochive_backend.repository.DocumentRepository;
import com.dochive.dochive_backend.strategy.reader.ContentReaderResolver;
import com.dochive.dochive_backend.strategy.reader.ContentReaderStrategy;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AsyncIngestionProcessor {

    private final @Qualifier("pgVectorStore") VectorStore vectorStore;
    private final DocumentRepository documentRepository;
    private final ContentReaderResolver readerResolver;
    private final ChunkingService chunkingService;
    private final TextSanitizer textSanitizer;

    @Async("ingestionExecutor")
    public void process(String documentId, byte[] fileBytes, String contentType, String filename) {
        try {
            updateStatus(documentId, IngestionStatus.PARSING, null);

            Resource resource = new ByteArrayResource(fileBytes);
            ContentReaderStrategy strategy = readerResolver.resolve(contentType, filename);
            List<Document> rawDocuments = strategy.read(resource);

            // Sanitize immediately after extraction — before chunking splits text
            List<Document> sanitizedDocuments = textSanitizer.sanitizeDocuments(rawDocuments);

            if (sanitizedDocuments.isEmpty()) {
                finalizeSuccess(documentId, 0); // nothing extractable after cleaning
                return;
            }

            updateStatus(documentId, IngestionStatus.CHUNKING, null);
            List<Document> chunks = chunkingService.chunk(sanitizedDocuments);

            List<Document> enrichedChunks = chunks.stream()
                    .map(doc -> doc.mutate()
                            .metadata("documentId", documentId)
                            .metadata("fileName", filename)
                            .build())
                    .toList();

            updateStatus(documentId, IngestionStatus.EMBEDDING, null);
            if (!enrichedChunks.isEmpty()) {
                vectorStore.accept(enrichedChunks);
                System.out.printf("Successfully embedded %d chunks for file: %s%n",
                        enrichedChunks.size(), filename);
            } else {
                System.out.printf("No readable text extracted from file: %s. Total chunks = 0.%n", filename);
            }

            finalizeSuccess(documentId, enrichedChunks.size());

        } catch (Exception e) {
            System.err.printf("Ingestion failed for document %s: %s%n", documentId, e.getMessage());
            updateStatus(documentId, IngestionStatus.FAILED, truncate(e.getMessage()));
        }
    }

    @Transactional
    protected void updateStatus(String id, IngestionStatus status, String error) {
        documentRepository.findById(id).ifPresent(m -> {
            m.setStatus(status);
            m.setErrorMessage(error);
            documentRepository.save(m);
        });
    }

    @Transactional
    protected void finalizeSuccess(String id, int chunkCount) {
        documentRepository.findById(id).ifPresent(m -> {
            m.setTotalChunks(chunkCount);
            m.setStatus(IngestionStatus.COMPLETED);
            m.setErrorMessage(null);
            documentRepository.save(m);
        });
    }

    private String truncate(String msg) {
        if (msg == null)
            return "Unknown error during ingestion";
        return msg.length() > 1000 ? msg.substring(0, 1000) : msg;
    }
}
