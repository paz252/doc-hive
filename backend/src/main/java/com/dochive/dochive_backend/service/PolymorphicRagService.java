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
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.dochive.dochive_backend.strategy.RagStrategy;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PolymorphicRagService {

    private final ChatClient.Builder chatClientBuilder;
    private final RagContextCacheService contextCacheService;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    private final List<RagStrategy> strategyList; // used to build the map below
    private Map<String, RagStrategy> strategyMap;

    private Map<String, RagStrategy> strategies() {
        if (strategyMap == null) {
            strategyMap = strategyList.stream()
                    .collect(Collectors.toMap(RagStrategy::getStrategyType, Function.identity()));
        }
        return strategyMap;
    }

    public SseEmitter streamResponse(String engineType, List<String> documentIds, String query) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3-minute timeout

        executor.execute(() -> {
            try {
                RagStrategy strategy = strategies().get(engineType.toUpperCase());
                if (strategy == null) {
                    throw new IllegalArgumentException("Unsupported RAG engine type: " + engineType);
                }

                // Cached context retrieval — repeated/near-identical queries skip the vector
                // search
                List<Document> contexts = contextCacheService.retrieve(strategy, engineType.toUpperCase(), query,
                        documentIds);
                final String contextText = extractContextText(contexts);

                ChatClient chatClient = chatClientBuilder.build();

                chatClient.prompt()
                        .system(sys -> sys.text(strategy.getSystemPrompt()).param("context", contextText))
                        .user(query)
                        .stream()
                        .content()
                        .subscribe(
                                chunk -> {
                                    try {
                                        emitter.send(SseEmitter.event().data(chunk, MediaType.APPLICATION_JSON));
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

    /**
     * Helper method to safely extract and format text chunks,
     * keeping the caller method clean and effectively final.
     */
    private String extractContextText(List<Document> contexts) {
        if (contexts == null || contexts.isEmpty()) {
            return "NO_READABLE_TEXT_FOUND";
        }

        String joinedText = contexts.stream()
                .map(Document::getText)
                .filter(text -> text != null && !text.isBlank())
                .collect(Collectors.joining("\n\n---\n\n"));

        return joinedText.isBlank() ? "NO_READABLE_TEXT_FOUND" : joinedText;
    }
}
