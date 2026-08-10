package com.dochive.dochive_backend.config;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.ai.reader.TextReader;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.SimpleVectorStore;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.pgvector.PgVectorStore;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.Resource;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.beans.factory.annotation.Value;

@Configuration
public class VectorStoreConfig {

    @Value("${portfolio.data.source-path}")
    private Resource markdownResource;

    // DocHive Primary Vector Store (PgVector)
    @Bean(name = "pgVectorStore")
    @Primary
    public VectorStore pgVectorStore(JdbcTemplate jdbcTemplate, EmbeddingModel embeddingModel) {
        return PgVectorStore.builder(jdbcTemplate, embeddingModel)
                .dimensions(3072)
                .distanceType(PgVectorStore.PgDistanceType.COSINE_DISTANCE)
                .indexType(PgVectorStore.PgIndexType.HNSW)
                .initializeSchema(true)
                .build();
    }

    // Portfolio In-Memory Vector Store (SimpleVectorStore)
    @Bean(name = "simpleVectorStore")
    public SimpleVectorStore simpleVectorStore(EmbeddingModel embeddingModel) {
        SimpleVectorStore simpleVectorStore = SimpleVectorStore.builder(embeddingModel).build();

        try {
            System.out.printf("Starting Nomi ETL pipeline: Reading resource from {}", markdownResource.getFilename());

            // Step 1: Extract text content from markdown file
            TextReader textReader = new TextReader(markdownResource);
            List<Document> rawDocuments = textReader.get();

            // Step 2: Split text into token chunks
            TokenTextSplitter textSplitter = TokenTextSplitter.builder()
                    .withChunkSize(800)
                    .withMinChunkSizeChars(500)
                    .withMinChunkLengthToEmbed(10)
                    .withMaxNumChunks(10000)
                    .withKeepSeparator(true)
                    .build();
            List<Document> splitDocuments = textSplitter.apply(rawDocuments);

            // Step 3: Compute embeddings and populate SimpleVectorStore
            System.out.printf("Generating embeddings and writing %d chunks to SimpleVectorStore...",
                    splitDocuments.size());
            simpleVectorStore.add(splitDocuments);
            System.out.println("ETL Ingestion completed successfully. NOMI portfolio data is grounded.");

        } catch (Exception e) {
            System.err.printf("Failed to complete Nomi vector store ingestion from markdown file: %s", e.getMessage());
            throw new IllegalStateException(
                    "Nomi vector store initialization failed - application cannot serve grounded answers", e);
        }

        return simpleVectorStore;
    }
}
