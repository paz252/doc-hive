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
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.dochive.dochive_backend.dto.DocumentChunkResponse;
import com.dochive.dochive_backend.entity.DocumentMetaData;
import com.dochive.dochive_backend.repository.DocumentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final DocumentRepository documentRepository;

    @Transactional
    public DocumentMetaData ingestDocument(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();

        // Check for duplicates
        if (filename != null && documentRepository.existsByFileName(filename)) {
            throw new IllegalArgumentException("A document with the name '" + filename + "' already exists.");
        }

        String contentType = file.getContentType();
        Resource resource = new InputStreamResource(file.getInputStream());
        List<Document> rawDocuments;

        // Reader selection: PDFs use PagePdfDocumentReader; images/DOCX/TXT/MD use
        // TikaDocumentReader
        if (contentType != null && contentType.toLowerCase().contains("pdf")) {
            PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(resource);
            rawDocuments = pdfReader.get();
        } else {
            // TikaDocumentReader delegates image formats (.png, .jpg, .jpeg) to Tesseract
            // OCR automatically
            TikaDocumentReader tikaReader = new TikaDocumentReader(resource);
            rawDocuments = tikaReader.get();
        }

        // Save metadata entity first to generate Document UUID
        DocumentMetaData metadata = DocumentMetaData.builder()
                .fileName(filename)
                .contentType(contentType)
                .fileSize(file.getSize())
                .build();
        DocumentMetaData savedMetadata = documentRepository.save(metadata);

        // Token Chunking
        TokenTextSplitter textSplitter = TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(500)
                .withMinChunkLengthToEmbed(10)
                .withMaxNumChunks(10000)
                .withKeepSeparator(true)
                .build();

        List<Document> chunks = textSplitter.apply(rawDocuments);

        // Enrich chunks with metadata context filters using Spring AI .mutate()
        List<Document> enrichedChunks = chunks.stream()
                .map(doc -> doc.mutate()
                        .metadata("documentId", savedMetadata.getId())
                        .metadata("fileName", filename)
                        .build())
                .toList();

        // Vector Store Insertion (Only call vectorStore if readable chunks were
        // extracted)
        if (!enrichedChunks.isEmpty()) {
            vectorStore.accept(enrichedChunks);
            System.out.printf("Successfully embedded and stored {} chunks for file: {}", enrichedChunks.size(),
                    filename);
        } else {
            System.out.printf("No readable text or tokens extracted from file: {}. Total chunks = 0.", filename);
        }

        // 7. Save final chunk count (will be 0 if OCR extracted no text)
        savedMetadata.setTotalChunks(enrichedChunks.size());
        return documentRepository.save(savedMetadata);
    }

    public List<DocumentMetaData> getAllDocuments() {
        return documentRepository.findAllByOrderByUploadedAtDesc();
    }

    public DocumentMetaData getDocumentById(String id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found with ID: " + id));
    }

    // Retrieves raw text chunks using Spring AI's VectorStore & FilterExpressionBuilder
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
