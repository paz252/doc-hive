package com.dochive.dochive_backend.service;

import com.dochive.dochive_backend.entity.DocumentMetaData;
import com.dochive.dochive_backend.repository.DocumentRepository;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DocumentIngestionService {

    private final VectorStore vectorStore;
    private final DocumentRepository documentRepository;

    @Transactional
    public DocumentMetaData ingestDocument(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        String contentType = file.getContentType();

        Resource resource = new InputStreamResource(file.getInputStream());
        List<Document> rawDocuments;

        if (contentType != null && contentType.contains("pdf")) {
            PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(resource);
            rawDocuments = pdfReader.get();
        } else {
            TikaDocumentReader tikaReader = new TikaDocumentReader(resource);
            rawDocuments = tikaReader.get();
        }

        // Save metadata entity first to generate Document ID
        DocumentMetaData metadata = DocumentMetaData.builder()
                .fileName(filename)
                .contentType(contentType)
                .fileSize(file.getSize())
                .build();
        DocumentMetaData savedMetadata = documentRepository.save(metadata);

        // Chunking the documents
        TokenTextSplitter textSplitter = TokenTextSplitter.builder()
                .withChunkSize(800)
                .withMinChunkSizeChars(500)
                .withMinChunkLengthToEmbed(10)
                .withMaxNumChunks(10000)
                .withKeepSeparator(true)
                .build();

        List<Document> chunks = textSplitter.apply(rawDocuments);

        // Enrich chunks with metadata context filters
        List<Document> enrichedChunks = chunks.stream()
                .map(doc -> doc.mutate()
                        .metadata("documentId", savedMetadata.getId())
                        .metadata("fileName", filename)
                        .build())
                .toList();

        // Store vector embeddings into PgVector
        vectorStore.accept(enrichedChunks);

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
}
