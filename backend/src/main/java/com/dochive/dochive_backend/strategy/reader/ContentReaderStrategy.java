package com.dochive.dochive_backend.strategy.reader;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.core.io.Resource;

public interface ContentReaderStrategy {
    boolean supports(String contentType, String filename);

    List<Document> read(Resource resource);

    String getStrategyName();
}
