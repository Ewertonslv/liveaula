# DESIGN.md — liveaula MVP

> Sistema de design para plataforma EdTech com 3 personas distintas e 2 superfícies (mobile + web).
> **Dois modos visuais + dark mode professor:** alta densidade / baixa densidade / escuro.
> Versão: 1.2 — Polish editorial Notion+Claude — 2026-04-30
> Versão: 1.1 — SystemBuilder (liveaula-design Passo 2A) — 29/04/2026

---

## Changelog v1.2 (2026-04-30)

Análise comparativa de 5 design systems (Linear, Cal, Stripe, Notion, Claude — coleção awesome-design-md). Conclusão: **Notion + Claude** alinham com a filosofia warm-editorial do liveaula. Absorções pontuais (NÃO refazer sistema):

1. **Whisper borders** (Notion). Substituem borders sólidos no lado pai por `rgba(28,25,23,0.06)`. Cards parecem papel, não compartimento.
   - Token: `colorBorderWhisper` (parent / professor / professor-dark)
   - Aplicado em: LessonFeedCard (mobile + web), bottom nav web, login card, todos os surface raised do pai

2. **Brand-tinted shadows** (Stripe philosophy). Sombras carregam o teal primário em vez de preto puro.
   - Tokens novos: `shadows.parentSoft`, `shadows.parentLifted`, `shadows.professorSoft`
   - Web: `shadow-parent-soft`, `shadow-parent-lifted` (Tailwind), CSS vars `--shadow-parent-soft`
   - Mobile: `shadows.parentSoft` em RN ViewStyle

3. **Aurora gradient dinâmico por horário** (volta à intenção da spec original — estava hardcoded peach na impl). Card do feed escolhe `morning/afternoon/evening` baseado no `lesson.createdAt`.

4. **Warm gray scale** (Notion alternation). Adicionado `surfaceAlt` em cada modo para alternar seções longas (perfil, settings):
   - Pai: `#FFFBF5` ↔ `#FBF6EE`
   - Professor light: `#F1F5F9` ↔ `#F8FAFC`
   - Professor dark: `#0D1117` ↔ `#11161D`

5. **Tipografia mais nuanced** — Subject badges agora usam variant `bg-primary/10 text-primary` (semi-transparente sobre o card aurora) em vez de `bg-primary text-white` cheio. Menos contraste agressivo, mais coerente com a filosofia editorial.

**Decisões deliberadamente NÃO absorvidas:**
- Linear lavender accent → não se mistura com nosso teal
- Stripe weight 300 typography → afetado para EdTech BR
- Cal black-white branco puro → frio para o lado pai
- Claude serif Copernicus → adiado para experimento futuro (M6 protótipo) antes de commit

---

## 1. Identidade Visual

### Filosofia de Design

liveaula tem duas personas com necessidades emocionais opostas no mesmo produto:

- **Professor/Admin** — UX de produtividade: informação densa, controle, eficiência. Cada pixel serve a uma ação. Suporte a dark mode — professores trabalham à noite.
- **Pai/Mãe** — UX de reassurance: calor humano, narrativa, respiro visual. Cada tela entrega tranquilidade. Cards com gradientes aurora sutis transmitem emoção sem ser piegas.

O sistema resolve essa tensão com **tokens semânticos bifurcados** — mesma linguagem, dois modos. Não são dois apps; é um design system com dois estados de consciência.

**Referências visuais de mercado (2025):** Bear App (warm neutrals), Linear (dark mode produtividade), Notion Calendar (densidade informacional), Day One (emotional feed), Apple Health (celebration moments), Duolingo (streak gamification — adaptado com sobriedade).

---

### Tipografia

#### Titular: Plus Jakarta Sans (Variable)
- **Por quê:** Humanista moderna com personalidade própria e suporte a eixos variáveis (wght 200–800). Não é Inter (onipresente, sem caráter). Plus Jakarta tem traços ligeiramente arredondados — profissional sem ser corporativo. Tendência crescente em EdTech premium 2024–2025 (Notion, Linear, startups B2C).
- **Pesos usados:** 400 · 500 · 600 · 700
- **Variable axis:** `font-variation-settings: 'wght' 650` para valores intermediários
- **Google Fonts:** `Plus Jakarta Sans`
- **React Native:** `expo install @expo-google-fonts/plus-jakarta-sans`
- **Next.js:** `next/font/google`

#### Corpo: DM Sans
- **Por quê:** Geométrica clean com excelente legibilidade em tamanhos pequenos — crítico para mobile. Peso 400 lê bem em 14px sem fadiga. Par canônico com Plus Jakarta Sans.
- **Pesos usados:** 400 · 500
- **Google Fonts:** `DM Sans`

#### Mono: DM Mono
- **Uso restrito:** valores monetários no financeiro do professor, timestamps no admin.
- **Peso:** 400

---

### Paleta de Cores

#### Cor Primária (compartilhada)

| Token semântico | Valor | Uso |
|---|---|---|
| `color-primary` | `#1A6B74` | CTAs, links ativos, ícones de destaque |
| `color-primary-hover` | `#145760` | Hover e pressed state |
| `color-primary-muted` | `#E0F2F4` | Backgrounds informativos, badges de destaque |
| `color-primary-text` | `#FFFFFF` | Texto sobre superfície primária |

> **Escolha:** Teal profundo — nem azul corporativo (`#3B82F6` banido), nem verde EdTech genérico (`#10B981` banido), nem âmbar (`#F59E0B` banido). Remete a clareza, transparência, presença.

#### Cor Accent — Celebração e Momentum *(tendência EdTech 2025)*

| Token semântico | Valor | Uso |
|---|---|---|
| `color-accent` | `#D95F3B` | Streak badges, primeiro registro, milestones, ícones de conquista |
| `color-accent-hover` | `#BA4E2F` | Hover em elementos accent |
| `color-accent-muted` | `#FDEEE9` | Background de celebration, streak ativo |
| `color-accent-text` | `#FFFFFF` | Texto sobre superfície accent |

> **Por quê terracotta:** Cor quente, terrosa, brasileira. Não conflita com WhatsApp green nem PIX blue. Em 2025, terracotta/coral substituiu o laranja genérico no design emocional — mais sofisticado, menos agressivo. Usado com parcimônia (apenas celebração e momentum, não ações primárias).

#### Estados Funcionais (compartilhados)

| Token | Valor | Uso |
|---|---|---|
| `color-success` | `#15803D` | Aula registrada, pagamento ok |
| `color-success-muted` | `#DCFCE7` | Background de confirmação |
| `color-warning` | `#B45309` | Pai sem vínculo, trial expirando |
| `color-warning-muted` | `#FEF3C7` | Background de alerta |
| `color-error` | `#B91C1C` | Erro de validação, cartão recusado |
| `color-error-muted` | `#FEE2E2` | Background de erro |
| `color-info` | `#1D4ED8` | Informativo neutro |
| `color-info-muted` | `#DBEAFE` | Background informativo |

#### Modo Professor / Admin — Alta Densidade (Light)

| Token | Valor | Descrição |
|---|---|---|
| `color-surface` | `#F1F5F9` | Fundo da página (cinza frio) |
| `color-surface-raised` | `#FFFFFF` | Cards, modais, painéis |
| `color-surface-overlay` | `rgba(15, 23, 42, 0.65)` | Overlay de modais |
| `color-text` | `#0F172A` | Texto principal |
| `color-text-muted` | `#475569` | Texto secundário, labels |
| `color-text-disabled` | `#94A3B8` | Texto inativo |
| `color-border` | `#CBD5E1` | Bordas padrão |
| `color-border-focus` | `#1A6B74` | Borda em foco |

#### Modo Professor / Admin — Dark Mode *(produtividade noturna — tendência 2025)*

> Professores frequentemente registram aulas à noite. Dark mode reduz fadiga ocular e é a preferência de power users em apps de produtividade (Linear, Notion, Bear).

| Token | Valor | Descrição |
|---|---|---|
| `color-surface-dark` | `#0D1117` | Fundo escuro (GitHub-dark calibrado) |
| `color-surface-raised-dark` | `#161B22` | Cards e painéis escuros |
| `color-surface-elevated-dark` | `#21262D` | Modais, dropdowns sobre dark |
| `color-surface-overlay-dark` | `rgba(0, 0, 0, 0.7)` | Overlay escuro |
| `color-text-dark` | `#E6EDF3` | Texto principal dark |
| `color-text-muted-dark` | `#8D96A0` | Texto secundário dark |
| `color-text-disabled-dark` | `#484F58` | Texto inativo dark |
| `color-border-dark` | `#30363D` | Bordas dark |
| `color-border-focus-dark` | `#1A6B74` | Foco dark (= primary) |

> Implementação: `useColorScheme()` no React Native / `prefers-color-scheme` no Next.js. Professor vê dark se sistema estiver dark. Pai/mãe sempre light (emoção > conveniência técnica).

#### Modo Pai/Mãe — Baixa Densidade (sempre Light)

| Token | Valor | Descrição |
|---|---|---|
| `color-surface` | `#FFFBF5` | Fundo quente (creme) |
| `color-surface-raised` | `#FFFFFF` | Cards de aula |
| `color-surface-overlay` | `rgba(15, 23, 42, 0.55)` | Overlay suave |
| `color-text` | `#1C1917` | Texto quente (não preto puro) |
| `color-text-muted` | `#57534E` | Texto secundário quente |
| `color-text-disabled` | `#A8A29E` | Texto inativo quente |
| `color-border` | `#E7E5E4` | Borda quente |
| `color-border-focus` | `#1A6B74` | Mesmo foco (consistência cross-mode) |

#### Gradientes Aurora — Modo Pai/Mãe *(tendência premium EdTech 2025)*

> Gradientes voltaram — mas sutis, como camadas de luz. Não como background de página (AP-08), mas como accent de cards. Transmitem emoção sem serem barulhentos.

| Token | Valor | Uso |
|---|---|---|
| `gradient-card-morning` | `linear-gradient(135deg, #FFF9F0 0%, #F0F9FF 100%)` | Card de aula matutina (7h-12h) |
| `gradient-card-afternoon` | `linear-gradient(135deg, #FFF9F0 0%, #F5F0FF 100%)` | Card de aula tarde (12h-18h) |
| `gradient-card-evening` | `linear-gradient(135deg, #FFF5F0 0%, #FFF9F0 100%)` | Card de aula noite (18h+) |
| `gradient-celebration` | `linear-gradient(135deg, #FDEEE9 0%, #E0F2F4 100%)` | Tela de confirmação pós-aula |

> Implementação: gradiente baseado no timestamp da aula. Detalhe sutil que o pai não articula mas sente.

---

### Border-Radius

Sistema base: **6px** (equilibrado — nem quadrado demais, nem bolha demais).

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | `4px` | Badges, chips, tags |
| `radius-md` | `6px` | Inputs, botões, cards |
| `radius-lg` | `12px` | Modais, BottomSheet, cards hero |
| `radius-xl` | `20px` | Cards pai/mãe com gradiente aurora |
| `radius-full` | `9999px` | Avatares, pill buttons, FAB, streak |

---

### Grid de Espaçamento

Base: **8px**. Escala geométrica — dobra a cada nível.

| Token | Valor | Uso típico |
|---|---|---|
| `spacing-xs` | `4px` | Gap entre ícone e label, badge padding |
| `spacing-sm` | `8px` | Padding interno de chip, gap em lista densa |
| `spacing-md` | `16px` | Padding padrão de card, espaço entre campos |
| `spacing-lg` | `24px` | Padding de seção, espaço entre cards |
| `spacing-xl` | `40px` | Margem de página, espaçamento hero |
| `spacing-2xl` | `64px` | Exclusivo modo pai/mãe — respiro emocional |

---

## 2. Tokens de Design — Referência Completa

Todos os tokens seguem padrão: `[categoria]-[propriedade]-[variante]`.
Em CSS: variáveis `--color-primary`. Em React Native: objeto `tokens.colorPrimary` (camelCase).

### Tokens Compartilhados

```typescript
// packages/shared/design-tokens.ts
export const tokens = {
  // Primária
  colorPrimary: '#1A6B74',
  colorPrimaryHover: '#145760',
  colorPrimaryMuted: '#E0F2F4',
  colorPrimaryText: '#FFFFFF',

  // Accent (celebração e momentum)
  colorAccent: '#D95F3B',
  colorAccentHover: '#BA4E2F',
  colorAccentMuted: '#FDEEE9',
  colorAccentText: '#FFFFFF',

  // Funcionais
  colorSuccess: '#15803D',
  colorSuccessMuted: '#DCFCE7',
  colorWarning: '#B45309',
  colorWarningMuted: '#FEF3C7',
  colorError: '#B91C1C',
  colorErrorMuted: '#FEE2E2',
  colorInfo: '#1D4ED8',
  colorInfoMuted: '#DBEAFE',

  // Espaçamento
  spacingXs: 4,
  spacingSm: 8,
  spacingMd: 16,
  spacingLg: 24,
  spacingXl: 40,
  spacing2xl: 64,

  // Border-radius
  radiusSm: 4,
  radiusMd: 6,
  radiusLg: 12,
  radiusXl: 20,
  radiusFull: 9999,

  // Fontes
  fontHeading: 'PlusJakartaSans',
  fontBody: 'DMSans',
  fontMono: 'DMMono',
} as const;
```

### Tokens Modo Professor/Admin (Light)

```typescript
export const tokensProfLight = {
  ...tokens,
  colorSurface: '#F1F5F9',
  colorSurfaceRaised: '#FFFFFF',
  colorSurfaceOverlay: 'rgba(15, 23, 42, 0.65)',
  colorText: '#0F172A',
  colorTextMuted: '#475569',
  colorTextDisabled: '#94A3B8',
  colorBorder: '#CBD5E1',
  colorBorderFocus: '#1A6B74',
} as const;
```

### Tokens Modo Professor/Admin (Dark)

```typescript
export const tokensProfDark = {
  ...tokens,
  colorSurface: '#0D1117',
  colorSurfaceRaised: '#161B22',
  colorSurfaceElevated: '#21262D',
  colorSurfaceOverlay: 'rgba(0, 0, 0, 0.7)',
  colorText: '#E6EDF3',
  colorTextMuted: '#8D96A0',
  colorTextDisabled: '#484F58',
  colorBorder: '#30363D',
  colorBorderFocus: '#1A6B74',
} as const;
```

### Tokens Modo Pai/Mãe

```typescript
export const tokensPai = {
  ...tokens,
  colorSurface: '#FFFBF5',
  colorSurfaceRaised: '#FFFFFF',
  colorSurfaceOverlay: 'rgba(15, 23, 42, 0.55)',
  colorText: '#1C1917',
  colorTextMuted: '#57534E',
  colorTextDisabled: '#A8A29E',
  colorBorder: '#E7E5E4',
  colorBorderFocus: '#1A6B74',
  gradientCardMorning: ['#FFF9F0', '#F0F9FF'],
  gradientCardAfternoon: ['#FFF9F0', '#F5F0FF'],
  gradientCardEvening: ['#FFF5F0', '#FFF9F0'],
  gradientCelebration: ['#FDEEE9', '#E0F2F4'],
} as const;
```

---

## 3. Escala Tipográfica

### Modo Professor/Admin — Alta Densidade

| Token | Tamanho | Peso | Line-height | Tracking | Uso |
|---|---|---|---|---|---|
| `text-display` | 32px | 700 Bold | 1.2 | -0.5px | Títulos de página (web) |
| `text-h1` | 24px | 700 Bold | 1.3 | -0.3px | Cabeçalhos de seção |
| `text-h2` | 18px | 600 SemiBold | 1.4 | 0 | Subtítulos, headers de tabela |
| `text-body-lg` | 16px | 500 Medium | 1.5 | 0 | Texto de destaque, nomes de alunos |
| `text-body` | 14px | 400 Regular | 1.5 | 0 | Corpo padrão |
| `text-caption` | 12px | 400 Regular | 1.4 | 0.2px | Labels, datas, metadados |
| `text-mono` | 13px | 400 Regular | 1.5 | 0 | Valores monetários (DM Mono) |

### Modo Pai/Mãe — Baixa Densidade

| Token | Tamanho | Peso | Line-height | Tracking | Uso |
|---|---|---|---|---|---|
| `text-display` | 28px | 600 SemiBold | 1.3 | -0.3px | Saudação no Feed |
| `text-h1` | 22px | 600 SemiBold | 1.4 | -0.2px | Título de seção |
| `text-h2` | 18px | 500 Medium | 1.5 | 0 | Subtítulos |
| `text-body-lg` | 16px | 400 Regular | 1.7 | 0 | Descrição de aula (respiro visual) |
| `text-body` | 15px | 400 Regular | 1.7 | 0 | Corpo do Feed |
| `text-caption` | 13px | 400 Regular | 1.5 | 0.1px | Hora, data, matéria |

> **Por que body 15px no modo pai?** 1px extra + line-height 1.7 cria respiro que reduz ansiedade de leitura. Pequeno detalhe, grande impacto emocional.

---

## 4. Sistema de Motion *(tendência EdTech 2025)*

> Motion design é a camada que transforma um app funcional em um app que as pessoas gostam de usar. Em 2025, springs substituíram curves fixas como padrão em apps premium.

### Princípios

1. **Spring primeiro** — toda animação de UI usa spring physics, não ease curves arbitrárias
2. **Haptic como som visual** — cada ação significativa tem feedback tátil correspondente
3. **Celebração com intenção** — confetti apenas em primeiro registro e milestones (não em toda ação)
4. **Reduzido quando necessário** — respeitar `prefers-reduced-motion` e `AccessibilityInfo.isReduceMotionEnabled()`

### Presets de Spring (React Native Reanimated)

```typescript
// packages/shared/motion.ts
export const springs = {
  // UI padrão — responsivo, sem overshooting
  snappy: { damping: 20, stiffness: 300, mass: 0.8 },

  // Modais e BottomSheet — entrada suave
  modal: { damping: 26, stiffness: 200, mass: 1 },

  // Celebração — leve bounce proposital
  bounce: { damping: 12, stiffness: 180, mass: 1 },

  // Micro-interações (FAB press, chip tap)
  micro: { damping: 30, stiffness: 400, mass: 0.5 },
} as const;
```

### Presets de Duração (Framer Motion — Web)

```typescript
export const durations = {
  instant:  100,  // feedback imediato (toggle, checkbox)
  fast:     200,  // micro-interações, hovers
  standard: 300,  // transições de estado
  enter:    350,  // entrada de componentes
  page:     400,  // transição entre telas
} as const;
```

### Mapeamento Haptic (iOS + Android)

| Evento | iOS (expo-haptics) | Android (HapticFeedbackTypes) |
|---|---|---|
| FAB tap (Registrar Aula) | `impactAsync(Medium)` | `VIRTUAL_KEY` |
| Aula enviada com sucesso | `notificationAsync(Success)` | `CONFIRM` |
| Erro de envio | `notificationAsync(Error)` | `LONG_PRESS` |
| Seleção de chip (aluno, matéria) | `selectionAsync()` | `SELECTION` |
| BottomSheet aberto | `selectionAsync()` | `VIRTUAL_KEY` |
| Celebration (streak, milestone) | `impactAsync(Heavy)` + delay 300ms + `impactAsync(Light)` | `CONFIRM` |

### Coreografia: Confirmação de Aula Registrada

```
t=0ms    botão "Enviar" → loading state (spinner branco)
t=200ms  haptic Success
t=300ms  BottomSheet fecha (spring.modal, slide-down)
t=350ms  toast "Aula registrada" aparece (slide-down + fade, spring.snappy)
t=400ms  Notification Preview aparece (fade-in + scale 0.95→1, spring.snappy)
t=800ms  se streak ativo: StreakBadge pulsa (scale 1→1.15→1, spring.bounce)
t=4000ms toast auto-dismiss (fade-out)
t=4200ms Notification Preview fade-out
```

---

## 5. Componentes Base

### 5.1 Button

**Variantes:** `primary` | `secondary` | `ghost` | `destructive` | `fab`

```
ESTADOS: default → hover → focus → loading → disabled

PRIMARY (modo professor light)
  default:   bg=#1A6B74  text=#FFF  border=none  radius=6px  h=40px  px=16px
             font=heading 14px 600
  hover:     bg=#145760  transition=200ms
  focus:     bg=#1A6B74  outline=2px #1A6B74 offset=2px
  loading:   bg=#1A6B74  opacity=0.8  spinner-white  cursor=not-allowed
  disabled:  bg=#CBD5E1  text=#94A3B8  cursor=not-allowed

PRIMARY (modo professor dark)
  default:   bg=#1A6B74  text=#FFF  (mesmo primary — mantém consistência)
  hover:     bg=#145760
  focus:     outline=2px #1A6B74 offset=2px
  disabled:  bg=#30363D  text=#484F58

PRIMARY (modo pai/mãe)
  h=48px  px=24px  radius=6px  font-size=16px  (maior — toque e legibilidade)
  estados: mesmos tokens de cor
  disabled: bg=#E7E5E4  text=#A8A29E

SECONDARY
  light: bg=transparent  border=1px solid color-border  text=color-text
  dark:  bg=transparent  border=1px solid color-border-dark  text=color-text-dark
  hover: bg=color-surface
  focus: outline=2px primary offset=2px
  disabled: opacity=0.5

GHOST
  default: bg=transparent  text=color-primary  border=none
  hover:   bg=color-primary-muted
  focus:   outline=2px primary offset=2px
  disabled: text=color-text-disabled

DESTRUCTIVE
  default: bg=#B91C1C  text=#FFF  radius=6px
  hover:   bg=#991B1B
  focus:   outline=2px #B91C1C offset=2px

FAB (mobile professor — Registrar Aula)
  default:   bg=#1A6B74  size=56px  radius=full
             shadow: elevation=6 (Android) / shadowOffset={0,4} shadowRadius=12 (iOS)
             shadow color: rgba(26,107,116,0.4)  (sombra colorida — tendência 2025)
  pressed:   scale=0.92  bg=#145760  haptic=Medium  spring=micro
  position:  fixed  bottom=88px (acima tab bar + safe area)  center-horizontal
  icon:      "+" Ionicons 28px white
  dark:      bg=#1A6B74  shadow-color=rgba(26,107,116,0.6)
```

---

### 5.2 Input

**Variantes:** `text` | `select` | `textarea` | `search`

```
ESTADOS: default → focus → filled → error → disabled

TEXT INPUT (light)
  container: h=44px  px=12px  radius=6px  bg=surface-raised  border=1px solid color-border
  label:     text-caption  color=text-muted  mb=4px  font=heading
  focus:     border=2px color-primary  shadow=0 0 0 3px color-primary-muted
  filled:    border=1px color-border
  error:     border=2px color-error  helper: text-caption color=error mt=4px  icon-right: ⚠
  disabled:  bg=color-surface  border=color-border  text=color-text-disabled

TEXT INPUT (dark)
  bg=color-surface-raised-dark  border=1px solid color-border-dark
  text=color-text-dark  placeholder=color-text-muted-dark
  focus: border=2px color-primary  shadow=0 0 0 3px rgba(26,107,116,0.3)

TEXTAREA ("O que foi feito" — Registrar Aula)
  min-height=88px  max-height=120px  resize=none  py=10px
  counter: "0/280"  text-caption  align=right  mt=2px
           0-200: color-text-muted | 200-240: color-warning | 240+: color-error

SELECT (aluno, matéria)
  mesmo estilo text input + chevron-down right  icon
  ≥5 opções → BottomSheet com lista pesquisável
  <5 opções → chips inline horizontais

SEARCH
  icon-left: search 16px  color-text-muted  pl=36px
  border: none mobile / 1px solid color-border web
  clear: ícone × aparece quando preenchido
```

---

### 5.3 Card

**Variantes:** `default` | `elevated` | `bordered` | `aula` | `aula-gradient` | `skeleton`

```
DEFAULT (professor — lista de alunos)
  light: bg=surface-raised  radius=8px  p=16px  border=1px solid color-border
  dark:  bg=surface-raised-dark  border=1px solid color-border-dark
  shadow: none (borda define hierarquia)

ELEVATED (pai/mãe — card genérico)
  bg=surface-raised  radius=12px  p=20px
  shadow=0 2px 8px rgba(15,23,42,0.08)  border=none

BORDERED (item selecionado)
  border=2px solid color-primary  bg=color-primary-muted

AULA CARD — componente composto (pai/mãe, sem gradiente)
  radius=16px  p=20px  bg=surface-raised
  shadow=0 2px 12px rgba(15,23,42,0.06)
  ┌────────────────────────────────────────┐
  │ [Avatar prof 32px] [Nome prof]  [Hora] │
  │ [Matéria — bold]          [Duração]   │
  │ [Conteúdo — max 3 linhas, truncado]   │
  │ [😊 humor]                            │
  │ [Obs destacada se houver]             │
  └────────────────────────────────────────┘
  obs destacada: bg=#FFF8E6  border-left=3px solid color-warning  px=10px py=6px  radius=4px

AULA CARD GRADIENT (pai/mãe — tendência aurora) *(tendência 2025)*
  radius=20px  p=20px  border=none
  bg: gradiente baseado na hora da aula (morning/afternoon/evening tokens)
  shadow=0 4px 16px rgba(15,23,42,0.08)
  Mesmo conteúdo do AULA CARD, fundo gradiente sutil

SKELETON LOADING
  bg: shimmer linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%)
  dark: shimmer linear-gradient(90deg, #161B22 25%, #21262D 50%, #161B22 75%)
  animation: shimmer 1.5s infinite ease-in-out
```

---

### 5.4 Badge

**Variantes:** `success` | `warning` | `error` | `neutral` | `highlight` | `streak`

```
BASE: radius=sm  px=8px  py=2px  text-caption  font-weight=500  font=heading

success:   bg=#DCFCE7  text=#15803D
warning:   bg=#FEF3C7  text=#B45309
error:     bg=#FEE2E2  text=#B91C1C
neutral:   bg=#F1F5F9  text=#475569
highlight: bg=#E0F2F4  text=#1A6B74

streak (novo):
  bg=color-accent-muted  text=color-accent  font-weight=600
  icon: 🔥 12px  gap=4px
  ex: "🔥 7 dias"
  pulse animation: scale 1→1.05→1  duration=2s  loop  spring=snappy

USO contextual:
  Dashboard professor: "Aula hoje" (highlight) | "Sem aula há 7d" (warning) | "Sem pai" (error) | "Em dia" (success)
  Streak professor:    "🔥 5 dias" (streak)
  Admin:              "Ativo" (success) | "Inativo" (error) | "Trial" (warning)
  Feed pai:           matéria e data como neutral
```

---

### 5.5 Avatar

**Variantes:** `professor` | `pai` | `filho` | `placeholder`

```
BASE: radius=full  overflow=hidden  border=2px solid color-surface-raised

TAMANHOS:
  xs: 24px — listas densas (modo professor)
  sm: 32px — cards de aula (Feed do pai)
  md: 40px — perfil em header
  lg: 64px — tela de perfil
  xl: 96px — onboarding, perfil dedicado

PLACEHOLDER:
  bg=color-primary-muted
  iniciais: text-body-lg  color=color-primary  font=heading  weight=600
  cor de bg gerada por hash(nome) → 6 tons distintos entre primary-muted e accent-muted

PROFESSOR (no Aula Card pai):
  badge matéria: bottom-right  size=18px  radius=full  bg=color-primary
  letra inicial matéria  text-caption  color=white

FILHO:
  border=3px solid color-primary  (destaque — tudo gira em torno dele)
```

---

### 5.6 Notification Preview — Premium *(iMessage-style, tendência 2025)*

> O momento pós-registro é o mais emocionalmente carregado do produto — professor vê o pai sendo notificado em tempo real. O preview deve ser tratado como uma tela de celebration, não um simples widget.

```
CONTAINER DE CELEBRATION:
  bg=gradient-celebration (FDEEE9→E0F2F4)
  radius=20px  p=20px  w=100%
  label topo: text-caption  color=color-text-muted  mb=12px
              "Notificação enviada ao pai:"

SKIN iOS (Dark — fidelidade visual alta):
  bg=#1C1C1E  radius=16px  px=16px  py=12px
  border=0.5px solid rgba(255,255,255,0.1)
  backdrop-filter: blur(20px)  (no web; skip no RN)

  header: [app-icon 20px radius=6px] [liveaula 12px #ABABAB] [agora 12px #6B6B6B]
  gap entre header e body: 6px
  título:  15px  weight=600  color=#FFFFFF  max-1-line
  corpo:   13px  weight=400  color=#ABABAB  max-2-lines

  EXEMPLO:
  ┌──────────────────────────────────────────┐
  │ [L] liveaula                       agora │
  │ Aula de Matemática — Pedro               │
  │ 1h30 · "Equações do 2º grau, revisão...  │
  └──────────────────────────────────────────┘

ESTADOS:
  enviando: spinner branco no lugar do preview
  sucesso:  preview acima com checkmark verde animado (scale 0→1, spring.bounce)
  sem-pai:  badge warning "Pai não vinculado — push não enviado"
            (não bloqueia registro — aula salva de qualquer forma)
```

---

### 5.7 ProgressBar

```
BASE: h=8px  radius=full  bg=color-border  overflow=hidden

FILL: bg=color-primary  radius=full
      animation: width 0→valor, 600ms, spring.snappy (não linear!)

VARIANTES:
  padrão:       percentual (ex: 65%)
  semanal:      7 segmentos (seg→dom)  gap=3px  filled/empty
  por-matéria:  barra horizontal + label esquerda + % direita  py=6px por linha

LEGENDA: "X de Y aulas este mês"  text-caption  color=text-muted  mt=4px

ESTADO VAZIO: fill=0%  "Primeira aula ainda não registrada"  text-caption center
```

---

### 5.8 BottomSheet (Mobile — Registrar Aula)

```
ESTRUTURA:
  overlay:    bg=rgba(0,0,0,0.5)  tap-fora=fechar (rascunho vazio)
  container:  bg=surface-raised  radius-top=16px  max-h=85vh
              dark: bg=surface-raised-dark
  handle:     w=36px  h=4px  bg=color-border  radius=full  mx=auto  mt=8px  mb=4px

ANIMAÇÃO: spring.modal (damping=26, stiffness=200, mass=1)
  entrada: translateY(100%)→0
  saída:   translateY(0)→100%
  haptic:  selectionAsync ao abrir

TECLADO:
  iOS: behavior=padding
  Android: windowSoftInputMode=adjustResize via app.json

ESTADOS:
  vazio:      "Selecione um aluno para começar"  text-caption  color=text-muted  center  mt=32px
  preenchendo: campos progressivos desbloqueados sequencialmente
  enviando:   botão loading  campos disabled  overlay interno opacity=0.3
  sucesso:    fecha com spring.modal → coreografia de celebration (ver Seção 4)
  erro-rede:  toast error  dados preservados  "Tentar novamente"

SWIPE TO DISMISS: threshold=40% altura
  rascunho preenchido: Alert "Descartar aula não registrada?"
```

---

### 5.9 Toast

```
POSIÇÃO: top + safe-area-top + 8px  horizontal-center  z-index=9999
ANIMAÇÃO: spring.snappy  translateY(-20px)→0 + opacity 0→1  (200ms)
AUTO-DISMISS: 4000ms  swipe-up = dismiss manual

VARIANTES:
  success: bg=#15803D  text=#FFF  icon=checkmark-circle
  error:   bg=#B91C1C  text=#FFF  icon=xmark-circle
  warning: bg=#B45309  text=#FFF  icon=exclamation-triangle
  info:    bg=#1A6B74  text=#FFF  icon=info-circle

  dark mode: mesmas cores (toast é sempre escuro — contraste garantido)

DIMENSÕES: min-h=44px  max-w=343px  px=16px  py=12px  radius=8px
```

---

### 5.10 StreakBadge *(novo — tendência gamification EdTech 2025)*

> Inspirado no Duolingo mas sem a infantilidade. Registros consecutivos criam momentum para o professor — é uma métrica que o professor valoriza porque mede sua disciplina, não sua auditoria.

```
ESTRUTURA:
  container: bg=color-accent-muted  radius=full  px=12px  py=6px
             border=1px solid rgba(217,95,59,0.2)
  conteúdo: "🔥" + número + "dias" (ou "dia" se 1)
  font: text-caption  weight=600  color=color-accent

TAMANHOS:
  sm: Dashboard header (direita)  h=24px
  md: Tela de perfil do professor  h=32px
  lg: Tela de conquistas / celebration  h=40px

ANIMAÇÕES:
  aparecimento: scale 0→1  spring.bounce  haptic=Heavy+delay+Light
  pulse idle:   scale 1→1.04→1  duration=2s  loop  (quando streak ≥ 7)
  novo dia:     scale 1→1.3→1  spring.bounce + número conta de prev→new

ESTADOS:
  ativo:   bg=accent-muted  text=accent
  zerado:  oculto (não exibir badge de "0 dias" — remove sentido de fracasso)

THRESHOLD de exibição: apenas quando streak ≥ 2 dias consecutivos
```

---

### 5.11 CelebrationOverlay *(novo — milestones e primeiro registro)*

> Confetti com intenção. Usado APENAS em: (1) primeira aula registrada no app, (2) cada 10 aulas registradas, (3) primeiro pai vinculado. Não em toda confirmação — perderia impacto.

```
TRIGGERS:
  firstLesson:   primeira aula registrada no app
  tenthLesson:   10ª, 20ª, 30ª aula (multiplos de 10)
  firstParent:   primeiro pai vinculado com sucesso

VISUAL:
  overlay: bg=rgba(0,0,0,0)  (transparente — confetti sobre a UI)
  partículas: 40–60 elementos  cores: primary, accent, success, warning
  formas: círculo 6px / retângulo 4×8px  (sem estrelas ou corações — muito infantil)
  physics: queda com rotação e gravidade simulada  duration=2500ms

MENSAGEM (centro da tela, sobre confetti):
  text-display  font=heading  weight=700  color=color-text  center
  firstLesson:  "Primeira aula registrada! 🎉"
  tenthLesson:  "10 aulas registradas! Vai professor."
  firstParent:  "Primeiro pai conectado! Está crescendo."

DISMISS: auto após 3000ms OU toque na tela
HAPTIC:  Heavy + 300ms delay + Light (coreografia dupla)

IMPLEMENTAÇÃO: react-native-confetti-cannon
               Web: canvas animation ou lottie
```

---

## 6. Anti-Patterns Visuais — O que NÃO fazer

### AP-01 — Não usar shadow-lg em todos os cards
**Problema:** Toda tela vira pilha de cartões flutuantes. Parece template de Dribbble.
**liveaula usa:** cards sem sombra no modo professor (borda define hierarquia); sombra discreta `0 2px 12px` no modo pai.

### AP-02 — Não usar densidade visual única para ambas as personas
**Problema:** Dashboard do pai igual ao do professor — tabelas, badges múltiplos, ações inline.
**liveaula usa:** modo professor = alta densidade; modo pai = uma informação principal por card, muito espaço, foco emocional.

### AP-03 — Não usar ícone de escola, livro ou chapéu de formatura como marca
**Problema:** Todo EdTech usa. Viram commodities invisíveis.
**liveaula usa:** ícones de comunicação e conexão. Hero action "registrar" = paper-plane, não livro.

### AP-04 — Não usar azul corporativo como cor primária
**Problema:** `#3B82F6` evoca "formulário de banco". Banido.
**liveaula usa:** teal profundo `#1A6B74` + accent terracotta `#D95F3B` para celebração.

### AP-05 — Não usar tipografia única em toda a aplicação
**Problema:** Mesmo peso, mesmo tamanho, mesma cor. Hierarquia zero.
**liveaula usa:** mínimo dois pesos por tela, mínimo 4px de diferença entre níveis.

### AP-06 — Não usar illustration-style genérico de EdTech
**Problema:** Crianças com lápis, foguetes, estrelas de banco de imagem. Sem identidade.
**liveaula usa:** estados vazios com texto empático + ação. Fotos reais quando disponíveis (UGC). Ícones funcionais em erros.

### AP-07 — Não usar Inter/Roboto sem justificativa
**Problema:** Inter é onipresente — invisível, sem personalidade.
**liveaula usa:** Plus Jakarta Sans + DM Sans. Mesma legibilidade, personalidade distinta.

### AP-08 — Não usar gradiente como background de tela inteira
**Problema:** Card branco centralizado sobre gradiente azul/roxo. Clichê absoluto mobile 2020-2024.
**liveaula usa:** surfaces sólidas, tipografia como herói visual. Gradientes APENAS como accent de cards aurora no modo pai (sutil, não como wallpaper).

### AP-09 — Não enquadrar o registro de aula como auditoria
**Problema:** Professor que sente que "presta contas" abandona o produto em dias.
**liveaula usa:** linguagem "comunicar" (não "registrar"), confirmação via preview push (professor vê o que pai recebe), tom de "compartilhar" não "documentar".

### AP-10 — Não usar avatar placeholder com ícone de câmera padrão
**Problema:** Ícone de usuário cinza genérico. Filho sem foto parece cadastro burocrático.
**liveaula usa:** iniciais estilizadas com cor gerada por hash(nome) — variação visual sem precisar de foto.

### AP-11 — Não usar gamification infantil (pontos, troféus, XP)
**Problema:** Professor é adulto profissional. Troféus de plástico digital ofendem sua inteligência.
**liveaula usa:** StreakBadge com foco em DISCIPLINA (dias consecutivos), linguagem de adulto ("Vai professor"), celebração discreta. Sem ranking, sem leaderboard, sem pontuação.

### AP-12 — Não usar animações com ease linear ou duração fixa arbitrária
**Problema:** Animações lineares ou com `duration: 0.3s ease` genérico parecem rígidas, artificiais.
**liveaula usa:** spring physics em todas as animações de UI (damping, stiffness, mass). Movimento que imita física real.

---

## 7. Diretrizes de Implementação

### React Native (Mobile)
- **Toque mínimo:** todos elementos interativos ≥ 44×44px; usar `hitSlop` quando necessário
- **Safe areas:** `useSafeAreaInsets()` obrigatório em toda tela raiz
- **Fonts:** `useFonts()` via `expo-font`; fallback `System` enquanto carrega
- **Shadows:** presets em `shadows.ts` — nunca inline. Android: `elevation`. iOS: `shadow*`.
- **Haptics:** `expo-haptics` — mapeamento na Seção 4 (Motion)
- **Dark mode:** `useColorScheme()` apenas para professor; forçar light no app pai
- **Animations:** `react-native-reanimated` com `withSpring()` — springs da Seção 4
- **Confetti:** `react-native-confetti-cannon` para CelebrationOverlay
- **StatusBar:** professor dark mode = light-content; professor light = dark-content; pai = dark-content

### Next.js Web (Professor + Admin)
- **Fonts:** `next/font/google` com `display: 'swap'`; variáveis CSS para Tailwind
- **Dark mode:** `next-themes` + `prefers-color-scheme`; professor apenas
- **Tailwind config:** `theme.extend.colors` + `theme.extend.spacing` com todos os tokens
- **Animations:** Framer Motion com `spring` type — presets da Seção 4
- **Focus visible:** `:focus-visible` em todos os interativos (acessibilidade)
- **Gradientes aurora:** Tailwind `bg-gradient-to-br` com cores dos gradient tokens

---

## 8. Glossário de Tokens (Quick Reference)

```
CORES COMPARTILHADAS:
  primary           #1A6B74    cor da marca
  primary-hover     #145760    interação
  primary-muted     #E0F2F4    bg informativo
  primary-text      #FFFFFF    texto sobre primary
  accent            #D95F3B    celebração, streak
  accent-hover      #BA4E2F    interação accent
  accent-muted      #FDEEE9    bg celebração
  success           #15803D    confirmações
  success-muted     #DCFCE7    bg sucesso
  warning           #B45309    alertas
  warning-muted     #FEF3C7    bg alerta
  error             #B91C1C    erros
  error-muted       #FEE2E2    bg erro
  info              #1D4ED8    informativos
  info-muted        #DBEAFE    bg info

MODO PROFESSOR LIGHT:
  surface           #F1F5F9    fundo frio
  surface-raised    #FFFFFF    cards
  text              #0F172A    principal
  text-muted        #475569    secundário
  border            #CBD5E1    padrão
  border-focus      #1A6B74    foco

MODO PROFESSOR DARK:
  surface           #0D1117    fundo escuro
  surface-raised    #161B22    cards dark
  surface-elevated  #21262D    modais dark
  text              #E6EDF3    principal dark
  text-muted        #8D96A0    secundário dark
  border            #30363D    bordas dark
  border-focus      #1A6B74    foco (= primary)

MODO PAI LIGHT:
  surface           #FFFBF5    fundo quente
  surface-raised    #FFFFFF    cards aula
  text              #1C1917    principal quente
  text-muted        #57534E    secundário quente
  border            #E7E5E4    borda quente

GRADIENTES PAI:
  card-morning      #FFF9F0 → #F0F9FF  (aurora azul)
  card-afternoon    #FFF9F0 → #F5F0FF  (aurora lilás)
  card-evening      #FFF5F0 → #FFF9F0  (aurora quente)
  celebration       #FDEEE9 → #E0F2F4  (accent → primary)

ESPAÇAMENTO:    xs=4  sm=8  md=16  lg=24  xl=40  2xl=64
BORDER-RADIUS:  sm=4  md=6  lg=12  xl=20  full=9999
FONTES:         heading=Plus Jakarta Sans | body=DM Sans | mono=DM Mono

MOTION SPRINGS:
  snappy:  damping=20  stiffness=300  mass=0.8
  modal:   damping=26  stiffness=200  mass=1
  bounce:  damping=12  stiffness=180  mass=1
  micro:   damping=30  stiffness=400  mass=0.5
```
