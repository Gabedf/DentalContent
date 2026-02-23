# 🦷 DentalContent Pro — Frontend

Frontend Next.js 14 conectado ao backend DentalContent Pro.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS** — dark theme customizado
- **TanStack React Query** — cache e data fetching
- **Zustand** — estado de autenticação
- **@dnd-kit** — Kanban drag and drop
- **react-big-calendar** — Calendário editorial
- **react-hot-toast** — Notificações
- **Axios** — HTTP client com interceptors JWT

---

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Rodar

Certifique-se que o **backend está rodando** na porta 3000:

```bash
# No diretório do backend:
npm run dev
```

Depois inicie o frontend (porta 3001 para não conflitar):

```bash
npm run dev -- -p 3001
```

Acesse: [http://localhost:3001](http://localhost:3001)

---

## Estrutura de pastas

```
app/
├── layout.tsx              ← Root layout (fontes, providers)
├── globals.css             ← Estilos globais + overrides do calendário
├── providers.tsx           ← React Query + Toaster
├── page.tsx                ← Redirect → /login
├── login/page.tsx          ← Tela de login/cadastro
└── app/
    ├── layout.tsx          ← AppShell (sidebar + proteção de rota)
    ├── dashboard/page.tsx  ← Dashboard com stats
    ├── generate/page.tsx   ← Geração de conteúdo (core)
    ├── kanban/page.tsx     ← Kanban drag & drop
    ├── calendar/page.tsx   ← Calendário editorial
    └── settings/page.tsx   ← Perfil, plano e conta

components/
├── layout/
│   ├── AppShell.tsx        ← Wrapper com proteção de rota
│   ├── Sidebar.tsx         ← Navegação + uso do plano
│   └── Topbar.tsx          ← Header de cada página
└── ui/
    ├── Button.tsx
    ├── Input.tsx           ← Input, Select, Textarea
    └── Badge.tsx           ← TypeBadge, StatusBadge, Card

hooks/
├── useAuth.ts              ← login, register, logout
├── useProfiles.ts          ← CRUD de perfis
└── useContents.ts          ← generate, list, status, schedule, usage

lib/
├── api.ts                  ← Axios com interceptors JWT
├── authStore.ts            ← Zustand store + hydration localStorage
└── utils.ts                ← cn(), formatDate(), getInitials()
```

---

## Fluxo do usuário

1. `/login` → autentica → token salvo no localStorage
2. Redirect → `/app/dashboard`
3. `/app/settings` → criar perfil odontológico
4. `/app/generate` → selecionar perfil → preencher form → gerar
5. Aprovar → agendar com data
6. `/app/kanban` → arrastar cards entre colunas
7. `/app/calendar` → ver conteúdos agendados no mês

---

## Deploy (Vercel)

1. Push para GitHub
2. Conectar ao Vercel
3. Adicionar variável: `NEXT_PUBLIC_API_URL=https://sua-api.railway.app/api`
4. Deploy automático
