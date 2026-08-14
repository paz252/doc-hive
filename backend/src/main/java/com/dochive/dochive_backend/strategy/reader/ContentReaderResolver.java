package com.dochive.dochive_backend.strategy.reader;

import java.util.List;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ContentReaderResolver {

    // Spring injects this List already sorted by @Order across all ContentReaderStrategy beans
    private final List<ContentReaderStrategy> strategies;

    public ContentReaderStrategy resolve(String contentType, String filename) {
        return strategies.stream()
                .filter(s -> s.supports(contentType, filename))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "No reader strategy matched content type: " + contentType));
    }
}
