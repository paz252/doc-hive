package com.dochive.dochive_backend.service.image;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
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

    private static final int OCR_PARALLELISM = 1;
    private static final int MAX_DIMENSION = 1600; // OCR accuracy plateaus well below this
    private static final int MAX_IMAGES_PER_DOCUMENT = 20; // guard against degenerate image-bomb PDFs

    public List<Document> buildFromImages(
            List<ExtractedImage> images,
            String sourceFileName) {

        if (images == null || images.isEmpty()) {
            return List.of();
        }

        List<ExtractedImage> capped = images.size() > MAX_IMAGES_PER_DOCUMENT
                ? images.subList(0, MAX_IMAGES_PER_DOCUMENT)
                : images;

        System.out.printf(
                "Starting OCR for %d image(s) in %s%n",
                capped.size(),
                sourceFileName);

        ExecutorService ocrExecutor = Executors.newFixedThreadPool(
                Math.min(OCR_PARALLELISM, capped.size()));

        try {

            List<CompletableFuture<List<Document>>> futures = capped.stream()
                    .map(image -> CompletableFuture.supplyAsync(
                            () -> ocrSingleImage(
                                    image,
                                    sourceFileName),
                            ocrExecutor))
                    .toList();

            return futures.stream()
                    .map(CompletableFuture::join)
                    .flatMap(List::stream)
                    .toList();

        } finally {
            ocrExecutor.shutdown();

            try {
                if (!ocrExecutor.awaitTermination(5, TimeUnit.SECONDS)) {
                    ocrExecutor.shutdownNow();
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                ocrExecutor.shutdownNow();
            }
        }
    }

    private List<Document> ocrSingleImage(
            ExtractedImage image,
            String sourceFileName) {

        long totalStart = System.currentTimeMillis();

        try {
            // Decode image
            long decodeStart = System.currentTimeMillis();

            BufferedImage original = ImageIO.read(
                    new ByteArrayInputStream(image.data()));

            long decodeTime = System.currentTimeMillis() - decodeStart;

            if (original == null) {
                System.err.printf(
                        "Could not decode image %d in %s%n",
                        image.locationIndex(),
                        sourceFileName);

                return List.of();
            }

            // Resize before OCR
            long resizeStart = System.currentTimeMillis();

            BufferedImage scaled = downscaleIfLarge(
                    original,
                    MAX_DIMENSION);

            long resizeTime = System.currentTimeMillis() - resizeStart;

            System.out.printf(
                    "OCR image %d | original=%dx%d | scaled=%dx%d%n",
                    image.locationIndex(),
                    original.getWidth(),
                    original.getHeight(),
                    scaled.getWidth(),
                    scaled.getHeight());

            // OCR
            long ocrStart = System.currentTimeMillis();

            String text = ocrEngine.extractText(scaled);

            long ocrTime = System.currentTimeMillis() - ocrStart;

            long totalTime = System.currentTimeMillis() - totalStart;

            System.out.printf(
                    "OCR image %d completed | decode=%dms | resize=%dms | OCR=%dms | total=%dms%n",
                    image.locationIndex(),
                    decodeTime,
                    resizeTime,
                    ocrTime,
                    totalTime);

            if (text == null || text.isBlank()) {
                System.out.printf(
                        "OCR image %d produced no text%n",
                        image.locationIndex());

                return List.of();
            }

            // Convert OCR result to Spring AI Document
            Document doc = new Document(
                    text.trim(),
                    java.util.Map.of(
                            "contentSource",
                            "EMBEDDED_IMAGE",

                            "locationIndex",
                            image.locationIndex(),

                            "imageFormat",
                            image.format(),

                            "sourceFile",
                            sourceFileName != null
                                    ? sourceFileName
                                    : "unknown"));

            return List.of(doc);

        } catch (Exception e) {

            long totalTime = System.currentTimeMillis() - totalStart;

            System.err.printf(
                    "OCR failed for image %d in %s after %dms: %s%n",
                    image.locationIndex(),
                    sourceFileName,
                    totalTime,
                    e.getMessage());

            e.printStackTrace();

            return List.of();
        }
    }

    private BufferedImage downscaleIfLarge(
            BufferedImage original,
            int maxDimension) {

        int width = original.getWidth();
        int height = original.getHeight();

        if (width <= maxDimension && height <= maxDimension) {
            return original;
        }

        double scale = (double) maxDimension
                / Math.max(width, height);

        int newWidth = Math.max(1, (int) (width * scale));

        int newHeight = Math.max(1, (int) (height * scale));

        /*
         * TYPE_CUSTOM can cause problems with some images.
         * TYPE_INT_RGB provides a predictable format for OCR.
         */
        BufferedImage resized = new BufferedImage(
                newWidth,
                newHeight,
                BufferedImage.TYPE_INT_RGB);

        Graphics2D g = resized.createGraphics();

        try {
            g.drawImage(
                    original,
                    0,
                    0,
                    newWidth,
                    newHeight,
                    null);
        } finally {
            g.dispose();
        }

        return resized;
    }
}
