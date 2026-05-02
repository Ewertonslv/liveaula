# Bruno — Prioridade MVP | liveaula-dev Phase 1

**Data:** 29/04/2026  
**Papel:** Bruno (Prioridade)  
**Input:** product-spec.md v1.0 + DESIGN.md v1.1 + handoff-manifest (liveaula-design)

---

## Confidence: 0.92

Confiança muito alta. O product-spec é claro, o design está completo com 52 telas especificadas, e o squad tem memória de decisões críticas já validadas. O risco maior é cronograma de infra (Pagar.me/Asaas/Stripe integration), não escopo de produto.

---

## Priority

**Level:** CRITICAL  
**Score:** 96/100

Este é um MVP de **go-to-market dependente de cold-start**. O produto não funciona se o professor não conseguir convidar o pai em < 2 minutos, e não vale a pena se o pai não recebe notificação push em < 5 segundos. Portanto, as prioridades são invertidas de um típico EdTech: Core loop (P5 Registrar Aula) > Auth > Onboarding > Pagamento.

---

## Suggested Sprint

### Sprint 1 (Semanas 1–2): Foundation + Core Loop — Entrega de risco mínimo

**Objetivo:** Validar que o registro de aula <30s funciona e push chega em <5s.

**Implementação (em paralelo):**

#### API (backend)
1. **Autenticação JWT** (Oscar)
   - Endpoints: POST `/auth/register`, POST `/auth/login`, POST `/auth/refresh`
   - Modelos: User (professor), User (pai) — mesma tabela, enum `role`
   - Zod schemas: validateRegister, validateLogin
   - Refresh tokens em httpOnly cookie (7 dias)
   - Testes: Supertest E2E para login/logout/refresh
   - **Critério de aceitação:** JWT decode válido após login; refresh retorna novo access token

2. **Modelo Prisma — Core (Alice)**
   - Entidades: User, Student, Class, Invitation
   - Relations: Professor 1→N Students, Student 1→N Classes, Parents M→N Students (via StudentParent)
   - LGPD fields: User.gdprConsent (boolean), User.gdprConsentDate (timestamp)
   - Indices: User.email (unique), Class.studentId + Class.createdAt (for feed queries)
   - Migrations: `001_initial_schema.sql`
   - **Critério de aceitação:** `prisma migrate dev` limpa; introspection válida

3. **Endpoint POST /classes** (Alice)
   - Request: { studentId, subject, duration, whatWasDone, observation?, emotion? }
   - Validation com Zod: 4 obrigatórios, 2 opcionais, whatWasDone max 280 chars
   - Response: { id, createdAt, notification: { sentAt?, status } }
   - Lógica: atomicidade (salvar + enviar FCM em transação)
   - Testes: Supertest com dados válidos + inválidos + race condition
   - **Critério de aceitação:** POST retorna 201 em <200ms; response contém preview completo

4. **Modelo FCM no backend** (Oscar)
   - Integração Expo.Server.Notifications ou Firebase Admin SDK
   - Tabela: ParentDeviceToken (parentId, token, isValid, lastVerified)
   - Função: sendPushToParent(parentId, classData) → { messageId, sentAt, error? }
   - SLA: envio em <2s após POST /classes (antes de responder ao cliente)
   - Retry logic: 1x se timeout <3s; falha silenciosa (não bloqueia registro)
   - Testes: Mock Expo server; validar payload shape (title, body, data)
   - **Critério de aceitação:** Notificação recebida em device real em <5s; teste E2E com Firebase Emulator

#### Web — Professor (Diego)
1. **Onboarding mínimo** (telas O1–O3)
   - O1: Signup (email, senha, validação Zod)
   - O2: Perfil (nome, foto, matérias — select de 20 pré-definidas)
   - O3: Confirmar + redirect para Dashboard
   - Dados salvos no localStorage **durante onboarding** (não esperar servidor)
   - Lógica: POST /auth/register após O3 completo
   - Estilo: high-density, light mode, Plus Jakarta Sans 16px caption
   - Testes: Playwright E2E (signup → dashboard vazio)
   - **Critério de aceitação:** O1-O3 em <2 min, email válido, foto upload opcional

2. **Dashboard professor** (tela D1)
   - Grid/lista de alunos: [Avatar + Nome + "Aula hoje?" badge + "Última aula há Xd" + "Sem pai"]
   - Ações inline: [Registrar aula] (navega para P5), [Convidar pai] (popover com link copiável), [Ver histórico] (placeholder)
   - Estados: vazio (> 0 alunos esperados após O3), 1–3 alunos, 5+
   - Busca: input com filtro real-time
   - Dados: GET /me/students (autenticado com JWT)
   - Testes: Playwright (load, busca, clickthrough para P5)
   - **Critério de aceitação:** D1 renderiza em <1s; busca filtra em real-time; [Registrar aula] navega para P5

3. **P5 — Registrar Aula** (tela mais crítica)
   - Formulário: [Aluno dropdown] [Matéria dropdown] [Duração select] [O que foi feito textarea 280ch] [obs opcional] [emoji rápido]
   - Smart defaults: último aluno destacado, última matéria/duração pré-selecionados
   - Validação inline (Zod): obrigatoriedade, whatWasDone max 280
   - Botão: [Enviar] → loading state + confirmação com Notification Preview (preview do iOS-style)
   - Tempo máximo (UX): <30s do clique até vazio + confirmation toast
   - Testes: Playwright (preenche em <30s, submete, ve preview)
   - **Critério de aceitação:** Form valida < 30s; submissão com preview; toast "Aula registrada"

#### Mobile — Professor (Mateo)
1. **Onboarding mínimo** (O1–O3 móvel)
   - O1: Email + senha (TextInput + validação inline)
   - O2: Avatar (foto via camera/library) + nome + matérias (multi-select)
   - O3: Confirmar
   - Flow: stack nav O1 → O2 → O3 → Dashboard (pop to root)
   - Tema: modo escuro suportado (useColorScheme), light como padrão durante onboarding
   - Testes: Detox (signup → D1)
   - **Critério de aceitação:** O1-O3 completo em <3 min; foto salva em device

2. **Dashboard professor** (D1 móvel)
   - List de alunos (FlatList): [Avatar 32px] [Nome + status badge] [> ícone]
   - FAB flutuante: [+] → P5 BottomSheet
   - Pull-to-refresh: GET /me/students
   - Vazio state: "Adicione o primeiro aluno para começar"
   - Tema: dark mode automático baseado em system
   - Testes: Detox (scroll, FAB tap, pull-refresh)
   - **Critério de aceitação:** FAB em bottom=88px (acima tab); lista renderiza <1s; dark mode muda com system

3. **P5 — Registrar Aula** (BottomSheet)
   - Estrutura: handle + título "Registrar aula" + form (campos em seção)
   - Campos: [Aluno button-select] [Matéria pill-select] [Duração segmented] [Textarea] [obs checkbox] [emoji button-row]
   - Keyboard: iOS behavior=padding, Android adjustResize via app.json
   - Submit: [Registrar] → loading → haptic.success → BottomSheet fecha → preview + toast
   - Dark mode: surface-raised-dark, text-dark (tokens)
   - Testes: Detox (open → preenche → fecha com confirmação)
   - **Critério de aceitação:** BottomSheet anima com spring.modal; form valida; confirmação haptic + toast

#### Infra + DevOps (Paulo)
1. **Banco PostgreSQL** (Railway ou managed)
   - 1 database liveaula_dev + backup automático
   - Conexão: DATABASE_URL com sslmode=require (TLS obrigatório)
   - Seed inicial: 5 professores teste + 10 alunos + 20 classes dummy
   - Monitoring: basic postgres health check
   - **Critério de aceitação:** `psql` conecta; schema migra sem erro; seed populada

2. **API deploy — Railway**
   - Dockerfile: Node 20 + Prisma + Fastify
   - Env vars: DATABASE_URL, JWT_SECRET, FCM_KEY, ENVIRONMENT=dev
   - Health endpoint: GET /health → { status: "ok", timestamp }
   - Logging: Pino JSON estruturado
   - **Critério de aceitação:** `railway up` deploya; health endpoint responde; API acessível via HTTPS

3. **Expo Firebase Cloud Messaging** (setup)
   - Projeto Firebase criado, `google-services.json` + `GoogleService-Info.plist` prontos
   - `expo-notifications` instalado no monorepo
   - Variáveis: EXPO_FCM_PROJECT_ID, EXPO_FCM_PRIVATE_KEY (secrets em Railway)
   - Teste: envio manual via Firebase Console antes de E2E
   - **Critério de aceitação:** notificação chega em device real; payload contém title + body + data

#### QA
- **E2E Flow 1 (Professor):** O1-O3 (web) → D1 → P5 (mobile) → registra aula → vê toast
- **E2E Flow 2 (Notificação):** P5 envia POST /classes → API → FCM → device pai (mock) recebe push em <5s
- **Testes unitários:** Auth (JWT decode), Zod validation, push retry logic (no-op se device token inválido)
- **SLA validation:** <30s P5 fill time (Playwright timeline), <5s push latency (Firebase logs)

### Sprint 2 (Semanas 3–4): Convite + Trial + Payment — Completar MVP

**Objetivo:** Fechar cold-start (convite professor→pai funciona) e pagamento (primeira cobrança).

#### API
1. **Invitation model + endpoint** (Oscar)
   - Model: Invitation (professorId, parentEmail, studentId, token (unique, 32 bytes), expiresAt (7 dias), claimedAt?)
   - POST /invitations → { parentEmail, studentId } → Response { inviteLink }
   - GET /invitations/{token} → validar token, retornar student + professor + subject (pré-preenchido no onboarding pai)
   - Validação: email válido, token não expirado, student pertence a professor
   - Testes: token expiration, email validation
   - **Critério de aceitação:** link funcionável; validação rigorosa; expiration em 7 dias

2. **Pagamento — Asaas/Pagar.me/Stripe** (Alice)
   - Integração elegida: avaliar suporte a recorrência em BR (Asaas ou Pagar.me preferível)
   - Modelo: Subscription (parentId, studentId, planId, externalSubscriptionId, status, nextBillingDate)
   - Webhook: POST /webhooks/payment → { subscriptionId, status, failureReason? }
   - Trial: parentId com TrialStartDate + 7 dias de acesso sem cartão
   - Teste: mock payment SDK; simular webhook de sucesso/falha
   - **Critério de aceitação:** primeira cobrança R$79/mês após trial; webhook atualiza DB; recurring funciona

3. **Endpoint GET /me/students/{id}/classes** (Alice)
   - Retorna histórico de aulas paginado (limit=10, cursor-based)
   - Campos: id, createdAt, subject, duration, whatWasDone, observation, emotion
   - Autenticação: pais veem apenas se Parent vinculado a Student
   - Ordenação: DESC createdAt
   - Teste: Supertest (pagination, unauthorized access bloqueado)
   - **Critério de aceitação:** histórico retorna em <500ms; paginação funciona

#### Web — Pai/Mãe (Diego)
1. **Onboarding pai via convite** (M1–M4)
   - M1: Email já pré-preenchido (do token), cria senha
   - M2: Foto do filho, nome, série, matéria (pré-selecionada do invite)
   - M3: LGPD Art.14 — scroll obrigatório + checkbox
   - M4: Trial 7 dias — "Comece a acompanhar grátis" + CTA para primeiro acesso
   - Fluxo: convite clicado → M1-M4 → Feed vazio (sem aulas ainda)
   - Testes: Playwright (full flow com token válido + expirado)
   - **Critério de aceitação:** LGPD tela aparece; trial começa após M4; usuário salvo com role='parent'

2. **Feed pai** (tela F1)
   - Timeline de aulas do filho: Card format [Avatar prof 32px] [Nome prof — Prof. João] [Matéria + duração] [Conteúdo (max 3 linhas)] [😊 emotion] [obs destaque se houver]
   - Gradiente aurora baseado na hora: morning/afternoon/evening
   - Vazio state: "Primeira aula do seu filho em breve 🎓"
   - Paginação: infinite scroll (10 aulas por página)
   - Refetch: pull-to-refresh
   - Testes: Playwright (load, scroll, card tap → detalhe)
   - **Critério de aceitação:** F1 carrega em <1s; cards renderizam com gradiente; scroll smooth

3. **Detalhe de aula** (tela F2)
   - Full card: professor (avatar lg + nome + matéria), duração, data/hora, conteúdo completo, obs completa, emotion
   - Ações: [Voltar], [Compartilhar] (WhatsApp/email — fora do MVP, placeholder)
   - Tema: light sempre (modo pai é emocional, não segue system)
   - Testes: Playwright (clica card F1 → F2 → voltar)
   - **Critério de aceitação:** F2 mostra dados completos; back funciona; compartilhar desabilitado (future)

4. **Assinatura** (tela S1)
   - Exibição: plano atual (trial 7 dias restantes OU active subscription), próxima cobrança
   - Ação: [Ir para pagamento] → modal Asaas/Pagar.me iframe
   - Histórico: últimas 3 cobranças (data, valor, status)
   - Card on file: [Trocar cartão] → modal payment update
   - Testes: Playwright (exibe trial counter, display-only durante trial, ativa payment após trial expirar)
   - **Critério de aceitação:** trial date exibida; pagamento ativável após trial; histórico mostra 3 últimas

#### Mobile — Pai/Mãe (Mateo)
1. **Onboarding pai** (M1–M4 mobile)
   - M1: Email pré-preenchido, cria senha (keyboard dismiss)
   - M2: Avatar filho (camera/library) + nome + série + matéria (multi-select)
   - M3: LGPD scroll obrigatório (BottomSheet com scroll detector)
   - M4: Confirmar trial → Feed vazio
   - Tema: light sempre
   - Testes: Detox (flow completo com token)
   - **Critério de aceitação:** M3 LGPD bloqueia próximo até scroll reach bottom; M4 leva ao Feed

2. **Feed pai** (F1 mobile)
   - FlatList de cards (50% width em tablet, full width em mobile)
   - Cada card: gradiente aurora + info de aula + swipe left (future share)
   - Paginação: renderiza mais 10 ao chegar no fim
   - Tema: light
   - Testes: Detox (scroll, card tap, pull-refresh)
   - **Critério de aceitação:** F1 renderiza <1s; scroll smooth; tap navega para F2

3. **Detalhe aula pai** (F2 mobile)
   - Modal stack ou full-screen (decision: stack com swipe-down dismiss)
   - Conteúdo: mesmo F2 web + botão [Voltar] ou swipe-down
   - Tema: light
   - Testes: Detox (abrir F2, fechar com swipe, fechar com botão)
   - **Critério de aceitação:** F2 anima com spring.modal; swipe-down funciona

4. **Assinatura** (S1 mobile)
   - Bottom tab: [Assinatura] → S1
   - Layout: coluna centrada, trial counter em destaque (creme + teal)
   - Botão: [Renovar] (se trial expirado) → modal payment iframe
   - Histórico: scroll abaixo
   - Testes: Detox (exibe trial, countdown, payment button)
   - **Critério de aceitação:** trial exibido, payment ativável post-trial, histórico visível

#### Admin (web, skeleton)
1. **Dashboard admin** (A1)
   - Tabela: Professores (email, #students, #parents, trial status, ação: activate/deactivate)
   - Tabela: Pais (email, #children, subscription status, próxima cobrança, ação: refund/suspend)
   - Métricas topo: DAU, MAU, churn (placeholder apenas)
   - Testes: Playwright (load tabelas, sort por coluna — future)
   - **Critério de aceitação:** A1 carrega dados reais; lista professores + pais; colunas críticas visíveis

#### QA
- **E2E Flow 3 (Cold Start):** Professor D1 → convidar pai → link gerado → Pai M1-M4 → Feed vazio → professor registra aula → pai vê em Feed
- **E2E Flow 4 (Pagamento):** Pai trial expirado → S1 → [Renovar] → pagamento webhook → subscription ativa
- **SLA:** Push <5s (já testado S1), signup <3min (Playwright), cold-start completo <10min E2E
- **Regressão:** all S1 flows (auth, P5, F1) continuam validando

---

## Rationale

### Por que essa sequência?

**Sprint 1 foca em "pode o professor registrar em <30s?"** — esse é o risco #1. Se esse core loop não funcionar, nada mais importa. Além disso, Sprint 1 testa:
- JWT/Auth (blocker para todos os outros endpoints)
- Infra (BD, API, FCM) — sem isso, nada roda
- Notificação <5s (SLA técnico não-negociável)

**Sprint 2 fecha a viabilidade comercial** — convite professor→pai (único modelo de crescimento) e pagamento (monetização). O vai-ou-não-vai é "conseguimos processar cobranças?" e "pai consegue entrar sem ajuda?"

### Por que não fazer Admin primeiro?
Admin é **interno e desacoplado**. Pode ser uma simple interface read-only até S3. Não bloqueia teste de usuário.

### Por que não fazer Agenda/Relatório no MVP?
Product-spec marca como Should-have, e Sprint 2 já tem payload pesado (convite + payment). Histórico filtrado (H1) é consulta GROUP BY matéria/período—pode vir em S1 com query simples. Agenda (calendário) e Relatório (PDF) são S2+.

### Paralelização (4 streams independentes)
- **API:** Alice + Oscar = 2 pessoas em 2 semanas = 8 story-points viáveis
- **Web Prof + Pai:** Diego = 1 pessoa em 2 sprints (Sprint 1 Prof light, Sprint 2 Pai light + S1)
- **Mobile Prof + Pai:** Mateo = 1 pessoa em 2 sprints (Sprint 1 Prof mobile, Sprint 2 Pai mobile + S1)
- **Infra:** Paulo = < 5 days em S1, after that observabilidade (< 1 day/week)

Nenhum gargalo crítico na sequência.

---

## Dependencies

### Ordem rígida (must-have)
1. **API Auth** (JWT) → tudo mais (web/mobile depentem de /login)
2. **API POST /classes** + FCM → mobile P5 + web P5 (core loop)
3. **API GET /me/students** + feed render → feed pai (S2)
4. **Invitation model** → onboarding pai (S2)
5. **Payment SDK** → S1 subscription (S2)

### Ordem flexível (paralelo)
- Web + Mobile podem desenvolver simultaneamente (mesmos endpoints)
- Admin é pure read-only até S3 (nenhuma blocker)
- Dark mode professor pode ser refatorado em S3 (não é blocker de MVP)

### Shared
- **Design tokens** (`packages/shared/design-tokens.ts`) — requerido no dia 1 de S1 (tanto web quanto mobile)
- **Zod schemas** (`packages/shared/schemas.ts`) — requerido no dia 1 (API validation)
- **FCM payload shape** — alinhado com DESIGN.md P5 confirmation flow

---

## Risks

### Cronograma (impacto: CRÍTICO)

| Risco | Probabilidade | Mitigação |
|---|---|---|
| **Integração FCM latência >5s** | Média (10%) | Teste dia 3 S1 com device real; se falhar, debugar imediatamente. Firebase Emulator pode mentir. |
| **Pagar.me/Asaas webhook não entra** | Alta (25%) | Escolher provider no dia 1 S1; setup webhook + ngrok local antes de S2. Testar 3x antes de produção. |
| **Prisma migration conflict** | Baixa (5%) | Seed limpa + rollback script prontos. Testar migração em staging antes de produção. |
| **Dark mode professor chrome rendering bug** | Baixa (3%) | Pode atrasar S3, não S1. Prototipo rápido em S1, pode ignorar por hora. |
| **React Native memory leak em FlatList** | Baixa (5%) | Usar `removeClippedSubviews={true}`, `initialNumToRender=5` no feed. Teste com 1000 itens em S1. |

### Técnico (impacto: MÉDIO)

| Risco | Causa | Mitigação |
|---|---|---|
| **LGPD Art.14 compliance insuficiente** | Advogado do Diabo (Diego) pode rjeitar M3 em S2 | Ler Art.14 completo antes de S2. Consulta com DPO (definir quem é) antes de S1 fim. |
| **Push notification não chega em iOS** | APNs setup (expo-notifications + Apple Developer Program) | Testar em device real iOS no dia 1 S1. Se falhar, dar 1 dia inteiro de debugging. |
| **Cold-start atrito na hora (professor não consegue copiar link)** | UX do convite confusa | Prototipar P5 convite em S1, testar com 2 professores antes de S2. |

### Comercial (impacto: ALTO, mas fora do escopo de dev)

| Risco | Causa | Mitigação |
|---|---|---|
| **Preço R$79/mês sem validação WTP** | Product-spec diz "testar com primeiros 20 pais" | Não é tarefa do dev, mas: cobança deve ser <1s (rápida), falha silenciosa se gateway down (não perde aula). |
| **Professor já resolve com WhatsApp** | Competição imediata | Fora do escopo dev, mas: P5 deve ser <30s OU pai não vai usar. Medir tempo real com e2e. |

---

## Concerns

### UX/Produto

1. **Convite professor→pai é passo crítico** — se gerar link URL longo ou QR code confuso, cold-start quebra. Design do convite (UI) deve ser testado com usuário real no fim de S1. Sugestão: button [Convidar pai] → modal com link + copy button (não QR code, muito step).

2. **LGPD Art.14 M3 tela** — spec diz "scroll obrigatório", mas qual é a altura mínima do conteúdo para scroll ser útil? Se o texto caber em <1 tela, scroll obrigatório vira UX ruim. Decisão: conteúdo deve ter mínimo 800px altura, forçando scroll até "Li e concordo" vazar para fora de viewport.

3. **Trial 7 dias UI ambígua** — pai vê "Aulas disponíveis: 7 dias restantes" mas não entende se é contagem regressiva ou absoluta. Sugestão: mudar para "Teste gratuito expira em 3/5 às 14h" (data/hora absoluta), mais claro que "6 dias restantes".

4. **Notification preview (P5 confirmação)** — spec diz "iOS-style dark iMessage skin", mas isso **não renderiza igual em Android**. Decisão: usar skin universal (white card + primária text) que funciona nos dois. Ou fazer skin condicional (iOS dark, Android light). Spec não deixa claro.

### Técnico

1. **Offline professor mobile** — spec menciona em memories.md "aula nunca se perde por falta de rede" (expo-sqlite), mas isso não está no product-spec nem no DESIGN.md. Sugestão: **não implementar offline em S1** — usar online-only com alert "Sem conexão, tente novamente". Offline é S2+ (complexidade alta: sync, conflict resolution, offline queue).

2. **Push FCM token rotation** — quem atualiza o token quando device muda? Spec diz "registrado no login e atualizado quando muda", mas "quando muda" é vago. Sugestão: atualizar token em `onAppStateChange('active')` e `useEffect` + `expo-notifications.getInitialNotificationAsync()`.

3. **Payment refund flow** — spec não menciona refunds. Se pai cancela assinatura em dia 5/7 de trial, ganha refund ou perde acesso imediatamente? Decisão deve ser tomada com PM antes de S2. Por enquanto: assume-se "cancela = acesso vira view-only imediatamente" (sem refund).

4. **Admin permissioning** — quem pode usar A1? Spec diz "admin (interno, web)" mas não descreve auth. Sugestão: usar JWT também, com role='admin' (enum User.role). Proteger GET /admin/* com middleware de role check.

### Dependências Externas

1. **Firebase Project não criado ainda** — spec diz "setup), mas deve ser feito **antes de S1 dia 1**. Responsável: Paulo. Bloqueia Mateo (mobile) até que `google-services.json` exista.

2. **Pagar.me / Asaas SDK** — deve ser escolhido no **dia 1 S2**. Asaas parece melhor para BR (PIX + boleto suportados). Não esperar até S2 para explorar—Paulo deve fazer proof-of-concept em paralelo durante S1.

3. **Apple Developer Program + APNs** — requerido para iOS. Pode ser caro (US$99/ano) e levar dias para setup. Sugestão: começar no dia 1 S1, antes de começar mobile iOS.

---

## Concerns (Observações Adicionais)

### Sobre Memória do Squad

A memória.md é **extremamente valiosa** — lista decisões que não devem ser revertidas (cor primária, spring physics, <30s constraint). Qualquer agente em S1 que questionar "por que teal e não blue?" deve receber esta memória como resposta. **Não abra decisões de design já validadas.**

### Sobre Alice & Oscar Dupla

Product-spec foi feito pensando em **um** backend (Alice), mas também tem Zod, autenticação (Oscar), pagamento (Alice). Sugestão: Oscar foca em **Auth + JWT + refresh**, Alice em **Models + Endpoints + Payment**. Menos context-switching.

### Sobre Diego Web

Web pai é **radicalmente diferente** de web professor (baixa densidade vs alta densidade, light-only vs dark suportado). Sugestão: criar pasta `apps/web/src/app/pai` separada com layout próprio, não tentar share components de professor. Mesmo que pareça DRY-violation, é melhor que ajustar 50 componentes de professor depois.

### Sobre Mateo Mobile

Mobile tem **2 fluxos completamente distintos** (professor dark mode vs pai light mode). Sugestão: usar conditional rendering `role === 'professor' ? <ProfessorNav /> : <ParentNav />` no root App.tsx, não tentar unificar se não puder.

### Sobre SLA Push <5s

Isso é **métrica de sucesso do MVP**. Recomendação: criar dashboard observabilidade que plota latência média de push vs timestamp de POST /classes. Se média >5s, isso é crítico para S1 completado. Firebase Logs + Pino timestamps permitem medir isso sem instrumentation adicional.

### Sobre Confeti (CelebrationOverlay)

DESIGN.md especifica "apenas 3 triggers" (firstLesson, tenthLesson, firstParent). **Não deixar confeti aparecer em toda confirmação** — isso esvazia de sentido. Recomendação: criar enum TriggerType = 'FIRST_LESSON' | 'TENTH_LESSON' | 'FIRST_PARENT', usar flag no modelo para rastrear isso.

---

## Conclusão

**MVP é viável em 4 semanas** com 4 devs paralelos (Oscar + Alice + Diego + Mateo) + Paulo infra. O caminho crítico é:

1. S1 semana 1: API auth + models + POST /classes + FCM (3 dias), web/mobile D1 + P5 (7 dias em paralelo)
2. S1 semana 2: E2E testing + refinamento P5 <30s
3. S2 semana 3: Convite + onboarding pai (3 dias), payment (2 dias)
4. S2 semana 4: E2E cold-start + refinamento, release para beta testing

**Confidence: 92%** porque as únicas incógnitas são integração (FCM, pagamento), que podem ser debugadas isoladamente. O produto é claro, o design é pronto, o stack é estável.

---

**Próximos passos:**
- Ler este arquivo (Bruno) no kickoff S1 (espalhar alinhamento de risco)
- Criar issues JIRA/Linear por Sprint usando este documento como baseline
- Schedule S1 kickoff: segunda-feira, 30/04/2026, 10h — todo squad presente
