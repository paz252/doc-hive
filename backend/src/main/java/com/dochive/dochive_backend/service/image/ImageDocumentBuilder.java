package com.dochive.dochive_backend.service.image;

import java.util.ArrayList;
import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.dto.ExtractedImage;
import com.dochive.dochive_backend.strategy.reader.impl.ImageContentReaderStrategy;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ImageDocumentBuilder {
private final ImageContentReaderStrategy imageReaderStrategy;

    /**
     * OCRs each extracted image and wraps successful results as Documents,
     * tagged so downstream chunking/RAG can tell image-derived text apart from body text.
     */
    public List<Document> buildFromImages(List<ExtractedImage> images, String sourceFileName) {
        List<Document> results = new ArrayList<>();

        for (ExtractedImage image : images) {
            try {
                ByteArrayResource resource = new ByteArrayResource(image.data());
                List<Document> ocrDocs = imageReaderStrategy.read(resource);

                for (Document doc : ocrDocs) {
                    String text = doc.getText();
                    if (text == null || text.isBlank()) continue; // OCR found nothing — skip, don't pollute the store

                    Document tagged = doc.mutate()
                            .metadata("contentSource", "EMBEDDED_IMAGE")
                            .metadata("locationIndex", image.locationIndex())
                            .metadata("imageFormat", image.format())
                            .build();
                    results.add(tagged);
                }
            } catch (Exception e) {
                System.err.printf("OCR failed for embedded image in %s (location %d): %s%n",
                        sourceFileName, image.locationIndex(), e.getMessage());
                // one bad image shouldn't fail the whole document — continue
            }
        }

        return results;
    }
}
