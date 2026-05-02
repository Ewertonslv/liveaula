# Specs — Pai/Mãe Web (MW1–MW7) + Admin Web (A1–A7)

> Passo 3B. Stack: Next.js 14 App Router.
> Pai Web: tokensPai (creme quente, baixa densidade). Admin: tokens professor-light (alta densidade, utilitário).

---

# PAI/MÃE — WEB

---

## MW1 — Tela de Convite — Pai/Mãe — Web

### Layout (ASCII wire)
```
┌──────────────────────────────────────────────────────────────┐
│  ◆ liveaula                                                  │  ← header mínimo
│──────────────────────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │                                                      │    │  ← max-w=640px, centered
│  │   João Silva te convidou para acompanhar             │    │
│  │   as aulas de Pedro Santos                          │    │  ← text-h1 600
│  │                                                      │    │
│  │   ┌────────────────────────────────────────────┐    │    │
│  │   │  gradient-card-morning  radius=20px         │    │    │
│  │   │  Pedro Santos                               │    │    │
│  │   │  Matemática • 8º Ano                        │    │    │
│  │   │  Prof. João Silva                           │    │    │
│  │   └────────────────────────────────────────────┘    │    │
│  │                                                      │    │
│  │   "Acompanhe o desenvolvimento do Pedro em           │    │
│  │   tempo real, com notificações a cada aula."         │    │  ← text-body line-height 1.7
│  │                                                      │    │
│  │   ┌────────────────────────────────────────────┐    │    │
│  │   │           Criar minha conta                │    │    │  ← Button primary full-width
│  │   └────────────────────────────────────────────┘    │    │
│  │   Já tenho conta — Entrar                            │    │  ← link ghost
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│   bg: tokensPai.colorSurface (#FFFBF5)                       │
└──────────────────────────────────────────────────────────────┘
```

### Componentes usados
- Card: aula-gradient (gradient-card-morning), radius=20
- Button: primary full-width
- Layout: coluna única centrada (max-w=640px) — pai web é mobile-first adaptado

### Estados da tela
- **Link expirado:** "Este convite expirou — peça ao professor um novo link"
- **Link já aceito:** "Você já está vinculado — Entrar na sua conta"

### Interações principais
- "Criar minha conta" → `/cadastro?convite_token=abc123`
- "Entrar" → `/login` com convite pendente em query param

### Dados necessários da API
- `GET /convites/:token` → `{ professor_nome, filho_nome, filho_serie, materia, status }`

**Anti-AI checklist:**
- [x] Coluna única centrada — não landing page com hero e seções (desnecessário)
- [x] 2 pesos (h1 + body)
- [x] Tokens semânticos (tokensPai)
- [x] Card gradient (não dado em texto puro)
- [x] Link expirado com instrução prática

---

## MW2 — Cadastro — Pai/Mãe — Web

### Layout (ASCII wire)
```
┌──────────────────────────────────────────────────────────────┐
│  ◆ liveaula                                                  │
│──────────────────────────────────────────────────────────────│
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Criar sua conta               ●──○──○               │    │  ← step indicator
│  │                                                      │    │
│  │  Nome completo                                       │    │
│  │  ┌────────────────────────────────────────────────┐  │    │
│  │  │ Maria Santos                                   │  │    │
│  │  └────────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  E-mail                                              │    │
│  │  ┌────────────────────────────────────────────────┐  │    │
│  │  │ maria@email.com                                │  │    │
│  │  └────────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  Senha                                               │    │
│  │  ┌────────────────────────────────────────────────┐  │    │
│  │  │ ••••••••                                  [👁] │  │    │
│  │  └────────────────────────────────────────────────┘  │    │
│  │                                                      │    │
│  │  ┌────────────────────────────────────────────────┐  │    │
│  │  │               Continuar →                      │  │    │
│  │  └────────────────────────────────────────────────┘  │    │
│  └──────────────────────────────────────────────────────┘    │
│   max-w=480px, centered, bg: tokensPai.colorSurface          │
└──────────────────────────────────────────────────────────────┘
```

> Step 2 (LGPD): idêntico ao M5 mobile, adaptado para web (scroll em div com altura fixa 400px).
> Step 3 (confirmação filho): card gradient + botão confirmar.

### Componentes usados
- Input: text, email, password
- Button: primary
- Step dots

### Estados, Interações, API
- Mesma lógica de M3 + M5, adaptada para web
- Submit final → `POST /auth/register` com convite_token

**Anti-AI checklist:**
- [x] Coluna centrada (não formulário full-width)
- [x] 2 pesos
- [x] Tokens semânticos
- [x] LGPD no step 2 (scroll obrigatório — mesma regra do mobile)
- [x] Conteúdo idêntico ao mobile (não inventa nova UX)

---

## MW3 — Login — Pai/Mãe — Web

### Layout (ASCII wire)
```
┌──────────────────────────────────────────────────────────────┐
│  ◆ liveaula                                                  │
│──────────────────────────────────────────────────────────────│
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Entrar na sua conta                                 │    │  ← max-w=400px centered
│  │  Para pais e mães                                    │    │
│  │                                                      │    │
│  │  E-mail / Senha / [Entrar]                           │    │
│  │  Esqueci minha senha                                 │    │
│  │  Recebeu um convite? Criar conta                     │    │
│  └──────────────────────────────────────────────────────┘    │
│   bg: tokensPai.colorSurface                                  │
└──────────────────────────────────────────────────────────────┘
```

> Layout idêntico ao M4 mobile, adaptado para web (max-w=400px, sem TabBar).

### Dados necessários da API
- `POST /auth/login` → Set-Cookie httpOnly → redirect MW4

**Anti-AI checklist:**
- [x] Surface creme (distingue do login do professor)
- [x] 2 pesos
- [x] Tokens semânticos
- [x] "Recebeu um convite?" visível
- [x] Redirect automático se logado

---

## MW4 — Feed de Aulas — Pai/Mãe — Web

### Layout (ASCII wire)
```
┌────────────────────────────────────────────────────────────────┐
│  ◆ liveaula          [Pedro Santos ▼]     [🔔2] [👤Maria]     │  ← TopBar mínimo
│────────────────────────────────────────────────────────────────│
│                                                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Hoje                                                  │    │  ← coluna única, max-w=680px
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  gradient-card-afternoon   radius=20px            │  │    │
│  │  │  Matemática  •  1h                                │  │    │
│  │  │  Pedro Santos  —  Prof. João Silva                │  │    │
│  │  │                                                   │  │    │
│  │  │  "Funções quadráticas e seus gráficos.            │  │    │
│  │  │  Pedro se saiu muito bem!"                        │  │    │
│  │  │                                                   │  │    │
│  │  │  😊 Ótimo  •  há 2 horas                         │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  │  Ontem                                                  │    │
│  │  ┌──────────────────────────────────────────────────┐  │    │
│  │  │  gradient-card-morning  ...                       │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
│   bg: tokensPai.colorSurface, sidebar: none (mobile-first web) │
└────────────────────────────────────────────────────────────────┘
```

### Componentes usados
- Card: aula-gradient (radius=20, gradient dinâmico)
- Dropdown: filho selecionado (se múltiplos)
- Badge: notificações não lidas no sino

### Estados da tela
- **Vazio:** idêntico M18 adaptado web
- **Paywall:** banner + overlay blur
- **Loading:** skeleton cards
- **Offline:** não aplicável (web sem cache agressivo)

### Interações principais
- Tap card → MW5 (detalhe)
- Dropdown filho → troca contexto (URL `/feed?filho_id=`)
- Pull to refresh → reload

### Dados necessários da API
- `GET /pai/feed?filho_id=&cursor=&limit=10`

**Anti-AI checklist:**
- [x] Coluna única centrada (não grid de cards 3×N)
- [x] 3 pesos (seções h2, matéria body-lg, metadata caption)
- [x] Tokens semânticos
- [x] Sem sidebar (pai web = mobile-first adaptado, não admin-style)
- [x] Cards gradient (não cards brancos)

---

## MW5 — Detalhe de Aula — Pai/Mãe — Web

### Layout (ASCII wire)
```
┌────────────────────────────────────────────────────────────────┐
│  ◆ liveaula                                          [👤Maria] │
│────────────────────────────────────────────────────────────────│
│  ← Feed                                                        │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  ┌──────────────────────────────────────────────────┐  │    │  ← max-w=680px
│  │  │  gradient-card-afternoon  radius=20  h=200px     │  │    │
│  │  │  Matemática  •  Segunda, 28/04/2026  •  1h       │  │    │
│  │  └──────────────────────────────────────────────────┘  │    │
│  │                                                         │    │
│  │  O que foi estudado                                     │    │
│  │  Funções quadráticas e seus gráficos...                 │    │  ← text-body line-height 1.7
│  │                                                         │    │
│  │  Como Pedro estava         😊 Estava bem animado        │    │
│  │                                                         │    │
│  │  Mensagem do professor                                  │    │
│  │  "Ótima aula! Pedro está evoluindo muito."              │    │
│  │                                                         │    │
│  │  [Avatar xs] João Silva, Professor de Matemática        │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

> Estrutura idêntica ao M7 mobile, em coluna centrada sem sidebar.

### Dados necessários da API
- `GET /aulas/:id/pai`

**Anti-AI checklist:**
- [x] Card gradient hero (não header de cor sólida)
- [x] Coluna centrada max-w=680px
- [x] 3 pesos
- [x] Emoji humor em destaque
- [x] Seções condicionais (sem observação = oculto)

---

## MW6 — Assinatura — Pai/Mãe — Web

### Layout (ASCII wire)
```
┌────────────────────────────────────────────────────────────────┐
│  ◆ liveaula                                          [👤Maria] │
│────────────────────────────────────────────────────────────────│
│                                                                │
│  ┌────────────────────────────────────────────────────────┐    │  ← max-w=560px
│  │  Minha assinatura                                      │    │
│  │  ──────────────────────────────────────────────────   │    │
│  │  Status:     ● Ativa                                  │    │  ← Badge success
│  │  Plano:      R$ 79/mês por filho                      │    │
│  │  Próx. cobr: 29 de maio de 2026                       │    │
│  │  Cartão:     •••• •••• •••• 4242                      │    │
│  │                                                        │    │
│  │  [Trocar cartão]      [Cancelar assinatura]           │    │  ← ghost + destructive ghost
│  └────────────────────────────────────────────────────────┘    │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Histórico de cobranças                                │    │
│  │  ─────────────────────────────────────────────────    │    │
│  │  29/04/26  R$79  ✓ Aprovado  [PDF]                    │    │
│  │  29/03/26  R$79  ✓ Aprovado  [PDF]                    │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────┘
```

### Componentes usados
- Badge: success (ativa) / warning (trial) / error (inadimplente)
- Button: ghost (Trocar cartão), destructive ghost (Cancelar)
- Tabela simples: histórico de cobranças

### Estados da tela
- **Inadimplente:** Badge error + Banner "Pagamento pendente" + Button primary "Regularizar"
- **Trial:** Badge warning + contador dias + Button primary "Assinar agora"
- **Cancelada:** Badge neutral + "Acesso até DD/MM"

### Interações principais
- "Trocar cartão" → modal com form de cartão
- "Cancelar assinatura" → confirm dialog + `DELETE /assinaturas/me`
- "PDF" → download fatura

### Dados necessários da API
- `GET /pai/assinatura` → `{ status, plano, proxima_cobranca, cartao_final, historico: [...] }`

**Anti-AI checklist:**
- [x] Próxima cobrança explícita (não escondida)
- [x] Histórico com download PDF
- [x] Cancelar é destructive ghost (não vermelho prominente)
- [x] Badge muda por status (não fixo verde)
- [x] Máximo de informação em espaço compacto

---

## MW7 — Configurações — Pai/Mãe — Web

### Layout (ASCII wire)
```
┌────────────────────────────────────────────────────────────────┐
│  ◆ liveaula                                          [👤Maria] │
│────────────────────────────────────────────────────────────────│
│                                                                │
│  ┌──────────────┬─────────────────────────────────────────┐    │
│  │  Perfil ●    │  Perfil                                 │    │  ← tabs horizontais
│  │  Notificações│  ──────────────────────────────────     │    │
│  │  Assinatura  │  [Avatar lg]  Maria Santos              │    │
│  │  Segurança   │  Editar foto  nome / telefone           │    │
│  │              │  [Salvar]                               │    │
│  └──────────────┴─────────────────────────────────────────┘    │
│   max-w=800px, bg: tokensPai.colorSurface                      │
└────────────────────────────────────────────────────────────────┘
```

> Estrutura idêntica ao PW7 (professor), mas com tokensPai e conteúdo de pai (filhos vinculados, assinatura em vez de plano professor).

### Dados necessários da API
- Mesmos de M13 + M14 adaptados web

**Anti-AI checklist:**
- [x] Surface creme (distingue de configurações do professor)
- [x] Tabs por URL
- [x] 2 pesos
- [x] Filhos vinculados em aba própria
- [x] Assinatura link para MW6

---

# ADMIN — WEB

> Tokens: professor-light. Alta densidade. Tom sóbrio, utilitário.
> Layout: sidebar 240px + content. Sem gradientes aurora. Sem gamification.

---

## A1 — Login Admin — Admin — Web

### Layout (ASCII wire)
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │  ◆ liveaula admin                                  │      │  ← max-w=400px centered
│  │                                                    │      │
│  │  Acesso restrito                                   │      │  ← text-h1
│  │                                                    │      │
│  │  E-mail admin                                      │      │
│  │  ┌──────────────────────────────────────────────┐  │      │
│  │  │ admin@liveaula.com.br                        │  │      │
│  │  └──────────────────────────────────────────────┘  │      │
│  │                                                    │      │
│  │  Senha                                             │      │
│  │  ┌──────────────────────────────────────────────┐  │      │
│  │  │ ••••••••                                [👁] │  │      │
│  │  └──────────────────────────────────────────────┘  │      │
│  │                                                    │      │
│  │  ┌──────────────────────────────────────────────┐  │      │
│  │  │                  Entrar                      │  │      │
│  │  └──────────────────────────────────────────────┘  │      │
│  └────────────────────────────────────────────────────┘      │
│   bg: color-surface (não creme — admin é neutro)             │
└──────────────────────────────────────────────────────────────┘
```

### Componentes e dados
- Input email + password, Button primary
- `POST /admin/auth/login` → Set-Cookie httpOnly session → redirect A2
- Rate limiting: 5 tentativas → bloqueio 15min

**Anti-AI checklist:**
- [x] Surface cinza (não creme — admin ≠ pai)
- [x] "Acesso restrito" (não "Bem-vindo")
- [x] 2 pesos
- [x] Sem "Criar conta" (admin não tem auto-cadastro)
- [x] Rate limiting documentado

---

## A2 — Dashboard Métricas — Admin — Web

### Layout (ASCII wire)
```
┌──────────────┬─────────────────────────────────────────────────┐
│  ◆ admin     │  Dashboard                     29 abr 2026      │
│              │─────────────────────────────────────────────────│
│  Dashboard ● │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐ │
│  Professores │  │  142   │ │  318   │ │  R$25k │ │  8.3%    │ │
│  Pais        │  │Professores│ Pais  │ │  MRR   │ │  Churn   │ │
│  Assinaturas │  │  +12/mês│ │ +28/mês│ │+R$3.2k │ │  (meta<5%)│ │
│  Config.     │  └────────┘ └────────┘ └────────┘ └──────────┘ │
│              │─────────────────────────────────────────────────│
│              │  Atividade recente                   [Export]   │
│              │  ┌─────────────────────────────────────────────┐│
│              │  │ Data    Evento                    Ator       ││
│              │  ├─────────────────────────────────────────────┤│
│              │  │ 28/04   Novo professor cadastrado  João S.   ││
│              │  │ 28/04   Assinatura ativada         Maria S.  ││
│              │  │ 27/04   Churn: cancelou assinatura Pedro R.  ││
│              │  └─────────────────────────────────────────────┘│
└──────────────┴─────────────────────────────────────────────────┘
```

### Componentes usados
- Stats cards: 4 métricas principais (Card elevated)
- Badge: warning no churn se > 5%
- Tabela: atividade recente com tipos de evento coloridos (success/error/neutral)

### Estados da tela
- **Loading:** skeleton stats + skeleton rows
- **Churn > 5%:** badge error (alerta visual)

### Interações principais
- Click row atividade → detalhe do ator (professor → A4, pai → detalhe pai)
- "Export" → CSV com dados do período selecionado

### Dados necessários da API
- `GET /admin/dashboard` → `{ professores: { total, novos_mes }, pais: { total, novos_mes }, mrr, churn_pct, atividade_recente: [...] }`

**Anti-AI checklist:**
- [x] 4 métricas chave — não 12 cards
- [x] Churn com alerta visual (não dado neutro)
- [x] 3 pesos (metric display, event body, caption metadata)
- [x] Tokens semânticos
- [x] Atividade recente com tipos distintos (novo/cancelou/etc)

---

## A3 — Lista Professores — Admin — Web

### Layout (ASCII wire)
```
┌──────────────┬─────────────────────────────────────────────────┐
│  [sidebar]   │  Professores                  [+ Criar professor]│
│              │─────────────────────────────────────────────────│
│              │  [🔍 Buscar...] [Status ▼] [Plano ▼]            │
│              │                                                 │
│              │  ┌─────────────────────────────────────────────┐│
│              │  │ ☐  Nome         E-mail     Alunos  Plano  Ativo││
│              │  ├─────────────────────────────────────────────┤│
│              │  │ ☐  João Silva   jo@em.com  4      Free  ● Sim││
│              │  │ ☐  Ana Lima     an@em.com  8      Pro   ● Sim││
│              │  │ ☐  Bruno R.     br@em.com  1      Free  ○ Não││
│              │  └─────────────────────────────────────────────┘│
│              │  3 de 142 professores  ←  1 ... 12 →            │
└──────────────┴─────────────────────────────────────────────────┘
```

### Componentes usados
- Tabela com checkbox + paginação server-side
- Badge: plano (neutral Free / success Pro)
- Badge: ativo (success ●) / inativo (neutral ○)
- Input: search + selects filtro

### Estados da tela
- **Loading:** skeleton rows
- **Sem resultado:** "Nenhum professor encontrado" + "Limpar filtros"

### Interações principais
- Click row → A4 (Detalhe professor)
- "Criar professor" → modal form rápido (admin cria conta para professor)
- Checkbox + ação → desativar em lote → A7 (modal)

### Dados necessários da API
- `GET /admin/professores?busca=&status=&plano=&page=1&limit=50`

**Anti-AI checklist:**
- [x] Tabela — não grid de cards
- [x] Filtros combinables
- [x] Badge ativo/inativo (não só texto)
- [x] Paginação server-side (142 professores não cabe no client)
- [x] Seleção em lote para ações

---

## A4 — Detalhe Professor — Admin — Web

### Layout (ASCII wire)
```
┌──────────────┬─────────────────────────────────────────────────┐
│  [sidebar]   │  ← Professores  /  João Silva         [Ações ▼] │
│              │─────────────────────────────────────────────────│
│              │  ┌──────────────────┐  ┌──────────────────────┐ │
│              │  │ [Avatar]         │  │  Atividade           │ │
│              │  │ João Silva       │  │  Aulas este mês: 42  │ │
│              │  │ jo@email.com     │  │  Alunos ativos: 4    │ │
│              │  │ Cadastro: 01/01  │  │  Última aula: 28/04  │ │
│              │  │ Plano: Free      │  │  Pais vinculados: 3  │ │
│              │  │ ● Ativo          │  └──────────────────────┘ │
│              │  └──────────────────┘                           │
│              │─────────────────────────────────────────────────│
│              │  Alunos vinculados                              │
│              │  ┌─────────────────────────────────────────────┐│
│              │  │ Nome         Série  Pai vinculado  Aulas/mês ││
│              │  ├─────────────────────────────────────────────┤│
│              │  │ Ana Silva    8º     ● Sim           12       ││
│              │  │ Bruno C.     6º     ⚠ Pendente      8        ││
│              │  └─────────────────────────────────────────────┘│
└──────────────┴─────────────────────────────────────────────────┘
```

### Componentes usados
- Avatar: professor, size=lg
- Stats: 2 colunas (info + atividade)
- Tabela: alunos vinculados com status pai
- Dropdown [Ações]: Desativar conta / Mudar plano / Enviar e-mail

### Estados da tela
- **Conta inativa:** Badge error + Banner "Conta desativada em DD/MM por: [motivo]"
- **Loading:** skeleton 2 colunas

### Interações principais
- "Desativar conta" → A7 (modal confirm)
- "Mudar plano" → modal select plano
- Click aluno → informações do aluno (read-only)

### Dados necessários da API
- `GET /admin/professores/:id` → `{ perfil, atividade, alunos: [...] }`

**Anti-AI checklist:**
- [x] Layout 2 colunas (info + atividade lado a lado)
- [x] Tabela de alunos com status pai
- [x] Dropdown ações (não botões individuais poluindo o layout)
- [x] Conta inativa com motivo explícito
- [x] 3 pesos

---

## A5 — Lista Pais — Admin — Web

### Layout (ASCII wire)
```
┌──────────────┬─────────────────────────────────────────────────┐
│  [sidebar]   │  Pais / Responsáveis          [Export]          │
│              │─────────────────────────────────────────────────│
│              │  [🔍 Buscar...] [Status assinatura ▼] [Filho ▼] │
│              │                                                 │
│              │  ┌─────────────────────────────────────────────┐│
│              │  │ Nome       E-mail    Filho    Assinatura  Ativo││
│              │  ├─────────────────────────────────────────────┤│
│              │  │ Maria S.   ma@em.com Pedro S. ● Ativa   ● Sim││
│              │  │ Carlos R.  ca@em.com Lucas R. ⚠ Trial   ● Sim││
│              │  │ Ana P.     an@em.com Sofia P. ○ Cancelou ● Sim││
│              │  └─────────────────────────────────────────────┘│
│              │  3 de 318 pais  ←  1 ... 12 →                   │
└──────────────┴─────────────────────────────────────────────────┘
```

### Componentes usados
- Tabela com filtros (status assinatura + filho)
- Badge: success (ativa) / warning (trial) / neutral (cancelou) / error (inadimplente)

### Interações principais
- Click row → modal side panel com detalhe do pai (não nova página)
- "Export" → CSV para análise financeira

### Dados necessários da API
- `GET /admin/pais?busca=&assinatura_status=&filho_id=&page=1`

**Anti-AI checklist:**
- [x] Tabela com status assinatura em badge (análise rápida)
- [x] Filtro por filho (caso pai com múltiplos filhos)
- [x] Export para análise financeira
- [x] 2 pesos
- [x] Side panel (não nova página — mantém contexto da lista)

---

## A6 — Lista Assinaturas — Admin — Web

### Layout (ASCII wire)
```
┌──────────────┬─────────────────────────────────────────────────┐
│  [sidebar]   │  Assinaturas                   MRR: R$25.123    │
│              │─────────────────────────────────────────────────│
│              │  [🔍 Buscar pai...] [Status ▼] [Próx. cobrança ▼]│
│              │                                                 │
│              │  ┌─────────────────────────────────────────────┐│
│              │  │ Pai        Filho    Próx. cobr.  Status  Valor││
│              │  ├─────────────────────────────────────────────┤│
│              │  │ Maria S.   Pedro S. 29/05/26     ● Ativa  R$79││
│              │  │ Carlos R.  Lucas R. Em trial     ⚠ Trial  R$0 ││
│              │  │ João P.    Sofia P. —             ✗ Cancel  —  ││
│              │  │ Ana M.     Duda M.  29/05/26     ⚠ Inad.  R$79││
│              │  └─────────────────────────────────────────────┘│
│              │  MRR total: R$25.123  Inadimplentes: 3  Churn: 2 │
│              │  ←  1 ... 5 →                                   │
└──────────────┴─────────────────────────────────────────────────┘
```

### Componentes usados
- Tabela com badges por status
- Stats no rodapé (MRR + inadimplentes + churn)
- Badge: error (inadimplente)

### Estados da tela
- **Inadimplente em destaque:** linha com bg color-warning-muted (se existisse — usar border-left color-warning como alternativa)

### Interações principais
- Click row → detalhe da assinatura (histórico de cobranças, opção de reembolso manual)
- Filtro "Próx. cobrança" → alerta para cobranças nos próximos 3 dias
- Ação manual: "Registrar pagamento manual" (para PIX/boleto futuro)

### Dados necessários da API
- `GET /admin/assinaturas?status=&proxima_cobranca_ate=&page=1` → `{ assinaturas: [...], mrr, inadimplentes, churn }`

**Anti-AI checklist:**
- [x] MRR no header (primeira coisa que o admin vê)
- [x] Inadimplentes com badge error destacado
- [x] Estatísticas no rodapé da tabela
- [x] Filtro próxima cobrança (ação antecipada)
- [x] 2 pesos

---

## A7 — Ativar / Desativar Conta — Admin — Web

### Layout (ASCII wire)
```
┌──────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░ overlay sobre A3 ou A4 ░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │  Desativar conta de João Silva            [×]      │      │  ← Modal confirm
│  │────────────────────────────────────────────────────│      │
│  │                                                    │      │
│  │  Esta ação irá:                                    │      │
│  │  • Bloquear o login do professor                   │      │
│  │  • Pausar notificações aos pais                    │      │
│  │  • Dados preservados (reversível)                  │      │
│  │                                                    │      │
│  │  Motivo *                                          │      │
│  │  ┌──────────────────────────────────────────────┐  │      │
│  │  │ Selecionar motivo...                       ▼ │  │      │  ← select obrigatório
│  │  └──────────────────────────────────────────────┘  │      │
│  │  Motivos: Solicitação do usuário / Spam /           │      │
│  │           Inadimplência / Violação TOS / Outro      │      │
│  │                                                    │      │
│  │  ┌──────────────────┐  ┌──────────────────────┐   │      │
│  │  │    Cancelar      │  │  Confirmar desativar  │   │      │  ← Button destructive
│  │  └──────────────────┘  └──────────────────────┘   │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

### Componentes usados
- Modal: overlay + Dialog
- Select: motivo (obrigatório)
- Button: ghost (Cancelar), destructive (Confirmar)

### Estados da tela
- **Motivo não selecionado:** botão Confirmar disabled
- **Loading:** botão loading
- **Conta já inativa (reativação):** mesmo modal mas "Reativar conta de João Silva" + botão primary (não destructive)

### Interações principais
- Cancelar → fecha modal, sem ação
- Confirmar → `PATCH /admin/usuarios/:id/status` `{ ativo: false, motivo }` → Toast "Conta desativada" + atualiza tabela

### Dados necessários da API
- `PATCH /admin/usuarios/:id/status` `{ ativo: boolean, motivo }`

**Anti-AI checklist:**
- [x] Modal de confirmação (não ação direta em botão)
- [x] Lista de consequências explícita ("dados preservados — reversível")
- [x] Motivo obrigatório (auditoria)
- [x] Botão Confirmar disabled sem motivo
- [x] Mesmo modal serve para desativar e reativar (variante por contexto)
