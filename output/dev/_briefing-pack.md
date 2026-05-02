# Briefing Pack — liveaula Dev
# Gerado em: 29/04/2026 | Cache key para papéis da Fase 1-3

---

## SEÇÃO 1 — Empresa e Contexto

**Empresa:** liveaula — EdTech brasileira de acompanhamento de aulas particulares
**Produto:** Plataforma com 3 atores: professor, pai/mãe, admin
**Fase atual:** Desenvolvimento MVP (pronto para dev em 29/04/2026)
**Stack planejada:** Node.js + Fastify + Prisma + PostgreSQL + Next.js 14 + React Native + Expo

**Preferências:** Usuário: Ewerton | Idioma: Português BR | IDE: claude-code

---

## SEÇÃO 2 — Product Spec (resumo executivo)

### Atores
| Ator | Dispositivo | Papel |
|---|---|---|
| Professor | Mobile (iOS+Android) + Web | Registra aulas, gerencia alunos, convida pai |
| Pai/Mãe | Mobile + Web | Recebe notificações, acompanha filho, paga R$79/mês |
| Admin | Web interno | Gestão, métricas |

### Modelo de negócio
- Pai: R$79/mês por filho
- Professor: R$19/mês (grátis com 5+ pais pagantes)
- Comissão: R$8-15/aluno a partir do 6º

### Core loop — Registrar Aula (INEGOCIÁVEL <30s)
- 4 campos: Aluno (seleção), Matéria (seleção), Duração (chips: 45min/1h/1h30/2h), O que foi feito (≤280 chars)
- Campos opcionais: Observação ao pai, Humor do aluno (😕😐😊)
- 1 botão → push notification automática ao pai em <5s
- Smart defaults: último aluno destacado, última matéria e duração pré-selecionadas

### Stack técnica definida
| Componente | Tecnologia |
|---|---|
| Backend API | Node.js 20 + Fastify + Prisma + PostgreSQL + Zod |
| Auth | JWT (15min) + refresh httpOnly cookie (7 dias) |
| Web | Next.js 14 App Router + TypeScript + Tailwind |
| Mobile | React Native + Expo managed + TypeScript |
| Push | FCM via Expo Notifications |
| Testes | Supertest+Jest (API), Playwright (web), Detox (mobile iOS+Android) |
| Deploy | Railway (API) + Vercel (web) + Expo EAS (mobile) |
| Monitoramento | Sentry + BetterStack |
| Monorepo | apps/api/, apps/web/, apps/mobile/, packages/shared/ |
| Pagamentos | TBD: Pagar.me / Asaas / Stripe |
| Storage | Cloudinary ou S3 (fotos de perfil) |

### Riscos críticos conhecidos
- Professor vê registro como auditoria → UX centrada em benefício para ele
- LGPD Art.14: dados de menores exigem consentimento parental explícito + log
- Cold start: professor adota antes do pai pagar (fluxo de convite é ÚNICO mecanismo)

### Fora do MVP (limite rígido)
- Videochamada, chat/mensagens, upload de material, gamificação aluno, app aluno
- Marketplace público, integração escola, reconhecimento facial, agendamento pelo pai

---

## SEÇÃO 3 — Design System (tokens essenciais)

**Versão:** DESIGN.md v1.1 — aprovado 29/04/2026

### Visual
- Cor primária: #1A6B74 (teal profundo) — NÃO substituir por blue-500/green-500/amber-500
- Cor accent: #D95F3B (terracotta) — APENAS celebração/streak, nunca ação genérica
- Fontes: Plus Jakarta Sans Variable (heading) + DM Sans (body) + DM Mono (mono)
- Border-radius base: 6px (radiusMd)
- Grid: 8px base

### Modos visuais bifurcados
- **Professor/Admin light:** surface #F1F5F9 (cinza frio), text #0F172A
- **Professor/Admin dark:** surface #0D1117 (GitHub-dark), text #E6EDF3
- **Pai/Mãe (sempre light):** surface #FFFBF5 (creme quente), text #1C1917
- Gradientes aurora nos cards do pai: morning/afternoon/evening por hora da aula

### Componentes base
Button (primary/secondary/ghost/destructive) | Input | Card | Badge | Avatar
BottomSheet | Toast | StreakBadge | CelebrationOverlay | ProgressBar | NotificationPreview

### Regras invioláveis de UX
- FAB "Registrar Aula": flutua sobre TabBar, bottom=88px — NÃO mover
- Toque mínimo mobile: 44px em TODOS elementos interativos
- StreakBadge: visível SOMENTE se streak ≥ 2 dias
- CelebrationOverlay: apenas 3 triggers (firstLesson, tenthLesson, firstParent)
- Coreografia pós-envio: 4200ms exata (haptic t=200ms → close t=300ms → toast t=550ms → preview t=600ms → streak t=800ms → dismiss t=4200ms)
- LGPD M5: tela dedicada com scroll obrigatório + checkbox bloqueado até rolar

---

## SEÇÃO 4 — Handoff Manifest (design sprint concluído)

**Status:** design sprint concluído — 52 telas especificadas

### Telas geradas
- Professor Mobile: P1-P13, P16, P17 (15 telas)
- Professor Web: PW1-PW7 (7 telas)
- Pai Mobile: M1-M14, M18, M19 (16 telas)
- Pai Web: MW1-MW7 (7 telas)
- Admin Web: A1-A7 (7 telas)

### Specs disponíveis
- output/design/spec-P5-registrar-aula.md (tela hero)
- output/design/spec-telas-professor-mobile.md
- output/design/spec-telas-professor-web.md
- output/design/spec-telas-pai-mobile.md
- output/design/spec-telas-pai-web-admin.md
- output/design/web-component-specs.md (Next.js/TypeScript/Tailwind)
- output/design/mobile-component-specs.md (React Native/Expo)

### Decisões de implementação do design (não reverter)
- Web pai: mobile-first adaptado, max-w=680px centrada, SEM sidebar
- Offline professor mobile: expo-sqlite + expo-task-manager
- Push FCM: token registrado no login, atualizado quando muda
- Server Components para data fetching; Client Components apenas para interatividade
- Safe area: useSafeAreaInsets() obrigatório em toda tela mobile

---

## SEÇÃO 5 — Squad Memory (decisões passadas)

### Decisões arquiteturais relevantes
- Stack definida: Node.js + Prisma + PostgreSQL (API), Next.js 14+ (web), React Native + Expo managed (mobile iOS + Android)
- Paulo Lima (DevOps) é agnóstico de plataforma — não lock-in em Vercel (mas Vercel é ok para MVP)
- Diego Moreira (Advogado do Diabo) é o último agente antes do Checkpoint 1 — revisa tudo
- Monorepo estruturado: apps/api/, apps/web/, apps/mobile/, packages/shared/

### Anti-patterns de design (não violar)
- Não misturar contextos visuais: professor (cinza frio, alta densidade) ≠ pai (creme quente, baixa densidade)
- Gamification adulta: StreakBadge = consequência real (hábito), não pontos por clicar
- Admin Web: utilitário puro, sem gradientes aurora nem gamification

---

## SEÇÃO 6 — Escopo desta execução

**Feature solicitada:** MVP completo — implementação integral do sistema liveaula
**Entrada:** handoff-manifest.md aprovado (design sprint concluído em 29/04/2026)
**Tipo:** fullstack (API + Web + Mobile)
**Prioridade:** crítica — core do produto

**Paths do monorepo:**
```
apps/
  api/          → Fastify + Prisma + PostgreSQL
  web/          → Next.js 14 App Router
  mobile/       → React Native + Expo managed
packages/
  shared/       → TypeScript types compartilhados
```
