# 🦷 DentalContent Pro — Backend

Micro SaaS para geração de conteúdo estratégico no Instagram para Dentistas Estéticos e Implantodontistas.

---

## Stack

- **Node.js** + **Express**
- **PostgreSQL** (compatível com Supabase)
- **OpenAI API** (GPT-4o)
- **JWT** para autenticação
- **Stripe** (stub — ativar quando necessário)

---

## Setup local

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite o .env com suas credenciais
```

### 3. Criar banco de dados

**Supabase:** crie um projeto em supabase.com e copie a connection string para `DATABASE_URL`.

**Local (Docker rápido):**
```bash
docker run --name dental-pg -e POSTGRES_PASSWORD=senha -e POSTGRES_DB=dentalcontent -p 5432:5432 -d postgres:15
```
Depois: `DATABASE_URL=postgresql://postgres:senha@localhost:5432/dentalcontent`

### 4. Rodar migrations

```bash
npm run migrate
```

### 5. Iniciar servidor

```bash
# Desenvolvimento (hot reload)
npm run dev

# Produção
npm start
```

---

## Endpoints

### Auth
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuário autenticado |

### Perfis
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/profiles` | Criar perfil odontológico |
| GET | `/api/profiles` | Listar perfis |
| PATCH | `/api/profiles/:id` | Atualizar perfil |

### Conteúdo
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/contents/generate` | Gerar conteúdo (verifica limite do plano) |
| GET | `/api/contents` | Listar (kanban / calendário) |
| GET | `/api/contents/usage` | Uso do mês atual |
| PATCH | `/api/contents/:id/status` | Mover no kanban |
| PATCH | `/api/contents/:id/schedule` | Agendar com data |

### Stripe
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/stripe/checkout` | Criar sessão de checkout |
| POST | `/api/stripe/webhook` | Webhook Stripe |

---

## Limites por plano

| Plano | Gerações/mês | Preço sugerido |
|-------|-------------|----------------|
| essencial | 20 | R$ 97 |
| pro | 60 | R$ 197 |
| clinica | Ilimitado | R$ 347 |

---

## Query params — GET /api/contents

| Param | Tipo | Descrição |
|-------|------|-----------|
| `profile_id` | UUID | Filtra por perfil |
| `status` | string | `idea \| generated \| approved \| scheduled \| published` |
| `month` | number | Mês (1–12) para visão calendário |
| `year` | number | Ano para visão calendário |

---

## Exemplos de request

### Gerar conteúdo
```json
POST /api/contents/generate
Authorization: Bearer <token>

{
  "profile_id": "uuid-do-perfil",
  "content_type": "educativo",
  "theme": "clareamento dental a laser: como funciona e quando indicar",
  "objective": "educar",
  "tone": "acessivel"
}
```

### Agendar conteúdo
```json
PATCH /api/contents/:id/schedule
Authorization: Bearer <token>

{
  "scheduled_date": "2024-03-15"
}
```

### Mover no Kanban
```json
PATCH /api/contents/:id/status
Authorization: Bearer <token>

{
  "status": "approved"
}
```

---

## Deploy (Railway / Render / Heroku)

1. Suba o código no GitHub
2. Conecte ao Railway ou Render
3. Configure as variáveis de ambiente do `.env.example`
4. Rode `npm run migrate` uma vez (via console do deploy ou script de build)
5. Start command: `npm start`
