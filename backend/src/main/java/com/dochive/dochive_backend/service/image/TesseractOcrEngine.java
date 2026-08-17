package com.dochive.dochive_backend.service.image;

import java.awt.image.BufferedImage;
import java.io.File;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;

@Component
public class TesseractOcrEngine {

    @Value("${tesseract.datapath}")
    private String tessDataPath;

    /*
     * Tesseract instances aren't thread-safe.
     *
     * Each OCR worker gets its own instance and reuses it.
     */
    private ThreadLocal<ITesseract> engine;

    @PostConstruct
    public void validateTesseractData() {

        File tessDataDir = new File(tessDataPath);
        File engDataFile = new File(tessDataDir, "eng.traineddata");

        System.out.println(
                "Tesseract datapath: " + tessDataDir.getAbsolutePath());

        System.out.println(
                "Tesseract tessdata exists: " + tessDataDir.exists());

        System.out.println(
                "eng.traineddata exists: " + engDataFile.exists());

        if (!tessDataDir.isDirectory()) {
            throw new IllegalStateException(
                    "Tesseract tessdata directory does not exist: "
                            + tessDataDir.getAbsolutePath());
        }

        if (!engDataFile.isFile()) {
            throw new IllegalStateException(
                    "Tesseract language data is missing: "
                            + engDataFile.getAbsolutePath());
        }

        /*
         * Only create the ThreadLocal after the tessdata
         * directory has been validated.
         */
        engine = ThreadLocal.withInitial(this::buildEngine);

        System.out.println(
                "Tesseract initialization validation successful.");
    }

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
