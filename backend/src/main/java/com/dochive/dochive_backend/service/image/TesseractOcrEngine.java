package com.dochive.dochive_backend.service.image;

import java.awt.image.BufferedImage;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

@Component
public class TesseractOcrEngine {

    @Value("${tesseract.datapath:/usr/share/tesseract-ocr/5/tessdata}")
    private String tessDataPath;

    // Tesseract instances aren't thread-safe. ThreadLocal gives each OCR
    // worker thread its own instance, reused across calls on that thread —
    // engine init cost is paid once per thread, not once per image.
    private final ThreadLocal<ITesseract> engine = ThreadLocal.withInitial(this::buildEngine);

    private ITesseract buildEngine() {
        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(tessDataPath);
        tesseract.setLanguage("eng");

        // PSM 6 = "Assume a single uniform block of text". Faster than the
        // default AUTO mode (0), which runs page-layout analysis first —
        // unnecessary overhead for extracted images that are usually a
        // single diagram/screenshot/table, not a multi-column page.
        tesseract.setPageSegMode(6);

        // OEM 1 = LSTM engine only. Skips the legacy engine's redundant pass
        // that the default combined mode (OEM 3) runs alongside LSTM.
        tesseract.setOcrEngineMode(1);

        return tesseract;
    }

    public String extractText(BufferedImage image) throws TesseractException {
        return engine.get().doOCR(image);
    }
}
