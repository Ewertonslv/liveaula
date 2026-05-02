# Specs — Professor Web (PW1–PW7)

> Passo 3B. Stack: Next.js 14 App Router. Viewport: 1280px+, sidebar 240px, content área restante.
> Tokens: ver DESIGN.md. Modo: professor light (padrão) com dark mode toggle.

---

## PW1 — Login — Professor — Web

### Layout (ASCII wire)
```
┌──────────────────────────────────────────────────────┐
│                                                      │
│    ┌─────────────────────────────────────────┐       │
│    │  ◆ liveaula                             │       │  ← left half: form
│    │                                         │       │
│    │  Entrar na sua conta                    │       │  ← text-h1 600
│    │  Para professores                        │       │  ← text-body color-text-muted
│    │                                         │       │
│    │  E-mail                                 │       │
│    │  ┌───────────────────────────────────┐  │       │
│    │  │ professor@email.com               │  │       │
│    │  └───────────────────────────────────┘  │       │
│    │                                         │       │
│    │  Senha                                  │       │
│    │  ┌───────────────────────────────────┐  │       │
│    │  │ ••••••••                      [👁]│  │       │
│    │  └───────────────────────────────────┘  │       │
│    │                                         │       │
│    │  [Esqueci minha senha]  (link right)     │       │
│    │                                         │       │
│    │  ┌───────────────────────────────────┐  │       │
│    │  │              Entrar               │  │       │  ← Button primary full-width
│    │  └───────────────────────────────────┘  │       │
│    │                                         │       │
│    │  Não tem conta? Criar conta             │       │
│    └─────────────────────────────────────────┘       │
│                                                      │
│    bg: color-surface, max-w: 400px, centered vertical│
└──────────────────────────────────────────────────────┘
```

### Componentes usados
- Input: text (email), password (toggle show)
- Button: primary full-width

### Estados da tela
- **Loading:** botão loading (spinner inline)
- **Erro credenciais:** Input erro + mensagem inline
- **Sucesso:** redirect para PW2

### Interações principais
- Submit → `POST /auth/login` → salva token httpOnly cookie → redirect PW2
- Enter no campo senha → submit
- "Esqueci" → `/esqueci-senha`
- Redirect automático se já logado → PW2

### Dados necessários da API
- `POST /auth/login` `{ email, senha }` → Set-Cookie httpOnly (access + refresh)

**Anti-AI checklist:**
- [x] Form centralizado sem gradient de fundo (surface limpo)
- [x] 2 pesos (h1 + labels body)
- [x] Tokens semânticos
- [x] Password com toggle (não input plain)
- [x] Redirect automático se logado (UX real)

---

## PW2 — Dashboard — Professor — Web

### Layout (ASCII wire)
```
┌────────────────────────────────────────────────────────────────┐
│ ◆ liveaula  [Buscar aluno...]          [🔥3] [👤João] [🌙]    │  ← TopBar
├──────────────┬─────────────────────────────────────────────────┤
│              │  Bom dia, João                                  │
│  Dashboard ● │                                                 │
│  Alunos      │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────┐│
│  Agenda      │  │   28    │ │  14.5h  │ │    6    │ │ R$474 ││
│  Financeiro  │  │ aulas   │ │  total  │ │ alunos  │ │ receita││
│  Configur.   │  │  este mês│ │ este mês│ │ ativos  │ │ (est.) ││
│              │  └─────────┘ └─────────┘ └─────────┘ └───────┘│
│  ────────    │                                                 │
│              │  Aulas recentes                  [+ Registrar →]│
│  [+ Registrar│  ┌─────────────────────────────────────────────┐│
│    Aula]     │  │ Data    Aluno      Matéria   Duração  Status ││
│  (CTA fixo   │  ├─────────────────────────────────────────────┤│
│   na sidebar)│  │ 28/04   Ana Silva  Mat.      1h       ✓ Env ││
│              │  │ 26/04   Bruno C.   Port.     1h30     ✓ Env ││
│              │  │ 24/04   Carla M.   Física    2h       ⚠ S/pai││
│              │  │ 22/04   Ana Silva  Mat.      1h       ✓ Env ││
│              │  │ 20/04   Bruno C.   Port.     1h       ✓ Env ││
│              │  └─────────────────────────────────────────────┘│
│              │  [Ver histórico completo →]                     │
│              │                                                 │
│              │  Alunos — atividade esta semana                 │
│              │  ┌──────────────────────────────────────────┐   │
│              │  │ [●] Ana Silva   Mat.  ░░░░░░░░░░░  3/sem  │   │
│              │  │ [●] Bruno C.    Port. ░░░░░░░░░    2/sem  │   │
│              │  │ [●] Carla M.    Fís.  ░░░░░       1/sem ⚠│   │
│              │  └──────────────────────────────────────────┘   │
└──────────────┴─────────────────────────────────────────────────┘
```

### Componentes usados
- Sidebar: navegação fixa 240px, item ativo com bg color-primary-muted + texto color-primary
- Stats cards: 4 cards com número + label (Card variant=elevated)
- Tabela: rows alternados (zebra: bg color-surface e color-surface-raised), Badge success/warning
- ProgressBar: por aluno, semanal
- Button: primary "Registrar Aula" (sidebar + top-right da tabela)
- StreakBadge: sm, no avatar do usuário no TopBar
- Input: search no TopBar (abre dropdown com alunos + aulas)

### Estados da tela
- **Sem alunos:** stats todos zero + tabela empty state "Adicione seu primeiro aluno"
- **Loading:** skeleton nos 4 stats cards + skeleton rows na tabela
- **Erro rede:** banner inline "Não foi possível carregar — Tentar novamente"

### Interações principais
- "Registrar Aula" → abre modal PW5 (mesma lógica do BottomSheet P5)
- Tap row da tabela → PW4 (Perfil aluno filtrado para aquela aula) ou abre side panel com detalhe
- Click aluno na seção de atividade → PW4
- Busca global → dropdown com resultados (alunos + aulas)
- Dark mode toggle (🌙) → salva preferência, aplica tokens dark imediato

### Dados necessários da API
- `GET /professor/dashboard` → `{ streak, mes: { aulas, horas, alunos_ativos, receita_estimada }, aulas_recentes: [...], alunos_atividade: [...] }`

**Anti-AI checklist:**
- [x] Sidebar + content — não centered-card
- [x] 4 pesos tipográficos (h2 greeting, stats número display, table body, caption labels)
- [x] Tokens semânticos
- [x] Tabela com zebra e badges distintos (✓ / ⚠)
- [x] Empty state com CTA acionável

---

## PW3 — Lista de Alunos (Tabela completa) — Professor — Web

### Layout (ASCII wire)
```
┌──────────────┬─────────────────────────────────────────────────┐
│  [sidebar]   │  Alunos                        [+ Novo aluno]   │
│              │─────────────────────────────────────────────────│
│              │  [🔍 Buscar aluno...]  Filtros: [Matéria ▼] [Status pai ▼]│
│              │                                                 │
│              │  ┌─────────────────────────────────────────────┐│
│              │  │ ☐  Avatar  Nome          Matéria  Pai    Aulas││
│              │  ├─────────────────────────────────────────────┤│
│              │  │ ☐  [●] Ana Silva    Mat.  ✓vinc   12/mês    ││
│              │  │ ☐  [●] Bruno C.     Port. ✓vinc   8/mês     ││
│              │  │ ☐  [●] Carla M.     Fís.  ⚠pend   4/mês     ││
│              │  │ ☐  [●] Diego R.     Mat.  ✗n/v    0/mês  ⚠  ││
│              │  └─────────────────────────────────────────────┘│
│              │  Mostrando 4 de 4 alunos                        │
│              │                                                 │
│              │  [Ações em lote: ☐ selecionados → Excluir]      │
└──────────────┴─────────────────────────────────────────────────┘
```

### Componentes usados
- Tabela com checkbox (seleção em lote)
- Avatar: filho, size=xs
- Badge: success (vinculado), warning (pendente), neutral (não vinculado)
- Badge: warning "0/mês" para aluno inativo
- Input: search, select (filtros)
- Button: primary (Novo aluno), destructive ghost (Excluir selecionados)

### Estados da tela
- **Sem alunos:** "Nenhum aluno cadastrado — Adicionar primeiro aluno" (CTA primary)
- **Filtro sem resultado:** "Nenhum aluno encontrado" + "Limpar filtros"
- **Loading:** skeleton rows
- **Seleção ativa:** barra de ações em lote aparece no bottom

### Interações principais
- Click row → PW4 (perfil do aluno)
- "Novo aluno" → modal de criação (mesmo form P13 adaptado web)
- Filtro matéria → `?materia_id=` query param
- Filtro status pai → `?pai_status=vinculado|pendente|nao_vinculado`
- Checkbox + Excluir → confirm dialog → `DELETE /alunos` batch

### Dados necessários da API
- `GET /professor/alunos?busca=&materia_id=&pai_status=&page=1`

**Anti-AI checklist:**
- [x] Tabela com colunas — não grid de cards
- [x] 2 pesos (header uppercase caption + rows body)
- [x] Tokens semânticos (badges por status)
- [x] Filtros são combinables (busca + matéria + status)
- [x] 0 aulas/mês sinaliza atenção (não é dado neutro)

---

## PW4 — Perfil do Aluno — Professor — Web

### Layout (ASCII wire)
```
┌──────────────┬─────────────────────────────────────────────────┐
│  [sidebar]   │  ← Alunos  /  Ana Silva           [Editar] [⋮] │
│              │─────────────────────────────────────────────────│
│              │  ┌──────────────────┐  ┌──────────────────────┐ │
│              │  │ [Avatar lg]      │  │  Progresso este mês  │ │
│              │  │ Ana Silva        │  │  Aulas: ████░░░ 12/16│ │  ← ProgressBar
│              │  │ 8º Ano • Mat.    │  │  Horas: 14.5h        │ │
│              │  │ ● Pai vinculado  │  │  Frequência: 75%     │ │
│              │  │ [Convidar pai]   │  └──────────────────────┘ │
│              │  └──────────────────┘                           │
│              │─────────────────────────────────────────────────│
│              │  Histórico de aulas          [Filtrar] [Export CSV]│
│              │  ┌─────────────────────────────────────────────┐│
│              │  │ Data    Duração  Conteúdo            Humor   ││
│              │  ├─────────────────────────────────────────────┤│
│              │  │ 28/04   1h       Funções quadráticas  😊     ││
│              │  │ 22/04   1h30     Trigonometria        😐     ││
│              │  │ 15/04   2h       Revisão prova        😕     ││
│              │  │ 08/04   1h       Geometria analítica  😊     ││
│              │  └─────────────────────────────────────────────┘│
│              │  Paginação: ← 1 2 3 →                          │
└──────────────┴─────────────────────────────────────────────────┘
```

### Componentes usados
- Avatar: filho, size=lg
- ProgressBar: por-matéria (aulas mês)
- Tabela: histórico de aulas com humor emoji
- Badge: success (pai vinculado) / warning/neutral
- Button: primary (Convidar pai — se não vinculado), ghost (Editar), secondary (Export CSV)

### Estados da tela
- **Sem aulas:** tabela empty state "Nenhuma aula registrada — Registrar primeira aula"
- **Loading:** skeleton layout-2-col
- **Pai não vinculado:** Badge prominent + Button primary "Convidar pai" em destaque

### Interações principais
- Click row → side panel com detalhe da aula (não nova página)
- "Export CSV" → download `aluno-ana-silva-aulas.csv`
- "Editar" → modal de edição do aluno
- "Convidar pai" → modal de convite (mesmo P10 adaptado)
- Paginação → 20 registros/página

### Dados necessários da API
- `GET /alunos/:id` → dados do aluno
- `GET /alunos/:id/aulas?page=1&limit=20` → histórico
- `GET /alunos/:id/progresso` → métricas mês
- `GET /alunos/:id/aulas/export.csv` → stream CSV

**Anti-AI checklist:**
- [x] Layout 2 colunas (perfil + progresso) — não stack linear
- [x] 3 pesos (nome h1, labels body, caption metadata)
- [x] Tokens semânticos
- [x] Tabela com emoji humor — elemento visual não-genérico
- [x] Export CSV (funcionalidade real, não cosmética)

---

## PW5 — Registrar Aula (Modal Web) — Professor — Web

### Layout (ASCII wire)
```
┌──────────────────────────────────────────────────────┐
│  ░░░░░░░░ dashboard ao fundo (overlay bg-black/40) ░░│
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  Registrar Aula                            [×] │  │  ← Modal, max-w=560px
│  │────────────────────────────────────────────────│  │
│  │                                                │  │
│  │  Aluno *                                       │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │ Selecionar aluno...                    ▼ │  │  │  ← Select com busca interna
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                │  │
│  │  Matéria *          Duração *                  │  │
│  │  ┌─────────────┐    ┌──┐ ┌──┐ ┌──┐ ┌────┐    │  │
│  │  │ Matemática▼ │    │45m│ │1h│●│1h30│ │2h  │  │  │  ← chips duração
│  │  └─────────────┘    └──┘ └──┘ └──┘ └────┘    │  │
│  │                                                │  │
│  │  O que foi estudado *                          │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │                                    0/280 │  │  │  ← textarea 4 linhas
│  │  │                                          │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │                                                │  │
│  │  Humor da aula (opcional)    Obs. ao pai (opt.)│  │
│  │  😕 😐 😊                   ┌──────────────┐  │  │
│  │                              │              │  │  │
│  │                              └──────────────┘  │  │
│  │                                                │  │
│  │  ┌────────────────┐  ┌────────────────────┐   │  │
│  │  │    Cancelar    │  │    Registrar aula   │   │  │
│  │  └────────────────┘  └────────────────────┘   │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### Componentes usados
- Modal: overlay + Dialog (Radix UI)
- Input: select com busca (Aluno), select (Matéria), textarea, emoji picker inline
- Chips duração: toggle (um de cada vez)
- Button: ghost (Cancelar), primary (Registrar aula)

### Estados da tela
- **Disabled:** botão Registrar disabled até aluno + matéria + duração + conteúdo preenchidos
- **Loading (submit):** botão loading + spinner
- **Sucesso:** modal fecha + Toast success "Aula registrada — Ana Silva, Matemática, 1h" (com link "Ver detalhes")
- **Erro rede:** Toast error, dados preservados no modal (não fecha)
- **Offline:** não disponível na web (sem expo-sqlite) — Toast warning "Sem conexão — aguarde"

### Interações principais
- Smart default: último aluno selecionado destacado no topo do select
- Ao selecionar aluno → matéria pré-selecionada (última usada para esse aluno)
- Duração: chip dura selecionada por último (cross-session)
- Escape / click fora → fecha modal (se campos vazios) ou confirm "Descartar?"
- Submit → `POST /aulas`

### Dados necessários da API
- `GET /professor/alunos/recentes?limit=5`
- `GET /professor/preferencias`
- `POST /aulas` `{ aluno_id, materia_id, duracao, conteudo, humor_aluno, observacao_pai, registrado_em }`

**Anti-AI checklist:**
- [x] Modal — não página separada (não quebra contexto do dashboard)
- [x] 2 pesos (labels caption + inputs body)
- [x] Tokens semânticos
- [x] Smart defaults (mesmo sistema do mobile P5)
- [x] Offline não disponível na web — comunicado honestamente

---

## PW6 — Histórico de Aulas — Professor — Web

### Layout (ASCII wire)
```
┌──────────────┬─────────────────────────────────────────────────┐
│  [sidebar]   │  Histórico de aulas                             │
│              │─────────────────────────────────────────────────│
│              │  [🔍 Buscar...] [Aluno ▼] [Matéria ▼] [Período ▼] [Export]│
│              │                                                 │
│              │  ┌─────────────────────────────────────────────┐│
│              │  │ Data     Aluno      Mat.   Dur.  Conteúdo   ││
│              │  ├─────────────────────────────────────────────┤│
│              │  │ 28/04/26 Ana Silva  Mat.   1h    Funções...  ││
│              │  │ 26/04/26 Bruno C.   Port.  1h30  Interpret..││
│              │  │ 24/04/26 Carla M.   Fís.   2h    Cinemática  ││
│              │  │ ...                                          ││
│              │  └─────────────────────────────────────────────┘│
│              │  20 de 48 registros  ←  1  2  3  →              │
└──────────────┴─────────────────────────────────────────────────┘
```

### Componentes usados
- Tabela com paginação
- Input: search, selects (filtros)
- Button: secondary (Export CSV)

### Estados da tela
- **Vazio:** "Nenhuma aula registrada" + CTA "Registrar primeira aula"
- **Filtro sem resultado:** "Nenhum resultado" + "Limpar filtros"
- **Loading:** skeleton rows

### Interações principais
- Click row → side panel com detalhe completo da aula (não nova página)
- Export CSV → `GET /professor/aulas/export.csv?filtros`
- Paginação server-side (20/página)

### Dados necessários da API
- `GET /professor/aulas?page=&limit=20&aluno_id=&materia_id=&data_inicio=&data_fim=&busca=`
- `GET /professor/aulas/export.csv?[filtros]`

**Anti-AI checklist:**
- [x] Tabela com filtros combinables — não list de cards
- [x] 2 pesos (header caption + rows body)
- [x] Tokens semânticos
- [x] Side panel para detalhe (não quebra contexto)
- [x] Export acessível por botão visível (não escondido em menu)

---

## PW7 — Configurações — Professor — Web

### Layout (ASCII wire)
```
┌──────────────┬────────────────────────────────────────────────┐
│  [sidebar]   │  Configurações                                 │
│              │────────────────────────────────────────────────│
│              │  ┌──────────┐  ┌───────────────────────────┐   │
│              │  │ Perfil   │  │  Perfil                   │   │  ← sub-nav (tabs)
│              │  │ Notif.   │  │  ─────────────────────── │   │
│              │  │ Plano    │  │  [Avatar lg]  João Silva  │   │
│              │  │ Segurança│  │  Editar foto              │   │
│              │  └──────────┘  │  Nome: [________________] │   │
│              │                │  Bio:  [________________] │   │
│              │                │  Mat.: [Mat] [Fís] [+]    │   │
│              │                │                           │   │
│              │                │  [Salvar alterações]      │   │
│              │                └───────────────────────────┘   │
│              │                                                │
│              │  (Notificações tab)                            │
│              │  ● Notificação push ativa                      │
│              │  ● E-mail de resumo semanal                    │
│              │                                                │
│              │  (Plano tab)                                   │
│              │  Plano Free — 3 alunos grátis                  │
│              │  [Ver planos →]                                │
└──────────────┴────────────────────────────────────────────────┘
```

### Componentes usados
- Sub-nav: tabs vertical (Perfil / Notificações / Plano / Segurança)
- Avatar: professor, size=lg, com upload
- Input: text (nome), textarea (bio), chips (matérias)
- Toggle: notificações
- Button: primary (Salvar), ghost (Trocar foto)

### Estados da tela
- **Salvar sem mudanças:** botão disabled
- **Loading save:** botão loading
- **Sucesso:** Toast "Perfil atualizado"
- **Plano Free:** Card com limite (3 alunos) + CTA upgrade

### Interações principais
- Switch de tab → URL `/configuracoes/perfil`, `/configuracoes/notificacoes` etc (URL-based tabs)
- Upload foto → drag-drop ou click (aceita JPG/PNG, max 5MB)
- Toggle notificação → `PATCH /professor/preferencias` imediato

### Dados necessários da API
- `GET /professor/perfil` + `GET /professor/preferencias` + `GET /professor/plano`
- `PATCH /professor/perfil`, `PATCH /professor/preferencias`

**Anti-AI checklist:**
- [x] Layout split (sub-nav + conteúdo) — não form único vertical
- [x] 2 pesos (section headers h2 + form body)
- [x] Tokens semânticos
- [x] Tabs por URL (navegação real, não state local)
- [x] Plano Free com limite explícito (honesto, não escondido)
