package com.dochive.dochive_backend.service;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.SearchRequest;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RagChatService {

    private final ChatClient.Builder chatClientBuilder;
    private final VectorStore vectorStore;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    private static final String RAG_SYSTEM_PROMPT = """
            You are DocHive AI, an intelligent document context assistant.

            GUARDRAILS AND INSTRUCTIONS:
            1. Answer the user query strictly using ONLY the provided contexts below.
            2. If the context does not contain enough information to answer the question, state clearly: "I cannot answer this question based on the selected document context."
            3. Do NOT hallucinate, extrapolate, or use general external background knowledge outside the provided document.
            4. Keep responses direct, professional, clear, and structured.

            CONTEXT FROM DOCUMENTS:
            ------------------------------------
            {context}
            ------------------------------------
            """;

    public SseEmitter streamRagResponse(String documentId, String userQuery) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3-minute timeout

        executor.execute(() -> {
            try {
                // Similarity search filtered by doc ID
                FilterExpressionBuilder b = new FilterExpressionBuilder();
                SearchRequest searchRequest = SearchRequest.builder()
                        .query(userQuery)
                        .topK(5)
                        .similarityThreshold(0.6)
                        .filterExpression(b.eq("documentId", documentId).build())
                        .build();

                List<Document> similarDocuments = vectorStore.similaritySearch(searchRequest);

                String contextText = similarDocuments.stream()
                        .map(Document::getText)
                        .collect(Collectors.joining("\n\n---\n\n"));

                ChatClient chatClient = chatClientBuilder.build();

                // Stream response from ChatClient and send chunks via SseEmitter
                chatClient.prompt()
                        .system(sys -> sys.text(RAG_SYSTEM_PROMPT).param("context", contextText))
                        .user(userQuery)
                        .stream()
                        .content()
                        .subscribe(
                                chunk -> {
                                    try {
                                        emitter.send(SseEmitter.event().data(chunk));
                                    } catch (IOException e) {
                                        emitter.completeWithError(e);
                                    }
                                },
                                emitter::completeWithError,
                                emitter::complete);

            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }
}