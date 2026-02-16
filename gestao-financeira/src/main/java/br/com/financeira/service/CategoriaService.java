package br.com.financeira.service;

import br.com.financeira.dto.CategoriaRequest;
import br.com.financeira.dto.CategoriaResponse;
import br.com.financeira.entity.Categoria;
import br.com.financeira.entity.Usuario;
import br.com.financeira.repository.CategoriaRepository;
import br.com.financeira.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarPorUsuario(Long usuarioId) {
        return categoriaRepository.findByUsuarioIdOrderByNome(usuarioId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoriaResponse criar(Long usuarioId, CategoriaRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        if (categoriaRepository.existsByUsuarioIdAndNome(usuarioId, request.getNome())) {
            throw new IllegalArgumentException("Já existe uma categoria com este nome");
        }
        Categoria cat = Categoria.builder()
                .nome(request.getNome())
                .descricao(request.getDescricao())
                .usuario(usuario)
                .build();
        cat = categoriaRepository.save(cat);
        return toResponse(cat);
    }

    @Transactional
    public CategoriaResponse atualizar(Long usuarioId, Long categoriaId, CategoriaRequest request) {
        Categoria cat = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));
        if (!cat.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("Categoria não pertence ao usuário");
        }
        cat.setNome(request.getNome());
        cat.setDescricao(request.getDescricao());
        cat = categoriaRepository.save(cat);
        return toResponse(cat);
    }

    @Transactional
    public void excluir(Long usuarioId, Long categoriaId) {
        Categoria cat = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new IllegalArgumentException("Categoria não encontrada"));
        if (!cat.getUsuario().getId().equals(usuarioId)) {
            throw new IllegalArgumentException("Categoria não pertence ao usuário");
        }
        categoriaRepository.delete(cat);
    }

    private CategoriaResponse toResponse(Categoria c) {
        return CategoriaResponse.builder()
                .id(c.getId())
                .nome(c.getNome())
                .descricao(c.getDescricao())
                .build();
    }
}
