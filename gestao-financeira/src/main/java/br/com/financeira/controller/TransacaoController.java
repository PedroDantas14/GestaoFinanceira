package br.com.financeira.controller;

import br.com.financeira.dto.TransacaoRequest;
import br.com.financeira.dto.TransacaoResponse;
import br.com.financeira.security.UsuarioPrincipal;
import br.com.financeira.service.TransacaoService;
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
@RequestMapping("/api/transacoes")
@RequiredArgsConstructor
@Tag(name = "Transações", description = "Entradas e saídas")
@SecurityRequirement(name = "bearerAuth")
public class TransacaoController {

    private final TransacaoService transacaoService;

    @GetMapping
    @Operation(summary = "Listar transações do usuário")
    public List<TransacaoResponse> listar(@AuthenticationPrincipal UsuarioPrincipal usuario) {
        return transacaoService.listarPorUsuario(usuario.getId());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Registrar transação")
    public TransacaoResponse criar(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                   @Valid @RequestBody TransacaoRequest request) {
        return transacaoService.criar(usuario.getId(), request);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar transação")
    public TransacaoResponse atualizar(@AuthenticationPrincipal UsuarioPrincipal usuario,
                                      @PathVariable Long id,
                                      @Valid @RequestBody TransacaoRequest request) {
        return transacaoService.atualizar(usuario.getId(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Excluir transação")
    public void excluir(@AuthenticationPrincipal UsuarioPrincipal usuario, @PathVariable Long id) {
        transacaoService.excluir(usuario.getId(), id);
    }
}
