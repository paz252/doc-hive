package com.dochive.dochive_backend.service.image;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.awt.RenderingHints;
import java.io.ByteArrayInputStream;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import javax.imageio.ImageIO;

import org.springframework.ai.document.Document;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.dto.ExtractedImage;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ImageDocumentBuilder {
    private final TesseractOcrEngine ocrEngine;

    private static final int OCR_PARALLELISM = 3; // tune down if CPU-constrained on Render
    private static final int MAX_DIMENSION = 1600; // OCR accuracy plateaus well below this
    private static final int PER_IMAGE_TIMEOUT_SECONDS = 15;
    private static final int MAX_IMAGES_PER_DOCUMENT = 20; // guard against degenerate image-bomb PDFs

    public List<Document> buildFromImages(List<ExtractedImage> images, String sourceFileName) {
        if (images.isEmpty())
            return List.of();

        List<ExtractedImage> capped = images.size() > MAX_IMAGES_PER_DOCUMENT
                ? images.subList(0, MAX_IMAGES_PER_DOCUMENT)
                : images;

        ExecutorService ocrExecutor = Executors.newFixedThreadPool(
                Math.min(OCR_PARALLELISM, capped.size()));

        try {
            List<CompletableFuture<List<Document>>> futures = capped.stream()
                    .map(image -> CompletableFuture.supplyAsync(
                            () -> ocrWithTimeout(image, sourceFileName), ocrExecutor))
                    .toList();

            return futures.stream()
                    .map(CompletableFuture::join)
                    .flatMap(List::stream)
                    .toList();
        } finally {
            ocrExecutor.shutdown();
        }
    }

    private List<Document> ocrWithTimeout(ExtractedImage image, String sourceFileName) {
        try {
            return CompletableFuture
                    .supplyAsync(() -> ocrSingleImage(image, sourceFileName))
                    .get(PER_IMAGE_TIMEOUT_SECONDS, TimeUnit.SECONDS);
        } catch (Exception e) {
            System.err.printf("OCR timed out/failed for image in %s (location %d): %s%n",
                    sourceFileName, image.locationIndex(), e.getMessage());
            return List.of();
        }
    }

    private List<Document> ocrSingleImage(ExtractedImage image, String sourceFileName) {
        try {
            BufferedImage original = ImageIO.read(new ByteArrayInputStream(image.data()));
            if (original == null)
                return List.of();

            BufferedImage scaled = downscaleIfLarge(original, MAX_DIMENSION);

            String text = ocrEngine.extractText(scaled);
            if (text == null || text.isBlank())
                return List.of();

            Document doc = new Document(text.trim(), java.util.Map.of(
                    "contentSource", "EMBEDDED_IMAGE",
                    "locationIndex", image.locationIndex(),
                    "imageFormat", image.format(),
                    "sourceFile", sourceFileName != null ? sourceFileName : "unknown"));

            return List.of(doc);
        } catch (Exception e) {
            System.err.printf("OCR failed for image in %s (location %d): %s%n",
                    sourceFileName, image.locationIndex(), e.getMessage());
            return List.of();
        }
    }

    private BufferedImage downscaleIfLarge(BufferedImage original, int maxDimension) {
        int width = original.getWidth();
        int height = original.getHeight();

        if (width <= maxDimension && height <= maxDimension) {
            return original;
        }

        double scale = (double) maxDimension / Math.max(width, height);
        int newWidth = (int) (width * scale);
        int newHeight = (int) (height * scale);

        BufferedImage resized = new BufferedImage(newWidth, newHeight, original.getType());
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(original, 0, 0, newWidth, newHeight, null);
        g.dispose();

        return resized;
    }
}
