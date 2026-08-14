package com.dochive.dochive_backend.service;

import java.util.List;

import org.springframework.ai.document.Document;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.stereotype.Service;

import com.dochive.dochive_backend.config.ChunkingConfig;

@Service
public class TokenChunkingService implements ChunkingService {

    @Override
    public List<Document> chunk(List<Document> rawDocuments, ChunkingConfig config) {
        TokenTextSplitter splitter = TokenTextSplitter.builder()
                .withChunkSize(config.chunkSize())
                .withMinChunkSizeChars(config.minChunkSizeChars())
                .withMinChunkLengthToEmbed(config.minChunkLengthToEmbed())
                .withMaxNumChunks(config.maxNumChunks())
                .withKeepSeparator(true)
                .build();
        return splitter.apply(rawDocuments);
    }
}
