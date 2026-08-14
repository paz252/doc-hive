package com.dochive.dochive_backend.strategy.reader.impl;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.reader.tika.TikaDocumentReader;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.strategy.reader.ContentReaderStrategy;

@Component
@Order(99)
public class TikaFallbackReaderStrategy implements ContentReaderStrategy{
@Override
    public boolean supports(String contentType, String filename) {
        return true; // always matches, must stay ordered last
    }

    @Override
    public List<Document> read(Resource resource) {
        return new TikaDocumentReader(resource).get();
    }

    @Override
    public String getStrategyName() {
        return "TIKA_GENERIC";
    }
}
