package br.com.financeira.controller;

import br.com.financeira.dto.RelatorioMensalResponse;
import br.com.financeira.security.UsuarioPrincipal;
import br.com.financeira.service.ExportService;
import br.com.financeira.service.RelatorioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/relatorios")
@RequiredArgsConstructor
@Tag(name = "Relatórios", description = "Relatório mensal, gráficos e exportação PDF/Excel")
@SecurityRequirement(name = "bearerAuth")
public class RelatorioController {

    private final RelatorioService relatorioService;
    private final ExportService exportService;

    @GetMapping("/mensal")
    @Operation(summary = "Relatório mensal (inclui totais e dados para gráficos)")
    public RelatorioMensalResponse relatorioMensal(
            @AuthenticationPrincipal UsuarioPrincipal usuario,
            @RequestParam int ano,
            @RequestParam int mes) {
        return relatorioService.relatorioMensal(usuario.getId(), ano, mes);
    }

    @GetMapping(value = "/mensal/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    @Operation(summary = "Exportar relatório mensal em PDF")
    public ResponseEntity<byte[]> exportarPdf(
            @AuthenticationPrincipal UsuarioPrincipal usuario,
            @RequestParam int ano,
            @RequestParam int mes) {
        RelatorioMensalResponse relatorio = relatorioService.relatorioMensal(usuario.getId(), ano, mes);
        byte[] pdf = exportService.exportarRelatorioPdf(relatorio);
        String filename = "relatorio_" + ano + "_" + mes + ".pdf";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(pdf);
    }

    @GetMapping(value = "/mensal/export/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    @Operation(summary = "Exportar relatório mensal em Excel")
    public ResponseEntity<byte[]> exportarExcel(
            @AuthenticationPrincipal UsuarioPrincipal usuario,
            @RequestParam int ano,
            @RequestParam int mes) {
        RelatorioMensalResponse relatorio = relatorioService.relatorioMensal(usuario.getId(), ano, mes);
        byte[] excel = exportService.exportarRelatorioExcel(relatorio);
        String filename = "relatorio_" + ano + "_" + mes + ".xlsx";
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(excel);
    }
}
