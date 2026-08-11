package com.dochive.dochive_backend.strategy;

import java.util.List;

import org.springframework.ai.document.Document;

/*
This interface defines contract methods for retrieving context chunks and identifying the target strategy type.
*/

public interface RagStrategy {

    // Identifies the strategy type ("DOCHIVE" or "PORTFOLIO")
    String getStrategyType();

    // Retrieves context documents matching the user query
    List<Document> retrieveContext(String query, List<String> documentIds);

    // System prompt specific to the assistant persona and guardrails
    String getSystemPrompt();
}
