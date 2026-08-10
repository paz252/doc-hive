package com.dochive.dochive_backend.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.dochive.dochive_backend.strategy.RagStrategy;

@Service
public class PolymorphicRagService {
    private final ChatClient.Builder chatClientBuilder;
    private final Map<String, RagStrategy> strategyMap;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    public PolymorphicRagService(ChatClient.Builder chatClientBuilder, List<RagStrategy> strategies) {
        this.chatClientBuilder = chatClientBuilder;
        // Map strategy type (DOCHIVE / PORTFOLIO) to implementation
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(RagStrategy::getStrategyType, Function.identity()));
    }

    public SseEmitter streamResponse(String engineType, String targetId, String query) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3-minute timeout

        executor.execute(() -> {
            try {
                RagStrategy strategy = strategyMap.get(engineType.toUpperCase());
                if (strategy == null) {
                    throw new IllegalArgumentException("Unsupported RAG engine type: " + engineType);
                }

                // Retrieve context polymorphically
                List<Document> contexts = strategy.retrieveContext(query, targetId);
                String contextText = contexts.stream()
                        .map(Document::getText)
                        .collect(Collectors.joining("\n\n---\n\n"));

                ChatClient chatClient = chatClientBuilder.build();

                // Stream tokens
                chatClient.prompt()
                        .system(sys -> sys.text(strategy.getSystemPrompt()).param("context", contextText))
                        .user(query)
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
