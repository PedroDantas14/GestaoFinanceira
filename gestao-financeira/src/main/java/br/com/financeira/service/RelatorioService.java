package br.com.financeira.service;

import br.com.financeira.dto.RelatorioMensalResponse;
import br.com.financeira.dto.TransacaoResponse;
import br.com.financeira.entity.Transacao;
import br.com.financeira.repository.TransacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RelatorioService {

    private final TransacaoRepository transacaoRepository;
    private final TransacaoService transacaoService;

    @Transactional(readOnly = true)
    public RelatorioMensalResponse relatorioMensal(Long usuarioId, int ano, int mes) {
        LocalDate inicio = LocalDate.of(ano, mes, 1);
        LocalDate fim = inicio.withDayOfMonth(inicio.lengthOfMonth());

        List<Transacao> transacoes = transacaoRepository.findByUsuarioIdAndDataBetween(usuarioId, inicio, fim);

        BigDecimal totalEntradas = transacaoRepository.somarPorUsuarioTipoEPeriodo(
                usuarioId, Transacao.TipoTransacao.ENTRADA, inicio, fim);
        BigDecimal totalSaidas = transacaoRepository.somarPorUsuarioTipoEPeriodo(
                usuarioId, Transacao.TipoTransacao.SAIDA, inicio, fim);
        BigDecimal saldo = totalEntradas.subtract(totalSaidas);

        List<RelatorioMensalResponse.ResumoPorCategoria> porCategoria = transacoes.stream()
                .collect(Collectors.groupingBy(t -> new CatKey(t.getCategoria().getId(), t.getCategoria().getNome(), t.getTipo())))
                .entrySet().stream()
                .map(e -> RelatorioMensalResponse.ResumoPorCategoria.builder()
                        .categoriaId(e.getKey().id)
                        .categoriaNome(e.getKey().nome)
                        .tipo(e.getKey().tipo.name())
                        .total(e.getValue().stream().map(Transacao::getValor).reduce(BigDecimal.ZERO, BigDecimal::add))
                        .build())
                .collect(Collectors.toList());

        List<TransacaoResponse> transacoesResponse = transacoes.stream()
                .map(transacaoService::toResponsePublic)
                .collect(Collectors.toList());

        return RelatorioMensalResponse.builder()
                .ano(ano)
                .mes(mes)
                .totalEntradas(totalEntradas != null ? totalEntradas : BigDecimal.ZERO)
                .totalSaidas(totalSaidas != null ? totalSaidas : BigDecimal.ZERO)
                .saldo(saldo != null ? saldo : BigDecimal.ZERO)
                .porCategoria(porCategoria)
                .transacoes(transacoesResponse)
                .build();
    }

    private record CatKey(Long id, String nome, Transacao.TipoTransacao tipo) {}
}
