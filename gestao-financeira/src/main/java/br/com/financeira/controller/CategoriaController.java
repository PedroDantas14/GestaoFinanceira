package br.com.financeira.controller;

import br.com.financeira.dto.CategoriaRequest;
import br.com.financeira.dto.CategoriaResponse;
import br.com.financeira.security.UsuarioPrincipal;
import br.com.financeira.service.CategoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
@Tag(name = "Categorias", description = "CRUD de categorias (Alimentação, Aluguel, etc.)")
@SecurityRequirement(name = "bearerAuth")
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    @Operation(summary = "Listar categorias do usuário")
    public List<CategoriaResponse> listar(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return categoriaService.listarPorUsuario(usuario.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Criar categoria")
    public CategoriaResponse criar(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                   @Valid @RequestBody CategoriaRequest request) {
        return categoriaService.criar(usuario.getId(), request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar categoria")
    public CategoriaResponse atualizar(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                       @PathVariable Long id,
                                       @Valid @RequestBody CategoriaRequest request) {
        return categoriaService.atualizar(usuario.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Excluir categoria")
    public void excluir(@AuthenticationPrincipal UsuarioPrincipal usuario, @PathVariable Long id) {
        categoriaService.excluir(usuario.getId(), id);
    }
}
