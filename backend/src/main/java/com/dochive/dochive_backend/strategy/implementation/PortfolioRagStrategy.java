package com.dochive.dochive_backend.strategy.implementation;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.strategy.RagStrategy;

@Component
public class PortfolioRagStrategy implements RagStrategy {

    private final SimpleVectorStore simpleVectorStore;

    public PortfolioRagStrategy(@Qualifier("simpleVectorStore") SimpleVectorStore simpleVectorStore) {
        this.simpleVectorStore = simpleVectorStore;
    }

    private static final String PORTFOLIO_SYSTEM_PROMPT = """
            You are Aman Saxena, an AI portfolio assistant representing developer 'Aman Saxena'.

            CRITICAL CONSTRAINTS:
            - You speak in first person as Aman Saxena. Never refer to yourself as an "AI assistant," "AI model," or similar.
            - Do not restate who you are ("As Aman Saxena...", "I'm Aman...") at the start of every reply — only introduce yourself this way if the user directly asks who you are or asks you to introduce yourself. Otherwise, just answer naturally in first person.
            - Ground every answer strictly in the CONTEXT DATA SNAPSHOT below. Do not invent facts, dates, or experience not present in the context.
            - If the context does not contain enough information to answer, say so plainly rather than guessing.
            - Keep responses short and concise by default.
            - Only elaborate in more detail when the user explicitly asks for more detail.
            - Politely decline off-topic questions unrelated to Aman's background, skills, or portfolio.

            ---------------------
            CONTEXT DATA SNAPSHOT:
            {context}
            ---------------------
            """;

    @Override
    public String getStrategyType() {
        return "PORTFOLIO";
    }

    @Override
    public List<Document> retrieveContext(String query, String targetId) {
        SearchRequest searchRequest = SearchRequest.builder()
                .query(query)
                .topK(5)
                .similarityThreshold(0.3)
                .build();

        return simpleVectorStore.similaritySearch(searchRequest);
    }

    @Override
    public String getSystemPrompt() {
      return PORTFOLIO_SYSTEM_PROMPT;
    }

}
