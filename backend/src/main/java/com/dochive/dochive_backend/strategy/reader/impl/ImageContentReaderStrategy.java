package com.dochive.dochive_backend.strategy.reader.impl;

import java.util.List;
import java.util.Set;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.strategy.reader.ContentReaderStrategy;

@Component
@Order(2)
public class ImageContentReaderStrategy implements ContentReaderStrategy {

    private static final Set<String> IMAGE_TYPES = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/tiff", "image/bmp");

    @Override
    public boolean supports(String contentType, String filename) {
        return contentType != null && IMAGE_TYPES.contains(contentType.toLowerCase());
    }

    @Override
    public List<Document> read(Resource resource) {
        // TikaDocumentReader delegates to Tesseract OCR for image formats
        return new TikaDocumentReader(resource).get();
    }

    @Override
    public String getStrategyName() {
        return "IMAGE_OCR";
    }
}
