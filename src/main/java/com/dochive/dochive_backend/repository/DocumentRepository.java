package com.dochive.dochive_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dochive.dochive_backend.entity.DocumentMetaData;

public interface DocumentRepository extends JpaRepository<DocumentMetaData, String> {
    List<DocumentMetaData> findAllByOrderByUploadedAtDesc();
}
