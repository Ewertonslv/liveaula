# Design — `liveaula-dev` skill (12 papéis, 3 fases)

**Data:** 2026-04-29
**Status:** Approved (pending written-spec review)
**Substitui:** `liveaula-dev` atual (Maker/Critic/Chef — 3 papéis)

## Contexto

O `liveaula-dev` atual tem 3 papéis genéricos (Maker, Critic, Chef) e cobre apenas execução de sprint. O usuário tem em `C:\Users\Ewerton\Documents\Projetos github\Monarch-IA\agents` uma pipeline madura de 12 agentes Python que cobre o ciclo completo de desenvolvimento (Discovery → Deploy). Esta spec adapta esses 12 agentes para o stack liveaula (TypeScript/Node.js/Next.js/React Native/Expo) em **um único skill** Claude Code.

## Objetivo

Substituir o conteúdo de `.claude/skills/liveaula-dev/SKILL.md` por um pipeline de 12 papéis sequenciais em 3 fases, com 2 checkpoints humanos. Recebe o handoff do `liveaula-design` e entrega feature implementada, testada, segura, observável, documentada e pronta para deploy.

## Escopo

- **In:** SKILL.md completo, formato Claude Code skill, paths corretos para `squads/desenvolvimento/produto/liveaula/liveaula-dev/`, adaptação de cada papel ao stack TypeScript.
- **Out:** implementação real do código (será produzida pelo skill, não nesta spec). Migração da memória/output histórica do skill antigo (não há histórico relevante).

---

## Seção 1 — Pipeline geral

**Entrada:** `output/design/handoff-manifest.md` + `DESIGN.md` + `web-component-specs.md` + `mobile-component-specs.md`

**Saída:** código implementado + testes passando + feature pronta para produção

```
── FASE 1: PLANEJAMENTO ──────────────────────────────────
Alice    → Descoberta: lê handoff, mapeia feature para atores liveaula
Bruno    → Prioridade: avalia impacto no MVP
Carla    → Arquitetura: DB schema, endpoints, componentes, arquivos afetados
Diego    → Planejamento: tarefas atômicas ordenadas (API → Web → Mobile)
Ewerton  → Advogado do Diabo: ataca o plano antes do código
                    ↓
            ✅ CHECKPOINT 1 — aprovar plano

── FASE 2: CONSTRUÇÃO ───────────────────────────────────
Fernanda → Implementação: TypeScript — Fastify/Prisma + Next.js + RN/Expo
Gabriel  → Testes: Supertest (API) + Playwright (web) + Detox (iOS+Android)
Helena   → Revisão: code review
                    ↓
            ✅ CHECKPOINT 2 — aprovar build

── FASE 3: ENTREGA ──────────────────────────────────────
Igor     → Segurança: OWASP + LGPD Art. 14
Lucas    → Observabilidade: pino + métricas + alertas FCM
Karla    → Documentação: OpenAPI + README + changelog
Julia    → Deploy: GitHub Actions + Railway + Vercel + Expo EAS
```

---

## Seção 2 — Detalhe dos 12 papéis

### Fase 1 — Planejamento

**1. Alice — Descoberta** (Haiku 4.5)
- Lê handoff + product-spec, mapeia feature para atores (professor/pai/admin)
- Categoriza tipo: `fullstack` | `api-only` | `web-only` | `mobile-only` | `infra`
- Avalia complexidade: `trivial` | `low` | `medium` | `high` | `critical`
- Saída: `output/dev/phase-1/alice-discovery.md`

**2. Bruno — Prioridade** (Haiku 4.5)
- Avalia prioridade no MVP, peso especial para "Registrar Aula <30s"
- Identifica dependências e riscos de cronograma
- Saída: `output/dev/phase-1/bruno-priority.md`

**3. Carla — Arquitetura** (Sonnet 4.6)
- DB: alterações schema Prisma + migrações + índices
- API: endpoints Fastify (rota, método, schema Zod, auth, rate limit)
- Web: estrutura Next.js (Server vs Client, App Router, data fetching)
- Mobile: estrutura React Native/Expo (telas, navegação, AsyncStorage, FCM)
- Shared: types em `packages/shared/`
- Saída: `output/dev/phase-1/carla-architecture.md`

**4. Diego — Planejamento** (Sonnet 4.6)
- Quebra arquitetura em tarefas atômicas com dependências claras
- Ordem padrão: `migration → API+test → shared types → web+test → mobile+test`
- Cada task tem `acceptance` (comando concreto de validação)
- Saída: `output/dev/phase-1/diego-plan.md`

**5. Ewerton — Advogado do Diabo** (Sonnet 4.6)
- Ataca o plano antes do código
- Pontos liveaula-específicos: requisito <30s, LGPD Art. 14, cold-start professor→pai, abuso do flywheel de gratuidade
- Saída: `output/dev/phase-1/ewerton-devils-advocate.md`

**→ Checkpoint 1** — `output/dev/checkpoint-01-brief.md` (≤300 palavras)

### Fase 2 — Construção

**6. Fernanda — Implementação** (Sonnet 4.6)
- Escreve código TypeScript real seguindo TDD
- Despacha subagentes em ondas paralelas (Agent tool, retorno ≤200 palavras)
- Camadas: `apps/api/`, `apps/web/`, `apps/mobile/`, `packages/shared/`
- Política `cross_task_integration_required`: zero TODOs cruzados entre tarefas
- Saída: `output/dev/phase-2/fernanda-implementation.md` + `wave-log.md` (append-only)

**7. Gabriel — Testes** (Haiku 4.5)
- API (Supertest+Jest): `apps/api/src/__tests__/<dominio>.test.ts` — happy + 4xx + edge
- Web (Playwright): `e2e/web/<feature>.spec.ts` — assertions de DOM, não só navegação
- Mobile (Detox): `e2e/mobile/<feature>.test.js` — iOS **E** Android obrigatório, mock FCM
- Lint/types: `eslint` + `tsc --noEmit`
- Política `mobile_platform_parity_required`: divergências iOS×Android documentadas em `platform-notes.md`
- Comportamento em falha: volta para Fernanda (limite 2 tentativas)
- Saída: `output/dev/phase-2/gabriel-tests.md`

**8. Helena — Revisão** (Sonnet 4.6)
- Code review: correctness, readability, maintainability, test coverage
- Liveaula-específico: vazamento Server→Client, JWT em rotas protegidas, Prisma `select` para evitar exposure
- `overall_quality`: `excellent` | `good` | `acceptable` | `needs_work` | `rejected`
- Comportamento em rejeição: volta para Fernanda
- Saída: `output/dev/phase-2/helena-review.md`

**→ Checkpoint 2** — `output/dev/checkpoint-02-brief.md` (≤300 palavras)

### Fase 3 — Entrega

**9. Igor — Segurança** (Sonnet 4.6)
- OWASP Top 10 + LGPD Art. 14 (dados de menores)
- Checks liveaula: JWT 15min/refresh httpOnly, rate limit em auth+lessons, Zod em todo endpoint, Prisma `select`, consentimento parental, secrets em `expo-secure-store`, deep links validados
- Bloqueia se `risk_level >= high`
- Saída: `output/dev/phase-3/igor-security.md`

**10. Lucas — Observabilidade** (Haiku 4.5)
- Logging Fastify+pino (sem PII)
- Métricas: counters, gauges, histograms (incl. `lesson_registration_duration_seconds` para validar <30s)
- Alertas: push falha >5%/min, lesson p95 >30s, 5xx >1%
- Tracing: spans em `POST /lessons` (`prisma.create` → `fcm.send` → `notification.persist`)
- Health checks: `/health` + `/ready`
- Saída: `output/dev/phase-3/lucas-observability.md`

**11. Karla — Documentação** (Haiku 4.5)
- OpenAPI via `@fastify/swagger` (validar `summary`/`description`/`response` em toda rota)
- README por app (`apps/api/README.md`, etc.)
- CHANGELOG.md (keep-a-changelog format)
- Inline docs apenas para WHY não-óbvio
- Saída: `output/dev/phase-3/karla-docs.md`

**12. Julia — Deploy** (Haiku 4.5)
- GitHub Actions: `pnpm install`, `tsc --noEmit`, `eslint`, `jest`, `playwright`, `detox build` (release branches)
- Targets: Railway (API+Postgres) | Vercel (Web/Next.js) | Expo EAS (Mobile)
- Env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FCM_SERVER_KEY`, payment provider key, `EXPO_TOKEN`
- Migrations em produção: `npx prisma migrate deploy` no startup
- Rollback documentado
- Saída: `output/dev/phase-3/julia-deploy.md`

### Encerramento

- Atualiza `output/dev/state.json` (estado consolidado)
- Atualiza `squads/desenvolvimento/produto/liveaula/liveaula-dev/_memory/memories.md` (persona Gabriela Mendes assina)
- Resumo executivo ≤300 palavras para o usuário

---

## Seção 3 — Briefing pack + estrutura de output

### Briefing pack (Passo 0, lido uma vez)

`output/dev/_briefing-pack.md` concatena:

1. `_expxagents/_memory/company.md`
2. `_expxagents/_memory/preferences.md`
3. `squads/desenvolvimento/produto/liveaula/liveaula-dev/product-spec.md`
4. `squads/desenvolvimento/produto/liveaula/liveaula-dev/DESIGN.md`
5. `output/design/handoff-manifest.md`
6. `output/design/web-component-specs.md`
7. `output/design/mobile-component-specs.md`
8. `squads/desenvolvimento/produto/liveaula/liveaula-dev/_memory/memories.md`

Cada papel passa este arquivo como **primeiro Read** → prompt cache hit (Anthropic ephemeral cache, TTL 5min).

**Aviso de cache:** se houver pausa >4min entre papéis (checkpoint humano demorado), o skill avisa que próxima leitura paga preço cheio.

### Estrutura de saída

```
output/dev/
  _briefing-pack.md
  phase-1/
    alice-discovery.md
    bruno-priority.md
    carla-architecture.md
    diego-plan.md
    ewerton-devils-advocate.md
  checkpoint-01-brief.md
  phase-2/
    fernanda-implementation.md
    wave-log.md
    gabriel-tests.md
    platform-notes.md
    helena-review.md
  checkpoint-02-brief.md
  phase-3/
    igor-security.md
    lucas-observability.md
    karla-docs.md
    julia-deploy.md
  state.json

apps/api/src/__tests__/<dominio>.test.ts    # Supertest persiste como suite
e2e/web/<feature>.spec.ts                   # Playwright persiste
e2e/mobile/<feature>.test.js                # Detox persiste

squads/desenvolvimento/produto/liveaula/liveaula-dev/
  _memory/memories.md  ← atualizado no encerramento
```

---

## Seção 4 — Checkpoint briefs (formato obrigatório)

Antes de cada checkpoint, gerar `output/dev/checkpoint-NN-brief.md` ≤300 palavras:

```markdown
# Checkpoint NN — <título curto>

## O que está sendo decidido (1 frase)
<direto>

## Resumo (≤150 palavras)
- bullet 1: o que foi planejado/construído
- bullet 2: riscos
- bullet 3: recomendação

## Caso prático
<exemplo concreto se aprovar — dá convicção>

## Se rejeitar, o que acontece?
<volta pra qual fase, o que será refeito>

## Fontes (paths absolutos)
- `output/dev/phase-X/<arquivo>.md`
```

| # | Checkpoint | Quem gera | Quando |
|---|---|---|---|
| 01 | Plano aprovado | Ewerton (último da Fase 1) | Após 5 papéis da Fase 1 |
| 02 | Build aprovado | Helena (última da Fase 2) | Após 3 papéis da Fase 2 |

**Sem brief, checkpoint é inválido** — pause e gere antes.

---

## Seção 5 — Regras inegociáveis

Para sprint ser declarada `concluida`, **todos** estes são verdade simultaneamente:

1. `grep` de integração cruzada limpo:
   ```bash
   grep -rE "TODO.*T[0-9]+|Disponível em breve|em outra tarefa|DEPENDÊNCIA T[0-9]+" apps/ packages/
   ```
   Exit code != 0 → bloquear.

2. Pelo menos 1 teste passou em **cada camada implementada**:
   - API → Supertest+Jest passou
   - Web → Playwright passou
   - Mobile → Detox passou em iOS **E** Android (não vale só um)

3. Lint e types limpos: `eslint` exit 0 + `tsc --noEmit` exit 0

4. Helena (Revisão) deu `approved: true`

5. Igor (Segurança) NÃO bloqueou com `risk_level >= high`

6. `state.json` atualizado com paths de artifacts (traces, screenshots)

7. Squad memory atualizada com a execução

**Falhou um? Bloqueia. Sem exceção.**

### Política de subagentes (Fernanda)

- Retorno máximo de subagente: 200 palavras
- Subagente nunca retorna transcript completo
- Fernanda nunca executa código diretamente — sempre delega para subagentes via Agent tool

---

## Seção 6 — Modelos por papel

| # | Papel | Modelo | Justificativa |
|---|---|---|---|
| 1 | Alice (Descoberta) | Haiku 4.5 | Output estruturado JSON-like, sem raciocínio profundo |
| 2 | Bruno (Prioridade) | Haiku 4.5 | Avaliação por critérios fixos, sem nuance |
| 3 | Carla (Arquitetura) | Sonnet 4.6 | Decisão técnica complexa multi-stack |
| 4 | Diego (Planejamento) | Sonnet 4.6 | Decomposição em tarefas com dependências |
| 5 | Ewerton (Advogado do Diabo) | Sonnet 4.6 | Crítica não-óbvia, raciocínio adversarial |
| 6 | Fernanda (Implementação) | Sonnet 4.6 | Geração de código complexo TS |
| 7 | Gabriel (Testes) | Haiku 4.5 | Parse de outputs estruturados |
| 8 | Helena (Revisão) | Sonnet 4.6 | Avaliação qualitativa de código |
| 9 | Igor (Segurança) | Sonnet 4.6 | Identificação de vulnerabilidades sutis |
| 10 | Lucas (Observabilidade) | Haiku 4.5 | Recomendações estruturadas por padrão |
| 11 | Karla (Documentação) | Haiku 4.5 | Geração de documentação por template |
| 12 | Julia (Deploy) | Haiku 4.5 | Geração de YAML CI/CD por template |

**Distribuição:** 6 Sonnet (raciocínio crítico) + 6 Haiku (formato/template).

**Estimativa de economia:** ~40-50% tokens por execução vs. todos em Sonnet.

Modelo de Haiku: `claude-haiku-4-5-20251001` (declarado explicitamente em cada papel Haiku).

---

## Seção 7 — Triângulo de delivery liveaula

```
brief do produto
   ↓
liveaula-pesquisa-mercado     (4 papéis: Marcos, Priscila, Roberto, André)
   ↓
product-spec.md
   ↓
liveaula-design               (5 papéis: Strategist, SystemBuilder, SpecGen, StackAdapter, Chef)
   ↓
handoff-manifest.md
   ↓
liveaula-dev                  (12 papéis em 3 fases — esta spec)
   ↓
deploy
```

---

## Critérios de aceite desta spec

- [ ] `.claude/skills/liveaula-dev/SKILL.md` reescrito com os 12 papéis em 3 fases
- [ ] Frontmatter `name: liveaula-dev` + `description` atualizada
- [ ] Briefing pack documentado com 8 fontes
- [ ] 2 checkpoints com formato obrigatório
- [ ] 7 regras inegociáveis explícitas
- [ ] Tabela de modelos por papel (Sonnet × Haiku)
- [ ] Estrutura de output completa (`output/dev/phase-1/`, `phase-2/`, `phase-3/`)
- [ ] Paths corretos: `squads/desenvolvimento/produto/liveaula/liveaula-dev/` (não `acompanha`)
- [ ] Triângulo de delivery atualizado com `liveaula-pesquisa-mercado` (não `liveaula-validation`)

## Riscos

- **Token cost por execução:** mesmo com cache + Haiku, 12 papéis é mais caro que 3. Mitigação: checkpoints permitem parar cedo (Fase 1 ou Fase 2) sem rodar todos.
- **Latência:** 12 papéis sequenciais é lento. Mitigação: Fernanda (passo 6) usa subagentes paralelos para mitigar nas tarefas.
- **Manutenção do SKILL.md:** arquivo grande (~600+ linhas). Mitigação: estrutura clara em fases facilita edição focada.
