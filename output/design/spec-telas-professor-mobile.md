# Specs — Professor Mobile (P1–P17, exceto P5)

> Passo 3B da skill `liveaula-design`. Tokens: ver DESIGN.md. Superfície: iOS + Android (375px).

---

## P1 — Splash — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│         ◆ liveaula          │  ← logo: wordmark Plus Jakarta Sans 700 24px, color-primary
│    aulas que ficam na memória│  ← tagline text-caption color-text-muted
│                             │
│                             │
│    ░░░░░░░░░░░░░░░░░░░░░    │  ← ProgressBar indeterminate, color-primary, h=2px
└─────────────────────────────┘
   bg: color-surface (prof-light)
```

### Componentes usados
- Logo: wordmark SVG + tagline
- ProgressBar: indeterminate, h=2px, cor color-primary

### Estados da tela
- **Único:** exibe 1.5s → verifica token JWT salvo → navega para P4 (logado) ou P3 (não logado) ou P2 (primeira vez)
- **Sem estado vazio/erro:** falhas silenciosas redirecionam para P3

### Interações principais
- Auto-navega após verificação de token (max 2s)

### Dados necessários da API
- Nenhum — apenas leitura de AsyncStorage (token local)

**Anti-AI checklist:**
- [x] Layout não é centered-card-on-gradient (surface limpo)
- [x] Tipografia 2 pesos (700 logo + 400 tagline)
- [x] Paleta via tokens semânticos
- [x] Sem componentes genéricos
- [x] Sem estado vazio (tela de transição)

---

## P2 — Onboarding (Cadastro 3 steps) — Professor — Mobile

### Layout (ASCII wire) — Step 1/3
```
┌─────────────────────────────┐
│  ●──○──○      [Pular]       │  ← step dots + skip ghost button
│─────────────────────────────│
│                             │
│  Bem-vindo ao liveaula      │  ← text-h1 600
│  Crie sua conta de professor│  ← text-body color-text-muted
│                             │
│  ┌─────────────────────────┐│
│  │ E-mail profissional     ││  ← Input text, type=email
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Senha (mín. 8 chars)    ││  ← Input password, toggle show
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Confirmar senha         ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │      Continuar →        ││  ← Button primary, disabled até válido
│  └─────────────────────────┘│
│  Já tem conta? Entrar       │  ← link text-caption color-primary
└─────────────────────────────┘
```

### Layout — Step 2/3
```
┌─────────────────────────────┐
│  ○──●──○                    │
│─────────────────────────────│
│  Seu perfil profissional    │  ← text-h1
│                             │
│  ┌────┐  Nome completo      │  ← Avatar placeholder (tap = galeria/câmera)
│  │ 👤 │  ┌───────────────┐  │
│  └────┘  │               │  │
│           └───────────────┘  │
│  Matéria(s) que você ensina  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐│  ← chips selecionáveis (matérias pré-definidas)
│  │Mat.│ │Port│ │Fís.│ │+   ││
│  └────┘ └────┘ └────┘ └────┘│
│                             │
│  ┌─────────────────────────┐│
│  │      Continuar →        ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Layout — Step 3/3
```
┌─────────────────────────────┐
│  ○──○──●                    │
│─────────────────────────────│
│  Adicione seu primeiro aluno│  ← text-h1
│  Não pule — é onde tudo começa│ ← text-body color-text-muted
│                             │
│  ┌─────────────────────────┐│
│  │ Nome do aluno           ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Série/Ano escolar       ││  ← select nativo
│  └─────────────────────────┘│
│  Matéria (já puxada do step 2)│
│  ┌────┐ ┌────┐              │
│  │Mat.│ │Port│              │
│  └────┘ └────┘              │
│                             │
│  ┌─────────────────────────┐│
│  │    Criar conta e entrar ││  ← Button primary
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Componentes usados
- Input: text, password, select
- Button: primary (disabled/active), ghost (Pular)
- Badge chips: matérias selecionáveis (variante highlight quando selecionado)
- Avatar: professor/placeholder com tap para upload
- ProgressBar step: dots (3 steps)

### Estados da tela
- **Vazio:** campos em branco, botão disabled
- **Loading:** após tap em "Criar conta" → botão loading, spinner
- **Erro e-mail já usado:** Input erro + mensagem inline "Este e-mail já está cadastrado — Entrar"
- **Erro rede:** Toast error "Sem conexão — tente novamente"

### Interações principais
- Step 1 → Step 2: validação imediata de e-mail e senha
- Step 2 → Step 3: ao menos 1 matéria selecionada
- Step 3 → submit: POST /auth/register + POST /alunos (primeiro aluno)
- "Pular" no Step 3: não disponível — campo obrigatório por design

### Dados necessários da API
- `POST /auth/register` `{ email, senha, nome, foto_url, materias[] }`
- `POST /alunos` `{ nome, serie, materias[] }` (após register)
- `GET /materias` — lista de matérias disponíveis

**Anti-AI checklist:**
- [x] Layout não é centered-card-on-gradient
- [x] Tipografia 2 pesos (600 h1 + 400 body)
- [x] Tokens semânticos (color-primary, color-text-muted)
- [x] Chips de matéria têm variação selected/unselected
- [x] Estado vazio dos steps tem instrução clara

---

## P3 — Login — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│                             │
│  ◆ liveaula                 │  ← logo menor, top-left
│                             │
│  Entrar na sua conta        │  ← text-h1 600
│                             │
│  ┌─────────────────────────┐│
│  │ E-mail                  ││  ← Input text, type=email, autofocus
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Senha                   ││  ← Input password + toggle 👁
│  └─────────────────────────┘│
│                             │
│  Esqueci minha senha        │  ← link right-align, text-caption color-primary
│                             │
│  ┌─────────────────────────┐│
│  │         Entrar          ││  ← Button primary
│  └─────────────────────────┘│
│                             │
│  Não tem conta? Criar conta │  ← text-caption, "Criar conta" color-primary
└─────────────────────────────┘
```

### Componentes usados
- Input: text (email), password (toggle show)
- Button: primary (disabled → active ao preencher ambos)
- Links: ghost text-caption para esqueci senha + criar conta

### Estados da tela
- **Vazio:** botão disabled
- **Loading:** botão loading após tap
- **Erro credenciais:** Toast error "E-mail ou senha incorretos"
- **Erro rede:** Toast error "Sem conexão"
- **Sucesso:** navega para P4

### Interações principais
- Submit: `POST /auth/login` → salva JWT + refreshToken em SecureStore
- "Esqueci minha senha" → navega P17
- "Criar conta" → navega P2

### Dados necessários da API
- `POST /auth/login` `{ email, senha }` → `{ access_token, refresh_token, professor_id }`

**Anti-AI checklist:**
- [x] Não é centered-card-on-gradient (surface limpo, logo top-left)
- [x] 2 pesos (600 h1 + 400 labels)
- [x] Tokens semânticos
- [x] Input email e password são tipos distintos
- [x] Erro "E-mail ou senha incorretos" (não genérico)

---

## P4 — Dashboard (Lista de Alunos) — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  Boa tarde, João  🔥3 dias  │  ← greeting text-body + StreakBadge (se ≥2)
│─────────────────────────────│
│  Esta semana                │  ← text-caption color-text-muted
│  ┌──────┬──────┬──────┐     │
│  │  8   │  3h  │  4   │     │  ← stats: aulas / horas / alunos ativos
│  │aulas │total │ativos│     │
│  └──────┴──────┴──────┘     │
│─────────────────────────────│
│  Seus alunos                │  ← text-h2 600
│                             │
│  ┌─────────────────────────┐│
│  │ 🔍 Buscar aluno...      ││  ← Input search
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ [Avatar] Ana Silva      ││  ← Card aula, variant=default
│  │ Matemática • há 2 dias  ││
│  │ ░░░░░░░░░░░░░░░░  12/mês││  ← ProgressBar semanal
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ [Avatar] Bruno Costa    ││
│  │ Português • há 1 semana ││
│  │ ░░░░░░░░░░░░░  8/mês    ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ [Avatar] Carla Mendes   ││
│  │ Física • Nunca          ││  ← Badge warning "Sem aula recente"
│  │ ░░░░░░░  4/mês          ││
│  └─────────────────────────┘│
│                             │
│─────────────────────────────│
│ [🏠] [📅] [    ●    ] [⚙️] │  ← TabBar: Dashboard/Agenda/FAB/Config
│              [+]            │  ← FAB color-primary, shadow rgba(26,107,116,0.4)
└─────────────────────────────┘
```

### Componentes usados
- StreakBadge: sm, ativo (visível somente se streak ≥ 2)
- Card: variant=aula, tap → P7
- ProgressBar: semanal por aluno
- Badge: warning "Sem aula recente" (última aula > 7 dias)
- Badge: success "Pai vinculado" / neutral "Pai pendente"
- Input: search
- Button: FAB (+ registrar aula → abre P5 BottomSheet)

### Estados da tela
- **Vazio (P16):** ver spec P16 abaixo
- **Loading:** skeletons nos cards (3 cards animados)
- **Erro rede:** "Não foi possível carregar — Tentar novamente" (botão ghost)
- **Busca sem resultado:** "Nenhum aluno encontrado para '[busca]'" + CTA "Adicionar aluno"

### Interações principais
- Tap no card de aluno → P7 (Perfil aluno)
- Tap FAB "+" → BottomSheet P5 (registrar aula)
- Busca: filtra lista em tempo real (client-side, sem API)
- Pull to refresh: recarrega dados

### Dados necessários da API
- `GET /professor/dashboard` → `{ streak, semana: { aulas, horas, alunos_ativos }, alunos: [{ id, nome, materia_principal, ultima_aula, aulas_mes, pai_vinculado }] }`

**Anti-AI checklist:**
- [x] Layout lista com densidade alta — não centered-card
- [x] 3 pesos tipográficos (greeting body, h2 seção, caption stats)
- [x] Tokens semânticos
- [x] Cards têm variação (badge warning vs success vs sem badge)
- [x] Estado vazio tem CTA concreto ("Adicionar aluno")

---

## P6 — Confirmação de Envio (Modal) — Professor — Mobile

> Esta tela é o estado modal que aparece APÓS a coreografia de 4200ms do P5. É o "Notification Preview" que o professor vê antes de fechar.

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ░░░░░░░░ (dashboard embaixo)│
│  ╔═════════════════════════╗ │
│  ║  gradient-celebration   ║ │  ← bg: gradientCelebration (accent→primary)
│  ║                         ║ │
│  ║  ✓ Aula registrada!     ║ │  ← text-h2 600 #FFFFFF
│  ║                         ║ │
│  ║  ┌─────────────────────┐║ │
│  ║  │ 📱 Notificação      │║ │  ← Card notification preview (iMessage-style)
│  ║  │ liveaula  agora     │║ │     bg=#1C1C1E radius=12 p=12
│  ║  │ ─────────────────── │║ │
│  ║  │ Aula de Matemática  │║ │
│  ║  │ Ana teve aula hoje  │║ │
│  ║  │ 1h • "Funções quadrá│║ │
│  ║  │  ticas e gráficos"  │║ │
│  ║  └─────────────────────┘║ │
│  ║                         ║ │
│  ║  [Ver no histórico]     ║ │  ← Button ghost #FFFFFF border
│  ╚═════════════════════════╝ │
└─────────────────────────────┘
   aparece em t=600ms, fecha em t=4200ms (auto)
   tap fora ou botão fecha antes
```

### Componentes usados
- CelebrationOverlay: gradient-celebration bg
- Notification: preview premium (iMessage-style), bg=#1C1C1E
- Button: ghost branco (borda #FFFFFF, texto #FFFFFF)
- StreakBadge: pulsa em t=800ms se streak ≥ 2 (overlay no canto superior direito do modal)

### Estados da tela
- **Padrão:** preview da notificação enviada ao pai
- **Sem pai vinculado:** preview substituído por aviso "O pai ainda não foi vinculado. Aula salva — você pode convidar agora." + Button primary "Convidar pai"
- **Primeiro registro:** CelebrationOverlay com confetti + "Primeira aula registrada! 🎉"
- **Offline:** preview mostra "Notificação será enviada quando voltar online"

### Interações principais
- Auto-fecha em 4200ms → retorna Dashboard
- "Ver no histórico" → navega P8 (Histórico)
- "Convidar pai" → navega P10
- Tap fora do modal → fecha

### Dados necessários da API
- Dados recebidos na resposta do `POST /aulas`: `{ push_preview: { titulo, corpo }, streak_atual }`

**Anti-AI checklist:**
- [x] Modal sobre gradient — não a tela inteira no gradient
- [x] 2 pesos (600 h2 + 400 notification body)
- [x] Tokens semânticos (gradient-celebration, color-primary)
- [x] Notification preview é componente distinto do card padrão
- [x] Estado "sem pai" tem instrução acionável

---

## P7 — Perfil do Aluno — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar    Ana Silva  ⋮   │  ← header com menu (editar/excluir)
│─────────────────────────────│
│  [Avatar lg]  Ana Silva     │
│               8º ano • Mat. │  ← text-body-lg + text-caption
│               ● Pai vinculado│ ← Badge success
│                             │
│  [Convidar pai]  [Editar]   │  ← Buttons: secondary / ghost
│─────────────────────────────│
│  Progresso este mês         │  ← text-h2
│  ┌─────────────────────────┐│
│  │ Aulas realizadas  12/16 ││  ← ProgressBar por-matéria
│  │ ░░░░░░░░░░░░░░░░░  75%  ││
│  └─────────────────────────┘│
│─────────────────────────────│
│  Últimas aulas              │  ← text-h2
│  ┌─────────────────────────┐│
│  │ Seg 28/04  Matemática   ││  ← Card default, tap → P9
│  │ 1h • Funções quadráticas││
│  │ 😊 Bem                  ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Ter 22/04  Matemática   ││
│  │ 1h30 • Trigonometria    ││
│  │ 😐 Regular              ││
│  └─────────────────────────┘│
│  Ver histórico completo →   │  ← link text-caption color-primary
└─────────────────────────────┘
```

### Componentes usados
- Avatar: filho, size=lg
- Badge: success (pai vinculado) / neutral (pai pendente)
- Button: secondary (Convidar pai), ghost (Editar)
- ProgressBar: por-matéria
- Card: default por aula, tap → P9

### Estados da tela
- **Vazio (sem aulas):** "Nenhuma aula registrada ainda — Registrar primeira aula" (CTA FAB)
- **Loading:** skeleton avatar + skeleton cards
- **Pai não vinculado:** Badge neutral "Pai não vinculado" + destaque no botão "Convidar pai" (primary, não secondary)

### Interações principais
- Tap card de aula → P9 (Detalhe)
- "Convidar pai" → P10 (modal)
- "Editar" → P13 (editar aluno)
- "Ver histórico completo" → P8 filtrado por este aluno
- Menu "⋮" → opções: Editar, Excluir aluno (destrutivo, confirm modal)

### Dados necessários da API
- `GET /alunos/:id` → `{ nome, serie, materias, pai_vinculado, foto_url }`
- `GET /alunos/:id/aulas?limit=5` → lista de aulas recentes
- `GET /alunos/:id/progresso` → `{ aulas_mes, meta_mes, percentual }`

**Anti-AI checklist:**
- [x] Layout com seções distintas — não card único
- [x] 3 pesos (nome h2, subtítulo body, datas caption)
- [x] Tokens semânticos
- [x] Badge muda variant conforme status do pai
- [x] Estado "pai não vinculado" tem CTA destacado

---

## P8 — Histórico de Aulas — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar   Histórico       │
│─────────────────────────────│
│  ┌─────────────────────────┐│
│  │ 🔍 Buscar conteúdo...   ││
│  └─────────────────────────┘│
│  ┌────┐ ┌────┐ ┌──────────┐ │  ← chips filtro: Todos | Aluno | Matéria
│  │Todos│ │Ana │ │Matemática│ │
│  └────┘ └────┘ └──────────┘ │
│─────────────────────────────│
│  Abril 2026                 │  ← text-caption color-text-muted (section header)
│  ┌─────────────────────────┐│
│  │ 28 Seg  Ana • Mat  1h   ││  ← Card aula compacto
│  │ Funções quadráticas     ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 26 Sáb  Bruno • Port 1h30││
│  │ Interpretação de texto  ││
│  └─────────────────────────┘│
│─────────────────────────────│
│  Março 2026                 │
│  ┌─────────────────────────┐│
│  │ 30 Dom  Ana • Mat  2h   ││
│  │ Revisão para prova      ││
│  └─────────────────────────┘│
│  ... (infinite scroll)      │
└─────────────────────────────┘
```

### Componentes usados
- Input: search
- Badge chips: filtros selecionáveis (aluno, matéria)
- Card: aula compacto (data + aluno + matéria + duração + preview conteúdo)

### Estados da tela
- **Vazio (sem aulas):** "Nenhuma aula registrada ainda" + CTA FAB
- **Vazio (filtro sem resultado):** "Nenhuma aula encontrada para os filtros aplicados" + "Limpar filtros"
- **Loading:** skeletons (5 cards)
- **Erro:** "Erro ao carregar histórico — Tentar novamente"

### Interações principais
- Tap card → P9 (Detalhe)
- Busca em tempo real (debounce 300ms)
- Filtro chip aluno: abre FlatList modal de alunos
- Filtro chip matéria: abre FlatList modal de matérias
- Infinite scroll com paginação (20 itens/página)

### Dados necessários da API
- `GET /professor/aulas?page=1&limit=20&aluno_id=&materia_id=&busca=`
- Resposta: `{ aulas: [...], total, proxima_pagina }`

**Anti-AI checklist:**
- [x] Lista agrupada por mês — não cards em grid
- [x] 2 pesos (data/aluno bold, conteúdo regular)
- [x] Tokens semânticos
- [x] Cards compactos — variante distinta do card do P7
- [x] Filtro sem resultado tem ação "Limpar filtros"

---

## P9 — Detalhe de Aula — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar   Aula registrada │
│─────────────────────────────│
│  Seg, 28 de abril de 2026   │  ← text-caption color-text-muted
│                             │
│  [Avatar] Ana Silva         │  ← Avatar sm + nome text-body-lg 500
│  Matemática • 1 hora        │  ← text-caption
│                             │
│─────────────────────────────│
│  O que foi estudado         │  ← text-h2
│                             │
│  Funções quadráticas e seus │  ← text-body line-height 1.6
│  gráficos. Exercícios de    │
│  determinação de vértice e  │
│  raízes. Aluna se saiu bem  │
│  nos exemplos práticos.     │
│                             │
│─────────────────────────────│
│  Humor da aluna    😊 Bem   │  ← text-caption + emoji badge
│─────────────────────────────│
│  Mensagem ao pai            │  ← text-h2
│  "Ótima aula! Ana demonstrou│  ← text-body italic color-text-muted
│  muito progresso hoje."     │
│─────────────────────────────│
│  Notificação                │  ← text-caption
│  ● Enviada às 19h32         │  ← Badge success inline
│  [Ver preview]              │  ← link
│                             │
└─────────────────────────────┘
   (sem botão Editar — aulas são imutáveis após 24h)
   (dentro de 24h: botão ghost "Editar aula" no topo ⋮)
```

### Componentes usados
- Avatar: filho, size=sm
- Badge: success (notificação enviada) / warning (sem pai, não enviada)
- Ícone humor: emoji inline

### Estados da tela
- **Sem mensagem ao pai:** seção "Mensagem ao pai" oculta
- **Sem pai vinculado:** Badge warning "Pai não vinculado — notificação não enviada" + link "Convidar pai"
- **Aula offline:** Badge neutral "Salva offline — sync pendente"

### Interações principais
- "Ver preview" → abre modal com P6-style notification preview
- Menu "⋮" (dentro de 24h) → "Editar aula" → BottomSheet de edição (mesma UI do P5, pré-preenchida)
- Pull to refresh: recarrega dados da aula

### Dados necessários da API
- `GET /aulas/:id` → `{ aluno, materia, duracao, conteudo, humor_aluno, observacao_pai, registrado_em, push_enviado, push_preview }`

**Anti-AI checklist:**
- [x] Não é centered-card — é layout de leitura vertical
- [x] 3 pesos (h2 seção, body content, caption metadata)
- [x] Tokens semânticos
- [x] Seções têm divisão visual clara (border-bottom)
- [x] Estado "sem pai" tem ação acionável

---

## P10 — Convidar Pai (Compartilhar Link) — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar   Convidar pai    │  ← ou modal BottomSheet se aberto a partir de P7
│─────────────────────────────│
│                             │
│  Convide o pai de Ana Silva │  ← text-h1 600
│  para acompanhar as aulas   │  ← text-body color-text-muted
│                             │
│  ┌─────────────────────────┐│
│  │ 🔗 liveaula.app/conv/abc││  ← link único read-only, bg color-surface-raised
│  │                    [Copiar]│
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ 🟢 Compartilhar via WhatsApp││ ← Button primary #25D366 (exceção de cor = contexto WhatsApp)
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ ↗ Outras formas de compartilhar│ ← Button secondary (Sheet.share nativo)
│  └─────────────────────────┘│
│                             │
│─────────────────────────────│
│  Status do convite          │
│  ⏳ Aguardando aceite       │  ← Badge neutral
│  Enviado há 2 dias          │  ← text-caption
│                             │
│  [Reenviar convite]         │  ← Button ghost (só visível se enviado e não aceito)
└─────────────────────────────┘
```

### Componentes usados
- Input: read-only (link de convite)
- Button: primary WhatsApp (cor #25D366 — exceção contextual), secondary (compartilhar), ghost (reenviar)
- Badge: neutral (aguardando) / success (vinculado)

### Estados da tela
- **Pai já vinculado:** Badge success + "Pai vinculado em DD/MM" + sem botão de reenvio
- **Link expirado (30 dias):** aviso + Button primary "Gerar novo link"
- **Loading:** skeleton do link

### Interações principais
- "Copiar" → copia link para clipboard + Toast "Copiado!"
- WhatsApp → abre whatsapp://send com texto pré-montado
- "Outras formas" → React Native Share nativo
- "Reenviar" → gera novo link (invalida o anterior)

### Dados necessários da API
- `GET /alunos/:id/convite` → `{ link, status: 'aguardando'|'aceito'|'expirado', enviado_em }`
- `POST /alunos/:id/convite/reenviar`

**Anti-AI checklist:**
- [x] Não é centered-card-on-gradient
- [x] 2 pesos (h1 + body)
- [x] Tokens semânticos (exceto #25D366 contextual = WhatsApp brand)
- [x] Status do convite é feedback concreto (não genérico)
- [x] Estado "já vinculado" não mostra botão de convite desnecessário

---

## P11 — Configurações — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  Configurações              │  ← text-h1
│─────────────────────────────│
│  [Avatar] João Silva        │  ← Avatar md + nome + matérias
│  Matemática, Física         │
│  [Editar perfil →]          │  ← tap → P12
│─────────────────────────────│
│  CONTA                      │  ← text-caption uppercase color-text-muted
│  ┌─────────────────────────┐│
│  │ Alterar senha         › ││
│  │ Notificações          › ││  ← toggle ou sub-tela
│  │ Modo escuro           ┃ ││  ← Toggle switch, atualiza tema imediato
│  └─────────────────────────┘│
│─────────────────────────────│
│  PLANO                      │
│  ┌─────────────────────────┐│
│  │ Plano Professor Free  › ││  ← Badge neutral "Free"
│  │ Ver planos premium    › ││
│  └─────────────────────────┘│
│─────────────────────────────│
│  SUPORTE                    │
│  ┌─────────────────────────┐│
│  │ Central de ajuda      › ││
│  │ Enviar feedback       › ││
│  └─────────────────────────┘│
│─────────────────────────────│
│  ┌─────────────────────────┐│
│  │ 🚪 Sair                 ││  ← Button destructive ghost (texto vermelho)
│  └─────────────────────────┘│
│  v1.0.0 • liveaula          │  ← text-caption color-text-disabled center
└─────────────────────────────┘
```

### Componentes usados
- Avatar: professor, size=md
- Toggle switch (modo escuro): atualiza AsyncStorage + Context imediato
- Button: ghost destructive ("Sair")
- Badge: neutral/success (plano)
- Rows navegáveis com "›"

### Estados da tela
- **Modo escuro ativo:** bg muda para color-surface-dark, todos tokens dark aplicados
- **Loading (logout):** spinner no botão Sair

### Interações principais
- "Editar perfil" → P12
- "Alterar senha" → tela inline com inputs atual/nova/confirmar
- Toggle dark mode → AsyncStorage 'tema' + ThemeContext update
- "Sair" → confirm dialog → limpa SecureStore → navega P3

### Dados necessários da API
- `GET /professor/plano` → `{ plano: 'free'|'premium', valido_ate }`
- `POST /auth/logout` (invalida refresh token no server)

**Anti-AI checklist:**
- [x] Lista settings com seções — não cards em grid
- [x] 2 pesos (sections uppercase caption + rows body)
- [x] Tokens semânticos
- [x] Sair é destructive ghost (não primary vermelho)
- [x] Versão do app no rodapé (informação útil, não ornamental)

---

## P12 — Editar Perfil Professor — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar   Editar perfil   │
│─────────────────────────────│
│                             │
│     [Avatar lg]             │  ← Avatar professor lg, tap = galeria/câmera
│    [📷 Trocar foto]         │  ← link ghost text-caption
│                             │
│  Nome completo              │  ← label text-caption
│  ┌─────────────────────────┐│
│  │ João da Silva           ││  ← Input text, pré-preenchido
│  └─────────────────────────┘│
│                             │
│  Bio (opcional)             │
│  ┌─────────────────────────┐│
│  │ Professor de Matemática ││  ← Input textarea 3 linhas
│  │ e Física há 8 anos...   ││
│  └─────────────────────────┘│
│                             │
│  Matérias que você ensina   │
│  ┌────┐ ┌────┐ ┌────┐ ┌+──┐│  ← chips com × para remover + chip "+"
│  │Mat.×│ │Fís.×│ │    │ │+  ││
│  └────┘ └────┘ └────┘ └───┘│
│                             │
│  ┌─────────────────────────┐│
│  │       Salvar            ││  ← Button primary (disabled se sem mudanças)
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Componentes usados
- Avatar: professor, size=lg, tap=upload
- Input: text (nome), textarea (bio)
- Badge chips: matérias com × para remover
- Button: primary (Salvar), ghost (Trocar foto)

### Estados da tela
- **Sem mudanças:** botão Salvar disabled
- **Loading (save):** botão loading
- **Erro:** Toast error se upload de foto falhar
- **Sucesso:** Toast success "Perfil atualizado" + volta para P11

### Interações principais
- Tap avatar → ActionSheet: Galeria / Câmera / Remover foto
- Chip "+" → modal FlatList de matérias disponíveis
- "Salvar" → `PATCH /professor/perfil`

### Dados necessários da API
- `GET /professor/perfil` → dados pré-preenchidos
- `PATCH /professor/perfil` `{ nome, bio, materias[], foto_url }`
- `POST /upload/foto` → multipart, retorna URL

**Anti-AI checklist:**
- [x] Form com labels — não floating label genérico
- [x] 2 pesos (labels caption + inputs body)
- [x] Tokens semânticos
- [x] Chips de matéria têm variação (com × = removível)
- [x] Salvar disabled sem mudanças (previne POST desnecessário)

---

## P13 — Cadastrar / Editar Aluno — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar   Novo aluno      │  ← ou "Editar aluno" se modo edição
│─────────────────────────────│
│                             │
│  Nome do aluno *            │  ← label + asterisco obrigatório
│  ┌─────────────────────────┐│
│  │ Ex: Ana Silva           ││
│  └─────────────────────────┘│
│                             │
│  Série / Ano escolar *      │
│  ┌─────────────────────────┐│
│  │ 8º Ano (Fundamental)  ▼ ││  ← select nativo
│  └─────────────────────────┘│
│                             │
│  Matéria(s) que você ensina *│
│  ┌────┐ ┌────┐ ┌────┐       │
│  │Mat.│ │Fís.│ │ +  │       │  ← chips (puxados do perfil do professor)
│  └────┘ └────┘ └────┘       │
│                             │
│  Contato do pai (opcional)  │
│  ┌─────────────────────────┐│
│  │ WhatsApp ou e-mail      ││  ← Input text, type=tel/email
│  └─────────────────────────┘│
│  Será usado para enviar o   │
│  convite automaticamente    │  ← text-caption color-text-muted
│                             │
│  ┌─────────────────────────┐│
│  │    Adicionar aluno      ││  ← Button primary
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Componentes usados
- Input: text (nome, contato), select (série)
- Badge chips: matérias
- Button: primary (Adicionar/Salvar)

### Estados da tela
- **Modo criação:** botão "Adicionar aluno", pré-preenche matérias do perfil do professor
- **Modo edição:** botão "Salvar alterações", dados pré-preenchidos, + botão destructive "Excluir aluno" no rodapé
- **Loading:** spinner no botão
- **Erro (nome duplicado):** Input erro "Você já tem um aluno com este nome"

### Interações principais
- Submit (criação) → `POST /alunos` → navega P7 do aluno criado + opcional envio de convite automático se contato informado
- Submit (edição) → `PATCH /alunos/:id`
- "Excluir aluno" (modo edição) → confirm modal → `DELETE /alunos/:id` → volta P4

### Dados necessários da API
- `POST /alunos` `{ nome, serie, materias[], contato_pai }`
- `PATCH /alunos/:id` `{ nome, serie, materias[], contato_pai }`
- `DELETE /alunos/:id`

**Anti-AI checklist:**
- [x] Form simples com campos visíveis — não wizard com steps
- [x] 2 pesos (labels caption + inputs body)
- [x] Tokens semânticos
- [x] Chips de matéria pré-selecionados (reduz fricção)
- [x] "Excluir" só aparece no modo edição (não confunde criação)

---

## P16 — Estado Vazio Dashboard — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  Olá, João!                 │  ← greeting (mesmo header do P4)
│─────────────────────────────│
│                             │
│                             │
│         📚                  │  ← ícone estilizado (NÃO chapéu/livro genérico)
│                             │    ícone: outline, color-primary, 64px
│  Seus alunos aparecem aqui  │  ← text-h2 center 600
│                             │
│  Adicione seu primeiro aluno│  ← text-body center color-text-muted
│  para começar a registrar   │
│  aulas e notificar os pais. │
│                             │
│  ┌─────────────────────────┐│
│  │   + Adicionar aluno     ││  ← Button primary
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │   Ver como funciona     ││  ← Button ghost (abre vídeo/tutorial)
│  └─────────────────────────┘│
│                             │
│─────────────────────────────│
│ [🏠] [📅] [    ●    ] [⚙️] │  ← FAB oculto (sem alunos = sem aula pra registrar)
└─────────────────────────────┘
```

### Componentes usados
- Ícone: SVG outline (não illustration genérica EdTech)
- Button: primary (Adicionar aluno), ghost (Tutorial)

### Estados da tela
- **Único:** dashboard sem alunos cadastrados
- FAB ausente (regra: FAB só aparece quando há ≥1 aluno)

### Interações principais
- "Adicionar aluno" → P13 (cadastrar novo aluno)
- "Ver como funciona" → modal com vídeo curto de 60s OU scrollable de 4 slides

### Dados necessários da API
- Nenhum adicional — estado determinado pelo retorno vazio de `GET /professor/dashboard`

**Anti-AI checklist:**
- [x] Não é centered-card-on-gradient (surface limpo)
- [x] 2 pesos (h2 + body)
- [x] Tokens semânticos (color-primary para ícone)
- [x] Dois CTAs distintos (primário + secundário)
- [x] Estado vazio com instrução concreta ("Adicione seu primeiro aluno para...")

---

## P17 — Esqueci Senha — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar                   │
│                             │
│  Redefinir senha            │  ← text-h1 600
│  Enviaremos um link para    │  ← text-body color-text-muted
│  seu e-mail cadastrado.     │
│                             │
│  ┌─────────────────────────┐│
│  │ Seu e-mail              ││  ← Input text, type=email, autofocus
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │   Enviar link de acesso ││  ← Button primary
│  └─────────────────────────┘│
│                             │
│  ─────────── ou ────────────│
│                             │
│  [Estado pós-envio]         │  ← aparece após submit bem-sucedido
│  ✓ Link enviado!            │
│  Verifique seu e-mail       │
│  (verifique spam também)    │  ← text-caption color-text-muted
│  Reenviar em 60s            │  ← countdown, depois "Reenviar" habilitado
└─────────────────────────────┘
```

### Componentes usados
- Input: text email
- Button: primary (Enviar), ghost (Reenviar com countdown)

### Estados da tela
- **Inicial:** campo + botão
- **Pós-envio:** Badge success inline + instrução + countdown reenvio
- **Erro e-mail não encontrado:** Input erro "E-mail não cadastrado — Criar conta?"
- **Loading:** botão loading

### Interações principais
- Submit → `POST /auth/reset-password` `{ email }`
- Countdown 60s → habilita "Reenviar" (mesmo POST)
- Link no e-mail → web deeplink para tela de nova senha (fora do escopo mobile aqui)

### Dados necessários da API
- `POST /auth/reset-password` `{ email }`

**Anti-AI checklist:**
- [x] Não é centered-card
- [x] 2 pesos (h1 + body)
- [x] Tokens semânticos
- [x] Countdown de reenvio (UX real, evita spam de clique)
- [x] Estado pós-envio com instrução "verifique spam" (real-world awareness)
