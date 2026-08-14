package com.dochive.dochive_backend.strategy.reader.impl;

import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.ai.document.Document;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.strategy.reader.ContentReaderStrategy;

@Component
@Order(4)
public class CsvContentReaderStrategy implements ContentReaderStrategy {
    // Rows grouped per Document to avoid one-embedding-call-per-row at scale
    private static final int ROWS_PER_BATCH = 25;

    @Override
    public boolean supports(String contentType, String filename) {
        boolean contentTypeMatch = contentType != null && contentType.toLowerCase().contains("csv");
        boolean extensionMatch = filename != null && filename.toLowerCase().endsWith(".csv");

        // Content-Type headers for CSV are notoriously unreliable across
        // browsers/clients,
        // so fall back to the file extension too.
        return contentTypeMatch || extensionMatch;
    }

    @Override
    public List<Document> read(Resource resource) {
        List<Document> documents = new ArrayList<>();

        try (Reader reader = new java.io.InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
                CSVParser parser = CSVFormat.DEFAULT.builder()
                        .setHeader()
                        .setSkipHeaderRecord(true)
                        .setIgnoreEmptyLines(true)
                        .setTrim(true)
                        .build()
                        .parse(reader)) {

            List<String> headers = parser.getHeaderNames();
            if (headers.isEmpty()) {
                System.err.printf("CSV file %s has no detectable header row — skipping.%n", resource.getFilename());
                return documents;
            }

            List<CSVRecord> batch = new ArrayList<>(ROWS_PER_BATCH);
            int rowStart = 1; // 1-indexed, excluding header

            for (CSVRecord record : parser) {
                batch.add(record);
                if (batch.size() == ROWS_PER_BATCH) {
                    documents.add(buildBatchDocument(headers, batch, rowStart, resource.getFilename()));
                    rowStart += batch.size();
                    batch = new ArrayList<>(ROWS_PER_BATCH);
                }
            }
            // flush remaining partial batch
            if (!batch.isEmpty()) {
                documents.add(buildBatchDocument(headers, batch, rowStart, resource.getFilename()));
            }

        } catch (IOException e) {
            System.err.printf("Failed to parse CSV file %s: %s%n", resource.getFilename(), e.getMessage());
        }

        return documents;
    }

    private Document buildBatchDocument(List<String> headers, List<CSVRecord> batch, int rowStart, String filename) {
        StringBuilder text = new StringBuilder();
        text.append("Columns: ").append(String.join(", ", headers)).append("\n\n");

        for (CSVRecord record : batch) {
            for (String header : headers) {
                text.append(header).append(": ").append(record.get(header)).append("; ");
            }
            text.append("\n");
        }

        int rowEnd = rowStart + batch.size() - 1;

        return new Document(text.toString(), java.util.Map.of(
                "contentSource", "CSV",
                "rowStart", rowStart,
                "rowEnd", rowEnd,
                "sourceFile", filename != null ? filename : "unknown"));
    }

    @Override
    public String getStrategyName() {
        return "CSV";
    }
}
