package com.dochive.dochive_backend.service;

import java.util.List;
import java.util.regex.Pattern;

import org.springframework.ai.document.Document;
import org.springframework.stereotype.Component;

@Component
public class TextSanitizer {
    
    // Postgres text columns reject \u0000 outright — this is the hard failure case.
    private static final Pattern NULL_BYTE = Pattern.compile("\u0000");

    // Other C0 control chars (except \t \n \r) don't crash Postgres but are junk
    // artifacts from PDF/OCR extraction — safe to strip for cleaner embeddings.
    private static final Pattern OTHER_CONTROL_CHARS = Pattern.compile("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]");

    // Unicode replacement character — appears when extraction hits an
    // undecodable byte sequence (broken font encoding tables, corrupted glyphs).
    private static final Pattern REPLACEMENT_CHAR = Pattern.compile("\uFFFD");

    public String sanitize(String text) {
        if (text == null)
            return "";

        String cleaned = NULL_BYTE.matcher(text).replaceAll("");
        cleaned = OTHER_CONTROL_CHARS.matcher(cleaned).replaceAll("");
        cleaned = REPLACEMENT_CHAR.matcher(cleaned).replaceAll("");

        return cleaned;
    }

    /**
     * Sanitizes every Document's text content, dropping any that end up
     * blank after cleaning (pure garbage/binary-noise extractions).
     */
    public List<Document> sanitizeDocuments(List<Document> documents) {
        return documents.stream()
                .map(doc -> {
                    String cleaned = sanitize(doc.getText());
                    return doc.mutate().text(cleaned).build();
                })
                .filter(doc -> doc.getText() != null && !doc.getText().isBlank())
                .toList();
    }
}
