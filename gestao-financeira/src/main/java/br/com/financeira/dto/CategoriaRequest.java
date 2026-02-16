package br.com.financeira.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoriaRequest {

    @NotBlank
    @Size(min = 1, max = 80)
    private String nome;

    @Size(max = 200)
    private String descricao;
}
