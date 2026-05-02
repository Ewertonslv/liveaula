# Token Checklist — liveaula DESIGN.md v1.1

> Verificação pós-SystemBuilder (Passo 2B). Todos os tokens obrigatórios + adições de tendência 2025.

---

## Tokens de Cor Obrigatórios

| Token | Status | Valor |
|---|---|---|
| `color-primary` | ✅ | `#1A6B74` |
| `color-primary-hover` | ✅ | `#145760` |
| `color-primary-muted` | ✅ | `#E0F2F4` |
| `color-surface` | ✅ | Bifurcado: prof-light / prof-dark / pai |
| `color-surface-raised` | ✅ | Bifurcado por modo |
| `color-surface-overlay` | ✅ | Bifurcado por modo |
| `color-text` | ✅ | Bifurcado por modo |
| `color-text-muted` | ✅ | Bifurcado por modo |
| `color-text-disabled` | ✅ | Bifurcado por modo |
| `color-border` | ✅ | Bifurcado por modo |
| `color-border-focus` | ✅ | `#1A6B74` (= primary, cross-mode) |
| `color-success` | ✅ | `#15803D` |
| `color-warning` | ✅ | `#B45309` |
| `color-error` | ✅ | `#B91C1C` |
| `color-info` | ✅ | `#1D4ED8` |

**Resultado cores obrigatórias:** 15/15 ✅

## Tokens de Cor Adicionais (tendência 2025)

| Token | Status | Valor |
|---|---|---|
| `color-accent` | ✅ | `#D95F3B` — terracotta celebração |
| `color-accent-hover` | ✅ | `#BA4E2F` |
| `color-accent-muted` | ✅ | `#FDEEE9` |
| `color-surface-dark` | ✅ | `#0D1117` — dark mode professor |
| `color-surface-raised-dark` | ✅ | `#161B22` |
| `color-surface-elevated-dark` | ✅ | `#21262D` |
| `color-text-dark` | ✅ | `#E6EDF3` |
| `gradient-card-morning` | ✅ | aurora azul — pai/mãe |
| `gradient-card-afternoon` | ✅ | aurora lilás — pai/mãe |
| `gradient-card-evening` | ✅ | aurora quente — pai/mãe |
| `gradient-celebration` | ✅ | accent→primary |

---

## Tokens de Espaçamento

| Token | Valor | Status |
|---|---|---|
| `spacing-xs` | 4px | ✅ |
| `spacing-sm` | 8px | ✅ |
| `spacing-md` | 16px | ✅ |
| `spacing-lg` | 24px | ✅ |
| `spacing-xl` | 40px | ✅ |
| `spacing-2xl` | 64px | ✅ (bonus exclusivo pai) |

**Resultado:** 5/5 obrigatórios ✅

---

## Tokens de Border-Radius

| Token | Valor | Status |
|---|---|---|
| `radius-sm` | 4px | ✅ |
| `radius-md` | 6px | ✅ |
| `radius-lg` | 12px | ✅ |
| `radius-xl` | 20px | ✅ (bonus — cards gradient pai) |
| `radius-full` | 9999px | ✅ |

**Resultado:** 4/4 obrigatórios ✅

---

## Tokens de Tipografia

| Token | Status |
|---|---|
| `font-heading` | ✅ Plus Jakarta Sans (Variable) |
| `font-body` | ✅ DM Sans |
| `font-mono` | ✅ DM Mono |

**Resultado:** 3/3 ✅

---

## Tokens de Motion (adição v1.1)

| Token | Status | Valores |
|---|---|---|
| `spring-snappy` | ✅ | damping=20 stiffness=300 mass=0.8 |
| `spring-modal` | ✅ | damping=26 stiffness=200 mass=1 |
| `spring-bounce` | ✅ | damping=12 stiffness=180 mass=1 |
| `spring-micro` | ✅ | damping=30 stiffness=400 mass=0.5 |
| `duration-instant` | ✅ | 100ms |
| `duration-fast` | ✅ | 200ms |
| `duration-standard` | ✅ | 300ms |

---

## Componentes Base (obrigatórios)

| Componente | Variantes | Estados | Dark Mode | Status |
|---|---|---|---|---|
| Button | primary / secondary / ghost / destructive / fab | default/hover/focus/loading/disabled | ✅ | ✅ |
| Input | text / select / textarea / search | default/focus/filled/error/disabled | ✅ | ✅ |
| Card | default/elevated/bordered/aula/aula-gradient/skeleton | — | ✅ | ✅ |
| Badge | success/warning/error/neutral/highlight/streak | — | — | ✅ |
| Avatar | professor/pai/filho/placeholder | xs/sm/md/lg/xl | — | ✅ |
| Notification | preview premium (iMessage-style) | enviando/sucesso/sem-pai | — | ✅ |
| ProgressBar | padrão/semanal/por-matéria | vazio | — | ✅ |
| BottomSheet | registrar aula | vazio/preenchendo/enviando/sucesso/erro | ✅ | ✅ |
| Toast | success/error/warning/info | — | ✅ | ✅ |
| StreakBadge | sm/md/lg | ativo/zerado | — | ✅ |
| CelebrationOverlay | firstLesson/tenthLesson/firstParent | — | — | ✅ |

**Resultado componentes:** 9/9 obrigatórios + 2 novos ✅

---

## Anti-Patterns (mínimo 8)

| # | Anti-Pattern | Status |
|---|---|---|
| AP-01 | shadow-lg genérico | ✅ |
| AP-02 | Densidade única professor/pai | ✅ |
| AP-03 | Ícone escola/livro/chapéu | ✅ |
| AP-04 | Azul corporativo primário | ✅ |
| AP-05 | Tipografia sem hierarquia | ✅ |
| AP-06 | Illustration EdTech genérica | ✅ |
| AP-07 | Inter/Roboto sem justificativa | ✅ |
| AP-08 | Gradiente como bg de tela inteira | ✅ (nuançado: gradiente em card OK) |
| AP-09 | Registro de aula como auditoria | ✅ |
| AP-10 | Avatar câmera padrão | ✅ |
| AP-11 | Gamification infantil | ✅ (novo) |
| AP-12 | Animações ease linear | ✅ (novo) |

**Resultado:** 12/12 ✅ (mínimo era 8)

---

## Resumo Final v1.1

| Categoria | Obrigatórios | Entregues | Status |
|---|---|---|---|
| Cores | 15 | 26 (+ dark mode + gradientes + accent) | ✅ |
| Espaçamento | 5 | 6 | ✅ |
| Border-radius | 4 | 5 | ✅ |
| Fontes | 3 | 3 | ✅ |
| Motion | 0 (bonus) | 7 | ✅ |
| Componentes | 9 | 11 | ✅ |
| Anti-patterns | 8 | 12 | ✅ |
| Escala tipográfica | 6×2 | 6×2 | ✅ |

**DESIGN.md v1.1 aprovado para Checkpoint-02.**
