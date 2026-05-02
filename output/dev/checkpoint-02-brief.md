# Checkpoint 2 — MVP liveaula: Build completo

## O que está sendo decidido (1 frase)
Aprovar o build MVP completo — todas as 26 tasks implementadas, 3 fixes de segurança aplicados, todos os checks TypeScript passando.

## Resumo (≤150 palavras)
- **API (T1-T8 + T26):** 32 endpoints Fastify + Prisma, dual-transport JWT, LGPD compliance, FCM push via Expo, billing professor gratuidade, webhooks Asaas, admin metrics
- **Web (T9-T17):** Next.js 14 App Router — professor, pai e admin completos. Middleware jose.jwtVerify. LGPD consent com scroll gate. Feed aurora gradient, paywall Asaas.
- **Mobile (T18-T24):** Expo Router — professor (FAB, BottomSheet <30s), pai (FlashList, push foreground/background), LGPD M5 obrigatório, deep link convite.
- **CI/CD (T25):** GitHub Actions (API tests, web build, mobile tsc), Dockerfile multi-stage, EAS build config.
- **Fixes críticos (Helena):** lgpdGuard throw pattern, webhook timing-safe sem length oracle, middleware sem bypass com refreshToken orphan.
- **Checks:** API tsc ✅ | Web build ✅ | Mobile tsc ✅ | Shared ✅

## Caso prático
Professor registra aula em <30s no mobile → FCM push ao pai em <5s → pai abre notificação → vê LessonFeedCard com gradiente aurora → subscreve R$79/mês via Asaas → professor vira FREE com 5+ pais pagantes.

## Fontes
- `output/dev/phase-1/diego-plan.md` — plano de 26 tasks
- `output/dev/checkpoint-01-brief.md` — correções críticas I01-I07
- `apps/api/src/` — implementação completa da API
- `apps/web/src/app/` — implementação completa do web
- `apps/mobile/app/` — implementação completa do mobile
