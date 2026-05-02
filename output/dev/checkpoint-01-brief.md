# Checkpoint 1 — Plano de Implementação MVP liveaula

## O que está sendo decidido (1 frase)
Aprovar o plano de **26 tasks** de Diego com as 6 correções críticas de Ewerton **já incorporadas**, autorizando início da Fase 2 (implementação).

---

## Resumo (≤150 palavras)

- **Feature:** MVP completo liveaula — fullstack (API + Web + Mobile), complexidade crítica, 3 atores
- **Prioridade:** Score 96/100 — caminho crítico é S1 (API core loop <30s + FCM <5s)
- **Arquitetura:** 9 models Prisma, 32 endpoints Fastify, Next.js App Router (4 route groups), Expo Router (2 segments), dual-transport JWT (cookie web + SecureStore mobile)
- **Plano:** 25 tasks em 4 sprints (~7 semanas), branch `feat/liveaula-mvp`
- **Issues críticos de Ewerton — 6 correções já aplicadas no plano:**
  1. ✅ I01: T8 não toca mais em device-token routes (ownership exclusivo T6)
  2. ✅ I02: `auth.service.register` cria `ConsentLog TERMS_OF_USE` na mesma transação
  3. ✅ I03: Middleware e `getServerSession()` usam `jose.jwtVerify()` — não jwtDecode
  4. ✅ I04: T26 nova task — lógica de gratuidade professor (cron diário)
  5. ✅ I05: `GET /students/:id` aplica `lgpdGuard` para role PARENT
  6. ✅ I07: `claimInvitation(token, parentId, parentEmail)` verifica email antes de aceitar

---

## Caso prático

Se aprovar (com as 6 correções): Fernanda inicia implementação na onda 1 com T1 (Prisma schema) + T2 (shared types) em paralelo. Em ~2 semanas: professor registra aula no mobile em <30s e pai recebe push <5s — validação do core loop. Em ~4 semanas: fluxo completo professor→convite→pai funciona do zero.

Se rejeitar: volta para Diego para replanejamento das tasks afetadas pelas correções de Ewerton (estimativa: 1-2 horas de ajuste, não refaz a arquitetura).

---

## Issues must-fix (detalhes)

| ID | Severity | Categoria | Fix |
|---|---|---|---|
| I01 | critical | correctness | T6 owner total de device-token endpoints; remover de T8 |
| I02 | critical | compliance | Adicionar `POST /consent { consentType: 'TERMS_OF_USE' }` no fluxo de registro do professor (T3) |
| I03 | critical | security | Substituir `jwtDecode` por `jose.jwtVerify()` em middleware.ts (T9) |
| I04 | critical | correctness | Criar T26: lógica de gratuidade professor (cron diário conta pais pagantes vinculados) |
| I05 | critical | compliance | Adicionar `lgpdGuard` em `GET /students/:id` e outros 2 endpoints que retornam dados de menores (T6) |
| I07 | critical | security | `claimInvitation()` verifica `body.email === invitation.parentEmail` antes de aceitar (T5) |

---

## Fontes

- `output/dev/phase-1/alice-discovery.md`
- `output/dev/phase-1/bruno-priority.md`
- `output/dev/phase-1/carla-architecture.md`
- `output/dev/phase-1/diego-plan.md`
- `output/dev/phase-1/ewerton-devils-advocate.md`
