package com.dochive.dochive_backend.service;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import com.dochive.dochive_backend.strategy.RagStrategy;

@Service
public class RagContextCacheService {
    @Cacheable(value = "ragContext", key = "T(java.util.Objects).hash(#engine, #query, #documentIds)")
    public List<Document> retrieve(RagStrategy strategy, String engine, String query, List<String> documentIds) {
        return strategy.retrieveContext(query, documentIds);
    }
}
