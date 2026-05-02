# Web Component Specs — Next.js 14 App Router

> Passo 4A do StackAdapter. Stack: Next.js 14 + TypeScript + Tailwind CSS.
> Tokens mapeados para classes Tailwind via `tailwind.config.ts`. Todos os componentes seguem o DESIGN.md v1.1.

---

## Configuração base

### `tailwind.config.ts` — tokens do DESIGN.md
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:    { DEFAULT: '#1A6B74', hover: '#145760', muted: '#E0F2F4' },
        accent:     { DEFAULT: '#D95F3B', hover: '#BA4E2F', muted: '#FDEEE9' },
        surface:    { DEFAULT: '#F8FAFC', raised: '#F1F5F9', overlay: 'rgba(15,23,42,0.5)' },
        'prof-dark':{ DEFAULT: '#0D1117', raised: '#161B22', elevated: '#21262D' },
        'pai-surface': { DEFAULT: '#FFFBF5' },
        text:       { DEFAULT: '#0F172A', muted: '#64748B', disabled: '#94A3B8' },
        border:     { DEFAULT: '#E2E8F0', focus: '#1A6B74' },
        success:    '#15803D',
        warning:    '#B45309',
        error:      '#B91C1C',
        info:       '#1D4ED8',
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans Variable', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
        mono:    ['DM Mono', 'monospace'],
      },
      fontSize: {
        display: ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
        h1:      ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        h2:      ['1.375rem', { lineHeight: '1.4', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        body:    ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      borderRadius: {
        sm: '4px', md: '6px', lg: '12px', xl: '20px',
      },
      spacing: {
        xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '40px', '2xl': '64px',
      },
      boxShadow: {
        'fab': '0 4px 16px rgba(26,107,116,0.4)',
        'card': '0 1px 3px rgba(0,0,0,0.08)',
        'elevated': '0 4px 12px rgba(0,0,0,0.12)',
      },
      backgroundImage: {
        'gradient-morning':     'linear-gradient(135deg, #FFF9F0 0%, #F0F9FF 100%)',
        'gradient-afternoon':   'linear-gradient(135deg, #FFF9F0 0%, #F5F0FF 100%)',
        'gradient-evening':     'linear-gradient(135deg, #FFF5F0 0%, #FFF9F0 100%)',
        'gradient-celebration': 'linear-gradient(135deg, #FDEEE9 0%, #E0F2F4 100%)',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        'streak-pulse': { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.15)' } },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
        'streak-pulse': 'streak-pulse 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
}
export default config
```

### Estrutura de rotas — App Router
```
src/app/
  (auth)/
    login/page.tsx               → PW1
    cadastro/page.tsx            → Passo 1 onboarding
    esqueci-senha/page.tsx
  (professor)/
    layout.tsx                   → Sidebar + TopBar
    dashboard/page.tsx           → PW2
    alunos/page.tsx              → PW3
    alunos/[id]/page.tsx         → PW4
    historico/page.tsx           → PW6
    configuracoes/[tab]/page.tsx → PW7
  (pai)/
    layout.tsx                   → TopBar mínimo
    feed/page.tsx                → MW4
    aula/[id]/page.tsx           → MW5
    assinatura/page.tsx          → MW6
    configuracoes/[tab]/page.tsx → MW7
  (admin)/
    layout.tsx                   → Sidebar admin
    dashboard/page.tsx           → A2
    professores/page.tsx         → A3
    professores/[id]/page.tsx    → A4
    pais/page.tsx                → A5
    assinaturas/page.tsx         → A6
  convite/[token]/page.tsx       → MW1 (público)
  api/
    auth/[...route]/route.ts     → proxy para API Fastify
```

---

## Componentes Compartilhados

### `Button`
```typescript
// src/components/ui/Button.tsx — Client Component
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  className?: string
}

const variants = {
  primary:     'bg-primary text-white hover:bg-primary-hover disabled:bg-text-disabled',
  secondary:   'bg-surface-raised border border-border text-text hover:bg-surface',
  ghost:       'bg-transparent text-primary hover:bg-primary-muted',
  destructive: 'bg-transparent text-error border border-error hover:bg-red-50',
}
const sizes = {
  sm: 'px-3 py-1.5 text-caption rounded-md',
  md: 'px-4 py-2.5 text-body rounded-lg',
  lg: 'px-6 py-3 text-body-lg rounded-lg',
}
// loading state: spinner inline (Heroicons ArrowPath animate-spin), texto fica visível mas opaco
// disabled: pointer-events-none opacity-50
```

### `Input`
```typescript
// src/components/ui/Input.tsx — Client Component
interface InputProps {
  label: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'search' | 'textarea'
  placeholder?: string
  value: string
  onChange: (v: string) => void
  error?: string
  hint?: string
  disabled?: boolean
  rows?: number         // só textarea
  maxLength?: number    // só textarea — exibe contador
  readOnly?: boolean
}
// error state: border-error text-error (label + mensagem abaixo)
// focus state: ring-2 ring-primary border-border-focus
// textarea: resize-none, overflow-y-auto
// contador textarea: right-aligned text-caption color dinâmica (0-70%=muted, 70-85%=warning, 85%+=error)
```

### `Card`
```typescript
// src/components/ui/Card.tsx — Server Component (sem estado)
interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered' | 'gradient-morning' | 'gradient-afternoon' | 'gradient-evening' | 'gradient-celebration'
  radius?: 'lg' | 'xl'  // lg=12px padrão, xl=20px para cards pai
  children: React.ReactNode
  className?: string
}
const gradientMap = {
  'gradient-morning':     'bg-gradient-morning',
  'gradient-afternoon':   'bg-gradient-afternoon',
  'gradient-evening':     'bg-gradient-evening',
  'gradient-celebration': 'bg-gradient-celebration',
}
// Gradient variant escolhido dinamicamente:
// função getGradientVariant(horaAula: Date): 'morning'|'afternoon'|'evening'
//   morning: 6h–12h, afternoon: 12h–18h, evening: 18h–6h
```

### `Badge`
```typescript
// src/components/ui/Badge.tsx — Server Component
interface BadgeProps {
  variant: 'success' | 'warning' | 'error' | 'neutral' | 'highlight' | 'streak'
  size?: 'sm' | 'md'
  children: React.ReactNode
}
const variantClasses = {
  success:   'bg-green-100 text-success border border-green-200',
  warning:   'bg-amber-100 text-warning border border-amber-200',
  error:     'bg-red-100 text-error border border-red-200',
  neutral:   'bg-surface-raised text-text-muted border border-border',
  highlight: 'bg-primary-muted text-primary border border-primary',
  streak:    'bg-accent-muted text-accent border border-accent',
}
```

### `Skeleton`
```typescript
// src/components/ui/Skeleton.tsx — Server Component
// Padrão para loading states em todos as telas
interface SkeletonProps {
  variant?: 'line' | 'card' | 'avatar' | 'stats'
  width?: string
  height?: string
}
// usa animate-shimmer com bg-gradient (gray-100 → gray-200 → gray-100)
```

### `Toast`
```typescript
// src/components/ui/Toast.tsx — Client Component (usa Sonner ou react-hot-toast)
// Posição: top-center (web), z-50
// Variantes: success (border-l-4 border-success), error, warning, info
// Auto-dismiss: 4000ms para success, 6000ms para error
// Função exportada: toast.success('msg'), toast.error('msg')
```

### `Modal` (Dialog)
```typescript
// src/components/ui/Modal.tsx — Client Component (Radix UI Dialog)
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  maxWidth?: 'sm' | 'md' | 'lg'  // 400 / 560 / 720px
  children: React.ReactNode
}
// Overlay: bg-surface-overlay backdrop-blur-sm
// Animação: data-[state=open]:animate-in data-[state=closed]:animate-out fade-in zoom-in-95
// Fechar: Escape ou click fora (se campos não preenchidos)
```

---

## Componentes por Rota

### `(professor)/layout.tsx` — Server Component
```typescript
// Props: nenhuma (lê sessão via cookies server-side)
// Renderiza: <Sidebar /> + <TopBar /> + {children}
// Sidebar items: Dashboard / Alunos / Agenda / Financeiro / Configurações
// Item ativo: bg-primary-muted text-primary font-medium
// TopBar: logo + busca global (Client Component) + streak badge + avatar menu
// dark mode: classe 'dark' no <html> via cookie 'tema', lida no Server Component
```

### `dashboard/page.tsx` — Server Component (data fetching)
```typescript
// fetch('/api/professor/dashboard', { cache: 'no-store' })  ← sempre fresh
// Renderiza stats cards (Server) + <TabelaAulasRecentes /> (Client — paginação) + <ListaAlunos /> (Server)
// <ModalRegistrarAula /> carregado lazy (next/dynamic, sem SSR) — só monta quando abre

interface DashboardStats {
  streak: number
  mes: { aulas: number; horas: number; alunos_ativos: number; receita_estimada: number }
  aulas_recentes: AulaRecente[]
  alunos_atividade: AlunoAtividade[]
}
```

### `alunos/[id]/page.tsx` — Server Component
```typescript
// generateStaticParams: não (dados dinâmicos por professor logado)
// fetch em paralelo: aluno + aulas + progresso
// Promise.all([fetchAluno(id), fetchAulas(id), fetchProgresso(id)])
// <SidePanelAula /> — Client Component, renderiza detalhe sem nova página
```

### `(professor)/dashboard/_components/ModalRegistrarAula.tsx` — Client Component
```typescript
// Equivalente web do BottomSheet P5
interface ModalRegistrarAulaProps {
  open: boolean
  onClose: () => void
  onSuccess: (aula: AulaRegistrada) => void
}
// Estado interno: aluno_id, materia_id, duracao, conteudo, humor, observacao
// Smart defaults via useQuery('preferencias-professor')
// Submit: POST /api/aulas via fetch → toast success → onSuccess callback
// Sem offline support (web) — erro de rede preserva form aberto
```

### `(pai)/layout.tsx` — Server Component
```typescript
// TopBar mínimo: logo + dropdown filho (se múltiplos) + badge notificações + avatar
// bg: bg-pai-surface (#FFFBF5) — classe custom via tailwind.config
// Sem sidebar (mobile-first web do pai)
```

### `(pai)/feed/page.tsx` — Server Component
```typescript
// fetch('/api/pai/feed?limit=10', { cache: 'no-store' })
// Agrupa por data: hoje / ontem / esta semana / meses anteriores
// <CardAulaGradient /> — Server Component, recebe gradient_variant da API
// <FeedInfiniteScroll /> — Client Component (Intersection Observer para load more)
// Paywall check: se assinatura.status === 'expirado' → redirect /assinatura
```

### `convite/[token]/page.tsx` — Server Component
```typescript
// fetch('/api/convites/:token') — valida server-side
// Se expirado: renderiza tela de erro estática
// Se válido: renderiza card do filho + CTA criar conta
// Metadata: título dinâmico "João te convidou para acompanhar Pedro — liveaula"
```

### `(admin)/layout.tsx` — Server Component
```typescript
// Verifica role 'admin' no JWT — redirect /login se não for admin
// Sidebar: Professores / Pais / Assinaturas / Dashboard / Configurações
// bg: color-surface (não creme — admin é neutro)
```

### `(admin)/dashboard/page.tsx` — Server Component
```typescript
// fetch('/api/admin/dashboard', { cache: 'no-store' })
// StatsCards: professores / pais / MRR / churn
// <TabelaAtividadeRecente /> — Client Component (filtro de data client-side)
// Churn > 5%: Badge error + título da card muda para text-error
```

---

## Data Fetching — Estratégias por rota

| Rota | Estratégia | Justificativa |
|---|---|---|
| Dashboard professor | `cache: 'no-store'` | Dados mudam a cada aula registrada |
| Feed pai | `cache: 'no-store'` | Real-time critical |
| Perfil aluno | `revalidate: 60` | Muda pouco, pode ter 1min de staleness |
| Lista alunos | `revalidate: 30` | Novo aluno adicionado raramente |
| Admin métricas | `cache: 'no-store'` | Admin precisa de dados atuais |
| Convite (token) | `revalidate: 300` | Expira em 30 dias, cache 5min ok |
| Configurações | `revalidate: 3600` | Muda raramente |

---

## Autenticação Web — Middleware

```typescript
// src/middleware.ts
// Rotas protegidas: matcher /(professor|pai|admin)/(.*)
// Lê cookie 'access_token' httpOnly → verifica JWT
// Se inválido: redirect /login com callbackUrl
// Se role não bate (admin acessando /professor): redirect para role correto
export { default } from './src/middleware'
```

---

## Internacionalização de Datas

```typescript
// src/lib/formatDate.ts
// Usa Intl.DateTimeFormat com locale 'pt-BR'
export function formatRelative(date: Date): string
  // "há 2 horas", "ontem", "há 3 dias", "28 de abril"
export function formatFull(date: Date): string
  // "Segunda, 28 de abril de 2026"
export function formatShort(date: Date): string
  // "28/04/26"
```

---

## Componentes específicos por tela

### `StreakBadge` (web)
```typescript
// src/components/StreakBadge.tsx — Client Component (animação)
interface StreakBadgeProps {
  days: number
  size?: 'sm' | 'md'
  pulse?: boolean  // dispara animate-streak-pulse uma vez
}
// Visível somente se days >= 2
// sm: 'text-caption px-2 py-0.5', md: 'text-body px-3 py-1'
// Ícone: 🔥 + número + "dias"
// pulse: dispara keyframe streak-pulse via useEffect uma vez
```

### `NotificationPreview` (web)
```typescript
// src/components/NotificationPreview.tsx — Client Component
// Aparece como overlay no dashboard após registrar aula
// bg: #1C1C1E (dark card sobre gradient-celebration)
// Auto-dismiss: 4200ms via setTimeout + CSS transition opacity 0→1→0
interface NotificationPreviewProps {
  titulo: string
  corpo: string
  onDismiss: () => void
}
```

### `DataTable` (admin)
```typescript
// src/components/admin/DataTable.tsx — Client Component
// TanStack Table v8 ou implementação manual simples
interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  selectable?: boolean        // checkbox coluna + ações em lote
  loading?: boolean
  emptyMessage?: string
}
// Skeleton rows: 5 linhas animadas quando loading=true
// Zebra: rows pares bg-surface, ímpares bg-surface-raised
```

### `AulaGradientCard` (pai)
```typescript
// src/components/pai/AulaGradientCard.tsx — Server Component
interface AulaGradientCardProps {
  materia: string
  duracao: string
  filhoNome: string
  professorNome: string
  conteudoPreview: string
  humorAluno: 1 | 2 | 3 | null  // 1=ruim, 2=ok, 3=bem
  registradoEm: Date
  gradientVariant: 'morning' | 'afternoon' | 'evening'
  href: string  // link para detalhe
}
// Usa <Link href={href}> com prefetch
// Humor: { 1: '😕 Precisou de apoio', 2: '😐 Regular', 3: '😊 Muito bem' }
// Tempo relativo: formatRelative(registradoEm)
```
