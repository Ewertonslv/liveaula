# Diego — Plano de Tarefas Atômicas MVP | liveaula-dev Phase 1

**Data:** 29/04/2026
**Papel:** Diego (Planejamento)
**Input:** carla-architecture.md (29/04/2026) + alice-discovery.md + bruno-priority.md

---

## Confidence: 0.92

Alta confiança. A arquitetura de Carla é coerente e sem ambiguidades de dependência. As 25 tarefas seguem grafo acíclico dirigido (DAG) rigoroso — cada task tem todas as suas dependências satisfeitas antes de iniciar. Os 3 concerns bloqueantes de Carla (refresh dual-transport, LGPD guard, isolamento multi-professor) foram traduzidos em critérios de acceptance concretos e mensuráveis. Único risco residual: integração Asaas (T7) tem dependência de conta sandbox que precisa ser provisionada antes do sprint.

---

## Branch name

```
feat/liveaula-mvp
```

---

## Estimated tasks

**25 tasks em 4 sprints**

| Sprint | Tasks | Tema |
|---|---|---|
| S1 (semanas 1-2) | T1–T8 | API completa + infra de dados |
| S2 (semanas 3-4) | T9–T17 | Web completa |
| S3 (semanas 5-6) | T18–T24 | Mobile completa |
| S4 (semana 7) | T25 | CI/CD + observabilidade |

---

## Tasks

---

### T1: Prisma schema + migrations iniciais + seed

- **type:** migration
- **files:**
  - `apps/api/prisma/schema.prisma` (criar)
  - `apps/api/prisma/migrations/001_initial_schema/migration.sql` (criar)
  - `apps/api/prisma/migrations/002_students_and_lessons/migration.sql` (criar)
  - `apps/api/prisma/migrations/003_invitations/migration.sql` (criar)
  - `apps/api/prisma/migrations/004_subscriptions_payments/migration.sql` (criar)
  - `apps/api/prisma/seed.ts` (criar)
  - `apps/api/package.json` (criar)
  - `apps/api/tsconfig.json` (criar)
  - `apps/api/.env.example` (criar)
  - `package.json` (raiz, pnpm workspaces)
  - `pnpm-workspace.yaml` (criar)
  - `.npmrc` (criar — `shamefully-hoist=true` para Expo compat)
- **dependencies:** nenhuma
- **acceptance:** `cd apps/api && npx prisma migrate dev --name initial && npx prisma db seed && npx prisma studio --browser none 2>&1 | grep -i "server running"`
- **description:**
  Criar o schema Prisma conforme especificado em carla-architecture.md, com todos os 10 models: `User` (Role enum: PROFESSOR/PARENT/ADMIN), `Subject`, `Student`, `StudentParent`, `Lesson`, `Invitation`, `Subscription`, `Payment`, `DeviceToken`, `ConsentLog`. Enums obrigatórios: `Role`, `InvitationStatus` (PENDING/CLAIMED/EXPIRED), `SubscriptionStatus` (TRIAL/ACTIVE/PAST_DUE/CANCELLED/SUSPENDED), `LessonEmotion` (GREAT/GOOD/NEUTRAL/DIFFICULT/CHALLENGING), `ConsentType` (LGPD_PARENTAL_ART14/TERMS_OF_USE/PRIVACY_POLICY).

  Migrations em 4 arquivos separados (não mesclar — facilita rollback): `001` cobre User+Subject+DeviceToken+ConsentLog; `002` cobre Student+StudentParent+Lesson; `003` cobre Invitation; `004` cobre Subscription+Payment.

  Seed deve criar: 20 subjects (Matemática, Português, Física, Química, Biologia, História, Geografia, Inglês, Artes, Educação Física, Redação, Literatura, Filosofia, Sociologia, Informática, Música, Espanhol, Francês, Libras, Robótica), 5 professores de teste (professor1@test.com até professor5@test.com, senha: `Test@1234`), 10 alunos (2 por professor), 20 aulas dummy (2 por aluno), 1 admin (`admin@liveaula.com`, senha: `Admin@secure1`).

  Configurar `package.json` raiz com `pnpm workspaces` apontando para `apps/*` e `packages/*`. Adicionar scripts: `dev`, `build`, `test`, `lint` em cascata via `--filter`. `.env.example` deve listar: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ASAAS_API_KEY`, `ASAAS_WEBHOOK_TOKEN`, `FCM_SERVER_KEY`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `NODE_ENV`.

---

### T2: Shared types (packages/shared/)

- **type:** shared-type
- **files:**
  - `packages/shared/package.json` (criar — `@liveaula/shared`)
  - `packages/shared/tsconfig.json` (criar)
  - `packages/shared/src/types/user.ts` (criar)
  - `packages/shared/src/types/lesson.ts` (criar)
  - `packages/shared/src/types/student.ts` (criar)
  - `packages/shared/src/types/invitation.ts` (criar)
  - `packages/shared/src/types/subscription.ts` (criar)
  - `packages/shared/src/types/consent.ts` (criar)
  - `packages/shared/src/types/pagination.ts` (criar)
  - `packages/shared/src/schemas/auth.schema.ts` (criar)
  - `packages/shared/src/schemas/lesson.schema.ts` (criar)
  - `packages/shared/src/schemas/student.schema.ts` (criar)
  - `packages/shared/src/schemas/invitation.schema.ts` (criar)
  - `packages/shared/src/schemas/consent.schema.ts` (criar)
  - `packages/shared/src/design-tokens.ts` (criar)
  - `packages/shared/src/index.ts` (criar — re-export tudo)
- **dependencies:** [T1]
- **acceptance:** `cd packages/shared && npx tsc --noEmit && node -e "const s = require('./src/index.ts'); console.log(Object.keys(s).length > 5 ? 'OK' : 'FAIL')"`
- **description:**
  Implementar todos os tipos e schemas compartilhados sem dependências de runtime (apenas TypeScript + Zod).

  **Tipos obrigatórios** (exatamente como em carla-architecture.md):
  - `user.ts`: `UserRole = 'PROFESSOR' | 'PARENT' | 'ADMIN'`, `UserPublic` (id, email, name, role, avatarUrl, bio, isActive, createdAt: string ISO 8601)
  - `lesson.ts`: `LessonEmotion`, `Lesson`, `LessonListItem` (com professor e subject aninhados), `CreateLessonInput` (durationMin como union literal 15|30|45|60|90|120)
  - `student.ts`: `Student`, `CreateStudentInput`, `UpdateStudentInput`
  - `invitation.ts`: `InvitationStatus`, `Invitation`, `InvitationPublic` (sem professorId interno)
  - `subscription.ts`: `SubscriptionStatus`, `Subscription`, `Payment`
  - `consent.ts`: `ConsentType`, `ConsentLog`
  - `pagination.ts`: `CursorPageMeta` (nextCursor: string|null, hasMore, total?), `CursorPage<T>`

  **Zod schemas** — cada schema deve usar `.strict()` para rejeitar campos extras:
  - `auth.schema.ts`: `registerSchema` (email, password min 8 max 72, role, inviteToken?), `loginSchema`
  - `lesson.schema.ts`: `createLessonSchema` com `.max(280)` em `whatWasDone` e `.max(500)` em `observation`; `listLessonsQuerySchema` (cursor?, limit? default 10 max 50, studentId?, subjectId?, from?, to?)
  - `student.schema.ts`: `createStudentSchema` (name min 2 max 100, gradeLevel, subjectId cuid, avatarUrl? url), `updateStudentSchema` (todos opcionais)
  - `invitation.schema.ts`: `createInvitationSchema` (studentId cuid, parentEmail email)
  - `consent.schema.ts`: `consentSchema` (consentType ConsentType enum, version string)

  **design-tokens.ts**: exportar `colors` (primary, accent, professor, parent, admin), `spacing` (touchTarget: 44, fabBottom: 88), `typography` (fontFamily: 'Plus Jakarta Sans' para professor, 'Nunito' para parent, 'Inter' para admin).

---

### T3: API Auth (register/login/refresh/logout) + testes Supertest

- **type:** api-endpoint
- **files:**
  - `apps/api/src/server.ts` (criar)
  - `apps/api/src/app.ts` (criar — Fastify app factory)
  - `apps/api/src/plugins/prisma.ts` (criar)
  - `apps/api/src/plugins/jwt.ts` (criar)
  - `apps/api/src/plugins/rateLimit.ts` (criar)
  - `apps/api/src/plugins/cors.ts` (criar)
  - `apps/api/src/middleware/requireAuth.ts` (criar)
  - `apps/api/src/middleware/requireRole.ts` (criar)
  - `apps/api/src/types/fastify.d.ts` (criar)
  - `apps/api/src/repositories/user.repository.ts` (criar)
  - `apps/api/src/services/auth.service.ts` (criar)
  - `apps/api/src/routes/auth.routes.ts` (criar)
  - `apps/api/src/routes/health.routes.ts` (criar)
  - `apps/api/tests/auth.test.ts` (criar)
  - `apps/api/jest.config.ts` (criar)
- **dependencies:** [T1, T2]
- **acceptance:** `cd apps/api && npx jest --testPathPattern=auth --forceExit --runInBand 2>&1 | tail -5`
- **description:**
  Implementar a camada base do servidor Fastify e os 4 endpoints de auth.

  **`app.ts`**: factory function `buildApp(opts?)` que registra plugins em ordem: cors → rateLimit → prisma → jwt → routes. Exportar `buildApp` para uso em testes e em `server.ts`.

  **`server.ts`**: chama `buildApp()`, adiciona graceful shutdown (SIGTERM/SIGINT → `await app.close()`).

  **Plugin `prisma.ts`**: instancia `PrismaClient`, decora `fastify.prisma`, fecha conexão em `fastify.addHook('onClose')`.

  **Plugin `jwt.ts`**: usa `@fastify/jwt`. Access token: HS256, 15min, payload `{ sub: userId, role }`. Decora `fastify.verifyJwt` (hook) e `fastify.signTokens(userId, role)` → `{ accessToken, refreshToken }`. Refresh token: 64 bytes hex via `crypto.randomBytes(64).toString('hex')` — **não é JWT**, é opaque token armazenado em `User.refreshToken`.

  **`requireAuth.ts`**: preHandler que lê `Authorization: Bearer <token>`, verifica via `fastify.jwt.verify`, anexa `request.user = { id, role }`.

  **`requireRole.ts`**: factory `requireRole(role: UserRole)` → preHandler que checa `request.user.role === role`, retorna 403 se diferente.

  **`user.repository.ts`**: métodos `findByEmail`, `findById`, `create`, `updateRefreshToken`. Todo `findById`/`findByEmail` usa `select` explícito (nunca retornar `passwordHash` ou `refreshToken`).

  **`auth.service.ts`**: implementar exatamente o rotate-on-use pattern de carla-architecture.md. `register` usa `bcrypt.hash(password, 12)` e, após criar o User, insere `ConsentLog { userId, consentType: 'TERMS_OF_USE', version: '1.0', ip: request.ip }` na mesma transação Prisma (`$transaction`) — **[FIX I02: LGPD professor]**. `login` usa `bcrypt.compare`. `refreshTokens` invalida o token antigo atomicamente (update `User.refreshToken = newToken`).

  **Dual transport refresh (concern #1 de Carla)**:
  - `POST /auth/login` response: seta cookie httpOnly `refreshToken` + retorna no body `{ accessToken, refreshToken }` (mobile lê do body)
  - `POST /auth/refresh`: se header `X-Client: mobile` presente → lê `refreshToken` do body `{ refreshToken }`; caso contrário → lê do cookie httpOnly
  - `POST /auth/logout`: invalida no banco, limpa cookie, mobile ignora cookie

  **Rate limits**: register 5/min por IP, login 10/min por IP, refresh 30/min por userId.

  **`fastify.d.ts`**: augmentar `FastifyRequest` com `user: { id: string; role: UserRole }`.

  **Testes (`auth.test.ts`)** — cobrir obrigatoriamente:
  1. `POST /auth/register` → professor: 201 com accessToken
  2. `POST /auth/register` → email duplicado: 409
  3. `POST /auth/login` → credenciais válidas: 200, cookie httpOnly setado
  4. `POST /auth/login` → senha errada: 401
  5. `POST /auth/refresh` → cookie válido: 200, novo accessToken
  6. `POST /auth/refresh` → header `X-Client: mobile` + body: 200
  7. `POST /auth/refresh` → token inválido: 401
  8. `POST /auth/logout` → 200, cookie limpo
  9. `GET /me` sem token: 401
  10. Tentativa de reutilizar refresh token já rotacionado: 401 (rotate-on-use)

---

### T4: API Students + Subjects

- **type:** api-endpoint
- **files:**
  - `apps/api/src/repositories/student.repository.ts` (criar)
  - `apps/api/src/routes/students.routes.ts` (criar)
  - `apps/api/src/routes/me.routes.ts` (criar — parcial: GET /me, PATCH /me, GET /me/students)
  - `apps/api/src/routes/health.routes.ts` (modificar — adicionar GET /subjects)
  - `apps/api/tests/students.test.ts` (criar)
- **dependencies:** [T3]
- **acceptance:** `cd apps/api && npx jest --testPathPattern=students --forceExit --runInBand 2>&1 | tail -5`
- **description:**
  Implementar CRUD de alunos e endpoints auxiliares de perfil.

  **`student.repository.ts`**: métodos `create`, `findById`, `findManyByProfessor`, `update`. Toda query filtra por `professorId = request.user.id` — **nunca** retornar alunos de outros professores. `findManyByProfessor` aceita `{ professorId, search?, isActive? }` e ordena por `name ASC`.

  **`POST /students`**: exige role PROFESSOR. Valida via `createStudentSchema`. Cria `Student` com `professorId = request.user.id`. Retorna 201 com dados do aluno (sem campos internos).

  **`GET /students`**: exige PROFESSOR. Query params: `search` (filtra por `name ilike %search%`), `isActive` (default true). Retorna array com subject aninhado `{ id, name }`.

  **`GET /students/:id`**: exige JWT. Se role PROFESSOR: verifica `student.professorId === request.user.id` → 403 se diferente. Se role PARENT: **aplica `lgpdGuard`** (verifica `ConsentLog` ativo para `LGPD_PARENTAL_ART14`) + verifica `StudentParent.parentId === request.user.id` → 403 com código `LGPD_CONSENT_REQUIRED` se sem consentimento, 403 com `NOT_AUTHORIZED` se não vinculado. **[FIX I05: dados de menor protegidos]**. Retorna student com subject.

  **`PATCH /students/:id`**: exige PROFESSOR + ownership. Valida via `updateStudentSchema`. Retorna student atualizado.

  **`GET /me`**: retorna `UserPublic` do usuário autenticado (select explícito, sem passwordHash/refreshToken). `PATCH /me`: campos opcionais `name`, `bio`, `avatarUrl`.

  **`GET /me/students`**: se PROFESSOR → retorna `students` do professor (igual `GET /students`). Se PARENT → retorna `student` vinculado via `StudentParent` (array, mas MVP tem 1 filho por pai). Aplica `lgpdGuard` para PARENT (verificar `ConsentLog`).

  **`GET /subjects`**: exige JWT. Retorna lista completa de subjects ordenada por `name ASC`. Sem paginação (≤20 items, estático após seed).

  **Testes (`students.test.ts`)** — cobrir:
  1. Professor cria aluno: 201
  2. Professor A tenta ver aluno do professor B: 403
  3. Professor lista seus alunos com `search`: retorna apenas os próprios
  4. `PATCH /students/:id` com `isActive: false`: aluno desativado
  5. Parent sem ConsentLog tenta `GET /me/students`: 403 com `LGPD_CONSENT_REQUIRED`
  6. Parent com ConsentLog válido acessa `GET /me/students`: 200

---

### T5: API Invitations (criar + validar + listar)

- **type:** api-endpoint
- **files:**
  - `apps/api/src/repositories/invitation.repository.ts` (criar)
  - `apps/api/src/services/invitation.service.ts` (criar)
  - `apps/api/src/routes/invitations.routes.ts` (criar)
  - `apps/api/tests/invitations.test.ts` (criar)
- **dependencies:** [T4]
- **acceptance:** `cd apps/api && npx jest --testPathPattern=invitations --forceExit --runInBand 2>&1 | tail -5`
- **description:**
  Implementar o fluxo completo de convite professor→pai.

  **`invitation.service.ts`**:
  - `generateToken()`: `crypto.randomBytes(32).toString('base64url')` — URL-safe, 32 bytes = 43 chars base64url
  - `createInvitation(professorId, studentId, parentEmail)`: verifica que student pertence ao professor (403 se não), verifica se já existe convite PENDING para o mesmo `(studentId, parentEmail)` — se sim, retorna o existente sem criar duplicata. Cria com `expiresAt = now() + 7 days`, `status = PENDING`
  - `validateToken(token)`: busca invitation com `status = PENDING AND expiresAt > now()`. Se não encontrar → 404. Retorna dados para pré-preenchimento (student name, subject, parentEmail, professorName)
  - `claimInvitation(token, parentId, parentEmail)`: **antes de qualquer mudança** verifica `parentEmail.toLowerCase() === invitation.parentEmail.toLowerCase()` → lança `BadRequestError('Email não corresponde ao convite')` se diferente **[FIX I07: impede sequestro de convite]**. Dentro de transação Prisma: valida token, cria `StudentParent { studentId, parentId }`, atualiza invitation `{ status: CLAIMED, claimedAt: now(), claimedById: parentId }`

  **Endpoints**:
  - `POST /invitations` (PROFESSOR): valida via `createInvitationSchema`, chama `invitation.service.createInvitation`. Retorna `{ id, token, inviteUrl: https://liveaula.com/invite/${token}, expiresAt }`
  - `GET /invitations/:token` (público, sem auth): chama `validateToken`, retorna dados para pré-preencher onboarding pai. Rate limit: 20/min por IP
  - `GET /invitations` (PROFESSOR): lista convites do professor autenticado. Query param `?status` (PENDING/CLAIMED/EXPIRED). Inclui `student.name` e `student.subject.name` aninhados
  - **Não implementar** `POST /invitations/:token/accept` separado — o claim acontece durante `POST /auth/register` quando `inviteToken` presente no body. Em `auth.service.register`: se `inviteToken` fornecido → chama `invitation.service.claimInvitation(token, userId, registerInput.email)` passando o email do cadastro — a verificação de correspondência ocorre dentro de `claimInvitation` **[FIX I07]**

  **Testes (`invitations.test.ts`)**:
  1. Professor cria convite para aluno próprio: 201 com inviteUrl
  2. Professor tenta criar convite para aluno de outro professor: 403
  3. `GET /invitations/:token` válido sem auth: 200 com dados pré-preenchidos
  4. `GET /invitations/:token` expirado: 404
  5. `POST /auth/register` com `inviteToken` válido: cria parent + cria StudentParent + marca invitation CLAIMED
  6. Reutilizar token já CLAIMED: 404

---

### T6: API Lessons (POST + GET) + push FCM ao pai

- **type:** api-endpoint
- **files:**
  - `apps/api/src/repositories/lesson.repository.ts` (criar)
  - `apps/api/src/services/lesson.service.ts` (criar)
  - `apps/api/src/services/notification.service.ts` (criar)
  - `apps/api/src/middleware/lgpdGuard.ts` (criar)
  - `apps/api/src/routes/lessons.routes.ts` (criar)
  - `apps/api/src/routes/me.routes.ts` (modificar — adicionar POST /me/device-tokens, DELETE /me/device-tokens/:token)
  - `apps/api/tests/lessons.test.ts` (criar)
  - `apps/api/tests/push.test.ts` (criar)
- **dependencies:** [T5]
- **acceptance:** `cd apps/api && npx jest --testPathPattern="lessons|push" --forceExit --runInBand 2>&1 | tail -5`
- **description:**
  Implementar o core loop da plataforma: professor registra aula → push para pai.

  **`lesson.repository.ts`**:
  - `create(data)`: insere Lesson com `select` explícito. Retorna `LessonListItem`
  - `findManyByProfessor({ professorId, cursor?, limit, studentId?, subjectId? })`: cursor-based pagination por `createdAt DESC`. Usa `id` do último item como cursor (busca `createdAt < cursorLesson.createdAt`)
  - `findManyByStudent({ studentId, parentId?, cursor?, limit, subjectId?, from?, to? })`: se `parentId` presente, verifica `StudentParent.parentId = parentId` antes de retornar (row-level security na query)
  - `findById(id, requesterId, requesterRole)`: PROFESSOR verifica `professorId = requesterId`; PARENT verifica `StudentParent.parentId = requesterId`

  **`notification.service.ts`**:
  - `getValidTokensForStudent(studentId)`: busca `DeviceToken` dos parents vinculados via `StudentParent` onde `isValid = true`
  - `sendPushToParent(studentId, lesson)`: monta payload FCM `{ title: "Nova aula de ${subjectName}", body: "${lesson.whatWasDone.slice(0,100)}...", data: { lessonId, type: 'NEW_LESSON' } }`. Usa `Expo.sendPushNotificationsAsync` (não FCM direto — usa Expo Push Notifications service). Retry 1x após 3s se timeout. Retorna `{ messageId?, ticketIds[] }`
  - `POST /me/device-tokens`: upsert `DeviceToken` por token único (`onConflict token → update isValid=true, lastVerified=now()`)
  - `DELETE /me/device-tokens/:token`: seta `isValid = false` (soft delete)

  **`lesson.service.ts`**: implementar exatamente o padrão `setImmediate` de carla-architecture.md. Resposta ao professor em <200ms. FCM em background sem bloquear.

  **`lgpdGuard.ts`**: implementar conforme carla-architecture.md. Aplicar em `GET /students/:studentId/lessons` quando requester é PARENT.

  **Endpoints**:
  - `POST /lessons` (PROFESSOR, 60/min): valida `createLessonSchema`. Verifica que `studentId` pertence ao professor. Chama `lesson.service.createLesson`. Retorna 201 com lesson criada
  - `GET /lessons` (PROFESSOR, 120/min): cursor-based, limit default 10, max 50. Query params: `cursor`, `limit`, `studentId`, `subjectId`. Retorna `CursorPage<LessonListItem>`
  - `GET /students/:studentId/lessons` (PROFESSOR ou PARENT, 120/min): PROFESSOR verifica ownership. PARENT aplica `lgpdGuard` + verifica StudentParent. Retorna `CursorPage<LessonListItem>`
  - `GET /lessons/:id` (JWT, 120/min): role-based ownership check

  **Testes (`lessons.test.ts`)**:
  1. Professor posta aula: 201, FCM disparado assincronamente (mock notification service)
  2. `whatWasDone` com 281 chars: 422
  3. `durationMin` com valor não permitido (ex: 25): 422
  4. Professor A tenta listar aulas do aluno do professor B: 403
  5. Parent sem ConsentLog tenta GET /students/:id/lessons: 403 LGPD_CONSENT_REQUIRED
  6. Parent com ConsentLog acessa lições do filho: 200 com CursorPage
  7. Cursor-based pagination: segunda página retorna items corretos

  **Testes (`push.test.ts`)**:
  1. `POST /me/device-tokens`: token registrado
  2. Token duplicado: upsert sem erro (isValid=true, lastVerified atualizado)
  3. `DELETE /me/device-tokens/:token`: isValid=false

---

### T7: API Subscription + Webhooks Asaas

- **type:** api-endpoint
- **files:**
  - `apps/api/src/repositories/subscription.repository.ts` (criar)
  - `apps/api/src/services/payment.service.ts` (criar — Asaas SDK wrapper)
  - `apps/api/src/routes/subscription.routes.ts` (criar)
  - `apps/api/src/routes/webhooks.routes.ts` (criar)
- **dependencies:** [T6]
- **acceptance:** `cd apps/api && curl -s http://localhost:3000/health | grep '"status":"ok"' && echo "Server OK" && npx jest --testPathPattern=subscription --forceExit --runInBand 2>&1 | tail -5`
- **description:**
  Implementar gestão de assinatura e integração com Asaas.

  **`payment.service.ts`** (wrapper Asaas — usar `axios` ou `node-fetch`, não SDK oficial que não existe para Node):
  - `createCustomer(parentUser)`: POST `https://api-sandbox.asaas.com/v3/customers` com `{ name, email, cpfCnpj? }`
  - `createSubscription(customerId, planAmountCents)`: POST `/subscriptions` com `{ customer, billingType: 'CREDIT_CARD', value: planAmountCents/100, nextDueDate, cycle: 'MONTHLY' }`
  - `cancelSubscription(externalSubscriptionId)`: DELETE `/subscriptions/:id`
  - Toda chamada inclui header `access_token: env.ASAAS_API_KEY`

  **Endpoints**:
  - `GET /subscription` (PARENT, 60/min): busca `Subscription` do parent autenticado com `payments` mais recentes (limit 5). Se não existe: retorna `{ status: 'NONE' }`
  - `POST /subscription` (PARENT, 5/min): se já tem subscription ativa → 409. Cria customer Asaas se não existe (`externalCustomerId` nulo). Cria subscription Asaas. Persiste `Subscription { parentId, studentId, externalSubscriptionId, externalCustomerId, status: ACTIVE }`. Body: `{ paymentMethodToken: string }` (token do cartão gerado pelo front via Asaas.js)
  - `GET /subscription/payments` (PARENT, 60/min): lista `Payment` do subscription com limit 10. Retorna array `{ id, amountCents, status, paidAt, failureReason }`

  **`POST /webhooks/asaas`** (público com validação):
  - Validar header `asaas-access-token` com `crypto.timingSafeEqual(Buffer.from(header), Buffer.from(env.ASAAS_WEBHOOK_TOKEN))`. Se inválido → 401 imediatamente
  - Parsear body bruto (registrar raw plugin antes de JSON parser para esta rota)
  - Eventos a tratar:
    - `PAYMENT_RECEIVED` → busca Subscription por `externalSubscriptionId`, cria `Payment { status: 'paid', paidAt }`, atualiza `Subscription.status = ACTIVE, currentPeriodEnd = nextDueDate`
    - `PAYMENT_OVERDUE` → atualiza `Subscription.status = PAST_DUE`
    - `PAYMENT_DELETED` ou `SUBSCRIPTION_DELETED` → atualiza `Subscription.status = CANCELLED, cancelledAt = now()`
    - Sempre persiste `Payment.rawWebhookPayload = req.body` (JSON bruto) para auditoria
  - Retornar 200 para todos os eventos reconhecidos (Asaas faz retry se receber != 2xx)

  **Nota**: usar conta sandbox Asaas (`api-sandbox.asaas.com`) — provisionar antes do sprint e colocar `ASAAS_API_KEY` sandbox em `.env.local`.

---

### T8: API Admin endpoints + consentimento LGPD + Cloudinary signature

- **type:** api-endpoint
- **files:**
  - `apps/api/src/routes/admin.routes.ts` (criar)
  - `apps/api/src/routes/me.routes.ts` (modificar — adicionar SOMENTE `POST /me/cloudinary-signature`; NÃO tocar em `/me/device-tokens` — ownership exclusivo de T6)
  - `apps/api/src/routes/consent.routes.ts` (criar — POST /consent)
  - `apps/api/src/plugins/cors.ts` (modificar — adicionar origins Vercel + Railway)
- **dependencies:** [T7]
- **acceptance:** `cd apps/api && npx jest --testPathPattern="admin|consent" --forceExit --runInBand 2>&1 | tail -5`
- **description:**
  Completar a API com endpoints admin, consentimento LGPD e upload de avatar.

  **Admin endpoints** (todos exigem `requireRole('ADMIN')`):
  - `GET /admin/users` (30/min): query params `role`, `isActive`, `cursor`, `limit=20`. Retorna `CursorPage<UserPublic>`. Select explícito — sem passwordHash/refreshToken
  - `PATCH /admin/users/:id/status` (20/min): body `{ isActive: boolean }`. Atualiza `User.isActive`. Retorna user atualizado
  - `GET /admin/subscriptions` (30/min): query params `status`, `cursor`. Retorna subscriptions com `parent.name`, `parent.email`, `student.name` aninhados
  - `GET /admin/metrics` (10/min): query params `from` e `to` (ISO date). Calcula em uma query agregada:
    - `DAU`: count distinct userId em Lessons do dia
    - `MAU`: count distinct userId em Lessons do mês
    - `activeSubscriptions`: count Subscription WHERE status = ACTIVE
    - `trialSubscriptions`: count Subscription WHERE status = TRIAL
    - `churnRate`: cancelledThisPeriod / totalAtStartOfPeriod (usar `from`/`to`)
    - `conversionRate`: ACTIVE / (ACTIVE + CANCELLED + TRIAL expirado)

  **`POST /consent`** (JWT, 5/min): registra `ConsentLog`. Extrair IP real via `request.ip` com `fastify-ip-header` plugin (Railway usa `X-Forwarded-For`). Body: `consentSchema`. Verificar se já existe ConsentLog ativo do mesmo tipo — se sim, retornar 200 idempotente sem duplicar

  **`POST /me/cloudinary-signature`** (JWT, 10/min): gera assinatura Cloudinary para upload direto. Calcula `sha1(folder=avatars&timestamp=${ts}&upload_preset=liveaula${CLOUDINARY_API_SECRET})`. Retorna `{ signature, timestamp, apiKey, cloudName, folder: 'avatars', uploadPreset: 'liveaula' }`. Frontend usa para upload direto sem passar binário pelo backend

  **Testes**:
  1. PROFESSOR tenta acessar `GET /admin/users`: 403
  2. ADMIN acessa `GET /admin/users`: 200 com CursorPage
  3. ADMIN desativa usuário: 200, `isActive = false`
  4. `POST /consent` registra ConsentLog com IP real
  5. `POST /consent` duplicado: 200 idempotente (sem criar segundo registro)
  6. `GET /admin/metrics` retorna objeto com todas as métricas (valores numéricos)

---

### T9: Web — Setup Next.js (tailwind, tokens, middleware auth, providers)

- **type:** infra
- **files:**
  - `apps/web/package.json` (criar)
  - `apps/web/tsconfig.json` (criar)
  - `apps/web/next.config.ts` (criar)
  - `apps/web/tailwind.config.ts` (criar)
  - `apps/web/postcss.config.js` (criar)
  - `apps/web/middleware.ts` (criar)
  - `apps/web/src/app/layout.tsx` (criar — root layout)
  - `apps/web/src/lib/api.ts` (criar — fetcher wrapper)
  - `apps/web/src/lib/auth.ts` (criar — session helpers Server + Client)
  - `apps/web/src/contexts/AuthContext.tsx` (criar — access token em memória)
- **dependencies:** [T2]
- **acceptance:** `cd apps/web && npx next build 2>&1 | tail -10`
- **description:**
  Configurar a base do Next.js 14 App Router com autenticação e tokens de design.

  **`tailwind.config.ts`**: estender com tokens de `@liveaula/shared/design-tokens`. Adicionar `fontFamily: { jakarta: ['Plus Jakarta Sans', 'sans-serif'], nunito: ['Nunito', 'sans-serif'], inter: ['Inter', 'sans-serif'] }`. Safelist classes de gradiente aurora (bg-gradient-to-br from-amber-50 to-orange-100) para parent feed.

  **`middleware.ts`**: usar `next/server` middleware. Proteger rotas:
  - `/(professor)/*` → redirecionar para `/login` se sem cookie `refreshToken`
  - `/(parent)/*` → redirecionar para `/login` se sem cookie `refreshToken`
  - `/(admin)/*` → redirecionar para `/login` se sem cookie `refreshToken`
  - `/(auth)/invite/:token` → público (não proteger)
  - Verificar role via **`jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))`** do cookie `accessToken` (não-httpOnly) para redirecionar professor que tenta acessar rota parent e vice-versa — **[FIX I03: nunca usar jwtDecode/atob sem verificar assinatura]**

  **`lib/auth.ts`**:
  - `getServerSession()`: Server-only. Lê `accessToken` de `cookies()` de `next/headers`, verifica via `jose.jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))` — **[FIX I03: não usar decode sem verificação]** — retorna `{ id, role }` ou null
  - `refreshServerSession()`: Route Handler que chama `POST /auth/refresh` da API com cookie forwarded, seta novo cookie

  **`AuthContext.tsx`**: Provider que mantém `accessToken` em memória (não localStorage). Expõe `useAuth() → { user, accessToken, login, logout }`. `login()` chama `POST /auth/login`, recebe `accessToken` no body e armazena em state. Cookie `refreshToken` é httpOnly, gerenciado automaticamente pelo browser.

  **`lib/api.ts`**: fetcher com `Authorization: Bearer ${accessToken}`. Intercepta 401 → chama `/api/auth/refresh` (Route Handler interno) → retorna novo token → retry request original. Exportar `apiFetch(url, init?)`.

  **`next.config.ts`**: configurar `rewrites` para `/api/*` → `${process.env.API_URL}/*` em desenvolvimento. Em produção, web chama API diretamente.

---

### T10: Web — Auth pages (login, registro professor, invite landing)

- **type:** web-component
- **files:**
  - `apps/web/src/app/(auth)/login/page.tsx` (criar — Client)
  - `apps/web/src/app/(auth)/register/page.tsx` (criar — Client)
  - `apps/web/src/app/(auth)/invite/[token]/page.tsx` (criar — Server)
  - `apps/web/src/app/(onboarding)/professor/page.tsx` (criar — Client, multi-step)
  - `apps/web/src/app/(onboarding)/parent/page.tsx` (criar — Client, multi-step)
  - `apps/web/src/app/(onboarding)/parent/_components/LgpdConsentStep.tsx` (criar — Client)
  - `apps/web/src/app/(onboarding)/parent/_components/TrialWelcomeStep.tsx` (criar — Client)
  - `apps/web/tests/e2e/auth.spec.ts` (criar — Playwright)
- **dependencies:** [T9]
- **acceptance:** `cd apps/web && npx playwright test auth --reporter=line 2>&1 | tail -10`
- **description:**
  Implementar todas as páginas de autenticação e onboarding web.

  **`/login/page.tsx`**: form email + senha com react-hook-form + zod resolver (`loginSchema`). Submit chama `POST /auth/login` via `apiFetch`. Sucesso → salva accessToken no AuthContext → redireciona baseado em `role`: PROFESSOR → `/dashboard`, PARENT → `/feed`, ADMIN → `/admin/users`. Exibir erro genérico "Email ou senha inválidos" (não distinguir qual campo errou).

  **`/register/page.tsx`**: apenas para PROFESSOR (cadastro direto sem convite). Form: nome, email, senha, confirmar senha. Submit: `POST /auth/register { role: 'PROFESSOR' }` → sucesso → redirecionar para `/onboarding/professor`.

  **`/invite/[token]/page.tsx`** (Server Component): chama `GET /invitations/:token` da API. Se 404 → renderizar página de erro "Convite inválido ou expirado" com link para home. Se válido → renderizar dados do aluno/professor + botão "Criar minha conta" → redirect para `/onboarding/parent?token=${token}&email=${parentEmail}`.

  **`/onboarding/professor/page.tsx`**: wizard 3 steps com estado em `useState`:
  - Step 1: avatar upload (Cloudinary direto via assinatura do backend) + nome + bio (opcional)
  - Step 2: primeiro aluno (nome, série, matéria via select de `/subjects`)
  - Step 3: confirmação + link para baixar app mobile
  Progressão com indicador visual (dots). Permite pular step 2 (aluno pode ser adicionado depois).

  **`/onboarding/parent/page.tsx`**: wizard 4 steps (ler `token` de `searchParams`):
  - Step 1: email pré-preenchido (read-only) + nome + senha + confirmar senha. Submit chama `POST /auth/register { role: 'PARENT', inviteToken: token }` — cria conta + aceita convite atomicamente
  - Step 2: avatar do filho (opcional, via Cloudinary)
  - Step 3: **`LgpdConsentStep`** — exibir texto completo do termo LGPD Art.14. Botão "Aceitar" desabilitado até `IntersectionObserver` detectar que âncora bottom está visível (usuário rolou até o fim). Ao aceitar: chama `POST /consent { consentType: 'LGPD_PARENTAL_ART14', version: '1.0' }`
  - Step 4: `TrialWelcomeStep` — "Trial gratuito por 7 dias ativado". Mostra data de expiração. CTA → `/feed`

  **Playwright `auth.spec.ts`**:
  1. Login professor → redireciona para `/dashboard`
  2. Login com senha errada → mensagem de erro
  3. Convite inválido → página de erro
  4. Fluxo completo onboarding pai: acessa `/invite/[validToken]` → cria conta → aceita LGPD → trial welcome → `/feed`

---

### T11: Web — Professor: Dashboard + Alunos

- **type:** web-component
- **files:**
  - `apps/web/src/app/(professor)/layout.tsx` (criar — Server)
  - `apps/web/src/app/(professor)/dashboard/page.tsx` (criar — Server)
  - `apps/web/src/app/(professor)/dashboard/loading.tsx` (criar)
  - `apps/web/src/app/(professor)/dashboard/_components/StudentCard.tsx` (criar — Client)
  - `apps/web/src/app/(professor)/dashboard/_components/StudentGrid.tsx` (criar — Client)
  - `apps/web/src/app/(professor)/dashboard/_components/EmptyState.tsx` (criar — Server)
  - `apps/web/src/app/(professor)/students/new/page.tsx` (criar — Client)
  - `apps/web/src/app/(professor)/students/[studentId]/page.tsx` (criar — Server)
- **dependencies:** [T10]
- **acceptance:** `cd apps/web && npx playwright test professor --reporter=line 2>&1 | tail -10`
- **description:**
  Dashboard principal do professor com gestão de alunos.

  **`(professor)/layout.tsx`** (Server): lê sessão via `getServerSession()`. Se não autenticado → redireciona `/login`. Se não PROFESSOR → redireciona `/login`. Renderiza sidebar esquerda (desktop) / bottom nav (mobile) com links: Dashboard, Alunos, Histórico, Convites, Configurações. Cor primária `#1A6B74`, fonte Plus Jakarta Sans. Slot `{children}`.

  **`dashboard/page.tsx`** (Server): chama `GET /students?isActive=true` com cookie forwarded. Passa `students` para `StudentGrid`. Se lista vazia → renderiza `EmptyState`.

  **`StudentGrid.tsx`** (Client): recebe `initialStudents`. Input de busca que filtra client-side por `name`. Grid responsivo: 1 col mobile, 2 col tablet, 3 col desktop. Cada item: `StudentCard`.

  **`StudentCard.tsx`** (Client): exibe avatar (32px, fallback initials), nome, série, matéria. Hover: eleva com shadow. Clique → navega para `/students/${id}`. Popover ativado por ícone de 3 pontos: opções "Registrar Aula", "Enviar Convite", "Editar".

  **`EmptyState.tsx`** (Server): ilustração + título "Nenhum aluno ainda" + botão "Adicionar primeiro aluno" → `/students/new`.

  **`/students/new/page.tsx`** (Client): form com react-hook-form. Campos: nome (required), série (select: 1º ao 9º EF, 1ª a 3ª EM), matéria (select carregado de `GET /subjects`), avatar opcional. Submit: `POST /students` → sucesso → navigate para `/dashboard` com toast "Aluno adicionado".

  **`/students/[studentId]/page.tsx`** (Server): chama `GET /students/:id` e `GET /students/:id/lessons?limit=10`. Renderiza: header com foto + nome + série + matéria. Seção convites: botão "Enviar convite para pai" → abre modal inline com form de email. Lista de aulas recentes (5 items) com link "Ver todas".

---

### T12: Web — Professor: Registrar Aula

- **type:** web-component
- **files:**
  - `apps/web/src/app/(professor)/register-lesson/page.tsx` (criar — Client)
  - `apps/web/src/app/(professor)/register-lesson/_components/RegisterLessonForm.tsx` (criar — Client)
  - `apps/web/src/app/(professor)/register-lesson/_components/NotificationPreview.tsx` (criar — Client)
- **dependencies:** [T11]
- **acceptance:** `cd apps/web && npx playwright test register-lesson --reporter=line 2>&1 | tail -5`
- **description:**
  Fluxo de registro de aula otimizado para <30 segundos.

  **`RegisterLessonForm.tsx`**: form controlado com react-hook-form + zod (`createLessonSchema`).

  Campos e UX:
  - **Aluno**: select com busca. Carrega `GET /students`. Pré-seleciona o último aluno que teve aula registrada (salvo em `localStorage.lastStudentId`). Trocar aluno → pré-seleciona matéria do aluno
  - **Duração**: segmented control (15 | 30 | 45 | 60 | 90 | 120 min). Default: última duração usada (localStorage)
  - **O que foi feito**: textarea controlada com contador de chars `X/280`. Autofocus ao montar. Borda vermelha se >280
  - **Observação**: textarea opcional, contador 0/500, colapsável (mostrar/esconder com chevron)
  - **Emoji/humor**: row de 5 emojis clicáveis (😊 😐 😤 🤔 💪) mapeando para LessonEmotion enum

  Submit: desabilita botão + spinner. Chama `POST /lessons`. Sucesso → esconde form → monta `NotificationPreview`.

  **`NotificationPreview.tsx`**: simula notificação iOS no estilo overlay (fundo escurecido, card branco no topo). Exibe: ícone liveaula + "Relatório enviado para [nome do pai]" + preview truncado do `whatWasDone`. Botão "Registrar outra aula" → limpa form (mantém aluno selecionado). Botão "Ver histórico" → navega `/students/[studentId]`. Auto-dismiss após 5s.

  **Smart defaults de localStorage**:
  - `liveaula.lastStudentId` → pré-seleciona aluno
  - `liveaula.lastDurationMin` → pré-seleciona duração
  Atualizar ambos no submit bem-sucedido.

---

### T13: Web — Professor: Histórico + Convites + Configurações

- **type:** web-component
- **files:**
  - `apps/web/src/app/(professor)/students/[studentId]/_components/LessonTimeline.tsx` (criar — Client)
  - `apps/web/src/app/(professor)/invitations/page.tsx` (criar — Server)
  - `apps/web/src/app/(professor)/settings/page.tsx` (criar — Client)
- **dependencies:** [T12]
- **acceptance:** `cd apps/web && npx next build 2>&1 | grep -E "Route|error" | head -30`
- **description:**
  Completar as páginas restantes do fluxo professor.

  **`LessonTimeline.tsx`** (Client): componente de infinite scroll cursor-based. Usa `useSWRInfinite` para carregar `GET /students/:id/lessons?cursor=...&limit=10`. Renderiza lista de `LessonCard` (data + matéria + emoção + `whatWasDone` truncado em 2 linhas). Clique no card: expand inline com texto completo + `observation`. Indicador de carregamento no bottom (IntersectionObserver → dispara next page). Botão de filtro por matéria (select chips horizontais).

  **`/invitations/page.tsx`** (Server): tabela de convites do professor autenticado. Colunas: Aluno, Email do pai, Status (badge colorido: PENDING=amarelo, CLAIMED=verde, EXPIRED=cinza), Criado em, Expira em. Botão "Copiar link" por linha (navigator.clipboard). Filtro por status via query param. Empty state: "Nenhum convite enviado — convide um pai pelo perfil do aluno".

  **`/settings/page.tsx`** (Client): formulário de perfil professor com react-hook-form. Campos: nome, bio (max 300 chars), avatar (upload Cloudinary direto). Submit: `PATCH /me`. Seção separada "Segurança" com link "Alterar senha" (MVP: redireciona para email de reset — não implementar reset em S1, apenas placeholder). Exibir toast de sucesso ao salvar.

---

### T14: Web — Onboarding pai (convite → cadastro → LGPD) [movido para T10]

> **Nota**: O onboarding do pai foi implementado em T10 como parte do fluxo de auth (necessário para o convite landing funcionar). T14 cobre refinamentos e testes E2E específicos do fluxo pai.

- **type:** web-component
- **files:**
  - `apps/web/tests/e2e/parent-onboarding.spec.ts` (criar — Playwright)
- **dependencies:** [T13]
- **acceptance:** `cd apps/web && npx playwright test parent-onboarding --reporter=line 2>&1 | tail -10`
- **description:**
  Testes E2E completos do fluxo de onboarding do pai.

  **`parent-onboarding.spec.ts`** — cenários obrigatórios:
  1. Pai acessa link de convite válido: vê nome do aluno e do professor pré-preenchidos
  2. Pai tenta aceitar LGPD sem rolar até o fim: botão "Aceitar" permanece desabilitado
  3. Pai rola até o fim do termo LGPD: botão "Aceitar" habilita
  4. Pai completa onboarding completo (step 1 a 4): é redirecionado para `/feed`
  5. Pai tenta acessar `/feed` diretamente sem ConsentLog: é redirecionado de volta ao step 3 (LGPD)
  6. Convite já utilizado (CLAIMED): página de erro "Este convite já foi utilizado"

---

### T15: Web — Pai: Feed + Detalhe aula

- **type:** web-component
- **files:**
  - `apps/web/src/app/(parent)/layout.tsx` (criar — Server)
  - `apps/web/src/app/(parent)/feed/page.tsx` (criar — Server SSR)
  - `apps/web/src/app/(parent)/feed/loading.tsx` (criar)
  - `apps/web/src/app/(parent)/feed/_components/LessonFeed.tsx` (criar — Client)
  - `apps/web/src/app/(parent)/feed/_components/LessonFeedCard.tsx` (criar — Client)
  - `apps/web/src/app/(parent)/lessons/[lessonId]/page.tsx` (criar — Server)
- **dependencies:** [T14]
- **acceptance:** `cd apps/web && npx next build 2>&1 | grep -E "Route \(parent\)|error" | head -20`
- **description:**
  Feed de aulas do pai — principal ponto de valor percebido da plataforma.

  **`(parent)/layout.tsx`** (Server): verifica sessão, role PARENT. Surface `#FFFBF5`, fonte Nunito. Coluna centrada max-width 640px. Bottom nav (mobile): Feed | Assinatura | Perfil.

  **`feed/page.tsx`** (Server): SSR — chama `GET /students/:studentId/lessons?limit=10` com cookie forwarded. Passa `initialData` para `LessonFeed`. Usa `revalidateTag('lessons')` para invalidar cache quando nova aula for registrada (via webhook ou Server Action).

  **`LessonFeed.tsx`** (Client): recebe `initialData: CursorPage<LessonListItem>`. Usa `useSWRInfinite` para infinite scroll. Cada item: `LessonFeedCard`. IntersectionObserver no último card → carrega próxima página. Pull-to-refresh via `RefreshControl` equivalente web (botão de atualizar no topo, auto-refresh a cada 60s via `setInterval`).

  **`LessonFeedCard.tsx`** (Client): card com:
  - Header: avatar professor + nome + "• há X horas/dias" (date-fns `formatDistanceToNow`)
  - Gradiente aurora fundo: `bg-gradient-to-br from-amber-50 to-orange-100`
  - Body: matéria em badge + `whatWasDone` completo (sem truncar — 280 chars max)
  - Footer: emoji de emoção + duração em minutos + botão "Ver detalhes" → `/lessons/:id`
  - Animação de entrada: `opacity 0→1 + translateY 8px→0` com `transition-all duration-300`

  **`/lessons/[lessonId]/page.tsx`** (Server): detalhe da aula. Cabeçalho: professor name + avatar + matéria + data. Corpo: `whatWasDone` completo + `observation` (se existir, separado por linha) + emoção em destaque. Seção "Sobre o aluno": foto + nome + série.

---

### T16: Web — Pai: Assinatura + Pagamento

- **type:** web-component
- **files:**
  - `apps/web/src/app/(parent)/subscription/page.tsx` (criar — Server)
  - `apps/web/src/app/(parent)/subscription/_components/TrialBanner.tsx` (criar — Client)
  - `apps/web/src/app/(parent)/subscription/_components/PaymentModal.tsx` (criar — Client)
  - `apps/web/src/app/(parent)/profile/page.tsx` (criar — Client)
- **dependencies:** [T15]
- **acceptance:** `cd apps/web && npx next build 2>&1 | grep -E "Route \(parent\)|error" | head -20`
- **description:**
  Gestão de assinatura e perfil do pai.

  **`subscription/page.tsx`** (Server): chama `GET /subscription`. Renderiza baseado no status:
  - `NONE` → CTA "Assinar por R$79/mês"
  - `TRIAL` → `TrialBanner` com countdown + botão "Garantir acesso contínuo"
  - `ACTIVE` → badge verde "Assinatura ativa" + próxima cobrança + histórico de pagamentos (últimos 5)
  - `PAST_DUE` → banner vermelho "Pagamento pendente" + botão "Atualizar cartão"
  - `CANCELLED` → "Assinatura cancelada em [data]" + CTA "Reativar"

  **`TrialBanner.tsx`** (Client): exibe countdown com data absoluta de expiração (ex: "expira em 05/05/2026 às 14:32"). Usa `setInterval` de 1s para atualizar contador de tempo restante (dd:hh:mm:ss). Urgência visual: fundo amarelo → laranja quando <48h restantes.

  **`PaymentModal.tsx`** (Client): dialog/modal que exibe iframe da Asaas para coleta do cartão. Fluxo: abre modal → iframe carrega Asaas.js (CDN) → usuário preenche dados do cartão → Asaas.js retorna token → modal chama `POST /subscription { paymentMethodToken }` → fecha modal → revalida página subscription. Exibir spinner durante processamento. Em caso de erro da API Asaas: exibir mensagem legível ao usuário.

  **`profile/page.tsx`** (Client): exibe e permite editar foto do filho (upload Cloudinary), nome e série. Formulário com react-hook-form. Submit: `PATCH /students/:id` (atualiza dados do filho). Seção separada: perfil da conta (nome do pai, email read-only). Botão "Sair" → chama `POST /auth/logout` → redireciona `/login`.

---

### T17: Web — Admin: Dashboard + Gestão

- **type:** web-component
- **files:**
  - `apps/web/src/app/(admin)/layout.tsx` (criar — Server)
  - `apps/web/src/app/(admin)/users/page.tsx` (criar — Server)
  - `apps/web/src/app/(admin)/users/_components/UserTable.tsx` (criar — Client)
  - `apps/web/src/app/(admin)/subscriptions/page.tsx` (criar — Server)
  - `apps/web/src/app/(admin)/metrics/page.tsx` (criar — Server)
- **dependencies:** [T16]
- **acceptance:** `cd apps/web && npx next build 2>&1 | grep "Compiled successfully\|Build failed" | head -5`
- **description:**
  Interface admin interna — utilitária, tabela-first.

  **`(admin)/layout.tsx`** (Server): verifica role ADMIN — se não → 404 (não revelar existência da rota). Surface `#F8FAFC`, fonte Inter. Sidebar com links: Métricas, Usuários, Assinaturas.

  **`/users/page.tsx`** (Server): busca `GET /admin/users?limit=20` com cursor. Passa para `UserTable`.

  **`UserTable.tsx`** (Client): tabela com colunas: nome, email, role (badge), status (ativo/inativo toggle), criado em. Ordenação client-side por nome e data. Ação inline: toggle ativo/inativo (chama `PATCH /admin/users/:id/status` + atualiza row localmente). Busca por nome/email via input (filtro client-side na página atual, botão "Carregar mais" para próxima página). Sem paginação automática no MVP — botão explícito.

  **`/subscriptions/page.tsx`** (Server): tabela assinaturas com: pai (nome + email), filho (nome), status (badge colorido), plano (R$79/mês), próxima cobrança, ações (cancelar — chama `DELETE /subscription/:id` via Server Action).

  **`/metrics/page.tsx`** (Server): 4 cards de métricas: DAU, MAU, Assinaturas Ativas, Taxa de Conversão. Date picker (from/to) com Server Action para recarregar. Sem gráficos no MVP — apenas números com variação percentual vs período anterior.

---

### T18: Mobile — Setup Expo (tokens, fontes, navegação, providers)

- **type:** infra
- **files:**
  - `apps/mobile/package.json` (criar)
  - `apps/mobile/tsconfig.json` (criar)
  - `apps/mobile/app.json` (criar — Expo config)
  - `apps/mobile/app/_layout.tsx` (criar — root layout)
  - `apps/mobile/src/lib/api.ts` (criar — fetcher mobile)
  - `apps/mobile/src/lib/secureStorage.ts` (criar — wrapper SecureStore)
  - `apps/mobile/src/hooks/useAuth.ts` (criar)
  - `apps/mobile/src/hooks/usePushNotifications.ts` (criar)
- **dependencies:** [T2]
- **acceptance:** `cd apps/mobile && npx expo export --platform web 2>&1 | tail -10`
- **description:**
  Base do app React Native com Expo Router e autenticação mobile.

  **`app.json`**: nome "liveaula", slug "liveaula", scheme "liveaula" (deep linking). Plugins: `expo-font`, `expo-notifications`, `expo-secure-store`, `expo-router`. Android: adaptiveIcon background `#1A6B74`. iOS: supportsTablet false (MVP mobile-only portrait).

  **`app/_layout.tsx`**: root layout com `ThemeProvider` (react-navigation), `AuthProvider` (context próprio), `SplashScreen.preventAutoHideAsync()`. Após carregar auth state → `SplashScreen.hideAsync()`. Usa `expo-router` Stack com `initialRouteName` determinado por auth state: não autenticado → `(auth)`, PROFESSOR → `(professor)`, PARENT → `(parent)`.

  **`secureStorage.ts`**: wrapper sobre `expo-secure-store`. Métodos: `save(key, value)`, `get(key)`, `delete(key)`. Chaves tipadas: `'liveaula.accessToken'`, `'liveaula.refreshToken'`, `'liveaula.userId'`, `'liveaula.userRole'`.

  **`lib/api.ts`** (mobile): `apiFetch(url, init?)` que:
  - Lê `accessToken` via `SecureStore.get('liveaula.accessToken')`
  - Adiciona `Authorization: Bearer <token>` + `X-Client: mobile`
  - Intercepta 401 → chama `POST /auth/refresh` com body `{ refreshToken }` (lido do SecureStore) + header `X-Client: mobile` → salva novos tokens → retry
  - Verifica conectividade com `NetInfo.fetch()` antes de cada request — se offline: lança `NetworkError` com mensagem "Sem conexão com a internet"

  **`useAuth.ts`**: hook que expõe `{ user, login, logout, isLoading }`. `login(email, password)` → chama API, salva tokens no SecureStore. `logout()` → chama `POST /auth/logout`, limpa SecureStore, navega para `(auth)`.

  **`usePushNotifications.ts`**: na inicialização do app:
  1. Solicita permissão `expo-notifications`
  2. Se concedida: chama `getExpoPushTokenAsync()`
  3. `POST /me/device-tokens { token, platform: Platform.OS }` via `apiFetch`
  4. Registra `addNotificationResponseReceivedListener` → navega para feed do pai ao clicar
  5. Retorna `{ expoPushToken, notificationPermission }`

  **Design tokens no app**: criar `src/theme/index.ts` que importa `@liveaula/shared/design-tokens` e converte para StyleSheet-compatible. Fontes carregadas via `expo-font` no root layout (Plus Jakarta Sans para professor, Nunito para parent).

---

### T19: Mobile — Professor: Auth + Onboarding

- **type:** mobile-component
- **files:**
  - `apps/mobile/app/(auth)/_layout.tsx` (criar)
  - `apps/mobile/app/(auth)/login.tsx` (criar)
  - `apps/mobile/app/(auth)/register.tsx` (criar)
  - `apps/mobile/app/(onboarding)/professor/_layout.tsx` (criar)
  - `apps/mobile/app/(onboarding)/professor/step-1.tsx` (criar)
  - `apps/mobile/app/(onboarding)/professor/step-2.tsx` (criar)
  - `apps/mobile/app/(onboarding)/professor/step-3.tsx` (criar)
- **dependencies:** [T18]
- **acceptance:** `cd apps/mobile && npx tsc --noEmit 2>&1 | tail -10`
- **description:**
  Telas de auth e onboarding do professor no mobile.

  **`login.tsx`**: ScrollView com KeyboardAvoidingView (behavior `padding` iOS / `height` Android). Campos: email (TextInput, keyboardType=email-address, autoCapitalize=none), senha (secureTextEntry). Botão "Entrar" com ActivityIndicator durante request. Link "Não tem conta? Cadastre-se" → `/register`. Erro: Alert nativo (não toast) para login falho.

  **`register.tsx`**: nome, email, senha, confirmar senha. Validação em tempo real (react-hook-form + zod nativo RN). Submit: `POST /auth/register { role: 'PROFESSOR' }` → sucesso → navega para `(onboarding)/professor/step-1`.

  **Onboarding professor (3 steps)**:
  - `step-1.tsx`: avatar upload via `expo-image-picker` → Cloudinary (assinatura do backend) + nome + bio. TouchableOpacity no avatar abre picker. Preview da imagem selecionada antes do upload
  - `step-2.tsx`: adicionar primeiro aluno. Form: nome, série (Picker/select), matéria (FlatList horizontal de chips). Botão "Pular" (sem aluno agora)
  - `step-3.tsx`: tela de confirmação. Texto "Tudo pronto! Baixe o app e comece a registrar aulas." + QR code (imagem estática) para deep link do app. Botão "Ir para o Dashboard" → navega `(professor)/index`

  Indicador de progresso: 3 dots no topo de cada step. Step ativo: `#1A6B74`, inativo: `#CBD5E1`.

---

### T20: Mobile — Professor: Dashboard + FAB Registrar Aula (BottomSheet)

- **type:** mobile-component
- **files:**
  - `apps/mobile/app/(professor)/_layout.tsx` (criar — Tab navigator)
  - `apps/mobile/app/(professor)/index.tsx` (criar — Dashboard D1)
  - `apps/mobile/app/(professor)/_components/RegisterLessonSheet.tsx` (criar)
  - `apps/mobile/app/(professor)/_components/StudentListItem.tsx` (criar)
- **dependencies:** [T19]
- **acceptance:** `cd apps/mobile && npx tsc --noEmit 2>&1 | tail -10`
- **description:**
  Dashboard principal do professor e o core UX de registrar aula em <30s.

  **`(professor)/_layout.tsx`**: Tab navigator (react-navigation bottom tabs). Tabs: Dashboard (ícone home), Alunos (ícone people), Configurações (ícone settings). Cor active tab: `#1A6B74`. FAB [+] flutuante acima do tab bar (posição absoluta, bottom: 88px) — ao pressionar abre `RegisterLessonSheet` via ref.

  **`index.tsx`** (Dashboard D1): FlatList de alunos ativos do professor (chama `GET /students`). Header: greeting "Olá, [nome]" + data de hoje. Cada item: `StudentListItem`. Em caso de lista vazia: EmptyState com CTA "Adicionar aluno" → navega `(professor)/students/new`. Suporte a pull-to-refresh (`RefreshControl`).

  **`StudentListItem.tsx`**: Avatar 32px (ou initials se sem foto) + nome (semibold) + serie + matéria (caption) + chevron direito. TouchableOpacity com `activeOpacity=0.7`. Altura mínima 60px (>44px touch target).

  **`RegisterLessonSheet.tsx`** (BottomSheet via `@gorhom/bottom-sheet`):
  - Snap points: `['85%']` — abre em 85% da tela
  - Campos em ordem:
    1. Aluno: `BottomSheetFlatList` de alunos (com busca) — pré-seleciona último usado (AsyncStorage key `lastStudentId`)
    2. Matéria: pills horizontais (auto-selecionado com base no aluno)
    3. Duração: segmented control (15/30/45/60/90/120)
    4. O que foi feito: `BottomSheetTextInput` multiline, max 280 chars, contador
    5. Observação: colapsável com Animated.View
    6. Humor: row de 5 emojis clicáveis
  - Keyboard: `keyboardBehavior="interactive"` + `enablePanDownToClose`
  - Submit: `POST /lessons` → loading → `Haptics.notificationAsync(NotificationFeedbackType.Success)` → sheet fecha → Toast "Aula registrada! Notificação enviada ao pai" (via `react-native-toast-message`)
  - Erro de rede: Alert nativo com opção de retry

---

### T21: Mobile — Professor: Histórico + Perfil aluno + Convite

- **type:** mobile-component
- **files:**
  - `apps/mobile/app/(professor)/students/_layout.tsx` (criar)
  - `apps/mobile/app/(professor)/students/index.tsx` (criar)
  - `apps/mobile/app/(professor)/students/new.tsx` (criar)
  - `apps/mobile/app/(professor)/students/[studentId]/index.tsx` (criar)
  - `apps/mobile/app/(professor)/students/[studentId]/history.tsx` (criar)
  - `apps/mobile/app/(professor)/settings.tsx` (criar)
  - `apps/mobile/app/(professor)/_components/LessonHistoryCard.tsx` (criar)
  - `apps/mobile/app/(professor)/_components/NotificationPreview.tsx` (criar)
- **dependencies:** [T20]
- **acceptance:** `cd apps/mobile && npx tsc --noEmit 2>&1 | tail -10`
- **description:**
  Telas de gestão de alunos e histórico do professor.

  **`students/index.tsx`**: igual ao Dashboard mas sem FAB, com filtro de busca no topo (SearchBar nativo). Botão "+" no header → navega para `students/new`.

  **`students/new.tsx`**: formulário novo aluno. Nome, série (Picker), matéria (chips). Submit: `POST /students` → navega para detalhe do aluno criado.

  **`students/[studentId]/index.tsx`**: detalhe do aluno. Header: avatar grande (60px) + nome + série + matéria. Seção "Convidar pai": exibe status do convite (PENDING/CLAIMED) — se sem convite, botão "Enviar convite" abre ActionSheet com input de email (Alert.prompt no iOS, Modal com TextInput no Android). Últimas 3 aulas com link "Ver histórico completo" → `history.tsx`.

  **`students/[studentId]/history.tsx`**: `FlashList` de aulas da Expo (performante para listas longas). Cada item: `LessonHistoryCard`. Filtro de matéria: `ScrollView` horizontal de chips acima da lista. Cursor-based pagination: `onEndReached` → carrega próxima página. Empty state: "Nenhuma aula registrada ainda".

  **`LessonHistoryCard.tsx`**: card compacto — data (formatada: "Ter, 28 abr") + badge matéria + emoji emoção + `whatWasDone` (2 linhas com `numberOfLines=2`). `TouchableOpacity` expande para mostrar texto completo inline (sem navegar).

  **`NotificationPreview.tsx`**: modal overlay branco (estilo iOS notification) que aparece após submit do RegisterLessonSheet. Exibe: ícone + "Notificação enviada para [nome pai]" + preview 100 chars. Auto-dismiss 4s ou toque para fechar.

  **`settings.tsx`**: perfil do professor. Avatar editável via `expo-image-picker` + upload Cloudinary. Nome e bio editáveis. Botão "Sair" com confirmação (Alert).

---

### T22: Mobile — Pai: Onboarding via convite + LGPD

- **type:** mobile-component
- **files:**
  - `apps/mobile/app/(onboarding)/parent/_layout.tsx` (criar)
  - `apps/mobile/app/(onboarding)/parent/step-1.tsx` (criar)
  - `apps/mobile/app/(onboarding)/parent/step-2.tsx` (criar)
  - `apps/mobile/app/(onboarding)/parent/step-3.tsx` (criar — LGPD)
  - `apps/mobile/app/(onboarding)/parent/step-4.tsx` (criar — trial welcome)
- **dependencies:** [T21]
- **acceptance:** `cd apps/mobile && npx tsc --noEmit 2>&1 | tail -10`
- **description:**
  Onboarding do pai no mobile — entra via deep link `liveaula://invite/:token`.

  **Deep link handling em `app/_layout.tsx`**: usar `expo-linking` para capturar `liveaula://invite/:token`. Ao detectar: se não autenticado → navega para `(onboarding)/parent/step-1?token=:token`. Se já autenticado como PARENT → navega direto para feed.

  **`step-1.tsx`**: email pré-preenchido (read-only, vindo da API via token) + nome + senha + confirmar senha. Validação: senha min 8, confirmar igual. Submit: `POST /auth/register { role: 'PARENT', inviteToken: token }`. Sucesso: salva tokens no SecureStore → navega step-2.

  **`step-2.tsx`**: foto do filho (opcional). Instrução: "Adicione uma foto para [nome do aluno]". `expo-image-picker` → upload Cloudinary → `PATCH /students/:id { avatarUrl }`. Botão "Pular" disponível.

  **`step-3.tsx`** (LGPD M5 obrigatório):
  - ScrollView com texto completo do Termo de Consentimento Parental LGPD Art.14
  - Botão "Li e aceito os termos" **fixo no bottom** mas **desabilitado** até ScrollView atingir o fim (`onScroll` com `contentOffset.y + layoutHeight >= contentHeight - 10`)
  - Ao aceitar: `POST /consent { consentType: 'LGPD_PARENTAL_ART14', version: '1.0' }` → navega step-4
  - Não pode avançar sem scroll completo — sem "pular" neste step

  **`step-4.tsx`**: tela de boas-vindas trial. Animação de entrada (Animated scale 0.8→1.0). Exibe: "7 dias grátis ativados" + data de expiração + "Você receberá notificações sempre que [nome do aluno] tiver uma aula". CTA "Ver as aulas de [nome]" → navega `(parent)/index`.

  **Modo claro forçado**: todos os steps do onboarding pai usam `appearance="light"` no `_layout.tsx` (ignora system dark mode).

---

### T23: Mobile — Pai: Feed (FlashList paginado) + Push notifications

- **type:** mobile-component
- **files:**
  - `apps/mobile/app/(parent)/_layout.tsx` (criar — Tab navigator)
  - `apps/mobile/app/(parent)/index.tsx` (criar — Feed F1)
  - `apps/mobile/app/(parent)/_components/LessonFeedCard.tsx` (criar)
- **dependencies:** [T22]
- **acceptance:** `cd apps/mobile && npx tsc --noEmit 2>&1 | tail -10`
- **description:**
  Feed principal do pai — o momento de encantamento da plataforma.

  **`(parent)/_layout.tsx`**: Tab navigator light mode forçado. Tabs: Feed (ícone heart/book), Assinatura (ícone card), Perfil (ícone person). Surface `#FFFBF5`. `usePushNotifications()` chamado aqui para registrar token.

  **`index.tsx`** (Feed F1): `FlashList` (Shopify) de lesson cards — performante para grandes listas. Chama `GET /students/:studentId/lessons?limit=10`. Cursor-based: `onEndReached` → carrega mais. `RefreshControl` para pull-to-refresh. Header: "Aulas de [nome do filho]" + avatar do filho. Empty state: "Ainda não há aulas registradas. Seu professor receberá uma notificação para começar."

  **`LessonFeedCard.tsx`**: card com gradiente aurora (`LinearGradient` da expo com cores `#FFF7ED` → `#FED7AA`):
  - Header: avatar professor 36px + nome professor + "• há [tempo relativo]"
  - Badge matéria: `#1A6B74` background, texto branco
  - Corpo: `whatWasDone` completo (até 280 chars — nunca truncar no feed mobile)
  - Footer: emoji emoção (grande, 24px) + duração "45 min"
  - `TouchableOpacity` que navega para `lesson/[lessonId]`
  - Animação de entrada: `useAnimatedStyle` (Reanimated 2) com `FadeInDown` delay escalonado por index

  **Push notification foreground**: `addNotificationReceivedListener` → exibir `InAppNotificationBanner` (componente absoluto no topo da tela, slide down animation, auto-dismiss 4s). Conteúdo: título + body da notificação. Tap → navega para `/lesson/[lessonId]` do `data.lessonId`.

  **Push notification background/tap**: `addNotificationResponseReceivedListener` → navega para `(parent)/lesson/[lessonId]`.

---

### T24: Mobile — Pai: Detalhe aula + Assinatura + Perfil

- **type:** mobile-component
- **files:**
  - `apps/mobile/app/(parent)/lesson/[lessonId].tsx` (criar)
  - `apps/mobile/app/(parent)/subscription.tsx` (criar)
  - `apps/mobile/app/(parent)/profile.tsx` (criar)
  - `apps/mobile/app/(parent)/_components/TrialCountdown.tsx` (criar)
  - `apps/mobile/app/(parent)/_components/PaymentWebView.tsx` (criar)
- **dependencies:** [T23]
- **acceptance:** `cd apps/mobile && npx tsc --noEmit 2>&1 | tail -10`
- **description:**
  Completar as telas do pai no mobile.

  **`lesson/[lessonId].tsx`**: detalhe da aula. Stack push com `gestureEnabled: true` (swipe down dismiss no iOS). Layout:
  - Topo: avatar professor + nome + matéria em badge + data formatada
  - Card principal: `whatWasDone` em fonte Nunito 16px
  - Se `observation` presente: seção "Observação do professor" em card separado
  - Emoção: emoji grande (32px) + label textual
  - Duração: ícone relógio + "X minutos"
  - Rodapé: "Aluno: [nome] • [série]"

  **`subscription.tsx`**: status da assinatura. Chama `GET /subscription`. Renderiza baseado no status:
  - TRIAL: `TrialCountdown` + "R$79/mês após o trial" + botão "Assinar agora" → abre `PaymentWebView`
  - ACTIVE: badge verde + "Próxima cobrança: [data]" + lista de últimos pagamentos
  - PAST_DUE: Alert automático ao abrir tela "Seu pagamento está pendente"
  - CANCELLED: "Assinatura cancelada" + CTA "Reativar"

  **`TrialCountdown.tsx`**: countdown animado com `setInterval` 1s. Exibe dias + horas + minutos + segundos restantes. Se <48h: muda cor para laranja `#D95F3B`.

  **`PaymentWebView.tsx`**: WebView (`react-native-webview`) apontando para página de pagamento Asaas. Injetar `window.ReactNativeWebView` para capturar postMessage de sucesso do iframe Asaas. Ao receber mensagem de sucesso → fechar WebView → recarregar subscription. Mostrar `ActivityIndicator` enquanto WebView carrega.

  **`profile.tsx`**: foto do filho (editável via expo-image-picker → Cloudinary), nome do filho e série. Seção "Minha conta": nome do pai + email (read-only). Botão "Sair" com confirmação.

---

### T25: CI/CD setup + variáveis de ambiente + Dockerfile

- **type:** infra
- **files:**
  - `.github/workflows/ci.yml` (criar)
  - `.github/workflows/deploy-api.yml` (criar)
  - `.github/workflows/deploy-web.yml` (criar)
  - `apps/api/Dockerfile` (criar)
  - `.env.example` (raiz, criar)
  - `.gitignore` (criar)
- **dependencies:** [T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11, T12, T13, T14, T15, T16, T17, T18, T19, T20, T21, T22, T23, T24]
- **acceptance:** `gh workflow run ci.yml --dry-run 2>&1 | grep -i "ok\|valid" || cat .github/workflows/ci.yml | npx js-yaml - > /dev/null && echo "YAML valid"`
- **description:**
  Configurar CI/CD completo para o monorepo.

  **`.github/workflows/ci.yml`** (roda em todo PR):
  ```yaml
  triggers: pull_request (branches: main, develop)
  jobs:
    lint-and-type-check:
      runs-on: ubuntu-latest
      steps: pnpm install → pnpm -r lint → pnpm -r tsc --noEmit
    test-api:
      runs-on: ubuntu-latest
      services: postgres:15 (DATABASE_URL em secrets)
      steps: pnpm install → cd apps/api → prisma migrate deploy → jest --forceExit --ci
    test-web:
      runs-on: ubuntu-latest
      steps: pnpm install → playwright install chromium → playwright test
    build-check:
      runs-on: ubuntu-latest
      steps: pnpm install → pnpm --filter @liveaula/api build → pnpm --filter @liveaula/web build
  ```

  **`.github/workflows/deploy-api.yml`** (roda em push para main):
  - Build Docker image: `docker build -t liveaula-api apps/api/`
  - Push para Railway via `railway up` usando `RAILWAY_TOKEN` secret
  - Roda `prisma migrate deploy` como post-deploy hook no Railway

  **`.github/workflows/deploy-web.yml`** (roda em push para main):
  - `vercel --prod` via Vercel GitHub integration (não custom action — usar integration nativa do Vercel)
  - Apenas documenta — Vercel integration é configurada no painel

  **`apps/api/Dockerfile`**:
  ```dockerfile
  FROM node:20-alpine
  RUN corepack enable && corepack prepare pnpm@latest --activate
  WORKDIR /app
  COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
  COPY packages/shared/package.json packages/shared/
  COPY apps/api/package.json apps/api/
  RUN pnpm install --frozen-lockfile --filter @liveaula/api...
  COPY packages/shared/ packages/shared/
  COPY apps/api/ apps/api/
  RUN pnpm --filter @liveaula/api build
  WORKDIR /app/apps/api
  RUN npx prisma generate
  EXPOSE 3000
  CMD ["node", "dist/server.js"]
  ```

  **`.gitignore`**: node_modules, .env, .env.local, dist, .next, .expo, android/, ios/, *.log, .DS_Store, coverage/.

  **Variáveis de ambiente por ambiente**:
  | Variável | Dev | Railway Prod |
  |---|---|---|
  | DATABASE_URL | localhost:5432/liveaula | Railway PostgreSQL |
  | JWT_SECRET | dev-secret-32chars | Railway secret |
  | ASAAS_API_KEY | sandbox key | prod key |
  | ASAAS_WEBHOOK_TOKEN | qualquer string | Railway secret |
  | FCM_SERVER_KEY | Expo project key | mesmo |
  | CLOUDINARY_* | conta dev | conta prod |

---

### T26: API — Lógica de gratuidade professor (5+ pais pagantes = R$0) **[FIX I04]**

- **type:** api-endpoint
- **files:**
  - `apps/api/prisma/schema.prisma` (modificar — adicionar campo `planStatus` em User)
  - `apps/api/prisma/migrations/005_professor_plan_status/migration.sql` (criar)
  - `apps/api/src/services/billing.service.ts` (criar)
  - `apps/api/src/routes/cron.routes.ts` (criar — endpoint interno para Railway cron)
  - `apps/api/tests/billing.test.ts` (criar)
- **dependencies:** [T7]
- **acceptance:** `cd apps/api && npx jest --testPathPattern=billing --forceExit --runInBand 2>&1 | tail -5`
- **description:**
  Implementar o modelo de gratuidade do professor definido no product-spec seção 3: professor com 5+ pais pagantes vinculados tem acesso gratuito (planStatus = 'FREE').

  **Prisma schema update**: adicionar `planStatus ProfessorPlanStatus @default(PAID)` em User. Enum `ProfessorPlanStatus { FREE PAID }`. Migration `005_professor_plan_status`.

  **`billing.service.ts`**:
  - `countActivePaidParentsForProfessor(professorId)`: query Prisma que conta `StudentParent` onde `student.professorId = professorId` AND `subscription.status = 'ACTIVE'` — une Student → StudentParent → Subscription
  - `updateProfessorPlanStatus(professorId)`: chama `countActivePaidParents`, se ≥ 5 → seta `User.planStatus = 'FREE'`, senão → `'PAID'`
  - `syncAllProfessorsPlanStatus()`: busca todos os professores ativos, chama `updateProfessorPlanStatus` para cada um em batches de 50 (evitar timeout)

  **`cron.routes.ts`**: endpoint `POST /internal/sync-professor-plans` protegido por header `X-Internal-Secret: env.INTERNAL_CRON_SECRET` (não JWT — chamado por Railway cron, não por usuário). Chama `billing.service.syncAllProfessorsPlanStatus()`. Rate limit: 1/min.

  **Railway cron**: configurar no `railway.json` ou via dashboard: `0 3 * * *` (diariamente às 3h BRT) executando `POST /internal/sync-professor-plans` com o header secreto.

  **`GET /me` enriquecido**: adicionar `planStatus` no retorno do endpoint `GET /me` para professor — o app mobile exibe badge "Gratuito" se `planStatus === 'FREE'`.

  **Testes (`billing.test.ts`)**:
  1. Professor com 0 pais pagantes: `planStatus = 'PAID'`
  2. Professor com 4 pais pagantes: `planStatus = 'PAID'`
  3. Professor com 5 pais pagantes (todos ACTIVE): `planStatus = 'FREE'`
  4. Professor com 5 pais mas 2 com status CANCELLED: conta apenas os ACTIVE → `planStatus = 'PAID'`
  5. `POST /internal/sync-professor-plans` sem header: 401
  6. `POST /internal/sync-professor-plans` com header correto: 200, atualiza todos

---

## Concerns

### C1: Conta sandbox Asaas deve ser provisionada antes do Sprint S2 (T7)
T7 depende de credenciais Asaas sandbox funcionais. Provisionar conta em `sandbox.asaas.com` e configurar `ASAAS_API_KEY` no `.env.local` antes de iniciar S2. Webhooks locais requerem `ngrok` ou `smee.io` para receber eventos do sandbox. **Bloqueante para T7.**

### C2: Expo Push Token exige conta Expo e projeto EAS configurado antes do T6
`notification.service.ts` usa `Expo.sendPushNotificationsAsync` — requer que o app mobile esteja registrado no Expo Application Services (EAS). Criar projeto EAS antes de implementar T6 para obter `projectId`. O `projectId` vai em `app.json` e em `getExpoPushTokenAsync({ projectId })`.

### C3: Cloudinary upload preset deve existir antes de T10/T19
As telas de avatar (web T10, mobile T19) dependem de um upload preset público chamado `liveaula` no Cloudinary. Criar preset antes do sprint S2/S3 no painel Cloudinary. Configurar: modo `unsigned`, folder `avatars`, transformations: `c_fill,w_256,h_256,q_auto`.

### C4: `lgpdGuard` deve ser aplicado em todos os endpoints que expõem dados do filho
Risco de esquecer o middleware em novos endpoints. Recomendação: criar teste de segurança transversal (`tests/security.test.ts`) que lista todos os endpoints que retornam dados de `Student` ou `Lesson` e verifica que PARENT sem ConsentLog recebe 403.

### C5: Cursor-based pagination — cursos inconsistentes se criados no mesmo ms
`findManyByProfessor` usa `createdAt < cursorLesson.createdAt` como filtro. Se dois lessons são criados no mesmo milissegundo (improvável mas possível), o cursor pode retornar duplicatas. Mitigação: usar `(createdAt, id)` como cursor composto — `WHERE (createdAt, id) < (cursorCreatedAt, cursorId)` com índice composto.

### C6: Refresh token em SecureStore no mobile exige `expo-secure-store` ≥ v13
Versões anteriores têm limitação de tamanho (2048 bytes). O refresh token é 128 chars hex — dentro do limite. Verificar `expo-secure-store@13.x` antes de fixar versão no `package.json`.

### C7: CORS em desenvolvimento vs produção
`apps/api/src/plugins/cors.ts` deve ter allowlist explícita: `['http://localhost:3001', 'https://liveaula.vercel.app', env.WEB_URL]`. Nunca `origin: '*'` — auth cookies não funcionam com `*` em CORS. Em Railway, configurar `CORS_ORIGIN` como variável de ambiente.

### C8: Admin sem rota de cadastro — reset de senha manual
Conforme concern #6 de Carla: admin criado via seed. Documentar em `README.md` (ou `apps/api/prisma/seed.ts` comentários) o procedimento para reset de senha admin em produção: `railway run npx tsx apps/api/prisma/reset-admin-password.ts`.

---

*Plano produzido por Diego — Papel de Planejamento, liveaula-dev Phase 1*
*Próximos passos: Oscar (API Implementation) lê T1–T8; Eduardo/Sophia (Web) leem T9–T17; Miguel/Luna (Mobile) leem T18–T24; Haiku (CI/CD) lê T25*
