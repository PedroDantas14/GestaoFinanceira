package br.com.financeira.repository;

import br.com.financeira.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

    List<Categoria> findByUsuarioIdOrderByNome(Long usuarioId);

    boolean existsByUsuarioIdAndNome(Long usuarioId, String nome);
}
