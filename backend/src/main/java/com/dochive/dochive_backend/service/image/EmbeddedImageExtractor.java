package com.dochive.dochive_backend.service.image;

import java.util.List;

import org.springframework.core.io.Resource;

import com.dochive.dochive_backend.dto.ExtractedImage;

public interface EmbeddedImageExtractor {
    boolean supports(String contentType);

    List<ExtractedImage> extractImages(Resource resource);
}
