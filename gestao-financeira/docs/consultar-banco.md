# Como ver os dados no banco de dados

O backend usa **PostgreSQL**. As tabelas são: `usuarios`, `categorias`, `transacoes`.

Dados de conexão (conforme `application.properties`):

| Campo    | Valor              |
|----------|--------------------|
| Host     | localhost           |
| Porta    | 5432               |
| Banco    | gestao_financeira   |
| Usuário  | finance_user       |
| Senha    | 2312Arph           |

---

## 1. Pelo terminal (psql)

```bash
# Conectar com o usuário da aplicação (não precisa ser postgres)
psql -h localhost -p 5432 -U finance_user -d gestao_financeira
# Vai pedir a senha: 2312Arph
```

Dentro do `psql`, você pode rodar:

```sql
-- Listar tabelas
\dt

-- Ver usuários cadastrados (a senha fica criptografada)
SELECT id, nome, email, criado_em FROM usuarios;

-- Ver categorias (com o nome do usuário dono)
SELECT c.id, c.nome, c.descricao, u.email AS usuario_email
FROM categorias c
JOIN usuarios u ON u.id = c.usuario_id
ORDER BY u.email, c.nome;

-- Ver transações (com categoria e tipo)
SELECT t.id, t.data, t.valor, t.tipo, t.descricao, c.nome AS categoria, u.email AS usuario
FROM transacoes t
JOIN categorias c ON c.id = t.categoria_id
JOIN usuarios u ON u.id = t.usuario_id
ORDER BY t.data DESC, t.id DESC
LIMIT 50;

-- Sair do psql
\q
```

---

## 2. Com uma ferramenta gráfica (DBeaver, pgAdmin, etc.)

1. **Nova conexão** → PostgreSQL.
2. Preencha:
   - **Host:** localhost  
   - **Port:** 5432  
   - **Database:** gestao_financeira  
   - **Username:** finance_user  
   - **Password:** 2312Arph  
3. Teste a conexão e abra o banco.
4. Navegue em **Schemas → public → Tables** e abra `usuarios`, `categorias`, `transacoes`.
5. Use “View Data” ou “SELECT” para ver os registros.

---

## 3. Resumo das tabelas

| Tabela       | Conteúdo principal                                      |
|--------------|----------------------------------------------------------|
| **usuarios** | id, nome, email, senha (hash), criado_em                 |
| **categorias** | id, nome, descricao, usuario_id                        |
| **transacoes** | id, data, valor, tipo (ENTRADA/SAIDA), descricao, categoria_id, usuario_id, criado_em |

Assim você consegue ver no banco tudo que foi cadastrado pelo frontend ou pela API.
