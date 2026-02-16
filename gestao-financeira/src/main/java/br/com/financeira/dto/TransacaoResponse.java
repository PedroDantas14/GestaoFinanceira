package br.com.financeira.dto;

import br.com.financeira.entity.Transacao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransacaoResponse {

    private Long id;
    private LocalDate data;
    private BigDecimal valor;
    private Transacao.TipoTransacao tipo;
    private String descricao;
    private Long categoriaId;
    private String categoriaNome;
}
