package com.dochive.dochive_backend.strategy.reader.impl;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.imageio.ImageIO;

import org.springframework.ai.document.Document;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.service.image.TesseractOcrEngine;
import com.dochive.dochive_backend.strategy.reader.ContentReaderStrategy;

import lombok.RequiredArgsConstructor;

@Component
@Order(2)
@RequiredArgsConstructor
public class ImageContentReaderStrategy implements ContentReaderStrategy {

    private static final Set<String> IMAGE_TYPES = Set.of(
            "image/png", "image/jpeg", "image/jpg", "image/tiff", "image/bmp");

    private final TesseractOcrEngine ocrEngine;

    @Override
    public boolean supports(String contentType, String filename) {
        return contentType != null && IMAGE_TYPES.contains(contentType.toLowerCase());
    }

    @Override
    public List<Document> read(Resource resource) {
        try {
            byte[] bytes = resource.getInputStream().readAllBytes();
            BufferedImage image = ImageIO.read(new ByteArrayInputStream(bytes));

            if (image == null) {
                System.err.printf("Could not decode image: %s%n", resource.getFilename());
                return List.of();
            }

            String text = ocrEngine.extractText(image);
            if (text == null || text.isBlank()) {
                return List.of();
            }

            Document doc = new Document(text.trim(), Map.of(
                    "contentSource", "STANDALONE_IMAGE",
                    "sourceFile", resource.getFilename() != null ? resource.getFilename() : "unknown"));

            return List.of(doc);

        } catch (Exception e) {
            System.err.printf("OCR failed for image %s: %s%n", resource.getFilename(), e.getMessage());
            return List.of();
        }
    }

    @Override
    public String getStrategyName() {
        return "IMAGE_OCR";
    }
}
