package com.dochive.dochive_backend.config;

import java.util.concurrent.TimeUnit;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.github.benmanes.caffeine.cache.Caffeine;

@Configuration
@EnableCaching
public class CacheConfig {
    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();

        // Chunk lists rarely change once ingestion completes -> longer TTL
        manager.registerCustomCache("documentChunks",
                Caffeine.newBuilder()
                        .maximumSize(500)
                        .expireAfterWrite(30, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        // Retrieved RAG context depends on the live corpus -> shorter TTL,
        // so newly ingested docs surface without needing manual eviction
        manager.registerCustomCache("ragContext",
                Caffeine.newBuilder()
                        .maximumSize(300)
                        .expireAfterWrite(3, TimeUnit.MINUTES)
                        .recordStats()
                        .build());

        return manager;
    }
}
