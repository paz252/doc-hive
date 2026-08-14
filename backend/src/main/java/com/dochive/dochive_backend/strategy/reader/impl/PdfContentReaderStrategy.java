package com.dochive.dochive_backend.strategy.reader.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.dto.ExtractedImage;
import com.dochive.dochive_backend.service.image.ImageDocumentBuilder;
import com.dochive.dochive_backend.service.image.PdfEmbeddedImageExtractor;
import com.dochive.dochive_backend.strategy.reader.ContentReaderStrategy;

import lombok.RequiredArgsConstructor;

@Component
@Order(1)
@RequiredArgsConstructor
public class PdfContentReaderStrategy implements ContentReaderStrategy {

    private final PdfEmbeddedImageExtractor imageExtractor;
    private final ImageDocumentBuilder imageDocumentBuilder;

    @Override
    public boolean supports(String contentType, String filename) {
        return contentType != null && contentType.toLowerCase().contains("pdf");
    }

    @Override
    public List<Document> read(Resource resource) {
        List<Document> allDocs = new ArrayList<>();

        // 1. Regular text extraction (unchanged behavior)
        List<Document> textDocs = new PagePdfDocumentReader(resource).get();
        allDocs.addAll(textDocs);

        // 2. Embedded image extraction + OCR (new)
        try {
            List<ExtractedImage> images = imageExtractor.extractImages(resource);
            if (!images.isEmpty()) {
                String filename = resource.getFilename();
                List<Document> imageDocs = imageDocumentBuilder.buildFromImages(images, filename);
                allDocs.addAll(imageDocs);
            }
        } catch (Exception e) {
            // Image extraction is best-effort — never fail the whole ingestion over it
            System.err.printf("Embedded image processing skipped for PDF: %s%n", e.getMessage());
        }

        return allDocs;
    }

    @Override
    public String getStrategyName() {
        return "PDF";
    }

}
