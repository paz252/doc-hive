package com.dochive.dochive_backend.strategy.reader.impl;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.ai.document.Document;
import org.springframework.core.annotation.Order;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;

import com.dochive.dochive_backend.strategy.reader.ContentReaderStrategy;

@Component
@Order(5)
public class XlsxContentReaderStrategy implements ContentReaderStrategy {

    private static final int ROWS_PER_BATCH = 25;

    @Override
    public boolean supports(String contentType, String filename) {
        boolean contentTypeMatch = contentType != null
                && (contentType.equalsIgnoreCase("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") // .xlsx
                        || contentType.equalsIgnoreCase("application/vnd.ms-excel") // legacy .xls — see note below
                );
        boolean extensionMatch = filename != null && (filename.toLowerCase().endsWith(".xlsx")
                || filename.toLowerCase().endsWith(".xls"));

        return contentTypeMatch || extensionMatch;
    }

    @Override
    public List<Document> read(Resource resource) {
        List<Document> documents = new ArrayList<>();

        try (var inputStream = resource.getInputStream();
                Workbook workbook = WorkbookFactory.create(inputStream)) {

            int sheetCount = workbook.getNumberOfSheets();
            for (int sheetIndex = 0; sheetIndex < sheetCount; sheetIndex++) {
                Sheet sheet = workbook.getSheetAt(sheetIndex);
                documents.addAll(readSheet(sheet, resource.getFilename()));
            }

        } catch (IOException e) {
            System.err.printf("Failed to parse XLSX file %s: %s%n", resource.getFilename(), e.getMessage());
        }

        return documents;
    }

    private List<Document> readSheet(Sheet sheet, String filename) {
        List<Document> documents = new ArrayList<>();

        Row headerRow = sheet.getRow(sheet.getFirstRowNum());
        if (headerRow == null) {
            return documents; // empty sheet
        }

        List<String> headers = new ArrayList<>();
        for (Cell cell : headerRow) {
            headers.add(cellToString(cell));
        }

        if (headers.isEmpty()) {
            return documents;
        }

        List<Row> batch = new ArrayList<>(ROWS_PER_BATCH);
        int rowStart = sheet.getFirstRowNum() + 2; // 1-indexed, excluding header

        int lastRowNum = sheet.getLastRowNum();
        for (int rowIndex = sheet.getFirstRowNum() + 1; rowIndex <= lastRowNum; rowIndex++) {
            Row row = sheet.getRow(rowIndex);
            if (row == null || isRowBlank(row))
                continue; // skip empty rows

            batch.add(row);
            if (batch.size() == ROWS_PER_BATCH) {
                documents.add(buildBatchDocument(headers, batch, rowStart, filename, sheet.getSheetName()));
                rowStart += batch.size();
                batch = new ArrayList<>(ROWS_PER_BATCH);
            }
        }
        if (!batch.isEmpty()) {
            documents.add(buildBatchDocument(headers, batch, rowStart, filename, sheet.getSheetName()));
        }

        return documents;
    }

    private Document buildBatchDocument(List<String> headers, List<Row> batch, int rowStart,
            String filename, String sheetName) {
        StringBuilder text = new StringBuilder();
        text.append("Sheet: ").append(sheetName).append("\n");
        text.append("Columns: ").append(String.join(", ", headers)).append("\n\n");

        for (Row row : batch) {
            for (int col = 0; col < headers.size(); col++) {
                Cell cell = row.getCell(col);
                text.append(headers.get(col)).append(": ").append(cellToString(cell)).append("; ");
            }
            text.append("\n");
        }

        int rowEnd = rowStart + batch.size() - 1;

        return new Document(text.toString(), Map.of(
                "contentSource", "XLSX",
                "sheetName", sheetName,
                "rowStart", rowStart,
                "rowEnd", rowEnd,
                "sourceFile", filename != null ? filename : "unknown"));
    }

    private boolean isRowBlank(Row row) {
        for (Cell cell : row) {
            if (cell != null && cell.getCellType() != CellType.BLANK
                    && !cellToString(cell).isBlank()) {
                return false;
            }
        }
        return true;
    }

    private String cellToString(Cell cell) {
        if (cell == null)
            return "";

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> DateUtil.isCellDateFormatted(cell)
                    ? new SimpleDateFormat("yyyy-MM-dd").format(cell.getDateCellValue())
                    : stripTrailingZero(cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cellToStringFromFormula(cell);
            default -> "";
        };
    }

    private String cellToStringFromFormula(Cell cell) {
        try {
            return switch (cell.getCachedFormulaResultType()) {
                case STRING -> cell.getStringCellValue().trim();
                case NUMERIC -> stripTrailingZero(cell.getNumericCellValue());
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                default -> "";
            };
        } catch (Exception e) {
            return "";
        }
    }

    private String stripTrailingZero(double value) {
        if (value == Math.floor(value) && !Double.isInfinite(value)) {
            return String.valueOf((long) value);
        }
        return String.valueOf(value);
    }

    @Override
    public String getStrategyName() {
        return "XLSX";
    }

}
