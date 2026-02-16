package br.com.financeira.repository;

import br.com.financeira.entity.Transacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransacaoRepository extends JpaRepository<Transacao, Long> {

    List<Transacao> findByUsuarioIdOrderByDataDesc(Long usuarioId);

    @Query("SELECT t FROM Transacao t WHERE t.usuario.id = :usuarioId " +
           "AND t.data BETWEEN :inicio AND :fim ORDER BY t.data DESC")
    List<Transacao> findByUsuarioIdAndDataBetween(
        @Param("usuarioId") Long usuarioId,
        @Param("inicio") LocalDate inicio,
        @Param("fim") LocalDate fim
    );

    @Query("SELECT COALESCE(SUM(t.valor), 0) FROM Transacao t " +
           "WHERE t.usuario.id = :usuarioId AND t.tipo = :tipo " +
           "AND t.data BETWEEN :inicio AND :fim")
    BigDecimal somarPorUsuarioTipoEPeriodo(
        @Param("usuarioId") Long usuarioId,
        @Param("tipo") Transacao.TipoTransacao tipo,
        @Param("inicio") LocalDate inicio,
        @Param("fim") LocalDate fim
    );
}
