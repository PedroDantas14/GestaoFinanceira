package br.com.financeira.dto;

import br.com.financeira.entity.Transacao;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TransacaoRequest {

    @NotNull
    private LocalDate data;

    @NotNull
    @DecimalMin(value = "0.01")
    private BigDecimal valor;

    @NotNull
    private Transacao.TipoTransacao tipo;

    private String descricao;

    @NotNull
    private Long categoriaId;
}
