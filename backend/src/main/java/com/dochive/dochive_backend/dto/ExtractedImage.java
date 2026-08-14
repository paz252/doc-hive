package com.dochive.dochive_backend.dto;

public record ExtractedImage(byte[] data, String format, int locationIndex) {
    // locationIndex = page number for PDF, sequential index for DOCX
}
