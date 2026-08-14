package com.dochive.dochive_backend.service;

import java.util.List;

import org.springframework.ai.document.Document;

import com.dochive.dochive_backend.config.ChunkingConfig;

public interface ChunkingService {
    List<Document> chunk(List<Document> rawDocuments, ChunkingConfig config);

    default List<Document> chunk(List<Document> rawDocuments) {
        return chunk(rawDocuments, ChunkingConfig.dochiveDefaults());
    }
}
