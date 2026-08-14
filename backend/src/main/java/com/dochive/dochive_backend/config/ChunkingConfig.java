package com.dochive.dochive_backend.config;

public record ChunkingConfig(int chunkSize, int minChunkSizeChars, int minChunkLengthToEmbed, int maxNumChunks) {

    public static ChunkingConfig dochiveDefaults() {
        return new ChunkingConfig(800, 500, 10, 10000);
    }

    public static ChunkingConfig portfolioDefaults() {
        return new ChunkingConfig(500, 100, 5, 10000);
    }
}
