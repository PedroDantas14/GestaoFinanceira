# 💰 Gestão Financeira Pessoal

API REST em **Java (Spring Boot)** para controle de gastos e receitas: cadastro de usuários, categorias, transações (entradas/saídas), relatórios mensais e exportação em PDF/Excel.

---

## 🛠 Tecnologias

| Tecnologia | Uso |
|------------|-----|
| **Spring Boot 3.2** | API REST |
| **Spring Data JPA + Hibernate** | Persistência no banco |
| **PostgreSQL** | Banco de dados (ou H2 no perfil dev) |
| **JWT (jjwt)** | Login e autenticação |
| **Swagger (OpenAPI 3)** | Documentação e testes da API |
| **OpenPDF** | Geração de PDF |
| **Apache POI** | Geração de Excel |
| **Lombok** | Código mais enxuto (getters, setters, etc.) |

---

## 📋 Funcionalidades

- **Cadastro e login** de usuários (retorna token JWT)
- **Categorias** por usuário (ex.: Alimentação, Aluguel, Transporte)
- **Transações** de entrada e saída vinculadas a uma categoria
- **Relatório mensal** com totais, saldo e resumo por categoria (dados prontos para gráficos)
- **Exportar** relatório em **PDF** ou **Excel**

---

## 🚀 Como rodar o projeto (passo a passo)

### 1. O que você precisa ter instalado

- **Java 17 ou superior** (recomendado: 21)
- **Maven 3.8+**
- **PostgreSQL** (se for usar banco real; senão dá para usar H2 em memória)

Para conferir no terminal:

```bash
# Ver versão do Java (deve ser 17+)
java -v

# Ver versão do Maven
mvn -v
```

Se o Maven não estiver instalado (Linux/WSL):

```bash
sudo apt update
sudo apt install maven
```

---

### 2. Criar o banco de dados no PostgreSQL

O projeto espera um banco chamado `gestao_financeira` e um usuário com permissão para criar tabelas. Faça assim:

**2.1 – Entrar no PostgreSQL como superusuário**

```bash
sudo -u postgres psql
```

(Vai pedir sua senha do sistema.)

**2.2 – Dentro do `psql`, criar o usuário e o banco**

Digite cada comando e pressione Enter:

```sql
-- Cria o usuário que a aplicação vai usar (troque a senha se quiser)
CREATE USER finance_user WITH ENCRYPTED PASSWORD '2312Arph';

-- Cria o banco e já deixa o finance_user como dono (assim ele pode criar tabelas)
CREATE DATABASE gestao_financeira OWNER finance_user;

-- Sair do psql
\q
```

**2.3 – Conferir o `application.properties`**

O arquivo `src/main/resources/application.properties` deve estar com o mesmo usuário e senha:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/gestao_financeira
spring.datasource.username=finance_user
spring.datasource.password=2312Arph
```

Se você tiver usado outra senha no `CREATE USER`, altere a linha `spring.datasource.password` para essa senha.

---

### 3. Compilar o projeto

Na pasta raiz do projeto (onde está o `pom.xml`):

```bash
cd /home/pedro/projetos/gestao-financeira

# Limpa compilações antigas e gera o JAR
mvn clean package
```

- **BUILD SUCCESS** = compilou certo.
- Se aparecer **BUILD FAILURE**, leia a mensagem de erro (geralmente é falta de dependência ou Java incorreto).

---

### 4. Subir a aplicação

Ainda na mesma pasta:

```bash
mvn spring-boot:run
```

- Espere aparecer no log algo como: **Started GestaoFinanceiraApplication** e **Tomcat started on port 8080**.
- A API estará disponível em: **http://localhost:8080**.

Para parar: **Ctrl+C** no terminal.

---

### 5. Rodar sem PostgreSQL (só para testar, com H2 em memória)

Se não quiser usar PostgreSQL, dá para usar o banco em memória H2:

```bash
cd /home/pedro/projetos/gestao-financeira

mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

- O banco é criado na memória; ao parar a aplicação, os dados se perdem.
- Console do H2: http://localhost:8080/h2-console (se estiver habilitado no `application-dev.properties`).

---

### 6. Testar a API pelo Swagger

1. Com a aplicação rodando, abra no navegador:
   - **http://localhost:8080/swagger-ui.html**  
   (ou **http://localhost:8080/swagger-ui/index.html**)

2. **Cadastrar usuário**
   - Abra **POST /api/auth/registrar** → **Try it out**.
   - Body de exemplo:
     ```json
     {
       "nome": "Pedro",
       "email": "pedro@test.com",
       "senha": "123456"
     }
     ```
   - **Execute**. Deve retornar **201** e um **token**.

3. **Usar o token nas outras requisições**
   - Clique em **Authorize** (cadeado no topo).
   - No campo, coloque: `Bearer SEU_TOKEN_AQUI` (cole o valor do campo `token` da resposta do registrar).
   - **Authorize** → **Close**.

4. A partir daí você pode testar **Categorias**, **Transações** e **Relatórios** (todos exigem o token).

---

## 📁 Estrutura do projeto (pasta por pasta)

Tudo fica em `src/main/java/br/com/financeira/` e `src/main/resources/`.

### Raiz do projeto

| Arquivo/Pasta | O que é |
|---------------|---------|
| `pom.xml` | Configuração Maven: dependências (Spring, JPA, JWT, Swagger, etc.) e plugins. |
| `README.md` | Este arquivo. |
| `src/main/java/` | Código fonte Java. |
| `src/main/resources/` | Configurações e arquivos que vão para o classpath (ex.: `application.properties`). |
| `target/` | Gerado pelo Maven (compilados, JAR). Não versionar no Git. |

---

### `br.com.financeira` (pacote principal)

| Pasta | O que contém e como funciona |
|-------|------------------------------|
| **(raiz)** | `GestaoFinanceiraApplication.java` – classe com `main`; é a entrada da aplicação Spring Boot. |

---

### `config/`

Configurações globais da aplicação.

| Arquivo | Função |
|---------|--------|
| **SecurityConfig.java** | Define as rotas que são públicas (ex.: `/api/auth/**`, Swagger) e as que exigem token JWT; desativa CSRF e usa sessão stateless; registra o filtro JWT. |
| **OpenApiConfig.java** | Configura o Swagger (título, descrição, versão) e o esquema de segurança **Bearer JWT** para aparecer o botão “Authorize” na interface. |

---

### `entity/`

Entidades JPA (tabelas do banco).

| Arquivo | Tabela | O que guarda |
|---------|--------|--------------|
| **Usuario.java** | `usuarios` | id, nome, email, senha (criptografada), data de criação. |
| **Categoria.java** | `categorias` | id, nome, descrição; pertence a um usuário. |
| **Transacao.java** | `transacoes` | id, data, valor, tipo (ENTRADA/SAIDA), descrição; ligada a um usuário e a uma categoria. |

Cada entidade vira uma tabela no banco; o Hibernate cria/atualiza conforme `spring.jpa.hibernate.ddl-auto` no `application.properties`.

---

### `repository/`

Interfaces Spring Data JPA: acesso ao banco sem escrever SQL à mão.

| Arquivo | Uso |
|---------|-----|
| **UsuarioRepository.java** | Buscar usuário por e-mail; verificar se e-mail já existe (para evitar duplicata no cadastro). |
| **CategoriaRepository.java** | Listar categorias de um usuário; verificar se já existe categoria com o mesmo nome para esse usuário. |
| **TransacaoRepository.java** | Listar transações do usuário; filtrar por período (data início/fim); somar entradas ou saídas por período (para o relatório). |

---

### `dto/`

Objetos de entrada (request) e saída (response) da API. Não expõem as entidades direto.

| Arquivo | Uso |
|---------|-----|
| **LoginRequest.java** | Body do login: email e senha. |
| **LoginResponse.java** | Resposta do login/registro: token, tipo (Bearer), usuarioId, email, nome. |
| **UsuarioRequest.java** | Body do cadastro: nome, email, senha. |
| **CategoriaRequest.java** | Body para criar/atualizar categoria: nome, descrição. |
| **CategoriaResponse.java** | Resposta com id, nome, descrição da categoria. |
| **TransacaoRequest.java** | Body para criar/atualizar transação: data, valor, tipo, descrição, categoriaId. |
| **TransacaoResponse.java** | Resposta com id, data, valor, tipo, descrição, categoriaId e nome da categoria. |
| **RelatorioMensalResponse.java** | Resposta do relatório mensal: ano, mês, totais de entrada/saída, saldo, lista por categoria, lista de transações. |

---

### `service/`

Regras de negócio: o que cada operação faz (validações, chamadas aos repositórios, montagem de relatórios e arquivos).

| Arquivo | Função |
|---------|--------|
| **AuthService.java** | Registrar usuário (verifica e-mail duplicado, criptografa senha, salva, gera JWT); login (confere senha e gera JWT). |
| **CategoriaService.java** | Listar, criar, atualizar e excluir categorias do usuário logado; garante que a categoria pertence ao usuário. |
| **TransacaoService.java** | Listar, criar, atualizar e excluir transações; garante que a transação e a categoria pertencem ao usuário. |
| **RelatorioService.java** | Monta o relatório mensal: busca transações do mês, soma entradas/saídas, agrupa por categoria, monta a resposta (incluindo dados para gráficos). |
| **ExportService.java** | Gera o relatório em PDF (OpenPDF) e em Excel (Apache POI); recebe o resultado do relatório e devolve o arquivo em bytes. |

---

### `controller/`

Camada REST: mapeia URLs e métodos HTTP, chama os serviços e devolve JSON (ou arquivo no caso de PDF/Excel).

| Arquivo | Rotas | Função |
|---------|-------|--------|
| **AuthController.java** | `POST /api/auth/registrar`, `POST /api/auth/login` | Cadastro e login (públicos). |
| **CategoriaController.java** | `GET/POST/PUT/DELETE /api/categorias` | CRUD de categorias (exige token). |
| **TransacaoController.java** | `GET/POST/PUT/DELETE /api/transacoes` | CRUD de transações (exige token). |
| **RelatorioController.java** | `GET /api/relatorios/mensal`, export PDF/Excel | Relatório mensal e download de arquivos (exige token). |

O usuário logado é identificado pelo token JWT e passado para os serviços via `@AuthenticationPrincipal UsuarioPrincipal usuario`.

---

### `security/`

Tudo relacionado a autenticação e autorização (JWT e Spring Security).

| Arquivo | Função |
|---------|--------|
| **JwtService.java** | Gera o token JWT (com email e userId); valida o token e extrai email e userId. |
| **JwtAuthenticationFilter.java** | Filtro que roda a cada requisição: lê o header `Authorization: Bearer <token>`, valida o token e, se válido, preenche o contexto do Spring Security para o usuário ser considerado “logado”. |
| **UsuarioDetailsService.java** | Implementa a carga do usuário por “username” (no nosso caso, o e-mail); usado pelo Spring Security e pelo filtro JWT. |
| **UsuarioPrincipal.java** | Implementação de `UserDetails` que guarda id, email e senha do usuário; usada nos controllers em `@AuthenticationPrincipal UsuarioPrincipal usuario`. |

---

### `exception/`

Tratamento global de erros para a API devolver respostas padronizadas.

| Arquivo | Função |
|---------|--------|
| **GlobalExceptionHandler.java** | Captura exceções (ex.: `BadCredentialsException`, `IllegalArgumentException`, erros de validação `MethodArgumentNotValidException`) e devolve JSON com status e mensagem adequados (401, 400, etc.). |

---

### `src/main/resources/`

Arquivos de configuração que vão para o classpath.

| Arquivo | Função |
|---------|--------|
| **application.properties** | Configurações principais: porta, URL do banco, usuário/senha do banco, JPA (ddl-auto, dialect), chave e expiração do JWT, caminhos do Swagger. |
| **application-dev.properties** | Perfil `dev`: usa H2 em memória em vez de PostgreSQL; útil para rodar sem instalar banco. |

---

## 📖 Endpoints principais

| Método | URL | Descrição |
|--------|-----|------------|
| POST | `/api/auth/registrar` | Cadastrar usuário (body: nome, email, senha). |
| POST | `/api/auth/login` | Login (body: email, senha); retorna token. |
| GET/POST/PUT/DELETE | `/api/categorias` | CRUD de categorias (precisa do token). |
| GET/POST/PUT/DELETE | `/api/transacoes` | CRUD de transações (precisa do token). |
| GET | `/api/relatorios/mensal?ano=2026&mes=2` | Relatório do mês (precisa do token). |
| GET | `/api/relatorios/mensal/export/pdf?ano=2026&mes=2` | Download do relatório em PDF. |
| GET | `/api/relatorios/mensal/export/excel?ano=2026&mes=2` | Download do relatório em Excel. |

Documentação interativa: **http://localhost:8080/swagger-ui.html**.

---

## ⚙ Configuração importante (JWT)

No `application.properties`, a chave do JWT:

```properties
jwt.secret=sua-chave-secreta-muito-longa-e-segura-minimo-256-bits-para-hs256
jwt.expiration-ms=86400000
```

- **Produção:** use uma chave longa e aleatória (mínimo 32 caracteres para HS256).
- **expiration-ms:** 86400000 = 24 horas em milissegundos (tempo de vida do token).

---

## 📄 Licença

Uso livre para estudo e projetos pessoais.
