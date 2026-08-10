package com.dochive.dochive_backend.strategy.implementation;

import java.util.Collections;
import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.strategy.RagStrategy;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class DocHiveRagStrategy implements RagStrategy {

    private final VectorStore vectorStore;

    private static final String DOCHIVE_SYSTEM_PROMPT = """
            You are DocHive AI, an intelligent document context assistant.

            GUARDRAILS AND INSTRUCTIONS:
            1. Answer the user query strictly using ONLY the provided contexts below.
            2. If the context does not contain enough information, state clearly: "I cannot answer this question based on the selected document context. No readable text was extracted from this file."
            3. Do NOT hallucinate or extrapolate outside the provided context.
            4. Keep responses direct, clear, and structured.

            CONTEXT FROM DOCUMENTS:
            ------------------------------------
            {context}
            ------------------------------------
            """;

    @Override
    public String getStrategyType() {
        return "DOCHIVE";
    }

    @Override
    public List<Document> retrieveContext(String query, String targetId) {

        // If documentId is missing or empty, fail fast with empty context
        if (targetId == null || targetId.isBlank()) {
            return Collections.emptyList();
        }

        FilterExpressionBuilder b = new FilterExpressionBuilder();
        SearchRequest searchRequest = SearchRequest.builder()
                .query(query)
                .topK(5)
                .similarityThreshold(0.3)
                .filterExpression(b.eq("documentId", targetId).build())
                .build();

        List<Document> result = vectorStore.similaritySearch(searchRequest);
        return result != null ? result : Collections.emptyList();
    }

    @Override
    public String getSystemPrompt() {
        return DOCHIVE_SYSTEM_PROMPT;
    }

}
