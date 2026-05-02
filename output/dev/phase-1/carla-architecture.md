# Carla — Arquitetura Técnica MVP | liveaula-dev Phase 1

**Data:** 29/04/2026
**Papel:** Carla (Arquitetura)
**Input:** alice-discovery.md + bruno-priority.md + product-spec.md v1.0 + DESIGN.md v1.1

---

## Confidence: 0.91

Confiança alta. Stack definida, design aprovado, análises de Alice e Bruno são coerentes. O risco arquitetural real está em 3 pontos: (1) refresh token em httpOnly cookie vs SecureStore no Expo, (2) push FCM latência <5s em produção, (3) isolamento de dados entre papéis (professor não lê dados de outros professores). Esses 3 pontos estão detalhados em Concerns.

---

## Approach (high-level)

A arquitetura segue discriminated union no model `User` com enum `role` (PROFESSOR | PARENT | ADMIN), eliminando tabelas separadas e simplificando auth. Todas as queries Prisma usam `select` explícito para nunca vazar `passwordHash` ou `refreshToken`. O core loop (POST /lessons) é síncrono para garantir <200ms de resposta e dispara FCM de forma assíncrona via `setImmediate` — responde ao professor antes de esperar confirmação FCM, garantindo <30s UX sem sacrificar SLA de <5s de push. Web usa Server Components para leitura de dados e Client Components apenas onde há interatividade (formulários, real-time). Mobile usa Expo Router com segmentos `(professor)` e `(parent)` completamente separados — sem conditional rendering em runtime para papéis diferentes. Admin fica em route group próprio com middleware de role ADMIN.

---

## Prisma Schema

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── Enums ───────────────────────────────────────────────────────────────────

enum Role {
  PROFESSOR
  PARENT
  ADMIN
}

enum InvitationStatus {
  PENDING
  CLAIMED
  EXPIRED
}

enum SubscriptionStatus {
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELLED
  SUSPENDED
}

enum LessonEmotion {
  GREAT
  GOOD
  NEUTRAL
  DIFFICULT
  CHALLENGING
}

enum ConsentType {
  LGPD_PARENTAL_ART14
  TERMS_OF_USE
  PRIVACY_POLICY
}

// ─── User (Professor + Parent + Admin — discriminated via role) ───────────────

model User {
  id             String   @id @default(cuid())
  email          String   @unique
  passwordHash   String
  refreshToken   String?  // httpOnly cookie origin; rotated on use
  role           Role
  name           String
  avatarUrl      String?
  bio            String?  // professor only — short bio
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  // Professor relations
  students       Student[]       @relation("ProfessorStudents")
  lessons        Lesson[]        @relation("ProfessorLessons")
  sentInvitations Invitation[]   @relation("ProfessorInvitations")

  // Parent relations
  parentStudents StudentParent[]
  subscription   Subscription?
  deviceTokens   DeviceToken[]
  consentLogs    ConsentLog[]

  // Admin — no extra relations

  @@index([email])
  @@index([role])
}

// ─── Subject (predefined list, seeded) ───────────────────────────────────────

model Subject {
  id       String    @id @default(cuid())
  name     String    @unique  // e.g. "Matemática", "Português"
  slug     String    @unique  // e.g. "matematica"

  lessons  Lesson[]
  students Student[]
}

// ─── Student ──────────────────────────────────────────────────────────────────

model Student {
  id           String   @id @default(cuid())
  name         String
  gradeLevel   String   // e.g. "6º ano EF", "1ª série EM"
  avatarUrl    String?
  professorId  String
  subjectId    String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  professor    User          @relation("ProfessorStudents", fields: [professorId], references: [id])
  subject      Subject       @relation(fields: [subjectId], references: [id])
  lessons      Lesson[]
  parents      StudentParent[]
  invitations  Invitation[]

  @@index([professorId])
  @@index([subjectId])
  @@index([professorId, isActive])
}

// ─── StudentParent (M:N — one parent per student in MVP, extensible) ─────────

model StudentParent {
  id        String   @id @default(cuid())
  studentId String
  parentId  String
  linkedAt  DateTime @default(now())

  student   Student  @relation(fields: [studentId], references: [id])
  parent    User     @relation(fields: [parentId], references: [id])

  @@unique([studentId, parentId])
  @@index([parentId])
  @@index([studentId])
}

// ─── Lesson ───────────────────────────────────────────────────────────────────

model Lesson {
  id           String        @id @default(cuid())
  professorId  String
  studentId    String
  subjectId    String
  durationMin  Int           // duration in minutes (15, 30, 45, 60, 90, 120)
  whatWasDone  String        @db.VarChar(280)  // core content, 280 char max
  observation  String?       @db.VarChar(500)  // optional
  emotion      LessonEmotion?
  notifiedAt   DateTime?     // timestamp when FCM was sent
  fcmMessageId String?       // Firebase message ID for tracking
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  professor    User    @relation("ProfessorLessons", fields: [professorId], references: [id])
  student      Student @relation(fields: [studentId], references: [id])
  subject      Subject @relation(fields: [subjectId], references: [id])

  @@index([studentId, createdAt(sort: Desc)])   // feed pai (critical path)
  @@index([professorId, createdAt(sort: Desc)])  // dashboard professor
  @@index([studentId, subjectId])               // histórico filtrado por matéria
}

// ─── Invitation ───────────────────────────────────────────────────────────────

model Invitation {
  id           String           @id @default(cuid())
  professorId  String
  studentId    String
  parentEmail  String
  token        String           @unique  // 32 bytes random, URL-safe base64
  status       InvitationStatus @default(PENDING)
  expiresAt    DateTime         // 7 days from creation
  claimedAt    DateTime?
  claimedById  String?          // parentId after claim
  createdAt    DateTime         @default(now())

  professor    User    @relation("ProfessorInvitations", fields: [professorId], references: [id])
  student      Student @relation(fields: [studentId], references: [id])

  @@index([token])
  @@index([professorId])
  @@index([parentEmail])
}

// ─── Subscription ─────────────────────────────────────────────────────────────

model Subscription {
  id                     String             @id @default(cuid())
  parentId               String             @unique
  studentId              String
  externalSubscriptionId String?            // Asaas subscription ID
  externalCustomerId     String?            // Asaas customer ID
  status                 SubscriptionStatus @default(TRIAL)
  planAmountCents        Int                @default(7900)  // R$79,00
  trialStartsAt          DateTime           @default(now())
  trialEndsAt            DateTime           // +7 days
  currentPeriodStart     DateTime?
  currentPeriodEnd       DateTime?
  cancelledAt            DateTime?
  createdAt              DateTime           @default(now())
  updatedAt              DateTime           @updatedAt

  parent       User    @relation(fields: [parentId], references: [id])

  payments     Payment[]

  @@index([parentId])
  @@index([status])
  @@index([externalSubscriptionId])
}

// ─── Payment (webhook-driven) ─────────────────────────────────────────────────

model Payment {
  id               String   @id @default(cuid())
  subscriptionId   String
  externalPaymentId String  // Asaas payment ID
  amountCents      Int
  status           String   // paid | pending | failed | refunded
  paidAt           DateTime?
  failureReason    String?
  rawWebhookPayload Json    // store raw for debugging
  createdAt        DateTime @default(now())

  subscription Subscription @relation(fields: [subscriptionId], references: [id])

  @@index([subscriptionId])
  @@index([externalPaymentId])
}

// ─── DeviceToken (FCM push) ───────────────────────────────────────────────────

model DeviceToken {
  id            String   @id @default(cuid())
  userId        String
  token         String   @unique
  platform      String   // "ios" | "android"
  isValid       Boolean  @default(true)
  lastVerified  DateTime @default(now())
  createdAt     DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId, isValid])
}

// ─── ConsentLog (LGPD Art.14) ─────────────────────────────────────────────────

model ConsentLog {
  id          String      @id @default(cuid())
  userId      String
  consentType ConsentType
  version     String      // e.g. "1.0" — version of the terms accepted
  ipAddress   String
  userAgent   String?
  grantedAt   DateTime    @default(now())
  revokedAt   DateTime?   // null = still active

  user User @relation(fields: [userId], references: [id])

  @@index([userId, consentType])
  @@index([grantedAt])
}
```

**Decisões do schema:**
- `refreshToken` em `User`: uma única string (rotacionada a cada uso — rotate-on-use pattern). Não é array — professor/pai tem 1 sessão ativa por vez no MVP.
- `Lesson.whatWasDone` tem `@db.VarChar(280)` correspondendo ao limite de UI.
- `Subscription.planAmountCents` em centavos para evitar float arithmetic em valores monetários.
- `ConsentLog` é append-only com `revokedAt` nulável — nunca deletar, apenas marcar revogação.
- `rawWebhookPayload Json` em Payment para auditoria e debugging de webhooks Asaas.

---

## API Endpoints

### Auth

| Method | Path | Description | Auth | Rate Limit | Zod Schema Summary |
|---|---|---|---|---|---|
| POST | `/auth/register` | Cadastro professor ou parent via convite | None | 5 req/min por IP | `email: z.string().email(), password: z.string().min(8).max(72), role: z.enum(['PROFESSOR','PARENT']), inviteToken?: z.string()` |
| POST | `/auth/login` | Login com email+senha, retorna JWT + seta cookie refresh | None | 10 req/min por IP | `email: z.string().email(), password: z.string()` |
| POST | `/auth/refresh` | Novo access token via cookie refreshToken | Cookie | 30 req/min por userId | `— (lê cookie httpOnly)` |
| POST | `/auth/logout` | Invalida refreshToken, limpa cookie | JWT | 30 req/min por userId | `—` |

### Lessons

| Method | Path | Description | Auth | Rate Limit | Zod Schema Summary |
|---|---|---|---|---|---|
| POST | `/lessons` | Registra nova aula, dispara FCM async | JWT PROFESSOR | 60 req/min por userId | `studentId: cuid, subjectId: cuid, durationMin: z.enum([15,30,45,60,90,120]), whatWasDone: z.string().min(1).max(280), observation?: z.string().max(500), emotion?: z.enum([...LessonEmotion])` |
| GET | `/lessons` | Histórico de aulas do professor (todas) | JWT PROFESSOR | 120 req/min | `?cursor, ?limit=10, ?studentId, ?subjectId` |
| GET | `/students/:studentId/lessons` | Histórico de aulas de um aluno (professor ou parent autorizado) | JWT | 120 req/min | `?cursor, ?limit=10, ?subjectId, ?from, ?to` |
| GET | `/lessons/:id` | Detalhe de uma aula | JWT | 120 req/min | `—` |

### Students

| Method | Path | Description | Auth | Rate Limit | Zod Schema Summary |
|---|---|---|---|---|---|
| POST | `/students` | Cria novo aluno | JWT PROFESSOR | 30 req/min por userId | `name: z.string().min(2).max(100), gradeLevel: z.string(), subjectId: cuid, avatarUrl?: z.string().url()` |
| GET | `/students` | Lista alunos do professor autenticado | JWT PROFESSOR | 120 req/min | `?search, ?isActive=true` |
| GET | `/students/:id` | Detalhe de aluno | JWT | 120 req/min | `—` |
| PATCH | `/students/:id` | Atualiza dados do aluno | JWT PROFESSOR | 30 req/min | `name?, gradeLevel?, subjectId?, avatarUrl?, isActive?` |

### Invitations

| Method | Path | Description | Auth | Rate Limit | Zod Schema Summary |
|---|---|---|---|---|---|
| POST | `/invitations` | Gera link convite professor→pai | JWT PROFESSOR | 10 req/min por userId | `studentId: cuid, parentEmail: z.string().email()` |
| GET | `/invitations/:token` | Valida token e retorna dados pré-preenchidos | None | 20 req/min por IP | `—` |
| GET | `/invitations` | Lista convites enviados pelo professor | JWT PROFESSOR | 60 req/min | `?status` |

### Me (perfil autenticado)

| Method | Path | Description | Auth | Rate Limit | Zod Schema Summary |
|---|---|---|---|---|---|
| GET | `/me` | Perfil do usuário autenticado (sem passwordHash, sem refreshToken) | JWT | 120 req/min | `—` |
| PATCH | `/me` | Atualiza perfil | JWT | 10 req/min | `name?, bio?, avatarUrl?` |
| GET | `/me/students` | Alunos vinculados (professor: seus alunos; parent: filho vinculado) | JWT | 120 req/min | `—` |
| POST | `/me/device-tokens` | Registra ou atualiza FCM device token | JWT | 30 req/min | `token: z.string(), platform: z.enum(['ios','android'])` |
| DELETE | `/me/device-tokens/:token` | Remove device token | JWT | 30 req/min | `—` |

### Subscriptions

| Method | Path | Description | Auth | Rate Limit | Zod Schema Summary |
|---|---|---|---|---|---|
| GET | `/subscription` | Status da assinatura do parent autenticado | JWT PARENT | 60 req/min | `—` |
| POST | `/subscription` | Inicia assinatura (após trial) | JWT PARENT | 5 req/min | `paymentMethodToken: z.string()` (Asaas token) |
| GET | `/subscription/payments` | Histórico de cobranças | JWT PARENT | 60 req/min | `?limit=10` |

### Webhooks

| Method | Path | Description | Auth | Rate Limit | Zod Schema Summary |
|---|---|---|---|---|---|
| POST | `/webhooks/asaas` | Recebe eventos Asaas (pagamento, falha, renovação) | Asaas signature | 200 req/min | Raw body — validado via HMAC signature header |

### Admin

| Method | Path | Description | Auth | Rate Limit | Zod Schema Summary |
|---|---|---|---|---|---|
| GET | `/admin/users` | Lista todos os usuários | JWT ADMIN | 30 req/min | `?role, ?isActive, ?cursor, ?limit=20` |
| PATCH | `/admin/users/:id/status` | Ativa ou desativa conta | JWT ADMIN | 20 req/min | `isActive: z.boolean()` |
| GET | `/admin/subscriptions` | Lista assinaturas com status | JWT ADMIN | 30 req/min | `?status, ?cursor` |
| GET | `/admin/metrics` | DAU, MAU, churn, conversão (calculados) | JWT ADMIN | 10 req/min | `?from, ?to` |

### Misc

| Method | Path | Description | Auth | Rate Limit | Zod Schema Summary |
|---|---|---|---|---|---|
| GET | `/health` | Health check | None | None | `—` |
| GET | `/subjects` | Lista matérias disponíveis (seed) | JWT | 120 req/min | `—` |
| POST | `/consent` | Registra consentimento LGPD explícito | JWT | 5 req/min | `consentType: z.enum([...ConsentType]), version: z.string()` |

**Regras de autorização transversais:**
- Professor só acessa seus próprios `students`, `lessons`, `invitations`
- Parent só acessa `lessons` de `students` vinculados via `StudentParent`
- Admin acessa tudo via middleware `requireRole('ADMIN')`
- Nenhuma query expõe `passwordHash` ou `refreshToken` — `select` explícito em todo Prisma client call

---

## Web Pages/Components (Next.js 14 App Router)

### Estrutura de route groups

```
apps/web/src/app/
  (professor)/                       ← layout: sidebar, #1A6B74, Plus Jakarta Sans, dense
    layout.tsx                       [Server] — lê sessão via cookie, redireciona se não autenticado
    page.tsx                         [Server] — redirect → /dashboard
    dashboard/
      page.tsx                       [Server] — fetch students list
      loading.tsx                    [Server] — skeleton
      _components/
        StudentCard.tsx              [Client] — hover states, popover convite
        StudentGrid.tsx              [Client] — grid + busca real-time
        EmptyState.tsx               [Server] — static
    students/
      new/
        page.tsx                     [Client] — formulário novo aluno (Zod + react-hook-form)
      [studentId]/
        page.tsx                     [Server] — detalhe aluno + histórico aulas
        loading.tsx
        _components/
          LessonTimeline.tsx         [Client] — infinite scroll cursor-based
          LessonCard.tsx             [Server] — static card
    register-lesson/
      page.tsx                       [Client] — P5 formulário <30s, smart defaults de localStorage
      _components/
        RegisterLessonForm.tsx       [Client] — controlled form + timer UX
        NotificationPreview.tsx      [Client] — iOS-style preview após submit
    invitations/
      page.tsx                       [Server] — lista convites
    settings/
      page.tsx                       [Client] — perfil + foto (Cloudinary upload)

  (parent)/                          ← layout: coluna centrada 640px max, #FFFBF5, light-only, Nunito
    layout.tsx                       [Server] — lê sessão, redireciona se não autenticado
    feed/
      page.tsx                       [Server] — SSR primeiros 10 lessons (SEO não é requisito, mas performance sim)
      loading.tsx
      _components/
        LessonFeed.tsx               [Client] — infinite scroll com SWR/useSWRInfinite
        LessonFeedCard.tsx           [Client] — gradiente aurora, animação entrada
    lessons/
      [lessonId]/
        page.tsx                     [Server] — detalhe da aula
    subscription/
      page.tsx                       [Server] — status assinatura
      _components/
        TrialBanner.tsx              [Client] — countdown absoluto (data/hora)
        PaymentModal.tsx             [Client] — iframe Asaas
    profile/
      page.tsx                       [Client] — foto filho, nome, série

  (admin)/                           ← layout: utilitário, #F8FAFC, tabela-first, Inter
    layout.tsx                       [Server] — exige role ADMIN
    page.tsx                         [Server] — redirect → /users
    users/
      page.tsx                       [Server] — tabela professores + pais
      _components/
        UserTable.tsx                [Client] — sort, ações inline
    subscriptions/
      page.tsx                       [Server] — tabela assinaturas
    metrics/
      page.tsx                       [Server] — cards DAU/MAU/churn

  (auth)/                            ← sem layout autenticado
    login/
      page.tsx                       [Client] — email + senha
    register/
      page.tsx                       [Client] — professor: signup direto
    invite/
      [token]/
        page.tsx                     [Server] — fetch invite data, redireciona para onboarding pai

  (onboarding)/
    professor/
      page.tsx                       [Client] — O1-O3 multi-step wizard
    parent/
      page.tsx                       [Client] — M1-M4 (token via query param)
      _components/
        LgpdConsentStep.tsx          [Client] — scroll obrigatório (IntersectionObserver no bottom anchor)
        TrialWelcomeStep.tsx         [Client] — trial 7 dias CTA
```

### Estratégia de dados

- Server Components fazem `fetch` direto para `apps/api` com cookie de sessão forwarded via `headers()`
- Client Components usam SWR com `fetcher` que lê token do cookie via `document.cookie` (httpOnly inacessível — access token em memória, não localStorage)
- Access token armazenado em **React Context** (memória, não localStorage) — segurança XSS
- `middleware.ts` na raiz de `apps/web`: verifica cookie `refreshToken`, redireciona rotas protegidas
- Revalidação com `revalidateTag` e `next/cache` para dados do feed pai

---

## Mobile Screens/Components (React Native + Expo)

### Expo Router file structure

```
apps/mobile/app/
  _layout.tsx                        ← root: ThemeProvider, AuthProvider, SplashScreen
  (auth)/
    _layout.tsx                      ← Stack navigator
    login.tsx                        ← email + senha
    register.tsx                     ← professor signup
  (onboarding)/
    _layout.tsx                      ← Stack navigator, light mode forçado
    professor/
      _layout.tsx
      step-1.tsx                     ← email + senha
      step-2.tsx                     ← avatar + nome + matérias multi-select
      step-3.tsx                     ← confirmação
    parent/
      _layout.tsx
      step-1.tsx                     ← email pré-preenchido + senha
      step-2.tsx                     ← avatar filho + nome + série + matérias
      step-3.tsx                     ← LGPD Art.14 (BottomSheet com ScrollView + detector reach-bottom)
      step-4.tsx                     ← trial welcome
  (professor)/
    _layout.tsx                      ← Tab navigator: Dashboard | Alunos | Config
                                        dark mode: useColorScheme(); surface #0D1117
    index.tsx                        ← Dashboard (D1): FlatList alunos + FAB [+]
    students/
      _layout.tsx                    ← Stack
      index.tsx                      ← lista alunos (reusa D1 list)
      new.tsx                        ← formulário novo aluno
      [studentId]/
        index.tsx                    ← detalhe aluno + histórico
        history.tsx                  ← FlashList de lessons com filtro matéria
    settings.tsx                     ← perfil professor
    _components/
      RegisterLessonSheet.tsx        ← BottomSheet (Gorhom) com form P5
                                        campos: Aluno select | Matéria pills | Duração segmented | Textarea | Obs | Emoji
                                        keyboard: behavior=padding (iOS) / adjustResize (Android)
                                        submit: loading → haptic.success → sheet fecha → toast
      StudentListItem.tsx            ← Avatar 32px + nome + badge status + chevron
      LessonHistoryCard.tsx          ← card data + matéria + whatWasDone (2 linhas)
      NotificationPreview.tsx        ← modal overlay iOS-style (universal white card em Android)
  (parent)/
    _layout.tsx                      ← Tab navigator: Feed | Assinatura | Perfil
                                        light mode forçado (ignora system theme), surface #FFFBF5
    index.tsx                        ← Feed (F1): FlashList de lesson cards
    lesson/
      [lessonId].tsx                 ← detalhe aula (F2): stack push com swipe-down dismiss
    subscription.tsx                 ← S1: trial counter + histórico + botão pagamento
    profile.tsx                      ← foto filho, nome, série
    _components/
      LessonFeedCard.tsx             ← gradiente aurora + conteúdo + emotion
      TrialCountdown.tsx             ← data/hora absoluta expiração
      PaymentWebView.tsx             ← WebView do iframe Asaas
```

### Estado offline

MVP usa **online-only** com `NetInfo.fetch()` antes de POST /lessons. Se offline, exibe Alert "Sem conexão — tente novamente". Não implementar offline queue em S1 (risco de sync conflict supera benefício). Offline store (expo-sqlite) entra em S2+ se dados mostram que registro em área sem sinal é frequente.

### Dados sensíveis no mobile

- Access token: `SecureStore` da Expo (não AsyncStorage)
- Refresh token: `SecureStore` com chave `liveaula.refreshToken`
- Cookie httpOnly do backend **não funciona em React Native** — usar SecureStore como transporte

### Push notification lifecycle

```
onAppForeground + onMountApp:
  1. expo-notifications.getExpoPushTokenAsync()
  2. POST /me/device-tokens { token, platform }
  3. backend upsert DeviceToken (onConflict token → update isValid=true, lastVerified=now)

onNotificationReceived (foreground):
  expo-notifications.addNotificationReceivedListener → mostrar InAppNotificationBanner

onNotificationResponse (tap):
  → navigate para /feed (parent) ou ignorar (professor)
```

---

## Shared Types (packages/shared/)

```
packages/shared/
  src/
    types/
      user.ts          ← UserRole, UserPublic (sem passwordHash/refreshToken)
      lesson.ts        ← Lesson, LessonEmotion, CreateLessonInput, LessonListItem
      student.ts       ← Student, CreateStudentInput
      invitation.ts    ← Invitation, InvitationStatus, InvitationPublic
      subscription.ts  ← Subscription, SubscriptionStatus, Payment
      consent.ts       ← ConsentLog, ConsentType
      pagination.ts    ← CursorPage<T>, CursorPageMeta
    schemas/
      lesson.schema.ts      ← Zod schemas: createLessonSchema, listLessonsQuerySchema
      auth.schema.ts        ← Zod: registerSchema, loginSchema
      student.schema.ts     ← Zod: createStudentSchema, updateStudentSchema
      invitation.schema.ts  ← Zod: createInvitationSchema
      consent.schema.ts     ← Zod: consentSchema
    design-tokens.ts        ← cores, tipografia, espaçamentos (sem deps runtime)
    index.ts                ← re-export tudo
  package.json             ← { "name": "@liveaula/shared", "main": "src/index.ts" }
  tsconfig.json
```

### Tipos críticos

```typescript
// packages/shared/src/types/user.ts
export type UserRole = 'PROFESSOR' | 'PARENT' | 'ADMIN'

export interface UserPublic {
  id: string
  email: string
  name: string
  role: UserRole
  avatarUrl: string | null
  bio: string | null
  isActive: boolean
  createdAt: string  // ISO 8601
}

// packages/shared/src/types/lesson.ts
export type LessonEmotion = 'GREAT' | 'GOOD' | 'NEUTRAL' | 'DIFFICULT' | 'CHALLENGING'

export interface Lesson {
  id: string
  professorId: string
  studentId: string
  subjectId: string
  durationMin: number
  whatWasDone: string
  observation: string | null
  emotion: LessonEmotion | null
  notifiedAt: string | null
  createdAt: string
}

export interface LessonListItem extends Pick<Lesson,
  'id' | 'studentId' | 'subjectId' | 'durationMin' |
  'whatWasDone' | 'emotion' | 'createdAt'
> {
  professor: Pick<UserPublic, 'id' | 'name' | 'avatarUrl'>
  subject: { id: string; name: string }
}

export interface CreateLessonInput {
  studentId: string
  subjectId: string
  durationMin: 15 | 30 | 45 | 60 | 90 | 120
  whatWasDone: string   // max 280 chars
  observation?: string  // max 500 chars
  emotion?: LessonEmotion
}

// packages/shared/src/types/pagination.ts
export interface CursorPageMeta {
  nextCursor: string | null
  hasMore: boolean
  total?: number
}

export interface CursorPage<T> {
  data: T[]
  meta: CursorPageMeta
}

// packages/shared/src/design-tokens.ts
export const colors = {
  primary: '#1A6B74',
  accent: '#D95F3B',
  professor: {
    surface: '#F1F5F9',
    surfaceDark: '#0D1117',
    text: '#0F172A',
    textDark: '#F8FAFC',
  },
  parent: {
    surface: '#FFFBF5',
    text: '#1C1917',
  },
  admin: {
    surface: '#F8FAFC',
  },
} as const

export const spacing = {
  touchTarget: 44,  // px — mínimo obrigatório
  fabBottom: 88,    // px — FAB bottom clearance
} as const
```

---

## Design Patterns

### 1. Repository pattern leve (Fastify plugins)

```
apps/api/src/
  plugins/
    prisma.ts      ← decorate fastify com `prisma` client singleton
    jwt.ts         ← decorate fastify com `verifyJwt`, `signTokens`
    rateLimit.ts   ← plugin fastify-rate-limit com configs por rota
  repositories/
    lesson.repository.ts     ← findMany, create, findById — sempre com select explícito
    student.repository.ts
    user.repository.ts
    invitation.repository.ts
    subscription.repository.ts
  services/
    lesson.service.ts        ← orquestra repository + FCM dispatch
    notification.service.ts  ← sendPushToParent, getValidTokens
    invitation.service.ts    ← generateToken, validateToken, claim
    payment.service.ts       ← Asaas SDK wrapper
  routes/
    auth.routes.ts
    lessons.routes.ts
    students.routes.ts
    invitations.routes.ts
    me.routes.ts
    subscription.routes.ts
    webhooks.routes.ts
    admin.routes.ts
  middleware/
    requireAuth.ts           ← verifica JWT, anexa `request.user`
    requireRole.ts           ← verifica role do `request.user`
    lgpdGuard.ts             ← verifica ConsentLog antes de expor dados do filho
```

### 2. Select explícito em todas as queries Prisma

```typescript
// CORRETO — sempre assim
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    role: true,
    avatarUrl: true,
    bio: true,
    isActive: true,
    createdAt: true,
    // passwordHash: NUNCA
    // refreshToken: NUNCA
  },
})

// PROIBIDO
const user = await prisma.user.findUnique({ where: { id } })
```

### 3. FCM async fire-and-forget com logging

```typescript
// lesson.service.ts
async createLesson(data: CreateLessonInput, professorId: string): Promise<Lesson> {
  const lesson = await lessonRepository.create({ ...data, professorId })

  // Disparo assíncrono — não bloqueia resposta ao professor
  setImmediate(async () => {
    try {
      const result = await notificationService.sendPushToParent(data.studentId, lesson)
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { notifiedAt: new Date(), fcmMessageId: result.messageId },
      })
    } catch (err) {
      // Log mas não falha — aula já foi salva
      fastify.log.error({ err, lessonId: lesson.id }, 'FCM push failed')
    }
  })

  return lesson
}
```

### 4. LGPD guard middleware

```typescript
// middleware/lgpdGuard.ts
// Aplicado em: GET /students/:id/lessons (acesso parent), GET /me/students (parent)
export async function lgpdGuard(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.id
  const hasConsent = await prisma.consentLog.findFirst({
    where: {
      userId,
      consentType: 'LGPD_PARENTAL_ART14',
      revokedAt: null,
    },
    select: { id: true },
  })
  if (!hasConsent) {
    return reply.status(403).send({
      error: 'LGPD_CONSENT_REQUIRED',
      message: 'Consentimento LGPD Art.14 necessário antes de acessar dados do menor',
    })
  }
}
```

### 5. Rotate-on-use refresh tokens

```typescript
// auth.service.ts — previne refresh token reuse attack
async refreshTokens(oldRefreshToken: string): Promise<Tokens> {
  const user = await prisma.user.findFirst({
    where: { refreshToken: oldRefreshToken },
    select: { id: true, role: true, refreshToken: true },
  })
  if (!user) throw new UnauthorizedError('Invalid refresh token')

  const newRefreshToken = crypto.randomBytes(64).toString('hex')
  const newAccessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: '15m' })

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: newRefreshToken },
  })

  return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}
```

### 6. Server Components para dados sensíveis (Next.js)

- Dados de assinatura, histórico de aulas, lista de alunos: buscados em Server Components
- Nenhum token ou dado de session exposto ao bundle do cliente
- `cookies()` de `next/headers` lido apenas em Server Components / Route Handlers

---

## Migrations

```
apps/api/prisma/migrations/
  001_initial_schema/
    migration.sql           ← User, Subject (seed data), DeviceToken, ConsentLog
  002_students_and_lessons/
    migration.sql           ← Student, StudentParent, Lesson, LessonObservation (futuro)
  003_invitations/
    migration.sql           ← Invitation
  004_subscriptions_payments/
    migration.sql           ← Subscription, Payment

apps/api/prisma/
  seed.ts                   ← 20 subjects (Matemática, Português, Física...),
                               5 professores teste, 10 alunos, 20 aulas dummy,
                               1 admin@liveaula.com
```

**Ordem das migrations é rígida** (dependências de FK). Não mesclar migrations — cada entidade lógica separada para facilitar rollback.

---

## New Files

```
# Monorepo root
/apps/api/package.json
/apps/api/tsconfig.json
/apps/api/Dockerfile
/apps/api/.env.example
/apps/api/src/server.ts
/apps/api/src/app.ts                         ← Fastify app factory
/apps/api/src/plugins/prisma.ts
/apps/api/src/plugins/jwt.ts
/apps/api/src/plugins/rateLimit.ts
/apps/api/src/plugins/cors.ts
/apps/api/src/middleware/requireAuth.ts
/apps/api/src/middleware/requireRole.ts
/apps/api/src/middleware/lgpdGuard.ts
/apps/api/src/repositories/user.repository.ts
/apps/api/src/repositories/lesson.repository.ts
/apps/api/src/repositories/student.repository.ts
/apps/api/src/repositories/invitation.repository.ts
/apps/api/src/repositories/subscription.repository.ts
/apps/api/src/services/lesson.service.ts
/apps/api/src/services/notification.service.ts
/apps/api/src/services/invitation.service.ts
/apps/api/src/services/payment.service.ts
/apps/api/src/services/auth.service.ts
/apps/api/src/routes/auth.routes.ts
/apps/api/src/routes/lessons.routes.ts
/apps/api/src/routes/students.routes.ts
/apps/api/src/routes/invitations.routes.ts
/apps/api/src/routes/me.routes.ts
/apps/api/src/routes/subscription.routes.ts
/apps/api/src/routes/webhooks.routes.ts
/apps/api/src/routes/admin.routes.ts
/apps/api/src/routes/health.routes.ts
/apps/api/src/types/fastify.d.ts             ← augment FastifyRequest com `user`
/apps/api/prisma/schema.prisma
/apps/api/prisma/seed.ts
/apps/api/prisma/migrations/001_initial_schema/migration.sql
/apps/api/prisma/migrations/002_students_and_lessons/migration.sql
/apps/api/prisma/migrations/003_invitations/migration.sql
/apps/api/prisma/migrations/004_subscriptions_payments/migration.sql
/apps/api/tests/auth.test.ts
/apps/api/tests/lessons.test.ts
/apps/api/tests/invitations.test.ts
/apps/api/tests/push.test.ts

# Web
/apps/web/package.json
/apps/web/tsconfig.json
/apps/web/next.config.ts
/apps/web/middleware.ts
/apps/web/src/app/(professor)/layout.tsx
/apps/web/src/app/(professor)/dashboard/page.tsx
/apps/web/src/app/(professor)/dashboard/_components/StudentCard.tsx
/apps/web/src/app/(professor)/dashboard/_components/StudentGrid.tsx
/apps/web/src/app/(professor)/dashboard/_components/EmptyState.tsx
/apps/web/src/app/(professor)/register-lesson/page.tsx
/apps/web/src/app/(professor)/register-lesson/_components/RegisterLessonForm.tsx
/apps/web/src/app/(professor)/register-lesson/_components/NotificationPreview.tsx
/apps/web/src/app/(professor)/students/new/page.tsx
/apps/web/src/app/(professor)/students/[studentId]/page.tsx
/apps/web/src/app/(professor)/students/[studentId]/_components/LessonTimeline.tsx
/apps/web/src/app/(professor)/invitations/page.tsx
/apps/web/src/app/(professor)/settings/page.tsx
/apps/web/src/app/(parent)/layout.tsx
/apps/web/src/app/(parent)/feed/page.tsx
/apps/web/src/app/(parent)/feed/_components/LessonFeed.tsx
/apps/web/src/app/(parent)/feed/_components/LessonFeedCard.tsx
/apps/web/src/app/(parent)/lessons/[lessonId]/page.tsx
/apps/web/src/app/(parent)/subscription/page.tsx
/apps/web/src/app/(parent)/subscription/_components/TrialBanner.tsx
/apps/web/src/app/(parent)/subscription/_components/PaymentModal.tsx
/apps/web/src/app/(admin)/layout.tsx
/apps/web/src/app/(admin)/users/page.tsx
/apps/web/src/app/(admin)/users/_components/UserTable.tsx
/apps/web/src/app/(admin)/subscriptions/page.tsx
/apps/web/src/app/(admin)/metrics/page.tsx
/apps/web/src/app/(auth)/login/page.tsx
/apps/web/src/app/(auth)/register/page.tsx
/apps/web/src/app/(auth)/invite/[token]/page.tsx
/apps/web/src/app/(onboarding)/professor/page.tsx
/apps/web/src/app/(onboarding)/parent/page.tsx
/apps/web/src/app/(onboarding)/parent/_components/LgpdConsentStep.tsx
/apps/web/src/app/(onboarding)/parent/_components/TrialWelcomeStep.tsx
/apps/web/src/lib/api.ts                     ← fetcher wrapper com auth
/apps/web/src/lib/auth.ts                    ← session helpers (Server + Client)
/apps/web/src/contexts/AuthContext.tsx       ← access token em memória
/apps/web/tests/e2e/professor.spec.ts
/apps/web/tests/e2e/parent-onboarding.spec.ts
/apps/web/tests/e2e/auth.spec.ts

# Mobile
/apps/mobile/package.json
/apps/mobile/tsconfig.json
/apps/mobile/app.json
/apps/mobile/app/_layout.tsx
/apps/mobile/app/(auth)/_layout.tsx
/apps/mobile/app/(auth)/login.tsx
/apps/mobile/app/(auth)/register.tsx
/apps/mobile/app/(onboarding)/professor/step-1.tsx
/apps/mobile/app/(onboarding)/professor/step-2.tsx
/apps/mobile/app/(onboarding)/professor/step-3.tsx
/apps/mobile/app/(onboarding)/parent/step-1.tsx
/apps/mobile/app/(onboarding)/parent/step-2.tsx
/apps/mobile/app/(onboarding)/parent/step-3.tsx
/apps/mobile/app/(onboarding)/parent/step-4.tsx
/apps/mobile/app/(professor)/_layout.tsx
/apps/mobile/app/(professor)/index.tsx
/apps/mobile/app/(professor)/students/_layout.tsx
/apps/mobile/app/(professor)/students/index.tsx
/apps/mobile/app/(professor)/students/new.tsx
/apps/mobile/app/(professor)/students/[studentId]/index.tsx
/apps/mobile/app/(professor)/students/[studentId]/history.tsx
/apps/mobile/app/(professor)/settings.tsx
/apps/mobile/app/(professor)/_components/RegisterLessonSheet.tsx
/apps/mobile/app/(professor)/_components/StudentListItem.tsx
/apps/mobile/app/(professor)/_components/LessonHistoryCard.tsx
/apps/mobile/app/(professor)/_components/NotificationPreview.tsx
/apps/mobile/app/(parent)/_layout.tsx
/apps/mobile/app/(parent)/index.tsx
/apps/mobile/app/(parent)/lesson/[lessonId].tsx
/apps/mobile/app/(parent)/subscription.tsx
/apps/mobile/app/(parent)/profile.tsx
/apps/mobile/app/(parent)/_components/LessonFeedCard.tsx
/apps/mobile/app/(parent)/_components/TrialCountdown.tsx
/apps/mobile/app/(parent)/_components/PaymentWebView.tsx
/apps/mobile/src/hooks/useAuth.ts
/apps/mobile/src/hooks/usePushNotifications.ts
/apps/mobile/src/lib/api.ts
/apps/mobile/src/lib/secureStorage.ts        ← wrapper SecureStore
/apps/mobile/tests/e2e/professor.e2e.ts
/apps/mobile/tests/e2e/parent.e2e.ts

# Shared
/packages/shared/package.json
/packages/shared/tsconfig.json
/packages/shared/src/types/user.ts
/packages/shared/src/types/lesson.ts
/packages/shared/src/types/student.ts
/packages/shared/src/types/invitation.ts
/packages/shared/src/types/subscription.ts
/packages/shared/src/types/consent.ts
/packages/shared/src/types/pagination.ts
/packages/shared/src/schemas/lesson.schema.ts
/packages/shared/src/schemas/auth.schema.ts
/packages/shared/src/schemas/student.schema.ts
/packages/shared/src/schemas/invitation.schema.ts
/packages/shared/src/schemas/consent.schema.ts
/packages/shared/src/design-tokens.ts
/packages/shared/src/index.ts

# Infra / CI
/package.json                                ← workspace root (pnpm workspaces)
/.npmrc                                       ← shamefully-hoist=true (Expo compat)
/pnpm-workspace.yaml
/.env.example
/.gitignore
/.github/workflows/ci.yml                    ← lint + test + build em PR
/.github/workflows/deploy-api.yml            ← Railway deploy em main
/.github/workflows/deploy-web.yml            ← Vercel deploy em main
```

---

## Concerns

### 1. Refresh token em httpOnly cookie vs React Native (BLOQUEANTE)

**Problema:** httpOnly cookies não funcionam de forma nativa em React Native com `fetch`. O `expo-notifications` e o `expo-router` não persistem cookies entre sessões.

**Decisão arquitetural necessária antes de S1:**
- Backend emite o refresh token **tanto** como cookie httpOnly (para web) **quanto** no corpo da resposta (para mobile)
- Mobile armazena em `SecureStore` e envia como `Authorization: Bearer <refreshToken>` no endpoint `/auth/refresh` com header `X-Client: mobile`
- Backend verifica: se request tem cookie → usa cookie; se tem header `X-Client: mobile` → aceita do body/header

**Risco mitigado por:** SecureStore é AES-256 criptografado no device, equivalente de segurança ao httpOnly em contexto mobile.

### 2. Push latência <5s — SLA não garantido

**Problema:** FCM tem SLA de "best effort". Expo Notifications adiciona uma camada intermediária. Em condições adversas (dispositivo com baixo sinal, background), pode exceder 5s.

**Mitigação implementada:**
- Log de `notifiedAt` na Lesson permite medir latência real via dashboard observabilidade
- Retry 1x após 3s se timeout (no notification.service.ts)
- Falha silenciosa — não bloqueia registro de aula
- **SLA real avaliado em S1 semana 2** com testes em device real antes de declarar critério atingido

### 3. Isolamento de dados multi-professor

**Problema:** Professor A não pode ver estudantes ou aulas do professor B.

**Implementação:**
- Toda query que busca `students` filtra por `professorId = request.user.id`
- Toda query que busca `lessons` via professor filtra por `professorId = request.user.id`
- Toda query que busca `lessons` via parent verifica `StudentParent.parentId = request.user.id`
- **Testes de segurança obrigatórios em S1:** Supertest com usuário A tentando acessar recurso do usuário B → deve retornar 403

### 4. LGPD Art.14 — consentimento antes de qualquer dado do menor

**Fluxo obrigatório:**
1. Parent completa M3 (tela LGPD com scroll obrigatório)
2. Frontend envia `POST /consent { consentType: 'LGPD_PARENTAL_ART14', version: '1.0' }` com IP real no header
3. Backend grava `ConsentLog { userId, consentType, version, ipAddress, grantedAt }`
4. `lgpdGuard` middleware verifica `ConsentLog` antes de qualquer `GET` que retorne dados do filho
5. **Sem ConsentLog → 403 com `LGPD_CONSENT_REQUIRED`** — frontend redireciona para tela M3

**Log de IP:** Usar `request.ip` com `fastify.register(fastify-ip-header)` para passar por proxy Railway corretamente (`X-Forwarded-For`).

### 5. Asaas webhook autenticidade

**Problema:** Endpoint `POST /webhooks/asaas` exposto publicamente — deve validar que veio da Asaas, não de atacante.

**Implementação:** Asaas envia header `asaas-access-token` com valor configurável. Backend compara com `env.ASAAS_WEBHOOK_TOKEN` via `crypto.timingSafeEqual` (evita timing attack). Requests sem token válido → 401.

**Atenção:** Asaas não usa HMAC-SHA256 como Stripe — usa token estático. Configurar no painel Asaas e em Railway secrets antes de S2.

### 6. Admin auth — sem onboarding próprio no MVP

**Decisão:** Admin é criado via seed (`prisma/seed.ts`) com role ADMIN. Não há rota de cadastro de admin exposta na API pública. Login usa o mesmo `/auth/login`. A única proteção é `requireRole('ADMIN')` em todas as rotas `/admin/*`.

**Risco:** Se admin esquece senha, precisa de intervenção manual (script reset no Railway). Aceitável no MVP — admin é equipe interna.

### 7. Cloudinary — upload de foto de perfil

**Fluxo (frontend → Cloudinary direto, sem passar pelo backend):**
1. Frontend chama `POST /me/cloudinary-signature` (backend gera assinatura com timestamp)
2. Frontend faz upload direto para Cloudinary com a assinatura
3. Frontend recebe URL segura e chama `PATCH /me { avatarUrl }`

**Por que não via backend:** Evita que imagens binarias passem pelo Railway (limitação de memória de containers gratuitos). Cloudinary free tier é suficiente para MVP.

---

*Arquitetura produzida por Carla — Papel de Arquitetura, liveaula-dev Phase 1*
*Próximos passos: Diego (Web Implementation) e Oscar/Alice (API) leem este documento como fonte única de verdade para Sprint 1*
