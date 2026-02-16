package br.com.financeira.service;

import br.com.financeira.dto.RelatorioMensalResponse;
import br.com.financeira.dto.TransacaoResponse;
import com.lowagie.text.Chunk;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.FontFactory;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExportService {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    public byte[] exportarRelatorioPdf(RelatorioMensalResponse relatorio) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4);
            PdfWriter.getInstance(doc, out);
            doc.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            doc.add(new Paragraph("Relatório Financeiro - " + relatorio.getMes() + "/" + relatorio.getAno(), titleFont));
            doc.add(Chunk.NEWLINE);

            doc.add(new Paragraph("Total Entradas: R$ " + relatorio.getTotalEntradas()));
            doc.add(new Paragraph("Total Saídas: R$ " + relatorio.getTotalSaidas()));
            doc.add(new Paragraph("Saldo: R$ " + relatorio.getSaldo(), FontFactory.getFont(FontFactory.HELVETICA_BOLD)));
            doc.add(Chunk.NEWLINE);

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100f);
            table.setWidths(new float[]{1.5f, 2f, 2f, 3f, 2f});
            table.addCell("Data");
            table.addCell("Tipo");
            table.addCell("Categoria");
            table.addCell("Descrição");
            table.addCell("Valor");
            for (TransacaoResponse t : relatorio.getTransacoes()) {
                table.addCell(t.getData().format(DATE_FMT));
                table.addCell(t.getTipo().name());
                table.addCell(t.getCategoriaNome());
                table.addCell(t.getDescricao() != null ? t.getDescricao() : "");
                table.addCell("R$ " + t.getValor());
            }
            doc.add(table);
            doc.close();
            return out.toByteArray();
        } catch (DocumentException | IOException e) {
            throw new RuntimeException("Erro ao gerar PDF", e);
        }
    }

    public byte[] exportarRelatorioExcel(RelatorioMensalResponse relatorio) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Relatório " + relatorio.getMes() + "_" + relatorio.getAno());
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            int rowNum = 0;
            Row headerRow = sheet.createRow(rowNum++);
            String[] headers = {"Resumo", "", ""};
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(i == 0 ? "Relatório " + relatorio.getMes() + "/" + relatorio.getAno() : "");
                c.setCellStyle(headerStyle);
            }
            rowNum++;
            createRow(sheet, rowNum++, "Total Entradas", "R$ " + relatorio.getTotalEntradas());
            createRow(sheet, rowNum++, "Total Saídas", "R$ " + relatorio.getTotalSaidas());
            createRow(sheet, rowNum++, "Saldo", "R$ " + relatorio.getSaldo());
            rowNum++;

            Row tableHeader = sheet.createRow(rowNum++);
            String[] colHeaders = {"Data", "Tipo", "Categoria", "Descrição", "Valor"};
            for (int i = 0; i < colHeaders.length; i++) {
                Cell c = tableHeader.createCell(i);
                c.setCellValue(colHeaders[i]);
                c.setCellStyle(headerStyle);
            }
            for (TransacaoResponse t : relatorio.getTransacoes()) {
                Row r = sheet.createRow(rowNum++);
                r.createCell(0).setCellValue(t.getData().format(DATE_FMT));
                r.createCell(1).setCellValue(t.getTipo().name());
                r.createCell(2).setCellValue(t.getCategoriaNome());
                r.createCell(3).setCellValue(t.getDescricao() != null ? t.getDescricao() : "");
                r.createCell(4).setCellValue(t.getValor().doubleValue());
            }
            for (int i = 0; i < 5; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar Excel", e);
        }
    }

    public byte[] exportarTransacoesExcel(List<TransacaoResponse> transacoes) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Transações");
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Row headerRow = sheet.createRow(0);
            String[] headers = {"Data", "Tipo", "Categoria", "Descrição", "Valor"};
            for (int i = 0; i < headers.length; i++) {
                Cell c = headerRow.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(headerStyle);
            }
            int rowNum = 1;
            for (TransacaoResponse t : transacoes) {
                Row r = sheet.createRow(rowNum++);
                r.createCell(0).setCellValue(t.getData().format(DATE_FMT));
                r.createCell(1).setCellValue(t.getTipo().name());
                r.createCell(2).setCellValue(t.getCategoriaNome());
                r.createCell(3).setCellValue(t.getDescricao() != null ? t.getDescricao() : "");
                r.createCell(4).setCellValue(t.getValor().doubleValue());
            }
            for (int i = 0; i < 5; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar Excel", e);
        }
    }

    private void createRow(Sheet sheet, int rowNum, String label, String value) {
        Row r = sheet.createRow(rowNum);
        r.createCell(0).setCellValue(label);
        r.createCell(1).setCellValue(value);
    }
}
