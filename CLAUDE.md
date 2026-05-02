# liveaula — Contexto do projeto

> Carregado automaticamente a cada sessão. Mantenha **<100 linhas** — é cacheado mas conta no contexto.

## Produto

Plataforma EdTech brasileira de aulas particulares. 3 atores: **professor** (registra aula <30s, web+mobile), **pai/mãe** (recebe push, paga R$79/mês, web+mobile), **admin** (interno, web). Compliance LGPD Art. 14 (dados de menores). Cold-start: professor adota antes do pai pagar.

## Stack

- **Backend:** Node.js 20 + Fastify + Prisma + PostgreSQL + Zod + JWT (15min) + refresh httpOnly
- **Web:** Next.js 14+ App Router + TypeScript + Tailwind
- **Mobile:** React Native + Expo managed + TypeScript
- **Push:** FCM via Expo
- **Pagamento:** TBD (Pagar.me / Asaas / Stripe)
- **Testes:** Supertest+Jest (API), Playwright (web), Detox (mobile iOS+Android)
- **Deploy:** Railway (API) + Vercel (web) + Expo EAS (mobile)
- **Monorepo:** `apps/api/`, `apps/web/`, `apps/mobile/`, `packages/shared/`

## Fluxo de delivery (3 skills)

```
brief → /liveaula-pesquisa-mercado → product-spec.md
       → /liveaula-design          → handoff-manifest.md
       → /liveaula-dev             → código + testes + deploy
```

Cada skill tem briefing pack cacheado (TTL 5min Anthropic). **Não copiar conteúdo do briefing inline** em prompts — sempre ler via primeiro Read.

## Smart Model Dispatch

Aplicar SEMPRE — não desperdiçar Sonnet em trabalho mecânico:

| Modelo | Quando usar |
|---|---|
| **Sonnet 4.6** (`claude-sonnet-4-6`) | Arquitetura, planejamento, advogado do diabo, implementação TS, code review, segurança |
| **Haiku 4.5** (`claude-haiku-4-5-20251001`) | Descoberta estruturada, prioridade, parse de testes, observabilidade, docs por template, YAML CI |
| **Opus 4.7** (`claude-opus-4-7`) | Apenas decisões de design extremamente críticas (raro neste projeto) |

A skill `liveaula-dev` já tem tabela completa por papel (12 papéis em 3 fases).

## Regras de redução de tokens

1. **`.claudeignore` já configurado** — não tente ler `agents/`, `mcps/`, `_expxagents/core/best-practices/`, `squads/**/agents/`, `squad.yaml`, `squad-party.csv`, ou outputs históricos.
2. **Subagentes retornam ≤200 palavras** — nunca transcript completo. Política aplicada em `liveaula-dev` Fase 2.
3. **Contexto < 100 linhas neste arquivo** — checar com `wc -l CLAUDE.md` antes de adicionar.
4. **Anti-duplicação** — informação aparece em **um** lugar:
   - Stack / fluxo → este arquivo
   - Detalhe de papel → SKILL.md respectivo
   - Decisões técnicas históricas → `_memory/memories.md` do squad
   - Tarefas em execução → TodoWrite (efêmero, não vira arquivo)
5. **Especs grandes** (`product-spec.md`, `DESIGN.md`) entram no briefing pack 1x, não inline em cada prompt.

## Paths críticos

- Skills: `.claude/skills/liveaula-{design,dev,pesquisa-mercado}/SKILL.md`
- Briefing pack base: `_expxagents/_memory/{company,preferences}.md`
- Specs ativos: `squads/desenvolvimento/produto/liveaula/liveaula-dev/{product-spec.md,DESIGN.md}`
- Memória dev: `squads/desenvolvimento/produto/liveaula/liveaula-dev/_memory/memories.md`
- Memória pesquisa: `squads/estrategia/produto/validacao/validacao-liveaula/_memory/memories.md`
- Outputs de skill: `output/{dev,design,pesquisa-mercado}/`
- Specs/plans superpowers: `docs/superpowers/{specs,plans}/`

## Idioma

- Comunicação com o usuário: **português brasileiro**
- Código, identificadores, paths: **inglês**
- Mensagens de commit: inglês conciso (Conventional Commits)

## ExpxAgents

Framework alternativo disponível (90+ agentes em `agents/`, comandos `/expxagents *`). **Não use por padrão** — as 3 skills locais cobrem o ciclo completo. ExpxAgents existe se o usuário precisar criar squad ad-hoc fora do escopo liveaula.
