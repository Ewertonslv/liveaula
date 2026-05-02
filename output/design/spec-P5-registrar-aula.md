# P5 — Registrar Aula (BottomSheet) — Professor — Mobile

> Tela hero do liveaula. Core loop do produto. Requisito inegociável: < 30 segundos do tap ao envio.
> Atenção 2x: especificação cobre cada campo, cada estado, cada milissegundo da coreografia pós-envio.

---

## Layout ASCII Wire — Mobile 375px

### Estado inicial (BottomSheet recém-aberto)

```
┌────────────────────── 375px ──────────────────────┐
│                  (overlay escuro 50%)              │
│                                                    │
│                                                    │
│                                                    │
│╔══════════════════════════════════════════════════╗│
│║                                                  ║│
│║              [▬▬▬▬ handle ▬▬▬▬]                 ║│
│║                                                  ║│
│║  Registrar aula              [✕ fechar]          ║│
│║  Plus Jakarta Sans 20px/700  text-caption right  ║│
│║                                                  ║│
│║  ── Aluno ─────────────────────────── obrig. ──  ║│
│║                                                  ║│
│║  [Maria L. ●] [Pedro R.] [Carlos M.] [+3 ›]     ║│
│║   chip accent   chip     chip         link       ║│
│║                                                  ║│
│║                                                  ║│
│║  ── Matéria ───────────────────────── bloq. ──  ║│
│║  (desbloqueada após aluno selecionado)           ║│
│║  [Matemática] [Física] [Química]                 ║│
│║   chips disabled até aluno ser selecionado       ║│
│║                                                  ║│
│║  ── Duração ───────────────────────── bloq. ──  ║│
│║  [45min] [1h] [1h30] [2h]                        ║│
│║   chips disabled até matéria ser selecionada     ║│
│║                                                  ║│
│║  ── O que foi feito ──────────────── bloq. ──   ║│
│║  ┌────────────────────────────────────────────┐ ║│
│║  │                                            │ ║│
│║  │  Descreva brevemente o conteúdo da aula    │ ║│
│║  │                                            │ ║│
│║  └──────────────────────────────────── 0/280 ─┘ ║│
│║   textarea disabled até duração ser selecionada ║│
│║                                                  ║│
│║  ╌╌ Opcionais ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  ║│
│║  Humor do aluno:  [😕]  [😐]  [😊]             ║│
│║                                                  ║│
│║  ┌──────────────────────────────────────────┐   ║│
│║  │  Observação para o pai (opcional)        │   ║│
│║  └──────────────────────────────────────────┘   ║│
│║                                                  ║│
│║  ┌──────────────────────────────────────────┐   ║│
│║  │       Enviar notificação ao pai          │   ║│
│║  │         Button primary — disabled        │   ║│
│║  └──────────────────────────────────────────┘   ║│
│║                                                  ║│
│║        [safe area bottom — 34px iOS]            ║│
│╚══════════════════════════════════════════════════╝│
└────────────────────────────────────────────────────┘
```

### Estado preenchido (todos os campos obrigatórios)

```
┌────────────────────── 375px ──────────────────────┐
│╔══════════════════════════════════════════════════╗│
│║              [▬▬▬▬ handle ▬▬▬▬]                 ║│
│║                                                  ║│
│║  Registrar aula              [✕ fechar]          ║│
│║                                                  ║│
│║  ── Aluno ──────────────────────────────────── ──║│
│║  [Maria L. ✓●] [Pedro R.] [Carlos M.] [+3 ›]   ║│
│║   selected accent                                ║│
│║                                                  ║│
│║  ── Matéria ────────────────────────────────── ──║│
│║  [Matemática ✓] [Física] [Química]               ║│
│║   selected primary                               ║│
│║                                                  ║│
│║  ── Duração ────────────────────────────────── ──║│
│║  [45min] [1h ✓] [1h30] [2h]                     ║│
│║           selected primary                       ║│
│║                                                  ║│
│║  ── O que foi feito ─────────────────────────── ─║│
│║  ┌────────────────────────────────────────────┐ ║│
│║  │ Revisamos equações do 2º grau. Aluno      │ ║│
│║  │ entendeu discriminante. Exercícios 1-10.  │ ║│
│║  └─────────────────────────────────── 87/280 ─┘ ║│
│║                                                  ║│
│║  ╌╌ Opcionais ╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌  ║│
│║  Humor do aluno:  [😕]  [😊 ✓]  [😐]           ║│
│║                                                  ║│
│║  ┌──────────────────────────────────────────┐   ║│
│║  │ Próxima aula: trazer caderno de ex...    │   ║│
│║  └──────────────────────────────────────────┘   ║│
│║                                                  ║│
│║  ┌──────────────────────────────────────────┐   ║│
│║  │    ▶  Enviar notificação ao pai          │   ║│
│║  │         Button primary — ATIVO           │   ║│
│║  └──────────────────────────────────────────┘   ║│
│║                                                  ║│
│║        [safe area bottom — 34px iOS]            ║│
│╚══════════════════════════════════════════════════╝│
└────────────────────────────────────────────────────┘
```

---

## Campos — Especificação Completa

### Campo 1 — Aluno (obrigatório)

| Atributo | Detalhe |
|---|---|
| Tipo | Chip selector horizontal com scroll |
| Dados | Últimos 5 alunos do professor (ordenados por data de última aula) |
| Smart default | Aluno da última aula pré-destacado visualmente (borda primary), mas não selecionado |
| Placeholder | — (chips sempre visíveis) |
| Estado bloqueado | Não se aplica — é o primeiro campo |
| Estado selecionado | bg=accent `#D95F3B`, text=white, ícone ✓ |
| Overflow | `[+N ›]` link ao lado dos chips — abre modal de lista completa com busca |
| Lista completa | FlatList com avatar + nome + última aula (data relativa) + badge matéria |
| Validação | Obrigatório — botão "Enviar" bloqueado até seleção |
| Estado erro | Borda vermelha nos chips + helper "Selecione um aluno" |
| Vazio (sem alunos) | Não chega neste estado via FAB — fluxo bloqueado no Dashboard com CTA "Adicionar aluno" |

### Campo 2 — Matéria (obrigatório)

| Atributo | Detalhe |
|---|---|
| Tipo | Chip selector horizontal |
| Dados | Matérias cadastradas para o aluno selecionado |
| Smart default | Última matéria usada com este aluno é pré-selecionada automaticamente |
| Estado bloqueado | opacity=0.4, chips não responsivos, label "Selecione um aluno primeiro" abaixo |
| Desbloqueio | Animação: seção desce com spring.snappy + chips aparecem em stagger 50ms |
| Estado selecionado | bg=primary `#1A6B74`, text=white |
| Um único registro | Auto-selecionado, seção fica visível mas não requer toque |
| Validação | Obrigatório |

### Campo 3 — Duração (obrigatório)

| Atributo | Detalhe |
|---|---|
| Tipo | Chip selector horizontal |
| Opções | `45min` · `1h` · `1h30` · `2h` |
| Smart default | Última duração usada (global, não por aluno) pré-selecionada |
| Estado bloqueado | opacity=0.4 até matéria selecionada |
| Estado selecionado | bg=primary `#1A6B74`, text=white |
| Validação | Obrigatório |

### Campo 4 — O que foi feito (obrigatório)

| Atributo | Detalhe |
|---|---|
| Tipo | Textarea multi-linha |
| Altura | min=88px, max=120px, scroll interno se exceder |
| Placeholder | "Descreva brevemente o conteúdo da aula..." |
| Contador | `0/280` — alinha direita, abaixo do campo |
| Cores do contador | 0–200: `color-text-muted` · 200–240: `color-warning` · 240+: `color-error` |
| Foco | Auto-focus após duração selecionada (teclado abre automaticamente) |
| Estado bloqueado | opacity=0.4, `userInteractionEnabled=false` até duração selecionada |
| Estado focus | border=2px primary + shadow glow `rgba(26,107,116,0.2)` |
| Validação | Obrigatório, mínimo 3 caracteres (anti-acidente), máximo 280 |
| Estado erro (min) | "Descreva um pouco mais o que aconteceu na aula" |
| Estado erro (max) | Contador em vermelho, campo com border-error |
| Teclado iOS | `returnKeyType="done"` move foco para botão |
| Teclado Android | `inputType="textMultiLine"`, `imeOptions="actionDone"` |

### Campo 5 — Humor do aluno (opcional)

| Atributo | Detalhe |
|---|---|
| Tipo | Emoji picker — 3 opções em linha |
| Opções | `😕` Difícil · `😐` Normal · `😊` Ótimo |
| Estado default | Nenhum selecionado — área cinza clara |
| Estado selecionado | Emoji aumenta scale=1.3 com spring.bounce, fundo circular accent-muted |
| Tap em selecionado | Deseleciona (toggle) |
| Toque mínimo | 48px área de toque por emoji |
| Haptic | selectionAsync ao tocar |

### Campo 6 — Observação para o pai (opcional)

| Atributo | Detalhe |
|---|---|
| Tipo | Textarea compacta |
| Altura | min=60px |
| Placeholder | "Algo que o pai deva saber sobre a próxima aula?" |
| Limite | Sem contador (campo livre) — máximo 500 chars backend |
| Contexto UX | Linguagem "para o pai" — não "observações do professor" |

---

## Sequência de Interação — Ordem de Foco

```
tap FAB
  └→ BottomSheet abre (spring.modal + haptic.selection)
       └→ Campo Aluno ganha foco visual (scroll snap para chips)
            └→ Tap aluno
                 └→ Campo Matéria desbloqueado (spring.snappy) + auto-seleciona última
                      └→ [Se 1 matéria: pula]  [Se múltiplas: tap matéria]
                           └→ Campo Duração desbloqueado + auto-seleciona última
                                └→ [Se duração ok: pula]  [Se quiser mudar: tap]
                                     └→ Textarea "O que foi feito" recebe auto-focus
                                          └→ Teclado sobe + BottomSheet ajusta
                                               └→ Digita conteúdo
                                                    └→ [Opcional: toca emoji humor]
                                                         └→ [Opcional: escreve obs]
                                                              └→ Botão "Enviar" ativo
                                                                   └→ Tap Enviar
```

**Caminho rápido (retorno — aluno/matéria/duração pré-selecionados):**
`tap FAB → tap aluno → digita conteúdo → tap Enviar` = ~4 interações = ~15–20s

**Caminho completo (primeira vez):**
`tap FAB → tap aluno → tap matéria → tap duração → digita → tap Enviar` = ~6 interações = ~25–30s

---

## Botão "Enviar notificação ao pai"

### Estados

| Estado | Visual | Condição |
|---|---|---|
| Disabled | bg=`#CBD5E1` text=`#94A3B8` h=48px | Campos obrigatórios incompletos |
| Ativo | bg=`#1A6B74` text=white h=48px | Todos os 4 campos obrigatórios preenchidos |
| Loading | bg=`#1A6B74` opacity=0.85 spinner-white | Durante envio (API call) |
| Erro | Volta para Ativo + Toast error | Falha de rede |

### Transição disabled → ativo
`spring.snappy` — scale 0.98→1 + cor muda gradualmente (não snap)

---

## Coreografia Completa Pós-Envio (4200ms)

```
t=0ms    tap "Enviar"
           → botão entra em loading (spinner branco)
           → campos desabilitados (pointer-events: none)
           → haptic: nenhum ainda

t=50ms   request HTTP POST /aulas enviado (background)

t=200ms  resposta OK recebida
           → haptic: notificationAsync(Success) — iOS
           → haptic: HapticFeedbackTypes.CONFIRM — Android

t=300ms  BottomSheet inicia fechamento
           → spring.modal (translateY 0→100%)
           → overlay inicia fade-out

t=500ms  BottomSheet fechado
           → Dashboard visível

t=550ms  Toast "Aula registrada ✓" aparece (top)
           → spring.snappy, slide-down + fade-in
           → bg=#15803D  text=white  icon=checkmark-circle

t=600ms  Notification Preview aparece (centro da tela, sobrepõe Dashboard)
           → fade-in + scale 0.95→1 (spring.snappy)
           → Container com gradient-celebration (FDEEE9→E0F2F4)
           → Label: "Notificação enviada ao pai:"
           → Skin iOS dark com conteúdo real da aula

t=800ms  [Se streak ≥ 2 dias] StreakBadge no Dashboard pulsa
           → scale 1→1.3→1 (spring.bounce)
           → número incrementa (prev→new)

t=800ms  [Se primeiro registro] CelebrationOverlay dispara
           → confetti 40 partículas (primary + accent + success)
           → haptic: Heavy + 300ms delay + Light

t=4000ms Toast auto-dismiss (fade-out)

t=4200ms Notification Preview auto-dismiss (fade-out + scale 1→0.95)
           → Dashboard retorna estado normal
           → Badge "última aula: agora" aparece no card do aluno registrado
```

---

## Notification Preview — Conteúdo Exato

```
CONTAINER (sobre Dashboard, centralizado):
  bg: gradient-celebration (135deg, #FDEEE9→#E0F2F4)
  radius=20px  p=20px  mx=16px
  shadow=0 8px 32px rgba(15,23,42,0.12)

LABEL TOPO:
  "Notificação enviada ao pai de [Nome do Aluno]:"
  text-caption  color=text-muted  mb=12px

SKIN iOS (dark card):
  bg=#1C1C1E  radius=16px  px=16px  py=12px
  border=0.5px solid rgba(255,255,255,0.08)

  Linha 1: [ícone app 20px radius=6px] "liveaula" (12px #ABABAB)  "agora" (12px #6B6B6B)
  Linha 2: "[Matéria] — [Nome do Aluno]"  (15px weight=600 #FFFFFF)
  Linha 3: "[Duração] · "[Primeiros 60 chars do conteúdo]..."  (13px #ABABAB)

EXEMPLO REAL:
┌────────────────────────────────────────────────┐
│ Notificação enviada ao pai de Pedro:           │
│ ┌──────────────────────────────────────────┐  │
│ │ [L] liveaula                       agora │  │
│ │ Matemática — Pedro                       │  │
│ │ 1h · "Revisamos equações do 2º grau...  │  │
│ └──────────────────────────────────────────┘  │
└────────────────────────────────────────────────┘
```

---

## Estados da Tela

### Estado vazio (sem alunos cadastrados)
Não chega neste estado via FAB — o FAB no Dashboard só aparece se `alunos.length > 0`. Se professor não tem alunos, o Dashboard mostra estado vazio com CTA primário "Adicionar aluno" e FAB não renderiza.

### Estado loading (carregando lista de alunos)
BottomSheet abre normalmente. Chips mostram skeleton (3 pills shimmer animadas) enquanto carrega. Timeout de 3s: se API não responder, mostra chips da cache local (última lista conhecida) + ícone de offline.

### Estado offline
Banner amarelo discreto no topo do BottomSheet: "Sem conexão — a aula será registrada quando voltar online."
Formulário permanece disponível. Ao submeter: salva em SQLite local (expo-sqlite). Botão muda para "Salvar offline". Sincroniza automaticamente ao voltar online (background sync via expo-task-manager).

### Estado erro de rede (post falhou, online)
Toast vermelho "Erro ao enviar — tente novamente"
Dados do formulário preservados — não limpa os campos.
Botão volta ao estado "Ativo" (não disabled).
Retry automático após 5s (silencioso).

### Estado aluno sem pai vinculado
Botão permanece ativo ("Enviar").
Após envio: toast de sucesso normal + warning badge amarelo dentro do Notification Preview: "Pai não vinculado — push não enviado. Você pode convidar agora."
Link "Convidar pai" dentro do warning → abre modal P10 (Convidar pai).
A AULA É SALVA DE QUALQUER FORMA — o professor não é penalizado pela ausência do pai.

---

## Componentes Usados

| Componente | Variante | Estado relevante |
|---|---|---|
| BottomSheet | registrar-aula | vazio / preenchendo / enviando / sucesso / erro |
| Button | primary | disabled / ativo / loading |
| Input (textarea) | textarea | bloqueado / focus / filled / error |
| Badge | highlight / neutral | streak / chip aluno / chip matéria / chip duração |
| Avatar | professor / placeholder | sm (32px) no card de aluno na lista |
| Notification | premium-preview | enviando / sucesso / sem-pai |
| Toast | success / error / warning | pós-envio |
| StreakBadge | md | ativo / pulse |
| CelebrationOverlay | firstLesson | first registration only |

---

## Interações Principais

| Ação | O que acontece |
|---|---|
| Tap FAB | BottomSheet abre (spring.modal) + haptic.selection |
| Tap aluno chip | Chip muda para accent selecionado + matéria desbloqueia (spring.snappy) |
| Tap "[+N ›]" | Modal de lista completa com search (FlatList, avatar, última aula) |
| Tap matéria chip | Chip selecionado + duração desbloqueia |
| Tap duração chip | Chip selecionado + textarea recebe auto-focus + teclado abre |
| Digitar conteúdo | Contador atualiza em tempo real |
| Tap emoji humor | Scale bounce + fundo circular accent-muted |
| Tap emoji selecionado | Deseleciona (toggle) |
| Tap "Enviar" | Loading → coreografia 4200ms |
| Swipe down (rascunho vazio) | BottomSheet fecha sem confirmação |
| Swipe down (rascunho preenchido) | Alert nativo: "Descartar aula não registrada?" |
| Tap ✕ | Mesmo comportamento do swipe down |
| Tap overlay | Mesmo comportamento do swipe down |

---

## Dados Necessários da API

### Carregamento inicial
```
GET /professor/alunos/recentes?limit=5
  response: [{ id, nome, foto_url, materias: [{id, nome}], ultima_aula: ISO }]

GET /professor/preferencias
  response: { ultima_duracao: "1h", ultimo_aluno_id: uuid }
```

### Submissão
```
POST /aulas
  body: {
    aluno_id: uuid,          // obrigatório
    materia_id: uuid,        // obrigatório
    duracao: "1h",           // obrigatório (enum: "45min"|"1h"|"1h30"|"2h")
    conteudo: string,        // obrigatório, 3–280 chars
    humor_aluno: "otimo" | "normal" | "dificil" | null,   // opcional
    observacao_pai: string | null,  // opcional, max 500 chars
    registrado_em: ISO,      // cliente envia timestamp local
    offline: boolean         // true se veio do SQLite offline
  }
  response 201: {
    aula_id: uuid,
    push_enviado: boolean,
    push_preview: { titulo: string, corpo: string },
    streak_atual: number
  }
  response 422: { error: "aluno_sem_pai" | "validation_error", details: {...} }
  response 503: salvar offline via expo-sqlite
```

---

## Anti-AI Checklist

- [x] Layout não é centered-card-on-gradient — BottomSheet sobre surface sólida, gradient apenas no Notification Preview como accent
- [x] Tipografia tem pelo menos 2 pesos distintos — título 700, labels 400, conteúdo 400, botão 600
- [x] Paleta usa tokens semânticos — `color-primary`, `color-accent`, `color-border`, não hexadecimais inline
- [x] Componentes têm variação — chips de aluno (accent) vs chips de matéria/duração (primary) vs emoji picker (nenhuma das duas)
- [x] Estado vazio tem conteúdo significativo — não chega vazio por design (FAB oculto sem alunos); estado offline tem explicação + funcionalidade completa
- [x] FAB não está dentro da tab bar — flutua acima, sempre visível, `position: absolute bottom=88px`
- [x] Toque mínimo 44px — todos os chips, emojis e botões verificados
- [x] Campos progressivos desbloqueados — não despeja 6 campos de uma vez na tela
