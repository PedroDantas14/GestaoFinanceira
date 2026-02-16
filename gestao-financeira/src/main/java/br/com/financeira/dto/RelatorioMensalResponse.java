package br.com.financeira.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelatorioMensalResponse {

    private int ano;
    private int mes;
    private BigDecimal totalEntradas;
    private BigDecimal totalSaidas;
    private BigDecimal saldo;
    private List<ResumoPorCategoria> porCategoria;
    private List<TransacaoResponse> transacoes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumoPorCategoria {
        private Long categoriaId;
        private String categoriaNome;
        private BigDecimal total;
        private String tipo;
    }
}
