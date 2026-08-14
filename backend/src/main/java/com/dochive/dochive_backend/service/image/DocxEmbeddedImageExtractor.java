package com.dochive.dochive_backend.service.image;

import java.util.ArrayList;
import java.util.List;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFPictureData;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.dto.ExtractedImage;

@Component
public class DocxEmbeddedImageExtractor implements EmbeddedImageExtractor {
    private static final int MIN_BYTES = 3_000; // filter tiny logos/bullets

    @Override
    public boolean supports(String contentType) {
        return contentType != null
                && (contentType.toLowerCase().contains("wordprocessingml")
                        || contentType.toLowerCase().contains("msword"));
    }

    @Override
    public List<ExtractedImage> extractImages(Resource resource) {
        List<ExtractedImage> images = new ArrayList<>();

        try (var inputStream = resource.getInputStream();
                XWPFDocument document = new XWPFDocument(inputStream)) {

            List<XWPFPictureData> pictures = document.getAllPictures();
            int index = 0;
            for (XWPFPictureData picture : pictures) {
                index++;
                byte[] data = picture.getData();
                if (data.length < MIN_BYTES)
                    continue;

                String format = picture.suggestFileExtension(); // e.g. "png", "jpeg"
                images.add(new ExtractedImage(data, format, index));
            }
        } catch (Exception e) {
            System.err.printf("DOCX image extraction failed: %s%n", e.getMessage());
        }

        return images;
    }
}
