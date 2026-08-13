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
            1. Answer the user query strictly using ONLY the provided context below. Do not
               use outside knowledge, and do not hallucinate or extrapolate beyond what is
               given.
            2. If the provided context does not contain enough information to answer the
               query, state clearly: "I couldn't find relevant information in the selected
               document(s) to answer this question." Do not speculate about why the context
               might be missing or insufficient — you only see what was retrieved, not the
               underlying ingestion process.
            3. When asked to summarize, explain concepts, or extract insights (e.g. Q&A
               pairs, technical architecture), synthesize information across ALL provided
               chunks. Do not just repeat or expand on the first chunk you see — read
               through the entire context before answering.
            4. If multiple documents are present in the context, structure your answer by
               document when it aids clarity, and note which document each key point comes
               from (use the fileName metadata if available).
            5. For technical or architectural content, preserve relationships between
               components (e.g. what connects to what, data flow, order of operations)
               rather than listing isolated facts.
            6. Keep responses direct, clear, and well-structured — use headings, bullet
               points, or numbered lists where they improve readability.
            7. Never fabricate document names, IDs, or content that isn't present in the
               context below.

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
    public List<Document> retrieveContext(String query, List<String> documentIds) {

        SearchRequest.Builder searchRequestBuilder = SearchRequest.builder()
                .query(query)
                .topK(8) // Increased topK to accommodate chunks across multiple files
                .similarityThreshold(0.1);

        // Dynamic Filtering Logic
        if (documentIds != null && !documentIds.isEmpty()) {
            List<String> validIds = documentIds.stream()
                    .filter(id -> id != null && !id.isBlank())
                    .toList();

            if (!validIds.isEmpty()) {
                FilterExpressionBuilder b = new FilterExpressionBuilder();
                if (validIds.size() == 1) {
                    // Filter by 1 single document ID
                    searchRequestBuilder.filterExpression(b.eq("documentId", validIds.get(0)).build());
                } else {
                    // Filter by multiple document IDs
                    searchRequestBuilder.filterExpression(b.in("documentId", validIds.toArray()).build());
                }
            }
        }
        // If documentIds is empty or null, no filter is applied -> Searches across ALL
        // uploaded documents in pgvector!

        List<Document> result = vectorStore.similaritySearch(searchRequestBuilder.build());
        return result != null ? result : Collections.emptyList();
    }

    @Override
    public String getSystemPrompt() {
        return DOCHIVE_SYSTEM_PROMPT;
    }

}
