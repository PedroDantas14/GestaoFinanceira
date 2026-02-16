package br.com.financeira.service;

import br.com.financeira.dto.TransacaoRequest;
import br.com.financeira.dto.TransacaoResponse;
import br.com.financeira.entity.Categoria;
import br.com.financeira.entity.Transacao;
import br.com.financeira.entity.Usuario;
import br.com.financeira.repository.CategoriaRepository;
import br.com.financeira.repository.TransacaoRepository;
import br.com.financeira.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransacaoService {

    private final TransacaoRepository transacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<TransacaoResponse> listarPorUsuario(Long usuarioId) {
        return transacaoRepository.findByUsuarioIdOrderByDataDesc(usuarioId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransacaoResponse criar(Long usuarioId, TransacaoRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));
        if (!categoria.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("Categoria não pertence ao usuário");
        }
        Transacao t = Transacao.builder()
                .data(request.getData())
                .valor(request.getValor())
                .tipo(request.getTipo())
                .descricao(request.getDescricao())
                .categoria(categoria)
                .usuario(usuario)
                .build();
        t = transacaoRepository.save(t);
        return toResponse(t);
    }

    @Transactional
    public TransacaoResponse atualizar(Long usuarioId, Long transacaoId, TransacaoRequest request) {
        Transacao t = transacaoRepository.findById(transacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Transação não encontrada"));
        if (!t.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("Transação não pertence ao usuário");
        }
        Categoria categoria = categoriaRepository.findById(request.getCategoriaId())
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));
        if (!categoria.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("Categoria não pertence ao usuário");
        }
        t.setData(request.getData());
        t.setValor(request.getValor());
        t.setTipo(request.getTipo());
        t.setDescricao(request.getDescricao());
        t.setCategoria(categoria);
        t = transacaoRepository.save(t);
        return toResponse(t);
    }

    @Transactional
    public void excluir(Long usuarioId, Long transacaoId) {
        Transacao t = transacaoRepository.findById(transacaoId)
                .orElseThrow(() -> new IllegalArgumentException("Transação não encontrada"));
        if (!t.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("Transação não pertence ao usuário");
        }
        transacaoRepository.delete(t);
    }

    public TransacaoResponse toResponsePublic(Transacao t) {
        return toResponse(t);
    }

    private TransacaoResponse toResponse(Transacao t) {
        return TransacaoResponse.builder()
                .id(t.getId())
                .data(t.getData())
                .valor(t.getValor())
                .tipo(t.getTipo())
                .descricao(t.getDescricao())
                .categoriaId(t.getCategoria().getId())
                .categoriaNome(t.getCategoria().getNome())
                .build();
    }
}
