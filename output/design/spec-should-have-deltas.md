# Specs — Telas Should-have (delta v1.2)

> Sprint de DELTA do `liveaula-design`. Herda DESIGN.md v1.1 (29/04/2026) sem alterações de tokens. Cobre 5 telas marcadas Should-have no inventário original que ficaram fora do v1.
> Data: 2026-04-30. Telas: P14, P15, M15, M16, M17. Superfície: mobile (375px).

---

## Decisões de escopo (registrar antes das specs)

| Tela | Decisão | Justificativa |
|---|---|---|
| **P14 Agenda** | Vista mensal **histórica** (não agendamento futuro). Dot indicator nos dias com aulas + tap → lista do dia. | Produto é "registrar aula dada", não "agendar". Calendário aqui = visualização densa de histórico para o professor verificar consistência. |
| **P15 Financeiro** | Lista de pais pagantes vinculados (não ledger contábil). Status por aluno + contador "X/5 para FREE". | Conexão direta com a regra T26 (5 pais ACTIVE → professor FREE). Pagamento real é da Asaas, professor só consulta. |
| **M15 Histórico filtrado** | Filtros aplicados ao próprio feed M6 — não é tela separada. Acionado por ícone de filtro no header de M6. | Evita duplicação de feed. Pai já mora no Feed; filtro é refinamento, não destino. |
| **M16 Gráfico de progresso** | Barras horizontais por matéria com **frequência das últimas 4 semanas** (#aulas), não score/nota. SVG inline, sem lib. | Não há nota no modelo (só `emotion`). Frequência é o sinal honesto de acompanhamento. AP-11/AP-12 + restrição "sem celebração infantil" preservados. |
| **M17 Múltiplos filhos** | Switch aparece **somente se** `studentParents.length ≥ 2`. Persiste seleção em SecureStore. Filtra Feed + Perfil. | Vínculos via convite são por filho, não por pai. Maioria dos pais terá 1 filho — switch escondido evita ruído. |

---

## P14 — Agenda (Histórico Calendário) — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar    Agenda    [⚙]  │  ← header padrão
│                             │
│  ◀  Abril 2026          ▶   │  ← month selector (chevrons + label)
│                             │
│  Seg Ter Qua Qui Sex Sáb Dom│  ← weekday labels text-caption color-text-muted
│ ┌──┬──┬──┬──┬──┬──┬──┐     │
│ │  │ 1│ 2│ 3│ 4│ 5│ 6│     │
│ │  │  │ •│  │ •│  │  │     │  ← dot color-primary se há aula(s)
│ ├──┼──┼──┼──┼──┼──┼──┤     │
│ │ 7│ 8│ 9│10│11│12│13│     │
│ │  │ •│ •│ •│ •│  │  │     │
│ ├──┼──┼──┼──┼──┼──┼──┤     │
│ │14│15│16│17│18│19│20│     │
│ │ •│  │ •│ •│  │  │  │     │
│ ├──┼──┼──┼──┼──┼──┼──┤     │
│ │21│22│23│24│25│26│27│     │
│ │ •│ •│ •│  │ ●│ •│  │     │  ← ● dia selecionado (filled circle color-primary)
│ ├──┼──┼──┼──┼──┼──┼──┤     │
│ │28│29│30│  │  │  │  │     │
│ │ •│  │  │  │  │  │  │     │
│ └──┴──┴──┴──┴──┴──┴──┘     │
│                             │
│  Aulas em 25 de abril       │  ← text-h2 600
│  ┌─────────────────────────┐│
│  │ 14:00 · Matemática      ││  ← LessonRow compacta
│  │ Pedro Santos · 1h       ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 16:30 · Português       ││
│  │ Ana Lima · 45min        ││
│  └─────────────────────────┘│
│─────────────────────────────│
│ [🏠] [👥] [📅] [⚙]         │  ← TabBar (📅 active)
│                       (FAB) │  ← FAB Registrar (mantém em todas as tabs)
└─────────────────────────────┘
   bg: color-surface (prof-light/dark)
```

### Componentes usados
- `CalendarMonthGrid` (**novo**, ver mobile-component-specs)
- `LessonRow` compact: usa `Card` existente com altura reduzida (h=64)
- TabBar (componente existente — adicionar slot `agenda` no array NAV)
- FAB (mantém — flutua sobre TabBar, bottom=88px)

### Estados da tela
- **Default:** mês corrente, dia de hoje pré-selecionado se houver aulas; senão primeiro dia do mês com aulas
- **Vazio (mês sem aulas):** grid renderiza sem dots; mensagem inferior "Nenhuma aula neste mês. Toque no FAB para registrar."
- **Loading:** skeleton do grid (28-31 quadrados shimmer)
- **Erro de fetch:** banner color-error-muted topo "Não foi possível carregar. [Tentar de novo]"
- **Offline:** carrega cache local de aulas (expo-sqlite), badge "Offline" no header

### Interações principais
- Tap dia com dot → atualiza lista inferior + dia vira `●` filled
- Tap dia sem aula → lista mostra "Nenhuma aula em {data}. [Registrar agora]"
- Swipe left/right no grid OU chevrons → muda mês (spring.smooth, 250ms)
- Tap LessonRow → P9 (Detalhe da aula)
- Long-press dia → menu contextual (futuro v1.3, não implementar)

### Dados necessários da API
- `GET /lessons?from=2026-04-01&to=2026-04-30` — extender o `listLessonsQuerySchema` existente para aceitar `from`/`to` ISO date
  - Resposta: `{ data: [...], meta: { ... } }`
  - Cliente agrega por dia local (timezone do device) para gerar dots

> **Backend dev nota:** o handler de `GET /lessons` já existe ([apps/api/src/routes/lessons.routes.ts](apps/api/src/routes/lessons.routes.ts)). Adicionar suporte a `from`/`to` no `listLessonsQuerySchema` em packages/shared.

### Anti-AI checklist
- [x] Não é centered-card (grid utilitário)
- [x] 3 pesos: weekday labels (caption 400) + day numbers (body 500) + month label (h2 600)
- [x] Tokens semânticos (color-primary para dots, color-text-muted para weekdays)
- [x] Estado vazio com ação (não "nenhum dado")
- [x] Sem ícone de "calendário com livro" — só grid limpo

---

## P15 — Financeiro — Professor — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar  Financeiro       │
│                             │
│  ┌─────────────────────────┐│
│  │ Plano: PAGO  R$ 49/mês  ││  ← Card status, color-warning-muted bg
│  │                         ││    se PAID
│  │ 3 de 5 pais pagantes    ││
│  │ ▓▓▓▓▓▓░░░░░ 60%         ││  ← ProgressBar
│  │                         ││
│  │ Faltam 2 pais ativos    ││  ← text-caption
│  │ para você ficar grátis. ││
│  └─────────────────────────┘│
│                             │
│  Pais pagantes                  ← text-h2 600
│  ┌─────────────────────────┐│
│  │ 👤 Maria Lima           ││  ← Avatar + nome
│  │    filho: Pedro Santos  ││
│  │    [ATIVO]   R$ 79/mês  ││  ← Badge status + valor
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 👤 João Costa           ││
│  │    filho: Ana Lima      ││
│  │    [ATIVO]   R$ 79/mês  ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ 👤 Carla Mendes         ││
│  │    filho: Pedro Santos  ││
│  │    [TRIAL] expira em 3d ││  ← warning
│  └─────────────────────────┘│
│                             │
│  Pendentes                  │  ← text-h2 (se houver)
│  ┌─────────────────────────┐│
│  │ 👤 Ricardo Oliveira     ││
│  │    filho: Ana Lima      ││
│  │    [INADIMPLENTE]       ││  ← color-error
│  │    [Reenviar lembrete]  ││  ← Button ghost
│  └─────────────────────────┘│
│─────────────────────────────│
│ [🏠] [👥] [📅] [⚙]          │
│                       (FAB) │
└─────────────────────────────┘
```

### Componentes usados
- Card (existente)
- Avatar (existente)
- Badge (existente — variantes: success / warning / error)
- ProgressBar (existente — usar variant determinada com value 0–1)
- Button ghost (existente)

> Sem componentes novos. Tudo é composição.

### Estados da tela
- **Default:** dados carregados ordenados por status (ATIVO → TRIAL → PAST_DUE → CANCELLED)
- **Vazio (0 pais vinculados):** banner color-info-muted "Você ainda não convidou pais. [Convidar primeiro pai]"
- **Loading:** skeleton 3 cards
- **Erro:** banner color-error-muted "Não foi possível carregar. [Tentar de novo]"
- **Plano FREE (5+ ATIVOS):** Card status muda para `color-success-muted` com texto "Você está no plano grátis. 5 pais ativos."

### Interações principais
- Tap row pai → modal com detalhes (filho, data início assinatura, próxima cobrança Asaas)
- Tap "Reenviar lembrete" (PAST_DUE) → trigger backend que marca lembrete (não implementar email real nesta v1)
- Pull to refresh → recarrega
- Sem ações destrutivas (não permitir cancelar pai daqui — Asaas faz isso)

### Dados necessários da API
- **Endpoint novo necessário:** `GET /me/billing/parents`
  - Resposta:
    ```json
    {
      "professorPlanStatus": "PAID",
      "paidParentsCount": 3,
      "paidParentsTarget": 5,
      "parents": [
        {
          "parentId": "...",
          "parentName": "Maria Lima",
          "parentAvatarUrl": null,
          "studentName": "Pedro Santos",
          "subscriptionStatus": "ACTIVE",
          "trialEndsAt": null,
          "amountCents": 7900
        }
      ]
    }
    ```
- Reutiliza dados que já existem em `Subscription` + `StudentParent` + `User`. Endpoint puramente de leitura/agregação.

> **Backend dev nota:** criar [apps/api/src/routes/me.routes.ts](apps/api/src/routes/me.routes.ts) handler `GET /me/billing/parents` agregando: pais (Subscription.parent) cujos filhos (Student) têm `professorId = currentUser.id`. Reutilizar lógica de billing.service.

### Anti-AI checklist
- [x] Não é dashboard genérico com 6 cards de número (foco em uma métrica: progresso para FREE)
- [x] 3 pesos (h2 + body + caption)
- [x] Tokens semânticos (success/warning/error coerentes com status real)
- [x] Empty state com ação concreta ("Convidar primeiro pai")
- [x] Sem barra circular gigante (ProgressBar linear é mais honesta)

---

## M15 — Histórico Filtrado — Pai/Mãe — Mobile

### Layout (ASCII wire) — Header com filtros aplicados
```
┌─────────────────────────────┐
│  ← Voltar  Filtros (2)  [×] │  ← contador filtros + clear all
│─────────────────────────────│
│                             │
│  Período                    │  ← text-caption color-text-muted
│  ┌────┐ ┌────┐ ┌────┐ ┌───┐│
│  │7 dias││30 d││90 d││Custom│  ← Chip pickable, single-select
│  └────┘ └─●──┘ └────┘ └───┘│  ← ●=ativo
│                             │
│  Matéria                    │
│  ┌────┐ ┌────┐ ┌────┐ ┌───┐│
│  │Mat ●│ │Por ●│ │Fís │ │... │  ← Chip multi-select, ●=ativo
│  └────┘ └────┘ └────┘ └───┘│
│                             │
│  ┌─────────────────────────┐│
│  │   Aplicar (12 aulas)    ││  ← Button primary, contador dinâmico
│  └─────────────────────────┘│
│                             │
└─────────────────────────────┘
```

### Layout (ASCII wire) — Feed com filtros aplicados (volta ao M6)
```
┌─────────────────────────────┐
│  Feed              [⚲ 2]    │  ← ícone filter + badge count
│─────────────────────────────│
│                             │
│  Mostrando 12 aulas         │  ← text-caption + chip "× Limpar filtros"
│  Últimos 30 dias · Mat, Por │
│  ┌─────────────────────────┐│
│  │ ... cards do M6 ...     ││  ← reutiliza Card aurora gradient
│  └─────────────────────────┘│
│  ...                        │
└─────────────────────────────┘
```

### Componentes usados
- `FilterBar` (**novo**, ver mobile-component-specs) — encapsula chips de período + matéria
- `FilterChip` — variante de Chip existente com prop `active` (já existe)
- Card aurora-gradient (existente)
- BottomSheet (existente) — abre em swipe-up no header de M6

### Estados da tela
- **Default (sem filtros):** Feed M6 normal, ícone filter sem badge
- **Filtros ativos:** badge com count, banner topo "Mostrando X aulas · {filtros}"
- **Resultado vazio:** "Nenhuma aula encontrada com esses filtros. [Limpar filtros]"
- **Loading filtragem:** skeleton 3 cards no feed

### Interações principais
- Tap ícone filter no header M6 → abre BottomSheet com filtros (snapPoints: ['65%'])
- Selecionar período (single) + matérias (multi) → contador "Aplicar (N)" atualiza em real-time
- Tap "Aplicar" → fecha sheet, refetch feed, atualiza banner topo
- Tap × no banner topo → limpa todos filtros, volta ao M6 padrão
- Custom período → date picker nativo (iOS/Android)
- Persistência: filtros NÃO persistem entre sessions (zera ao matar app); persistem em navegação dentro do app

### Dados necessários da API
- Reutiliza `GET /lessons/student/:studentId` (já existe)
- Adicionar query params: `subjectIds[]`, `from`, `to`
- **Backend dev nota:** estender `listLessonsQuerySchema` em packages/shared para aceitar array de subjectIds e date range

### Anti-AI checklist
- [x] Não duplica feed (mesmo M6 com banner)
- [x] Filtros como Chip (não dropdown genérico)
- [x] Empty state com ação ("Limpar filtros")
- [x] Contador "Aplicar (N)" mostra valor antes de confirmar
- [x] Custom date usa picker nativo, não componente custom

---

## M16 — Gráfico de Progresso — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar  Progresso        │
│                             │
│  Pedro Santos · 7º EF       │  ← text-h2 600 + caption (header se 1 filho)
│  ┌─────────────────────────┐│
│  │ Filho: Pedro Santos  ▼  ││  ← se >1 filhos, switcher inline (M17)
│  └─────────────────────────┘│
│                             │
│  Aulas nas últimas 4 semanas│  ← text-h2 600
│                             │
│  Matemática                 │  ← text-body-lg 500
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░  8 aulas   │  ← bar SVG, color-primary
│                             │
│  Português                  │
│  ▓▓▓▓▓▓░░░░░░░░░  4 aulas   │
│                             │
│  Física                     │
│  ▓▓▓░░░░░░░░░░░░  2 aulas   │
│                             │
│  ─────────────────────      │  ← divider
│                             │
│  Total: 14 aulas            │  ← text-body-lg 500
│  Última aula: há 2 dias     │  ← text-caption color-text-muted
│                             │
│  Como o Pedro tem se sentido│  ← text-h2 600
│  ┌─────┬─────┬─────┐        │
│  │ 😊  │ 😐  │ 😕  │        │  ← grid 3 colunas
│  │  9  │  4  │  1  │        │
│  │ ótimo│regular│ difícil│  │
│  └─────┴─────┴─────┘        │
│                             │
│─────────────────────────────│
│ [🏠] [👦] [🔔] [👤]         │  ← TabBar (👦 active)
└─────────────────────────────┘
   bg: tokensPai.colorSurface (#FFFBF5)
```

### Componentes usados
- `MiniBarChart` (**novo**, ver mobile-component-specs) — barra horizontal Views (sem lib)
- Card (existente) para grid de emotion summary
- Avatar inline (se >1 filhos)

### Estados da tela
- **Default:** dados das últimas 4 semanas
- **Vazio (0 aulas):** ilustração simples + "Nenhuma aula registrada nas últimas 4 semanas. As aulas aparecerão aqui após o professor registrar."
- **Loading:** skeleton com 3 barras shimmer
- **Sem filho selecionado (caso erro):** redireciona para Feed M6
- **Pai 1 filho:** sem switcher; header só com nome do filho
- **Pai ≥2 filhos:** switcher M17 inline

### Interações principais
- Tap matéria (linha de barra) → M15 com filtro `subjectId={id}` aplicado, período 4 semanas
- Tap emotion card → M15 com filtro `emotion={GREAT|GOOD|...}` (não implementar query param ainda — feature futura)
- Switcher de filho → recarrega dados da tela
- Pull to refresh → recarrega

### Dados necessários da API
- **Endpoint novo:** `GET /lessons/student/:studentId/stats?weeks=4`
  - Resposta:
    ```json
    {
      "totalLessons": 14,
      "lastLessonAt": "2026-04-28T14:00:00Z",
      "bySubject": [
        { "subjectId": "...", "subjectName": "Matemática", "count": 8 },
        { "subjectId": "...", "subjectName": "Português", "count": 4 }
      ],
      "byEmotion": {
        "GREAT": 4,
        "GOOD": 5,
        "NEUTRAL": 4,
        "DIFFICULT": 1,
        "CHALLENGING": 0
      }
    }
    ```
  - Mesmo guard de LGPD/StudentParent que `/lessons/student/:id`

### Anti-AI checklist
- [x] Não usa lib pesada (chart.js, victory-native) — Views/SVG inline
- [x] Sem celebration ou confete (AP-11/restrição explícita)
- [x] Sem score/nota inventada (apenas frequência real)
- [x] Tokens semânticos (color-primary para barra, não cor arbitrária)
- [x] 3 pesos (h2 + body-lg + caption)
- [x] Empty state honesto (sem mensagem motivacional artificial)

---

## M17 — Múltiplos Filhos (Switch) — Pai/Mãe — Mobile

### Layout (ASCII wire) — Header global com switcher (aparece em M6, M8, M9, M16)
```
┌─────────────────────────────┐
│  Olá, Maria       [🔔3]     │  ← text-body cumprimento
│                             │
│  ┌────────┐ ┌────────┐ ┌──┐│  ← horizontal scroll
│  │ Pedro  │ │  Ana   │ │+ ││  ← Card chip-like, h=72
│  │ ●ativo │ │        │ │  ││    ●=filho selecionado, color-primary border
│  │ 7º EF  │ │ 5º EF  │ │  ││
│  └────────┘ └────────┘ └──┘│
│─────────────────────────────│
│  Feed do Pedro              │  ← text-h2 contextual ao filho selecionado
│  ...                        │
└─────────────────────────────┘
```

### Layout (ASCII wire) — Card de filho expandido
```
┌────────────────────┐
│ ┌──┐  Pedro Santos │
│ │👤│  ● ativo      │  ← color-primary text + dot
│ └──┘  7º EF        │
│      Matemática    │  ← matéria principal (mais aulas no período)
│      8 aulas (mês) │  ← text-caption
└────────────────────┘
   border: 2px color-primary (selecionado)
   border: 1px color-border (não selecionado)
```

### Layout (ASCII wire) — Tela "Adicionar filho" (quando tap no `+`)
```
┌─────────────────────────────┐
│  ← Voltar                   │
│                             │
│  Adicionar outro filho      │  ← text-h1 600
│                             │
│  Para adicionar outro filho │  ← text-body 400 line-height 1.7
│  você precisa receber um    │
│  novo convite do professor  │
│  dele(a).                   │
│                             │
│  Já tenho um link de convite│
│  ┌─────────────────────────┐│
│  │ Cole aqui o link        ││  ← Input texto
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │     Validar link        ││  ← Button primary
│  └─────────────────────────┘│
│                             │
└─────────────────────────────┘
```

### Componentes usados
- `ChildSwitcher` (**novo**, ver mobile-component-specs) — horizontal scroll de cards
- Card (existente) com variant `compact` (h=72)
- Input + Button (existentes)

### Estados da tela
- **Pai com 1 filho:** ChildSwitcher NÃO renderiza. Headers ficam diretos: "Olá, Maria" sem switcher.
- **Pai com 2+ filhos:** Switcher visível em todas as telas com contexto de filho (M6, M8, M9, M16)
- **Selecionando filho diferente:** spring.smooth (250ms) na transição do feed/conteúdo abaixo
- **Persistência:** último filho selecionado salvo em SecureStore (`selected-child-id`); usado no boot
- **Adicionar filho — link inválido:** Toast color-error "Convite inválido ou expirado"
- **Adicionar filho — link válido:** abre M5 (LGPD para o novo vínculo) → vinculação criada → switcher passa a mostrar o novo filho como selecionado

### Interações principais
- Tap card filho → muda contexto (estado global ou Context React) → telas dependentes refazem fetch
- Tap `+` → tela "Adicionar filho"
- Long-press card → menu (futuro v1.3 — desvincular filho — não implementar)
- Scroll horizontal → mais filhos (raro mas possível)

### Dados necessários da API
- Reutiliza `GET /me` (retorna `studentParentLinks` com lista de filhos)
- Para "adicionar filho": reutiliza `POST /invitations/claim` ou registro com inviteToken (já existe na auth.service)

> **Backend dev nota:** garantir que `GET /me` retorne `studentParentLinks: [{ studentId, studentName, gradeLevel, subjectName, lessonCount30d }]` para alimentar o switcher sem fetch adicional.

### Anti-AI checklist
- [x] Esconde quando não aplicável (1 filho)
- [x] Sem ícones genéricos (avatar real, não emoji 👶)
- [x] Tokens semânticos para selected (color-primary border)
- [x] Persistência respeita escolha do user (não força reset)
- [x] Empty/sem-segundo-filho leva à ação concreta (cole link)

---

## Resumo de componentes novos vs reutilizados

| Tela | Componentes novos | Reutilizados |
|---|---|---|
| P14 Agenda | `CalendarMonthGrid` | Card, TabBar, FAB |
| P15 Financeiro | — | Card, Avatar, Badge, ProgressBar, Button |
| M15 Histórico filtrado | `FilterBar` (composto) | Chip, Card, BottomSheet |
| M16 Progresso | `MiniBarChart` (sem lib) | Card |
| M17 Múltiplos filhos | `ChildSwitcher` | Card, Input, Button |

**Total componentes novos:** 4 (`CalendarMonthGrid`, `FilterBar`, `MiniBarChart`, `ChildSwitcher`).

**Endpoints novos necessários:** 2 (`GET /me/billing/parents` e `GET /lessons/student/:id/stats`). Reutilizar handlers existentes para o resto.

**Mudanças em schemas compartilhados:**
- `listLessonsQuerySchema` (`packages/shared`): adicionar `from?`, `to?` (ISO date string), `subjectIds?` (string[])
- Nenhuma migration de banco necessária.
