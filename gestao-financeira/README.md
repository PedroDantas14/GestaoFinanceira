# 💰 Gestão Financeira Pessoal

Sistema em **Java (Spring Boot)** para controle de gastos e receitas, com cadastro de usuários, categorias, relatórios mensais, dados para gráficos e exportação em PDF/Excel.

## 🛠 Tecnologias

- **Spring Boot 3.2** – API REST
- **Spring Data JPA + Hibernate** – persistência
- **PostgreSQL** (ou H2 em dev)
- **JWT** – autenticação (login)
- **Swagger (OpenAPI 3)** – documentação da API
- **OpenPDF** – exportação PDF
- **Apache POI** – exportação Excel
- **Lombok** – redução de boilerplate

## 📋 Funcionalidades

- Cadastro e login de usuários (JWT)
- **Entradas e saídas** (transações)
- **Categorias** por usuário (Alimentação, Aluguel, etc.)
- **Relatório mensal**: totais, saldo, resumo por categoria
- **Dados para gráficos** (resposta do relatório inclui `porCategoria`)
- **Exportar** relatório em PDF e Excel

## 🚀 Como rodar

### Pré-requisitos

- Java 17+
- Maven 3.8+
- PostgreSQL (ou use perfil `dev` com H2 em memória)

### Banco PostgreSQL

Crie o banco e ajuste `application.properties` se necessário:

```bash
createdb gestao_financeira
```

Configuração padrão:

- URL: `jdbc:postgresql://localhost:5432/gestao_financeira`
- Usuário: `postgres`
- Senha: `postgres`

### Rodar sem PostgreSQL (perfil dev)

```bash
cd gestao-financeira
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

O H2 sobe em memória e o console fica em: http://localhost:8080/h2-console

### Rodar com PostgreSQL

```bash
mvn spring-boot:run
```

A aplicação sobe em **http://localhost:8080**.

## 📖 API e Swagger

- **Swagger UI**: http://localhost:8080/swagger-ui.html  
- **OpenAPI JSON**: http://localhost:8080/api-docs  

### Fluxo típico

1. **Registrar**: `POST /api/auth/registrar` com `nome`, `email`, `senha`.
2. **Login**: `POST /api/auth/login` com `email`, `senha` → retorna `token`.
3. Nas próximas requisições, enviar no header:  
   `Authorization: Bearer <token>`.
4. **Categorias**: `GET/POST/PUT/DELETE /api/categorias`.
5. **Transações**: `GET/POST/PUT/DELETE /api/transacoes`.
6. **Relatório mensal**: `GET /api/relatorios/mensal?ano=2025&mes=2`.
7. **Exportar PDF**: `GET /api/relatorios/mensal/export/pdf?ano=2025&mes=2`.
8. **Exportar Excel**: `GET /api/relatorios/mensal/export/excel?ano=2025&mes=2`.

## 📁 Estrutura do projeto

```
src/main/java/br/com/financeira/
├── config/          # Security, OpenAPI
├── controller/      # REST (Auth, Categorias, Transações, Relatórios)
├── dto/             # Request/Response
├── entity/          # Usuario, Categoria, Transacao
├── exception/       # Tratamento global de erros
├── repository/      # JPA
├── security/        # JWT, filtro, UserDetails
└── service/         # Regras de negócio e exportação
```

## ⚙ Configuração JWT

Em produção, defina uma chave longa e segura (mín. 32 caracteres para HS256):

```properties
jwt.secret=sua-chave-secreta-muito-longa-e-segura
jwt.expiration-ms=86400000
```

## 📄 Licença

Uso livre para estudo e projetos pessoais.
