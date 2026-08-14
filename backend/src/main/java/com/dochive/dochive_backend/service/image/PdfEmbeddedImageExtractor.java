package com.dochive.dochive_backend.service.image;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;

import javax.imageio.ImageIO;

import org.apache.pdfbox.cos.COSName;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.graphics.PDXObject;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.dto.ExtractedImage;

@Component
public class PdfEmbeddedImageExtractor implements EmbeddedImageExtractor {
    @Override
    public boolean supports(String contentType) {
        return contentType != null && contentType.toLowerCase().contains("pdf");
    }

    @Override
    public List<ExtractedImage> extractImages(Resource resource) {
        List<ExtractedImage> images = new ArrayList<>();

        try (var inputStream = resource.getInputStream()) {
            byte[] pdfBytes = inputStream.readAllBytes();

            try (PDDocument document = Loader.loadPDF(pdfBytes)) {
                int pageIndex = 0;
                for (PDPage page : document.getPages()) {
                    pageIndex++;
                    var resources = page.getResources();
                    if (resources == null)
                        continue;

                    for (COSName xObjectName : resources.getXObjectNames()) {
                        PDXObject xObject = resources.getXObject(xObjectName);
                        if (!(xObject instanceof PDImageXObject imageXObject))
                            continue;

                        if (imageXObject.getWidth() < 50 || imageXObject.getHeight() < 50)
                            continue;

                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        ImageIO.write(imageXObject.getImage(), "png", baos);
                        images.add(new ExtractedImage(baos.toByteArray(), "png", pageIndex));
                    }
                }
            }
        } catch (Exception e) {
            System.err.printf("PDF image extraction failed: %s%n", e.getMessage());
        }

        return images;
    }
}
