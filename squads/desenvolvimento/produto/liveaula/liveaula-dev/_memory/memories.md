# Squad Memory — liveaula Dev

## Contexto
Squad de desenvolvimento completo do produto liveaula.
Criado em: 29/04/2026

## Decisões Tomadas
- Stack definida: Node.js + Prisma + PostgreSQL (API), Next.js 14+ (web), React Native + Expo (mobile iOS + Android)
- Paulo Lima (DevOps) é agnóstico de plataforma — não lock-in em Vercel
- Diego Moreira (Advogado do Diabo) é o último agente — revisa tudo antes de aprovar

## Execuções

### 2026-04-29 — liveaula-design sprint completo
- Skill: `liveaula-design` (Strategist → SystemBuilder → SpecGen → StackAdapter → Chef)
- Resultado: 52 telas Must-have especificadas + DESIGN.md v1.1 + web-component-specs + mobile-component-specs
- Handoff manifest: `output/design/handoff-manifest.md`

### 2026-04-30 — liveaula-design DELTA Should-have
- Skill: `liveaula-design` em modo delta (sem refazer DESIGN.md, sem checkpoints completos)
- Cobre: P14 (Agenda), P15 (Financeiro), M15 (Histórico filtrado), M16 (Progresso), M17 (Múltiplos filhos)
- Output: `output/design/spec-should-have-deltas.md` + patches em `mobile-component-specs.md`
- 4 componentes novos: `CalendarMonthGrid`, `FilterBar`, `MiniBarChart`, `ChildSwitcher`
- 2 endpoints novos: `GET /me/billing/parents`, `GET /lessons/student/:id/stats`
- Schema shared estendido: `listLessonsQuerySchema` ganha `from`, `to`, `subjectIds[]`

## Decisões de Design (não reverter)

### Visual
- **Cor primária:** `#1A6B74` (teal profundo). Proibido substituir por blue-500, green-500 ou amber-500.
- **Cor accent:** `#D95F3B` (terracotta). Usada APENAS em celebração e streak — não como cor de ação genérica.
- **Fontes:** Plus Jakarta Sans Variable (heading) + DM Sans (body) + DM Mono (mono). Nunca Inter sem justificativa.
- **Modo escuro:** apenas professor. Pai/mãe é sempre light — emoção sobre conveniência.
- **Aurora gradients:** apenas nos cards do pai/mãe. Professor usa surface cinza frio.
- **Spring physics:** todos os easing devem ser spring, nunca ease-linear (AP-12).

### UX / Produto
- **FAB Registrar Aula:** flutua sobre a TabBar, `bottom=88px`. Não mover para tab ou menu.
- **< 30 segundos:** caminho rápido do P5 é 4 interações (~15–20s). Não adicionar campos obrigatórios.
- **Trial 7 dias:** pai pode ver as primeiras aulas antes de pagar. Não remover o trial.
- **LGPD Art.14:** tela M5 dedicada com scroll obrigatório. Não simplificar para checkbox no cadastro.
- **StreakBadge:** visível somente se streak ≥ 2 dias. Nunca mostrar no primeiro dia (AP-11).
- **CelebrationOverlay:** apenas 3 triggers (firstLesson, tenthLesson, firstParent). Não adicionar outros.
- **Coreografia 4200ms:** sequência exata documentada em spec-P5-registrar-aula.md. Não encurtar sem teste de usuário.

### Técnico
- **Offline professor mobile:** expo-sqlite + expo-task-manager. Aula nunca se perde por falta de rede.
- **Web pai:** mobile-first adaptado, coluna centrada max-w=680px, sem sidebar. Não fazer como o professor web.
- **Touch mínimo mobile:** 44px em todos os elementos interativos. Nunca violar.
- **Push FCM:** via Expo Notifications. Token registrado no login e atualizado quando muda.
- **Smart defaults P5:** último aluno destacado + última matéria e duração pré-selecionadas. São parte do contrato de UX do core loop.

## Aprendizados

### Identidade visual
- O público do professor é profissional/produtividade — alta densidade, cinza frio, sem firula.
- O público do pai é emocional/reassurance — baixa densidade, creme quente, gradientes aurora.
- Misturar os dois contextos visuais é o principal anti-pattern a evitar.

### Gamification adulta vs infantil
- StreakBadge e CelebrationOverlay foram adicionados como tendência EdTech 2025, mas com restrições deliberadas (AP-11) para não parecer app infantil.
- Regra prática: gamification adulta = consequência real (dias consecutivos = hábito real), não pontos por clicar.
