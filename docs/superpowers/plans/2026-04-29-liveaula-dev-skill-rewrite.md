# liveaula-dev Skill Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescrever `.claude/skills/liveaula-dev/SKILL.md` substituindo o pipeline atual de 3 papéis (Maker/Critic/Chef) pelo pipeline completo de 12 papéis em 3 fases definido em `docs/superpowers/specs/2026-04-29-liveaula-dev-skill-design.md`.

**Architecture:** Único arquivo `SKILL.md` (frontmatter YAML + corpo Markdown). Pipeline sequencial de 12 papéis adaptados do Monarch-IA ao stack TypeScript/Fastify/Next.js/React Native, com 2 checkpoints humanos e briefing pack cacheado. Nenhum código de produto — apenas reescrita de skill spec.

**Tech Stack:** Markdown + YAML frontmatter. Validação via leitura visual do arquivo final.

---

## File Structure

**Modified:**
- `.claude/skills/liveaula-dev/SKILL.md` — reescrita completa (~600+ linhas)
- `COMANDOS.md` — verificar/atualizar descrição do skill se necessário

**Created:**
- Nenhum (reescrita in-place)

**Deleted:**
- Conteúdo antigo do `SKILL.md` (substituído pelo novo)

---

## Task 1: Backup do SKILL.md atual e validação dos paths

**Files:**
- Read: `.claude/skills/liveaula-dev/SKILL.md` (estado atual)
- Read: `docs/superpowers/specs/2026-04-29-liveaula-dev-skill-design.md` (referência)

- [ ] **Step 1: Confirmar estado atual do SKILL.md**

Ler o conteúdo atual via Read tool e verificar:
- Existe frontmatter com `name: liveaula-dev`?
- Tem 3 papéis (Maker/Critic/Chef)?
- Paths usam `liveaula/liveaula-dev` (já corrigido) e não `acompanha/acompanha-dev`?

Esperado: arquivo existe com 3 papéis e paths corretos. Se `acompanha` ainda aparece, abortar e corrigir antes.

- [ ] **Step 2: Confirmar diretório do squad existe**

Run: `ls "c:/Users/Ewerton/Documents/Projetos github/liveaula/squads/desenvolvimento/produto/liveaula/liveaula-dev/"`

Esperado: lista mostra `agents/`, `_memory/`, `product-spec.md`, `squad.yaml`, `squad-party.csv`.

- [ ] **Step 3: Confirmar spec referência existe**

Run: `ls "c:/Users/Ewerton/Documents/Projetos github/liveaula/docs/superpowers/specs/2026-04-29-liveaula-dev-skill-design.md"`

Esperado: arquivo existe.

- [ ] **Step 4: Sem commit — esta task é apenas leitura/validação**

Não há mudanças nesta task.

---

## Task 2: Escrever frontmatter e seção de abertura

**Files:**
- Modify: `.claude/skills/liveaula-dev/SKILL.md` (substituir todo conteúdo)

- [ ] **Step 1: Sobrescrever SKILL.md com frontmatter + abertura**

Usar Write tool (não Edit — é substituição completa) com este conteúdo inicial:

```markdown
---
name: liveaula-dev
description: "Squad de desenvolvimento completo para liveaula (12 papéis em 3 fases). Recebe handoff do liveaula-design e entrega feature implementada, testada (Supertest+Playwright+Detox), revisada, segura (OWASP+LGPD), observável, documentada e pronta para deploy. 2 checkpoints humanos. Mix Sonnet 4.6 / Haiku 4.5 para economia de tokens."
---

# liveaula-dev — Squad de Desenvolvimento Completo

Adaptação dos 12 agentes Monarch-IA para o stack liveaula (TypeScript/Fastify/Next.js/React Native+Expo). Pipeline sequencial em 3 fases com 2 checkpoints humanos.

**Definição de pronto:** feature implementada + testes passando em todas as camadas implementadas + Helena (Revisão) aprovou + Igor (Segurança) não bloqueou + state.json e squad memory atualizados.

## Quando usar

Após handoff do `liveaula-design` (com `output/design/handoff-manifest.md` disponível) ou diretamente com `product-spec.md` quando não há trabalho de design (ex: feature de backend puro).

## Filosofia

12 papéis sequenciais em 3 fases. Briefing pack cacheado uma vez (prompt cache hit Anthropic, TTL 5min). Subagentes da fase de implementação retornam ≤200 palavras — nunca transcript completo. Modelos diferenciados: Sonnet 4.6 nos 6 papéis de raciocínio crítico, Haiku 4.5 nos 6 papéis de formato/template (~40-50% economia vs. tudo Sonnet).

```
── FASE 1: PLANEJAMENTO ──────────────────────────────────
Alice    → Descoberta            (Haiku)
Bruno    → Prioridade            (Haiku)
Carla    → Arquitetura           (Sonnet)
Diego    → Planejamento          (Sonnet)
Ewerton  → Advogado do Diabo     (Sonnet)
                    ↓
            ✅ CHECKPOINT 1 — aprovar plano

── FASE 2: CONSTRUÇÃO ───────────────────────────────────
Fernanda → Implementação         (Sonnet)
Gabriel  → Testes                (Haiku)
Helena   → Revisão               (Sonnet)
                    ↓
            ✅ CHECKPOINT 2 — aprovar build

── FASE 3: ENTREGA ──────────────────────────────────────
Igor     → Segurança             (Sonnet)
Lucas    → Observabilidade       (Haiku)
Karla    → Documentação          (Haiku)
Julia    → Deploy                (Haiku)
```

---
```

- [ ] **Step 2: Verificar arquivo gravado**

Read tool no `SKILL.md` — confirmar que termina exatamente com `---` da última linha do passo anterior (ou seja, está incompleto, esperando próximas seções).

- [ ] **Step 3: Sem commit — arquivo ainda incompleto**

Não comitar até a reescrita estar 100% feita (Task 8). Permite rollback fácil se algo der errado no meio.

---

## Task 3: Adicionar Seção 0 (Briefing pack) e Fase 1 completa

**Files:**
- Modify: `.claude/skills/liveaula-dev/SKILL.md` (append)

- [ ] **Step 1: Append da Seção 0 + Fase 1**

Usar Edit tool localizando o `---` final do passo anterior e substituindo por (ou Write completo com tudo até aqui):

```markdown
## Pipeline Obrigatório

### Passo 0 — Briefing Pack (uma vez)

Antes de qualquer papel, montar `output/dev/_briefing-pack.md` concatenando:

1. `_expxagents/_memory/company.md`
2. `_expxagents/_memory/preferences.md`
3. `squads/desenvolvimento/produto/liveaula/liveaula-dev/product-spec.md`
4. `squads/desenvolvimento/produto/liveaula/liveaula-dev/DESIGN.md`
5. `output/design/handoff-manifest.md`
6. `output/design/web-component-specs.md`
7. `output/design/mobile-component-specs.md`
8. `squads/desenvolvimento/produto/liveaula/liveaula-dev/_memory/memories.md`

Cada papel passa este arquivo como **primeiro Read** → prompt cache hit (Anthropic ephemeral cache, TTL 5min). Não copiar inline nos prompts seguintes.

> **Aviso de cache:** se houver pausa >4min entre papéis (checkpoint humano demorado), informar usuário que próxima leitura paga preço cheio.

---

## FASE 1 — Planejamento

### Passo 1 — Alice · Descoberta

**Modelo:** `claude-haiku-4-5-20251001`

**Entrada:** Briefing pack.

**O que faz:**
- Lê `handoff-manifest.md` e mapeia a feature para os 3 atores liveaula (professor / pai / admin)
- Extrai critérios de aceite testáveis da product-spec
- Categoriza tipo: `fullstack` | `api-only` | `web-only` | `mobile-only` | `infra`
- Avalia complexidade: `trivial` | `low` | `medium` | `high` | `critical`
- Identifica escopo (in/out)

**Saída:** `output/dev/phase-1/alice-discovery.md`

```markdown
## Confidence: 0.X
## Summary (1 frase)
## Feature type
## Complexity
## Affected actors
## Affected areas
- [api / web / mobile / infra]
## Acceptance criteria
- [testable condition]
## Out of scope
## Concerns
```

---

### Passo 2 — Bruno · Prioridade

**Modelo:** `claude-haiku-4-5-20251001`

**Entrada:** Saída de Alice + product-spec (seção MVP roadmap).

**O que faz:**
- Avalia prioridade no contexto do MVP (Must/Should/Could-have)
- Peso especial para o core loop "Registrar Aula <30s"
- Identifica dependências de outras features
- Sinaliza riscos de cronograma

**Saída:** `output/dev/phase-1/bruno-priority.md`

```markdown
## Confidence: 0.X
## Priority
- Level: critical | high | medium | low
- Score: 1-100
## Suggested sprint
- current | next | backlog
## Rationale
## Dependencies
## Risks
## Concerns
```

---

### Passo 3 — Carla · Arquitetura

**Modelo:** `claude-sonnet-4-6` (Sonnet 4.6 para raciocínio multi-stack)

**Entrada:** Alice + Bruno + briefing pack.

**O que faz:** desenha solução técnica multi-camada do liveaula:

**DB (Prisma):**
- Novos models, alterações em models existentes
- Migrações (`npx prisma migrate dev --name <descritivo>`)
- Índices necessários para queries críticas

**API (Fastify):**
- Endpoints: rota, método, schema Zod (request + response), autenticação JWT, rate limit
- Middlewares aplicáveis

**Web (Next.js App Router):**
- Server Components vs Client Components decision
- Routes em `apps/web/app/`
- Estratégia de data fetching (Server Component fetch vs SWR/React Query)

**Mobile (React Native + Expo managed):**
- Telas em `apps/mobile/src/screens/`
- Navegação (React Navigation)
- AsyncStorage / expo-secure-store decisions
- FCM integration points

**Shared:**
- Types em `packages/shared/` (TypeScript interfaces consumidas por web E mobile)

**Saída:** `output/dev/phase-1/carla-architecture.md`

```markdown
## Confidence: 0.X
## Approach (high-level)
## New files
## Modified files
## Deleted files
## Prisma migrations
- [migration name]: [descrição]
## API endpoints
| Method | Path | Description | Auth | Rate limit |
## Web pages/components
## Mobile screens/components
## Shared types
## Design patterns aplicados
## Concerns
```

---

### Passo 4 — Diego · Planejamento

**Modelo:** `claude-sonnet-4-6`

**Entrada:** Carla + Alice + briefing pack.

**O que faz:** quebra arquitetura em **tarefas atômicas ordenadas por dependência**.

Ordem natural no liveaula:
```
1. Prisma migration
2. Shared types (packages/shared/)
3. API endpoint + Supertest
4. Web component + Playwright
5. Mobile component + Detox
```

Cada tarefa tem:
- `id` (T1, T2, ...)
- `title` (1 frase)
- `description` (detalhamento)
- `type`: `migration` | `shared-type` | `api-endpoint` | `web-component` | `mobile-component` | `test`
- `files` (paths absolutos)
- `dependencies` ([T1, T2])
- `acceptance` (comando concreto, ex: `npx jest --testPathPattern=lessons --forceExit`)

**Saída:** `output/dev/phase-1/diego-plan.md`

```markdown
## Confidence: 0.X
## Branch name
- feat/<feature-name>
## Estimated steps
## Steps
### T1: <title>
- type
- files
- dependencies
- acceptance
- description
[repetir para cada task]
## Concerns
```

---

### Passo 5 — Ewerton · Advogado do Diabo

**Modelo:** `claude-sonnet-4-6`

**Entrada:** Alice + Bruno + Carla + Diego + briefing pack.

**O que faz:** ataca o plano antes do código. Pontos liveaula-específicos a verificar:

- O plano cumpre o requisito de "Registrar Aula <30s" (4 campos máx, seleção em vez de digitação)?
- LGPD Art. 14 está respeitado (consentimento parental para dados de menores)?
- Considera o cold-start (professor adota antes de pai pagar)?
- O modelo de gratuidade (5+ pais pagantes = grátis para professor) tem brechas exploráveis?
- Dependências entre tasks de Diego têm ordem viável?
- Algum endpoint sem rate limit em rota sensível (auth, registro)?
- Algum dado de menor sendo persistido sem consentimento explícito do responsável?

Cada issue tem:
- `severity`: critical | high | medium | low
- `category`: security | correctness | performance | maintainability | testing | compliance
- `description`
- `suggestion` (fix concreto)

**Saída:** `output/dev/phase-1/ewerton-devils-advocate.md`

```markdown
## Confidence: 0.X
## Approved (proceed to checkpoint?)
## Issues
| ID | Severity | Category | Description | Suggestion |
## Must fix before implementation
## Nice to have
## Concerns
```

---

### Checkpoint 1 — Aprovar plano

**Quem gera:** Ewerton (último papel da Fase 1)

**Arquivo obrigatório:** `output/dev/checkpoint-01-brief.md` (≤300 palavras)

```markdown
# Checkpoint 1 — Plano de implementação

## O que está sendo decidido (1 frase)
<aprovar o plano de Diego ajustado pelas críticas de Ewerton>

## Resumo (≤150 palavras)
- Bullet 1: feature, complexidade, atores afetados (de Alice)
- Bullet 2: prioridade e sprint sugerido (de Bruno)
- Bullet 3: principais decisões arquiteturais (de Carla)
- Bullet 4: número de tasks e branch sugerida (de Diego)
- Bullet 5: issues críticas a corrigir antes de implementar (de Ewerton)

## Caso prático
<exemplo concreto do que muda no produto se aprovar este plano>

## Se rejeitar, o que acontece?
<volta para Carla (arquitetura) ou Diego (replanejamento), o que será refeito>

## Fontes
- `output/dev/phase-1/alice-discovery.md`
- `output/dev/phase-1/bruno-priority.md`
- `output/dev/phase-1/carla-architecture.md`
- `output/dev/phase-1/diego-plan.md`
- `output/dev/phase-1/ewerton-devils-advocate.md`
```

**Sem brief, checkpoint é inválido** — pause e gere antes.

---
```

- [ ] **Step 2: Verificar gravação**

Read tool — confirmar que Fase 1 está completa e termina com o `---` após Checkpoint 1.

- [ ] **Step 3: Sem commit ainda**

---

## Task 4: Adicionar Fase 2 completa

**Files:**
- Modify: `.claude/skills/liveaula-dev/SKILL.md` (append)

- [ ] **Step 1: Append da Fase 2**

Append ao final do arquivo (Edit ou Write completo):

```markdown
## FASE 2 — Construção

### Passo 6 — Fernanda · Implementação

**Modelo:** `claude-sonnet-4-6`

**Entrada:** plano aprovado (Checkpoint 1) + arquitetura de Carla + briefing pack.

**O que faz:** escreve código TypeScript real seguindo TDD. Despacha subagentes em ondas paralelas via Agent tool — cada subagente recebe uma task de Diego e retorna **≤200 palavras** (status, arquivos tocados, comando que validou).

**Distribuição por camada:**

**API (`apps/api/`):**
- Fastify route com schema Zod
- Prisma client query (com `select` para evitar exposição de campos)
- Middleware JWT em rotas protegidas
- Migration via `npx prisma migrate dev --name <nome>`

**Shared (`packages/shared/`):**
- TypeScript interfaces/types compartilhados entre web E mobile
- Sem dependências de runtime (apenas types puros)

**Web (`apps/web/`):**
- Next.js 14 App Router
- Server Components para data fetching (sem expor segredos)
- Client Components apenas onde há interatividade
- Tailwind alinhado com tokens do `DESIGN.md`

**Mobile (`apps/mobile/`):**
- React Native + Expo managed workflow
- Telas em `src/screens/`
- React Navigation (stack/tab)
- NativeWind ou StyleSheet
- SafeArea handling, toque mínimo 44px

**Política `cross_task_integration_required`:**
Zero TODOs cruzados entre tasks. Se task T1 produz dado que T2 consome, T2 não pode commitar com `// TODO: integrar com T1`. Deve aguardar T1 completar.

**Saída:** `output/dev/phase-2/fernanda-implementation.md` + `output/dev/phase-2/wave-log.md` (append-only).

```markdown
## Confidence: 0.X
## Summary (≤150 palavras)
## Files written
- path: descrição
## Files modified
## Migrations executed
## Subagent waves executed
- Wave 1 (paralela): [T1, T2, T3]
- Wave 2 (sequencial): [T4]
## Next step hint
## Concerns
```

---

### Passo 7 — Gabriel · Testes

**Modelo:** `claude-haiku-4-5-20251001`

**Entrada:** Fernanda + plano de Diego + DESIGN.md.

**O que faz:** roda 3 camadas de teste obrigatórias.

**API (Supertest + Jest):**
- Arquivo: `apps/api/src/__tests__/<dominio>.test.ts`
- Cobre: happy path + 1 falha esperada (4xx) + 1 edge case
- Assertions reais (não só status code — verificar payload, side effects)
- Comando: `npx jest --testPathPattern=<dominio> --forceExit`

**Web (Playwright):**
- Arquivo: `e2e/web/<feature>.spec.ts`
- Assertions de DOM (data presente na tela), não só navegação
- Comando: `npx playwright test e2e/web/<feature>.spec.ts --reporter=line --trace=on`

**Mobile (Detox):**
- Arquivo: `e2e/mobile/<feature>.test.js`
- Happy path + comportamento de notificação push (mock FCM)
- **Obrigatório iOS E Android** — não vale só um
- Comando iOS: `npx detox test e2e/mobile/<feature>.test.js --configuration ios.sim.debug`
- Comando Android: `npx detox test e2e/mobile/<feature>.test.js --configuration android.emu.debug`

**Lint + types:**
- `npx eslint apps/ packages/` (exit 0)
- `npx tsc --noEmit` (exit 0)

**Política `cross_task_integration_required`:**
```bash
grep -rE "TODO.*T[0-9]+|Disponível em breve|em outra tarefa|DEPENDÊNCIA T[0-9]+" apps/ packages/
```
Exit code != 0 → bloquear conclusão da Fase 2.

**Política `mobile_platform_parity_required`:**
Qualquer comportamento divergente iOS×Android documentado em `output/dev/phase-2/platform-notes.md`.

**Comportamento em falha:**
Se algum teste falhar, **volta para Fernanda** (re-dispatch da task) com trace/screenshot anexado. Loop limitado a 2 tentativas — depois escala para o usuário.

**Saída:** `output/dev/phase-2/gabriel-tests.md`

```markdown
## Confidence: 0.X
## All passed (boolean)
## Jest (API)
- passed: N / failed: M
- summary
## Playwright (Web)
- passed / failed
- trace path
## Detox iOS
- passed / failed
- screenshot path
## Detox Android
- passed / failed
- screenshot path
## ESLint
- passed: boolean
- issue count
## TypeScript (tsc --noEmit)
- passed: boolean
- error count
## Cross-task integration grep
- passed: boolean (exit code 0 = limpo)
## Blocking issues
## Recommendations
## Concerns
```

---

### Passo 8 — Helena · Revisão

**Modelo:** `claude-sonnet-4-6`

**Entrada:** Fernanda + Gabriel.

**O que faz:** code review focado em correctness, readability, maintainability, test coverage e best practices.

**Checks específicos do liveaula:**
- Server Components (Next.js) não vazam segredos para Client Components?
- Middleware JWT aplicado em todas as rotas protegidas?
- Queries Prisma usam `select` para não vazar campos sensíveis (`passwordHash`, `refreshToken`)?
- Toque mínimo 44px respeitado em mobile?
- SafeArea aplicado em todas as telas mobile?
- Validação Zod em todo endpoint API?

Comentários por arquivo com:
- `file`
- `line_hint`
- `severity`: blocking | suggestion | nit
- `comment`

**Overall quality:** `excellent` | `good` | `acceptable` | `needs_work` | `rejected`

**Comportamento em rejeição:**
Se `approved: false` com `blocking_issues`, volta para Fernanda corrigir.

**Saída:** `output/dev/phase-2/helena-review.md`

```markdown
## Confidence: 0.X
## Approved (boolean)
## Overall quality
## Comments
| File | Line hint | Severity | Comment |
## Blocking issues
## Positive highlights
## Concerns
```

---

### Checkpoint 2 — Aprovar build

**Quem gera:** Helena (última papel da Fase 2)

**Arquivo obrigatório:** `output/dev/checkpoint-02-brief.md` (≤300 palavras)

```markdown
# Checkpoint 2 — Build implementado

## O que está sendo decidido (1 frase)
<avançar para Fase 3 (Entrega) ou parar aqui (feature pronta para dev local, não para produção)>

## Resumo (≤150 palavras)
- Bullet 1: arquivos criados/modificados (de Fernanda)
- Bullet 2: status dos testes em cada camada (de Gabriel)
- Bullet 3: qualidade geral e issues bloqueantes (de Helena)

## Caso prático
<o que o usuário consegue fazer agora se aprovar — ex: "professor consegue registrar aula no app local">

## Se rejeitar, o que acontece?
<volta para Fernanda (corrigir issues de Helena) ou paramos aqui sem rodar Fase 3>

## Fontes
- `output/dev/phase-2/fernanda-implementation.md`
- `output/dev/phase-2/wave-log.md`
- `output/dev/phase-2/gabriel-tests.md`
- `output/dev/phase-2/platform-notes.md` (se existir)
- `output/dev/phase-2/helena-review.md`
```

---
```

- [ ] **Step 2: Verificar gravação via Read**

Confirmar que Fase 2 termina com `---` após Checkpoint 2.

- [ ] **Step 3: Sem commit ainda**

---

## Task 5: Adicionar Fase 3 completa + Encerramento

**Files:**
- Modify: `.claude/skills/liveaula-dev/SKILL.md` (append)

- [ ] **Step 1: Append da Fase 3 + Encerramento**

```markdown
## FASE 3 — Entrega

### Passo 9 — Igor · Segurança

**Modelo:** `claude-sonnet-4-6`

**Entrada:** Carla (arquitetura) + Helena (review) + Gabriel (testes) + briefing pack.

**O que faz:** auditoria contra OWASP Top 10 + LGPD Art. 14 (dados de menores).

**Checks específicos do liveaula:**

**JWT:**
- Access token expira em 15min?
- Refresh token em httpOnly cookie?
- Secret rotativo (não hardcoded)?

**Rate limiting (Fastify `@fastify/rate-limit`):**
- Aplicado em rotas de auth (`POST /auth/login`, `POST /auth/refresh`)?
- Aplicado em registro de aula (`POST /lessons`)?

**Input validation:**
- Todo endpoint tem schema Zod no request body/params/query?

**Prisma queries:**
- Uso de `select` para não vazar `passwordHash`, `refreshToken` em respostas?
- Filtros por `userId` aplicados em queries de dados privados?

**LGPD Art. 14 (dados de menores):**
- Consentimento parental explícito antes de armazenar dados do filho?
- Log de consentimento (data, IP, identificação do responsável)?
- Rota de exclusão de dados (`DELETE /users/:id/data`) implementada?

**Mobile:**
- Secrets em `expo-secure-store` (não AsyncStorage)?
- Deep links validados (sem deep link injection)?

**OWASP Top 10:**
Mapear vulnerabilidades para CWE. Severidade: `critical` | `high` | `medium` | `low` | `info`.

**Comportamento de bloqueio:**
Se `risk_level >= high`, **bloqueia deploy** e escala para o usuário.

**Saída:** `output/dev/phase-3/igor-security.md`

```markdown
## Confidence: 0.X
## Approved (boolean)
## Overall risk level
## Vulnerabilities
| CWE | Severity | Location | Description | Remediation |
## Blocking vulnerabilities
## Security positives
## LGPD checklist
- consent: ok / missing
- exclusion route: ok / missing
- minor data isolation: ok / missing
## Concerns
```

---

### Passo 10 — Lucas · Observabilidade

**Modelo:** `claude-haiku-4-5-20251001`

**Entrada:** Carla + Fernanda + briefing pack.

**O que faz:** recomenda instrumentação para a feature ser debugável em produção.

**Logging (Fastify + pino):**
- `request.log.info({...})` em pontos-chave (registro de aula, envio de push, falha de pagamento)
- **Sem PII** (sem nome de aluno, email do pai, dados sensíveis no log)
- Correlation ID em toda request

**Métricas:**
- Counters: `lessons_registered_total`, `push_notifications_sent_total`, `auth_failures_total`
- Gauges: `active_subscriptions`, `connected_websocket_clients`
- Histograms: `lesson_registration_duration_seconds` (validar requisito <30s), `api_request_duration_seconds`

**Alertas:**
- Push notification falhou >5%/min
- Lesson registration p95 >30s
- Taxa de erro 5xx >1% em janela de 5min
- Auth failures >10/min (possível bruteforce)

**Tracing:**
- Spans em `POST /lessons`: `prisma.create` → `fcm.send` → `notification.persist`
- Span em `POST /auth/login`: `bcrypt.compare` → `jwt.sign` → `refresh.persist`

**Health checks:**
- `GET /health` (liveness) — retorna 200 imediato
- `GET /ready` (readiness) — checa Prisma connection + FCM credentials

**Saída:** `output/dev/phase-3/lucas-observability.md`

```markdown
## Confidence: 0.X
## Logging recommendations
- evento: log fields
## Metrics to add
| Name | Type | Description |
## Alerts to configure
| Name | Condition | Severity |
## Tracing spans
## Health check endpoints
## Concerns
```

---

### Passo 11 — Karla · Documentação

**Modelo:** `claude-haiku-4-5-20251001`

**Entrada:** Carla + Fernanda + Helena + briefing pack.

**O que faz:** gera/atualiza documentação consumível.

**OpenAPI/Swagger (Fastify):**
- Toda rota tem `schema` com `summary`, `description`, `response` por status code
- Output em `apps/api/openapi.json`
- Validação: `npx fastify-cli generate-openapi` exit 0

**README:**
- README raiz: visão geral, como rodar localmente, link para apps específicos
- `apps/api/README.md`: setup Prisma, env vars, como rodar testes
- `apps/web/README.md`: setup Next.js, build, deploy
- `apps/mobile/README.md`: setup Expo, como buildar, EAS

**CHANGELOG.md (keep-a-changelog format):**
```markdown
## [Unreleased]

### Added
- Nova feature X (#PR)

### Changed
- Comportamento Y atualizado

### Fixed
- Bug Z corrigido
```

**Inline docs (raros):**
- Apenas onde a intenção não é óbvia
- Exemplos válidos: restrição LGPD, workaround de bug iOS específico, decisão arquitetural não-trivial
- Sem comentários explicando o óbvio (`// incrementa contador`)

**Saída:** `output/dev/phase-3/karla-docs.md`

```markdown
## Confidence: 0.X
## Changelog entry
## README sections
- file: heading: content snippet
## API docs
- endpoint: description: example
## Inline docs added
- file:line: comment
## Concerns
```

---

### Passo 12 — Julia · Deploy

**Modelo:** `claude-haiku-4-5-20251001`

**Entrada:** Carla + Fernanda + Igor + Lucas + Karla + briefing pack.

**O que faz:** gera/atualiza CI/CD + configurações de deploy.

**GitHub Actions (`.github/workflows/ci.yml`):**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: npx tsc --noEmit
      - run: npx eslint apps/ packages/
      - run: npx jest
      - run: npx playwright install --with-deps
      - run: npx playwright test
```

Mobile (Detox) só em release branches por custo.

**Deploy targets recomendados:**
- **API** → Railway (Postgres managed + Node.js auto-deploy via GitHub)
- **Web** → Vercel (Next.js otimizado, SSR/ISR nativo)
- **Mobile** → Expo EAS Build (iOS TestFlight + Android Internal Testing)

**Environment variables (lista para cada ambiente):**
- `DATABASE_URL` (Railway gera)
- `JWT_SECRET` (gerar com `openssl rand -base64 32`)
- `JWT_REFRESH_SECRET` (idem, valor diferente)
- `FCM_SERVER_KEY` (Firebase Console)
- Provider de pagamento (Pagar.me/Asaas/Stripe — TBD na product-spec)
- `EXPO_TOKEN` (Expo dashboard, para EAS Build)

**Migrations em produção:**
- `npx prisma migrate deploy` no startup do container Railway (não `migrate dev`)
- Backup automático Railway antes de cada deploy

**Rollback (procedimento manual documentado):**
1. Railway dashboard → redeploy commit anterior
2. Se migration foi aplicada e quebrou: `npx prisma migrate resolve --rolled-back <migration-name>` + revert commit

**Saída:** `output/dev/phase-3/julia-deploy.md`

```markdown
## Confidence: 0.X
## Project type
## Deployment targets
- api: railway
- web: vercel
- mobile: expo-eas
## CI workflow
- path: .github/workflows/ci.yml
- content: <yaml inline>
## Files written
## Env vars needed
| Var | Where to set | How to generate |
## Migration strategy
## Rollback procedure
## Concerns
```

---

## Encerramento da execução

Após Julia, o skill atualiza:

**1. `output/dev/state.json` — estado consolidado:**

```json
{
  "sprint_status": "concluida | bloqueada",
  "feature_name": "<nome>",
  "branch": "feat/<nome>",
  "phases": {
    "phase_1": "concluida",
    "phase_2": "concluida",
    "phase_3": "concluida | skipped"
  },
  "tests": {
    "jest_api": { "passed": 0, "failed": 0 },
    "playwright_web": { "passed": 0, "failed": 0 },
    "detox_ios": { "passed": 0, "failed": 0 },
    "detox_android": { "passed": 0, "failed": 0 }
  },
  "security": {
    "risk_level": "low",
    "blocking_count": 0
  },
  "artifacts": {
    "wave_log": "output/dev/phase-2/wave-log.md",
    "test_traces": "test-results/",
    "openapi": "apps/api/openapi.json",
    "ci_workflow": ".github/workflows/ci.yml"
  },
  "concluido_em": "<ISO>",
  "proximo": "deploy (rodar ci.yml + Railway/Vercel/EAS)"
}
```

**2. `squads/desenvolvimento/produto/liveaula/liveaula-dev/_memory/memories.md`:**

Adicionar entrada (persona Gabriela Mendes assina, mantendo continuidade do squad):

```markdown
## Execução [data ISO] — [feature name]

### Features implementadas
- [feature]: [status]

### Decisões técnicas relevantes
- [decisão]: [motivo]

### Problemas encontrados
- [problema]: [solução]

### Aprendizados
- [aprendizado para próximas execuções]

— Gabriela Mendes (Tech Lead)
```

**3. Resumo executivo ≤300 palavras** para o usuário:
- O que foi entregue
- Testes que passaram em cada camada
- Vulnerabilidades encontradas (e severidade)
- Próximo passo recomendado (deploy / nova feature / fix)

---
```

- [ ] **Step 2: Verificar via Read**

Confirmar que Fase 3 + Encerramento estão presentes.

- [ ] **Step 3: Sem commit ainda**

---

## Task 6: Adicionar regras inegociáveis e tabela de modelos

**Files:**
- Modify: `.claude/skills/liveaula-dev/SKILL.md` (append)

- [ ] **Step 1: Append das seções finais**

```markdown
## Regras inegociáveis

Para sprint ser declarada `concluida`, **todos** estes são verdade simultaneamente:

1. **Grep de integração cruzada limpo:**
   ```bash
   grep -rE "TODO.*T[0-9]+|Disponível em breve|em outra tarefa|DEPENDÊNCIA T[0-9]+" apps/ packages/
   ```
   Exit code != 0 → bloquear.

2. **Pelo menos 1 teste passou em cada camada implementada:**
   - API → Supertest+Jest passou
   - Web → Playwright passou
   - Mobile → Detox passou em **iOS E Android** (não vale só um)

3. **Lint e types limpos:**
   - `npx eslint apps/ packages/` exit 0
   - `npx tsc --noEmit` exit 0

4. **Helena (Revisão) deu `approved: true`**

5. **Igor (Segurança) NÃO bloqueou com `risk_level >= high`**

6. **`state.json` atualizado** com paths de artifacts (traces, screenshots, openapi.json, ci.yml)

7. **Squad memory atualizada** com a execução (entrada com data, decisões, aprendizados)

**Falhou um? Bloqueia. Sem exceção.**

### Política de subagentes (Fernanda)

- Retorno máximo de subagente: 200 palavras
- Subagente nunca retorna transcript completo
- Fernanda nunca executa código diretamente — sempre delega via Agent tool

### Política de checkpoints

- Checkpoint sem brief é inválido — pause e gere antes
- Brief tem formato fixo (≤300 palavras, seções obrigatórias)

---

## Modelos por papel

| # | Papel | Modelo ID | Justificativa |
|---|---|---|---|
| 1 | Alice (Descoberta) | `claude-haiku-4-5-20251001` | Output estruturado, sem raciocínio profundo |
| 2 | Bruno (Prioridade) | `claude-haiku-4-5-20251001` | Avaliação por critérios fixos |
| 3 | Carla (Arquitetura) | `claude-sonnet-4-6` | Decisão técnica complexa multi-stack |
| 4 | Diego (Planejamento) | `claude-sonnet-4-6` | Decomposição com dependências |
| 5 | Ewerton (Advogado do Diabo) | `claude-sonnet-4-6` | Crítica adversarial não-óbvia |
| 6 | Fernanda (Implementação) | `claude-sonnet-4-6` | Geração de código complexo TS |
| 7 | Gabriel (Testes) | `claude-haiku-4-5-20251001` | Parse de outputs estruturados |
| 8 | Helena (Revisão) | `claude-sonnet-4-6` | Avaliação qualitativa de código |
| 9 | Igor (Segurança) | `claude-sonnet-4-6` | Vulnerabilidades sutis |
| 10 | Lucas (Observabilidade) | `claude-haiku-4-5-20251001` | Recomendações por padrão |
| 11 | Karla (Documentação) | `claude-haiku-4-5-20251001` | Documentação por template |
| 12 | Julia (Deploy) | `claude-haiku-4-5-20251001` | YAML CI/CD por template |

**Distribuição:** 6 Sonnet (raciocínio crítico) + 6 Haiku (formato/template).

**Estimativa de economia:** ~40-50% tokens por execução vs. tudo Sonnet.

---
```

- [ ] **Step 2: Verificar via Read**

- [ ] **Step 3: Sem commit ainda**

---

## Task 7: Adicionar estrutura de saída e triângulo de delivery

**Files:**
- Modify: `.claude/skills/liveaula-dev/SKILL.md` (append final)

- [ ] **Step 1: Append final**

```markdown
## Estrutura de saída

```
output/dev/
  _briefing-pack.md           # cache key, escrito 1x
  phase-1/
    alice-discovery.md
    bruno-priority.md
    carla-architecture.md
    diego-plan.md
    ewerton-devils-advocate.md
  checkpoint-01-brief.md
  phase-2/
    fernanda-implementation.md
    wave-log.md               # append-only
    gabriel-tests.md
    platform-notes.md         # diferenças iOS/Android (se houver)
    helena-review.md
  checkpoint-02-brief.md
  phase-3/
    igor-security.md
    lucas-observability.md
    karla-docs.md
    julia-deploy.md
  state.json                  # delta append-only ao longo do pipeline

apps/api/src/__tests__/
  <dominio>.test.ts           # Supertest persiste como suite de regressão
e2e/web/
  <feature>.spec.ts           # Playwright persiste
e2e/mobile/
  <feature>.test.js           # Detox persiste
.github/workflows/
  ci.yml                      # gerado/atualizado por Julia
apps/api/
  openapi.json                # gerado/atualizado por Karla

squads/desenvolvimento/produto/liveaula/liveaula-dev/
  _memory/memories.md         ← atualizado no encerramento
```

---

## Triângulo de delivery liveaula

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
liveaula-dev                  (12 papéis em 3 fases — esta skill)
   ↓
deploy (Railway + Vercel + Expo EAS)
```

---

## Substituição

Esta skill substitui o pipeline anterior de 3 papéis (Maker/Critic/Chef). Os 3 papéis antigos foram absorvidos por:
- Maker → Diego (planejamento) + Fernanda (implementação)
- Critic → Gabriel (testes) + Helena (revisão) + Igor (segurança)
- Chef → atualização de memory/state.json no encerramento

Adicionados 9 papéis novos: Alice, Bruno, Carla, Ewerton, Lucas, Karla, Julia (e os já citados).
```

- [ ] **Step 2: Verificar via Read o arquivo completo**

Read tool sem `limit` — confirmar que SKILL.md está coerente do início ao fim, sem duplicatas, sem seções faltando.

- [ ] **Step 3: Sem commit ainda — última verificação na Task 8**

---

## Task 8: Verificar consistência, atualizar COMANDOS.md e commitar

**Files:**
- Read: `.claude/skills/liveaula-dev/SKILL.md` (completo)
- Modify: `COMANDOS.md` (se descrição precisar atualizar)

- [ ] **Step 1: Grep para garantir que não sobrou referência ao pipeline antigo**

```bash
grep -nE "Maker|Critic|Chef|3 papéis|3 papeis" "c:/Users/Ewerton/Documents/Projetos github/liveaula/.claude/skills/liveaula-dev/SKILL.md"
```

Esperado: única ocorrência de "Maker/Critic/Chef" deve estar na seção "## Substituição" (contexto histórico). Nenhuma outra menção.

Se aparecer em outros lugares: remover/ajustar.

- [ ] **Step 2: Grep para garantir paths corretos**

```bash
grep -nE "acompanha|validacao-liveaula|liveaula-validation" "c:/Users/Ewerton/Documents/Projetos github/liveaula/.claude/skills/liveaula-dev/SKILL.md"
```

Esperado: zero resultados.

Se aparecer: corrigir para `liveaula/liveaula-dev` e `liveaula-pesquisa-mercado`.

- [ ] **Step 3: Verificar referências internas consistentes**

Grep das 12 personas para confirmar que aparecem na quantidade certa:
```bash
grep -cE "Alice|Bruno|Carla|Diego|Ewerton|Fernanda|Gabriel|Helena|Igor|Lucas|Karla|Julia" "c:/Users/Ewerton/Documents/Projetos github/liveaula/.claude/skills/liveaula-dev/SKILL.md"
```

Esperado: ≥ 24 ocorrências (cada persona aparece pelo menos 2x — diagrama + seção dedicada).

- [ ] **Step 4: Atualizar COMANDOS.md se a descrição mudou**

Read `COMANDOS.md` — verificar a linha do "Dev liveaula".

Atual:
```
| Dev liveaula | `/liveaula-dev` | Implementação completa: backend, web, mobile iOS+Android, testes API + E2E web + E2E mobile |
```

Atualizar para:
```
| Dev liveaula | `/liveaula-dev` | Squad de desenvolvimento completo (12 papéis em 3 fases): planejamento → construção → entrega. Recebe handoff do liveaula-design e entrega feature implementada, testada, segura, documentada e pronta para deploy. |
```

Edit tool com a substituição.

- [ ] **Step 5: Verificação final completa**

Read tool no `SKILL.md` inteiro (sem limit) — leitura humana de coerência:
- Frontmatter ok?
- 12 papéis presentes na ordem correta?
- 2 checkpoints com brief obrigatório?
- 7 regras inegociáveis listadas?
- Tabela de modelos com 12 linhas?
- Triângulo de delivery final correto?

- [ ] **Step 6: Commit final**

Não há git neste projeto (`Is a git repository: false` no contexto inicial). Pular o commit. Em vez disso, anunciar ao usuário que a reescrita está completa.

Se git for inicializado posteriormente, o commit seria:
```bash
git add .claude/skills/liveaula-dev/SKILL.md COMANDOS.md docs/superpowers/specs/2026-04-29-liveaula-dev-skill-design.md docs/superpowers/plans/2026-04-29-liveaula-dev-skill-rewrite.md
git commit -m "feat: reescrever liveaula-dev com pipeline de 12 papéis em 3 fases"
```

---

## Critérios de aceite (validação final)

Antes de declarar a reescrita concluída, todos estes devem ser verdade:

- [ ] `.claude/skills/liveaula-dev/SKILL.md` tem frontmatter válido com `name: liveaula-dev`
- [ ] 12 papéis presentes em 3 fases na ordem correta
- [ ] 2 checkpoints com formato obrigatório
- [ ] 7 regras inegociáveis listadas
- [ ] Tabela de modelos com 12 linhas (6 Sonnet + 6 Haiku)
- [ ] Estrutura de output completa (`output/dev/phase-1/`, `phase-2/`, `phase-3/`)
- [ ] Zero referências a `acompanha`, `validacao-liveaula`, `liveaula-validation`
- [ ] Zero referências a Maker/Critic/Chef fora da seção "Substituição"
- [ ] Triângulo de delivery final lista as 3 skills (`pesquisa-mercado` → `design` → `dev`)
- [ ] `COMANDOS.md` atualizado com nova descrição
