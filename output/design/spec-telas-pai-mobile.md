# Specs — Pai/Mãe Mobile (M1–M19, Must-have)

> Passo 3B. Stack: React Native + Expo. Viewport: 375px. Modo: sempre light (creme quente).
> Tokens: tokensPai (color-surface=#FFFBF5, gradientes aurora, spacing-2xl=64px para respiração).

---

## M1 — Splash — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│                             │
│                             │
│                             │
│         ◆ liveaula          │  ← logo, color-primary, Plus Jakarta Sans 700
│   acompanhe cada conquista  │  ← tagline text-caption color-text-muted
│                             │
│                             │
│    ░░░░░░░░░░░░░░░░░░░░░    │  ← ProgressBar indeterminate h=2px color-primary
└─────────────────────────────┘
   bg: tokensPai.colorSurface (#FFFBF5 — creme quente)
```

### Componentes usados
- Logo: wordmark SVG
- ProgressBar: indeterminate, h=2px

### Estados da tela
- Auto-navega: token presente → M6 (Feed) | primeira vez → M2 (Convite) | sem token → M4 (Login)

### Dados necessários da API
- Nenhum — verificação de token local (SecureStore)

**Anti-AI checklist:**
- [x] Surface creme (não branco genérico)
- [x] 2 pesos (logo 700 + tagline 400)
- [x] Tokens semânticos (tokensPai)
- [x] Tagline emocional ("conquista") — não funcional
- [x] Sem estado vazio (tela de transição)

---

## M2 — Tela de Convite (Entrada) — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│                             │
│  ◆ liveaula                 │  ← logo top-left
│                             │
│                             │
│  João Silva te convidou     │  ← text-h1 600, nome do professor em bold
│  para acompanhar            │  ← text-h1 600
│                             │
│  ┌─────────────────────────┐│
│  │   [foto filho]          ││  ← Card gradient-card-morning, radius=20px
│  │   Pedro Santos          ││     nome text-h2, matéria text-caption
│  │   Matemática • 8º Ano   ││
│  └─────────────────────────┘│
│                             │
│                             │
│  "Registre-se para ver as   │  ← text-body color-text-muted, line-height 1.7
│  aulas do Pedro em tempo    │
│  real e acompanhar seu      │
│  progresso."                │
│                             │
│  ┌─────────────────────────┐│
│  │   Aceitar convite       ││  ← Button primary
│  └─────────────────────────┘│
│                             │
│  Já tem conta? Entrar       │  ← link text-caption color-primary
└─────────────────────────────┘
   bg: tokensPai.colorSurface
```

### Componentes usados
- Card: aula-gradient (gradient-card-morning), radius=20px, mostra dados do filho
- Button: primary (Aceitar)
- Avatar: filho placeholder (foto ou inicial)

### Estados da tela
- **Link expirado (30 dias):** "Este convite expirou — Peça ao professor um novo link"
- **Link já usado:** "Você já aceitou este convite — Entrar na sua conta"
- **Loading:** skeleton do card filho

### Interações principais
- "Aceitar convite" → salva token de convite (query param) → navega M3 (Cadastro)
- "Entrar" → navega M4 (Login) com convite pendente
- Deep link: `liveaula://convite/abc123` → esta tela diretamente

### Dados necessários da API
- `GET /convites/:token` → `{ professor_nome, filho_nome, filho_serie, materia, status }`

**Anti-AI checklist:**
- [x] Card filho com gradient (não card branco genérico)
- [x] 2 pesos (h1 + body)
- [x] Tokens semânticos (gradient-card-morning)
- [x] Tom emocional na copy ("acompanhar seu progresso")
- [x] Estado "link expirado" com instrução acionável

---

## M3 — Cadastro (3 Steps) — Pai/Mãe — Mobile

### Layout — Step 1/3
```
┌─────────────────────────────┐
│  ●──○──○                    │
│─────────────────────────────│
│  Criar sua conta            │  ← text-h1 600
│  É rápido — menos de 1 min  │  ← text-body color-text-muted
│                             │
│  ┌─────────────────────────┐│
│  │ Seu nome completo       ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ E-mail                  ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Senha (mín. 8 chars)    ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Confirmar senha         ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │      Continuar →        ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Layout — Step 2/3 (foto)
```
┌─────────────────────────────┐
│  ○──●──○                    │
│─────────────────────────────│
│  Adicione uma foto          │  ← text-h1
│  (opcional — pode pular)    │
│                             │
│     ┌───────────────────┐   │
│     │   [+] Foto        │   │  ← Avatar placeholder 100px, tap = picker
│     │                   │   │
│     └───────────────────┘   │
│     Toque para adicionar    │  ← text-caption center
│                             │
│  ┌─────────────────────────┐│
│  │      Continuar →        ││
│  └─────────────────────────┘│
│  [Pular]                    │  ← ghost, bottom center
└─────────────────────────────┘
```

### Layout — Step 3/3 (confirmação filho)
```
┌─────────────────────────────┐
│  ○──○──●                    │
│─────────────────────────────│
│  Confirme os dados          │  ← text-h1
│  do Pedro                   │  ← nome do filho (do convite)
│                             │
│  ┌─────────────────────────┐│
│  │ [Avatar] Pedro Santos   ││  ← Card gradient-card-morning radius=20
│  │ Matemática • 8º Ano     ││
│  │ Professor: João Silva   ││
│  └─────────────────────────┘│
│                             │
│  Está correto?              │  ← text-body
│  ┌─────────────────────────┐│
│  │ ✓ Sim, sou pai de Pedro ││  ← Button primary
│  └─────────────────────────┘│
│  Não é meu filho — corrigir │  ← link text-caption color-error
└─────────────────────────────┘
```

### Componentes usados
- Input: text, email, password
- Avatar: pai/placeholder, size=lg, tap=upload
- Card: aula-gradient (confirmação filho)
- Button: primary, ghost (Pular)

### Estados da tela
- **Step 1 — erro e-mail já usado:** Input erro + "Entrar na sua conta"
- **Step 3 — filho errado:** "Não é meu filho" → abre form para corrigir nome/dados
- **Loading (submit):** botão loading após Step 3

### Interações principais
- Step 3 submit → `POST /auth/register` com token do convite + vincula filho automaticamente → navega M5 (LGPD)

### Dados necessários da API
- `POST /auth/register` `{ nome, email, senha, foto_url, convite_token }`

**Anti-AI checklist:**
- [x] Não é centered-card-on-gradient (form limpo com surface creme)
- [x] 2 pesos (h1 + inputs)
- [x] Tokens semânticos
- [x] Step 2 foto tem "Pular" (respeita que pai pode não querer foto)
- [x] Step 3 tem opção "não é meu filho" (caso real de link errado)

---

## M4 — Login — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│                             │
│  ◆ liveaula                 │
│                             │
│  Entrar                     │  ← text-h1 600
│  Para pais e mães           │  ← text-body color-text-muted
│                             │
│  ┌─────────────────────────┐│
│  │ E-mail                  ││  ← autofocus
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ Senha                  👁││
│  └─────────────────────────┘│
│                             │
│  Esqueci minha senha        │  ← link right-align
│                             │
│  ┌─────────────────────────┐│
│  │         Entrar          ││  ← Button primary
│  └─────────────────────────┘│
│                             │
│  Recebeu um convite?        │  ← text-caption center
│  [Criar conta →]            │  ← link color-primary
└─────────────────────────────┘
   bg: tokensPai.colorSurface
```

### Componentes usados
- Input: email, password
- Button: primary

### Estados da tela
- **Erro:** Toast "E-mail ou senha incorretos"
- **Loading:** botão loading
- **Sucesso:** navega M6 (Feed)

### Interações principais
- Submit → `POST /auth/login` → token → M6
- "Esqueci" → M19
- "Criar conta" → M2 (convite) ou M3 sem convite

### Dados necessários da API
- `POST /auth/login` `{ email, senha, tipo: 'pai' }`

**Anti-AI checklist:**
- [x] Surface creme (distingue do login do professor)
- [x] 2 pesos
- [x] Tokens semânticos
- [x] CTA "Recebeu um convite?" (cold-start do pai que não foi pela web)
- [x] Toast error (não inline abaixo dos campos)

---

## M5 — Aceite LGPD Art. 14 — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  Proteção de dados          │  ← text-h1 600
│  do seu filho               │
│─────────────────────────────│
│                             │
│  ┌─────────────────────────┐│  ← ScrollView (obrigatório rolar até o fim)
│  │ O liveaula coleta e     ││
│  │ processa dados do menor ││
│  │ Pedro Santos, conforme  ││
│  │ a LGPD Art. 14 (dados   ││
│  │ de crianças e           ││
│  │ adolescentes).          ││
│  │                         ││
│  │ Dados coletados:        ││
│  │ • Nome e série escolar  ││
│  │ • Registro de aulas     ││
│  │ • Humor nas aulas       ││
│  │ • Observações do prof.  ││
│  │                         ││
│  │ Finalidade: comunicação ││
│  │ entre professor e       ││
│  │ responsável legal.      ││
│  │                         ││
│  │ Você pode revogar o     ││
│  │ consentimento a qualquer││
│  │ momento em Configurações││
│  └─────────────────────────┘│
│  ░░░░░ (leu até aqui)       │  ← ProgressBar de scroll (read indicator)
│                             │
│  ☐ Li e concordo com os    │  ← Checkbox explícito (obrigatório marcar)
│    termos acima             │
│                             │
│  ┌─────────────────────────┐│
│  │  Concordar e continuar  ││  ← Button primary (disabled até checkbox)
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Componentes usados
- ScrollView com ProgressBar de leitura
- Checkbox: nativo
- Button: primary (disabled → active após checkbox)

### Estados da tela
- **Checkbox desmarcado:** botão disabled
- **Sem rolar até fim:** checkbox bloqueado (não habilitado até 100% do scroll)
- **Loading (submit):** botão loading

### Interações principais
- Scroll obrigatório até o fim → checkbox habilita
- Checkbox → botão habilita
- Submit → `POST /lgpd/aceite` com timestamp → navega M10 (Assinatura)

### Dados necessários da API
- `POST /lgpd/aceite` `{ filho_id, aceito_em, versao_termo }`

**Anti-AI checklist:**
- [x] Tela dedicada (não checkbox escondido no cadastro — peso jurídico Art. 14)
- [x] 2 pesos (h1 + body)
- [x] Scroll obrigatório (não checkbox logo de cara)
- [x] Checkbox explícito (não toggle)
- [x] Data e versão do termo registradas na API

---

## M6 — Feed de Aulas — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  Hoje                       │  ← text-h2 600 (seção por dia)
│  ┌─────────────────────────┐│
│  │ gradient-card-afternoon ││  ← Card aula-gradient, radius=20
│  │                         ││    gradient baseado na hora da aula
│  │ Matemática   1h         ││  ← text-body-lg 500 + text-caption
│  │ Pedro Santos            ││  ← nome filho
│  │ Prof. João Silva        ││  ← text-caption color-text-muted
│  │                         ││
│  │ "Funções quadráticas e  ││  ← conteúdo preview, text-body 400
│  │ seus gráficos. Pedro se ││    line-height 1.7
│  │ saiu muito bem!"        ││
│  │                         ││
│  │ 😊 Ótimo  • há 2 horas  ││  ← humor badge + tempo relativo
│  └─────────────────────────┘│
│                             │
│  Ontem                      │  ← section divider
│  ┌─────────────────────────┐│
│  │ gradient-card-morning   ││
│  │ Matemática   1h30       ││
│  │ Pedro Santos            ││
│  │ "Revisão de geometria..." ││
│  │ 😐 Regular • há 1 dia   ││
│  └─────────────────────────┘│
│                             │
│  Esta semana  (4 aulas)     │  ← seção colapsável
│  ...                        │
│─────────────────────────────│
│ [🏠] [👦] [🔔] [👤]        │  ← TabBar
└─────────────────────────────┘
   bg: tokensPai.colorSurface (#FFFBF5)
```

### Componentes usados
- Card: aula-gradient (radius=20, gradient dinâmico por hora)
- Badge humor emoji inline (😕/😐/😊)
- TabBar: Feed / Filho / Notificações / Perfil

### Estados da tela
- **Vazio trial (M18):** ver spec M18
- **Paywall (após 7 dias trial):** Feed travado com blur + banner "Liberar acesso completo"
- **Loading:** skeleton com 3 cards (animação shimmer)
- **Offline:** dados do cache local (expo-sqlite), badge "Offline" no topo
- **Nova aula (push aberto):** card destacado com borda color-primary pulsando 1x (spring.bounce)

### Interações principais
- Tap card → M7 (Detalhe da aula)
- Pull to refresh → recarrega feed
- Infinite scroll (paginação por cursor, 10 cards)
- Banner paywall → M10 (Assinatura)
- Seção "Esta semana" → tap header para expandir/colapsar

### Dados necessários da API
- `GET /pai/feed?cursor=&limit=10` → `{ aulas: [{ id, materia, duracao, filho_nome, professor_nome, conteudo_preview, humor, registrado_em, gradient_variant }], proximo_cursor }`

**Anti-AI checklist:**
- [x] Cards com aurora gradient (não cards brancos genéricos)
- [x] 3 pesos (matéria body-lg, conteúdo body, metadata caption)
- [x] Tokens semânticos (gradient-card-morning/afternoon/evening dinâmico)
- [x] Humor com emoji (não só texto)
- [x] Seções por data (não lista linear infinita sem separação)

---

## M7 — Detalhe de Aula — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar                   │
│                             │
│  ┌─────────────────────────┐│
│  │ gradient-card-afternoon ││  ← Card hero com gradient, radius=20, p=24
│  │                         ││    altura: 180px
│  │  Matemática             ││  ← text-h1 600 branco/escuro (contrast)
│  │  Segunda, 28 de abril   ││  ← text-caption
│  │  1 hora de aula         ││
│  └─────────────────────────┘│
│                             │
│  O que foi estudado         │  ← text-h2 600
│                             │
│  Funções quadráticas e seus │  ← text-body 400 line-height 1.7
│  gráficos. Exercícios de    │
│  determinação de vértice e  │
│  raízes. Pedro se saiu muito│
│  bem nos exemplos práticos. │
│                             │
│─────────────────────────────│
│  Como Pedro estava          │  ← text-h2
│  😊  Estava bem animado     │  ← emoji grande (32px) + texto
│                             │
│─────────────────────────────│
│  Mensagem do professor      │  ← text-h2 (só aparece se há observação)
│  "Ótima aula! Pedro está    │  ← text-body italic color-text-muted
│  evoluindo muito."          │
│                             │
│─────────────────────────────│
│  [Avatar xs] João Silva     │  ← professor info no rodapé
│  Professor de Matemática    │
└─────────────────────────────┘
```

### Componentes usados
- Card: aula-gradient hero (full-width, 180px)
- Avatar: professor, size=xs
- Emoji humor: 32px inline

### Estados da tela
- **Sem observação:** seção "Mensagem do professor" oculta
- **Sem humor:** seção "Como Pedro estava" oculta
- **Loading:** skeleton (card hero + linhas de texto)

### Interações principais
- Tap avatar professor → informação do professor (modal ou tab)
- "← Voltar" → volta ao Feed
- Deep link (da push notification) → abre diretamente esta tela

### Dados necessários da API
- `GET /aulas/:id/pai` → `{ materia, duracao, registrado_em, gradient_variant, conteudo, humor_aluno, observacao_pai, professor: { nome, foto_url } }`

**Anti-AI checklist:**
- [x] Card hero gradient (não header color sólido)
- [x] 3 pesos (h1 no card, h2 seções, body conteúdo)
- [x] Tokens semânticos (gradient dinâmico)
- [x] Emoji humor em tamanho 32px (destaque emocional)
- [x] Seções condicionais (sem observação = seção oculta, não "Nenhuma mensagem")

---

## M8 — Perfil do Filho — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  Pedro Santos               │  ← text-h1 600
│  8º Ano • Matemática        │  ← text-caption
│─────────────────────────────│
│                             │
│  ┌──────────┬──────────┐    │
│  │  Aulas   │ Horas    │    │
│  │    28    │  14.5h   │    │  ← Stats cards (este mês)
│  │ este mês │ este mês │    │
│  └──────────┴──────────┘    │
│                             │
│  Progresso                  │  ← text-h2
│  ┌─────────────────────────┐│
│  │ Frequência              ││
│  │ ░░░░░░░░░░░░░░░░  75%  ││  ← ProgressBar padrão
│  └─────────────────────────┘│
│                             │
│  Últimas aulas              │  ← text-h2
│  ┌─────────────────────────┐│
│  │ gradient-card-afternoon ││  ← Card aula-gradient compacto
│  │ Seg 28/04 • Mat. • 1h  ││
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │ gradient-card-morning   ││
│  │ Sab 26/04 • Mat. • 1h30││
│  └─────────────────────────┘│
│  Ver todas as aulas →       │  ← link color-primary
│─────────────────────────────│
│ [🏠] [👦●] [🔔] [👤]       │  ← TabBar, "Filho" ativo
└─────────────────────────────┘
```

### Componentes usados
- Stats cards: pair (2 colunas, Card variant=elevated)
- ProgressBar: padrão (frequência)
- Card: aula-gradient compacto (tap → M7)
- Avatar: filho, size=lg (topo, fora do wire por brevidade)

### Estados da tela
- **Sem aulas:** "Pedro ainda não teve nenhuma aula registrada. Quando o professor registrar, aparecerá aqui."
- **Loading:** skeleton stats + skeleton cards

### Interações principais
- "Ver todas as aulas" → M6 filtrado por este filho
- Tap card aula → M7 (Detalhe)
- Tab Filho → esta tela (se múltiplos filhos, switch filho no topo)

### Dados necessários da API
- `GET /pai/filho/:id/perfil` → `{ nome, serie, materias, aulas_mes, horas_mes, frequencia_pct, ultimas_aulas: [...] }`

**Anti-AI checklist:**
- [x] Cards gradient (não cards brancos)
- [x] 3 pesos (h1 nome, h2 seções, caption metadata)
- [x] Tokens semânticos
- [x] Stats em pares visuais (densidade baixa — pai não quer tabela)
- [x] Estado vazio com esperança ("quando o professor registrar")

---

## M9 — Notificações (Central) — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  Notificações               │  ← text-h1 600
│                    [Marcar todos lidos]│  ← link ghost right
│─────────────────────────────│
│  Hoje                       │
│  ┌─────────────────────────┐│
│  │ ● [🔔] Aula de Mat.    ││  ← ● = não lida (dot color-primary)
│  │   Pedro teve aula hoje  ││
│  │   há 2 horas            ││  ← text-caption
│  └─────────────────────────┘│
│  ┌─────────────────────────┐│
│  │   [🔔] Aula de Mat.    ││  ← sem dot = lida (bg color-surface-raised)
│  │   Pedro teve aula ontem ││
│  │   há 1 dia              ││
│  └─────────────────────────┘│
│  Esta semana                │
│  ┌─────────────────────────┐│
│  │   [🔔] ...              ││
│  └─────────────────────────┘│
│─────────────────────────────│
│ [🏠] [👦] [🔔●] [👤]       │  ← badge no tab (n não lidas)
└─────────────────────────────┘
```

### Componentes usados
- Notification card: lida (bg surface-raised) / não-lida (dot color-primary + bg surface)
- Badge no TabBar: count não lidas

### Estados da tela
- **Vazio:** "Nenhuma notificação ainda — as aulas do Pedro aparecerão aqui quando forem registradas"
- **Loading:** skeleton cards

### Interações principais
- Tap notificação → marca como lida + navega M7 (detalhe da aula)
- "Marcar todos lidos" → `PATCH /pai/notificacoes/lidas`
- Pull to refresh

### Dados necessários da API
- `GET /pai/notificacoes?page=1` → `{ notificacoes: [{ id, titulo, corpo, lida, aula_id, criado_em }], nao_lidas }`
- `PATCH /pai/notificacoes/:id/lida`
- `PATCH /pai/notificacoes/lidas`

**Anti-AI checklist:**
- [x] Lista agrupada por dia (não lista plana)
- [x] 2 pesos (título body + metadata caption)
- [x] Tokens semânticos (dot color-primary)
- [x] Diferenciação visual lida/não-lida (bg + dot)
- [x] Empty state com contexto ("aulas do Pedro")

---

## M10 — Assinatura (Paywall) — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  [×] fechar (se trial ativo)│
│─────────────────────────────│
│                             │
│  ┌─────────────────────────┐│
│  │  gradient-celebration   ││  ← Card hero com gradient accent→primary
│  │  Liberar acesso completo││  ← text-h1 600 branco
│  │  para acompanhar Pedro  ││
│  └─────────────────────────┘│
│                             │
│  O que está incluído:       │  ← text-h2
│  ✓ Feed de aulas em tempo real│ ← text-body (checks color-success)
│  ✓ Notificações imediatas   │
│  ✓ Histórico completo       │
│  ✓ Progresso do filho       │
│                             │
│  ┌─────────────────────────┐│
│  │  R$ 79          /mês   ││  ← Card elevated, preço em text-display
│  │  por filho vinculado    ││     sub-label text-caption
│  │  Cancele quando quiser  ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │   Assinar agora         ││  ← Button primary
│  └─────────────────────────┘│
│  [Ver planos]               │  ← ghost (mostra variantes se existirem)
└─────────────────────────────┘
```

### Componentes usados
- Card hero: gradient-celebration
- Lista de benefícios: icons color-success + text-body
- Card pricing: elevated, preço text-display
- Button: primary (Assinar)

### Estados da tela
- **Trial ativo (últimos 3 dias):** banner warning "Seu acesso gratuito termina em N dias" (não paywall bloqueante ainda)
- **Trial expirado:** paywall bloqueante (sem [×] fechar)
- **Loading (checkout):** botão loading
- **Cartão recusado:** Toast error + volta para M11

### Interações principais
- "Assinar agora" → navega M11 (Adicionar cartão)
- [×] → fecha paywall (só se trial ainda ativo)

### Dados necessários da API
- `GET /pai/assinatura` → `{ status, trial_expira_em, preco_mensal }`

**Anti-AI checklist:**
- [x] Card hero gradient (não ilustração genérica de paywall)
- [x] Benefícios com checks (não bullet points sem ícone)
- [x] Preço em destaque (text-display) — não escondido
- [x] "Cancele quando quiser" visível (reduz ansiedade)
- [x] Trial com [×] fechável / expirado sem [×] (comportamentos distintos)

---

## M11 — Adicionar Cartão — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar   Forma de pagamento│
│─────────────────────────────│
│                             │
│  ┌─────────────────────────┐│
│  │ Número do cartão        ││  ← Input text masked (XXXX XXXX XXXX XXXX)
│  │ 4242 4242 4242 4242     ││
│  └─────────────────────────┘│
│  ┌────────────┐ ┌──────────┐│
│  │ Validade   │ │ CVV      ││  ← Input date masked MM/AA + Input 3-4 dígitos
│  │ 12/27      │ │ 123      ││
│  └────────────┘ └──────────┘│
│  ┌─────────────────────────┐│
│  │ Nome no cartão          ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │ CPF do titular          ││  ← Para compliance BR
│  └─────────────────────────┘│
│                             │
│  🔒 Pagamento seguro        │  ← text-caption color-text-muted + ícone cadeado
│  Processado por [gateway]   │
│                             │
│  ┌─────────────────────────┐│
│  │   Assinar — R$79/mês    ││  ← Button primary com preço
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Componentes usados
- Input: masked (cartão, validade, CVV, CPF)
- Button: primary com preço inline

### Estados da tela
- **Campos inválidos:** validação inline (Luhn check número, data futura, CPF válido)
- **Loading (cobrar):** botão loading + overlay translúcido (previne double-tap)
- **Sucesso:** navega M12
- **Cartão recusado:** Toast error "Pagamento não autorizado — verifique os dados ou tente outro cartão"

### Interações principais
- Submit → `POST /assinaturas` com token do gateway (não envia dados do cartão direto)
- Validação client-side antes de submit (Luhn, regex)

### Dados necessários da API
- `POST /assinaturas` `{ gateway_token }` (tokenização feita pelo SDK do gateway no client)

**Anti-AI checklist:**
- [x] Inputs mascarados (UX de cartão real)
- [x] Preço no botão (confirmação antes do tap)
- [x] CPF como campo (compliance BR)
- [x] "Pagamento seguro" visível (reduz ansiedade)
- [x] Overlay no loading (previne double-charge)

---

## M12 — Confirmação de Pagamento — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│                             │
│  ┌─────────────────────────┐│
│  │  gradient-celebration   ││  ← CelebrationOverlay (confetti sparso)
│  │                         ││
│  │       ✓                 ││  ← ícone check 64px color-success
│  │  Assinatura ativa!      ││  ← text-h1 600 branco
│  │                         ││
│  │  Próxima cobrança:      ││
│  │  29 de maio de 2026     ││  ← text-body branco
│  └─────────────────────────┘│
│                             │
│  Agora você tem acesso      │  ← text-body
│  completo ao feed de aulas  │
│  de Pedro.                  │
│                             │
│  ┌─────────────────────────┐│
│  │  Ir para o feed →       ││  ← Button primary
│  └─────────────────────────┘│
└─────────────────────────────┘
```

### Componentes usados
- CelebrationOverlay: gradient-celebration + confetti sparso (não exagerado)
- Button: primary

### Estados da tela
- **Único:** confirmação de pagamento aprovado
- **Falha (se chegou aqui com erro):** redirecionar para M11 (não deve ocorrer)

### Interações principais
- "Ir para o feed" → navega M6 (sem paywall)
- Back button: desabilitado (não deve voltar para M11)

### Dados necessários da API
- Dados recebidos da resposta de `POST /assinaturas`: `{ status, proxima_cobranca }`

**Anti-AI checklist:**
- [x] Celebração com gradient (não tela verde genérica de "sucesso")
- [x] Próxima cobrança explícita (reduz ansiedade futura)
- [x] Back button desabilitado (não re-submete pagamento)
- [x] Tom pessoal ("feed de aulas de Pedro", não genérico)
- [x] Confetti sparso — não exagerado (AP-11: gamification adulta)

---

## M13 — Configurações — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  Configurações              │  ← text-h1
│─────────────────────────────│
│  [Avatar] Maria Santos      │  ← Avatar pai size=md
│  maria@email.com            │
│  [Editar perfil →]          │
│─────────────────────────────│
│  FILHOS VINCULADOS          │  ← section text-caption uppercase
│  ┌─────────────────────────┐│
│  │ [●] Pedro Santos      › ││  ← tap → perfil filho
│  │ Prof. João • Matemática ││
│  └─────────────────────────┘│
│  [+ Vincular outro filho]   │  ← ghost (adiciona pelo convite do professor)
│─────────────────────────────│
│  NOTIFICAÇÕES               │
│  ┌─────────────────────────┐│
│  │ Push de aulas   ┃       ││  ← Toggle on
│  │ E-mail semanal  ┃       ││
│  └─────────────────────────┘│
│─────────────────────────────│
│  ASSINATURA                 │
│  ┌─────────────────────────┐│
│  │ Plano ativo — R$79/mês ›││  ← Badge success + tap → detalhe assinatura
│  └─────────────────────────┘│
│─────────────────────────────│
│  [🚪 Sair]                  │  ← Button destructive ghost
│  v1.0.0                     │
└─────────────────────────────┘
   bg: tokensPai.colorSurface
```

### Componentes usados
- Avatar: pai, size=md
- Toggle: notificações
- Badge: success (plano ativo)
- Button: ghost destructive (Sair)

### Estados da tela
- **Plano inativo:** Badge warning "Trial expira em N dias" + CTA "Assinar"

### Interações principais
- "Editar perfil" → M14
- Filho → M8 (Perfil filho)
- "+ Vincular outro filho" → M2 (requer novo convite do professor)
- Toggle notificações → `PATCH /pai/preferencias`
- Assinatura → tela de detalhe da assinatura (cancela/muda cartão)
- Sair → confirm → limpa SecureStore → M4

### Dados necessários da API
- `GET /pai/perfil` + `GET /pai/filhos` + `GET /pai/assinatura` + `GET /pai/preferencias`

**Anti-AI checklist:**
- [x] Surface creme (distingue de configurações do professor)
- [x] 2 pesos (sections uppercase + rows body)
- [x] Tokens semânticos
- [x] Filhos vinculados visíveis (não escondidos em sub-menu)
- [x] Plano com preço explícito (não "Plano ativo")

---

## M14 — Editar Perfil Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar   Editar perfil   │
│─────────────────────────────│
│     [Avatar lg]             │  ← tap = galeria/câmera
│    [📷 Trocar foto]         │
│                             │
│  Nome completo              │
│  ┌─────────────────────────┐│
│  │ Maria Santos            ││
│  └─────────────────────────┘│
│                             │
│  E-mail                     │
│  ┌─────────────────────────┐│
│  │ maria@email.com         ││  ← read-only (para mudar e-mail, fluxo separado)
│  └─────────────────────────┘│
│                             │
│  Telefone (WhatsApp)        │
│  ┌─────────────────────────┐│
│  │ (11) 99999-9999         ││
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │       Salvar            ││  ← Button primary (disabled sem mudanças)
│  └─────────────────────────┘│
└─────────────────────────────┘
   bg: tokensPai.colorSurface
```

### Componentes usados
- Avatar: pai, size=lg, tap=upload
- Input: text (nome, telefone), read-only (email)
- Button: primary

### Estados da tela e interações principais
- Submit → `PATCH /pai/perfil`
- E-mail read-only (fluxo de mudança de e-mail envolve verificação — feature separada)

### Dados necessários da API
- `PATCH /pai/perfil` `{ nome, telefone, foto_url }`

**Anti-AI checklist:**
- [x] E-mail read-only com justificativa implícita (mudança requer verificação)
- [x] 2 pesos
- [x] Tokens semânticos
- [x] Foto com tap e opção "Trocar"
- [x] Salvar disabled sem mudanças

---

## M18 — Estado Vazio Feed (Trial) — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  Olá, Maria!                │  ← greeting
│─────────────────────────────│
│                             │
│                             │
│         🌱                  │  ← ícone (não genérico — plantinha = crescimento)
│                             │    color-primary, 64px outline
│  Sua primeira aula          │  ← text-h2 center 600
│  chega em breve             │
│                             │
│  O professor João precisa   │  ← text-body center color-text-muted line-height 1.7
│  registrar a próxima aula   │
│  de Pedro para aparecer     │
│  aqui no feed.              │
│                             │
│  Trial gratuito ativo       │  ← Badge success center
│  7 dias restantes           │  ← text-caption center
│                             │
│  ┌─────────────────────────┐│
│  │  Configurar notificações││  ← Button ghost (ajusta push para não perder)
│  └─────────────────────────┘│
│─────────────────────────────│
│ [🏠●] [👦] [🔔] [👤]       │
└─────────────────────────────┘
   bg: tokensPai.colorSurface
```

### Componentes usados
- Ícone: 🌱 outline, color-primary (não ilustração EdTech genérica)
- Badge: success (trial ativo)
- Button: ghost (configurar push)

### Estados da tela
- **Único:** feed vazio no período de trial
- Trial encerrado sem aula: paywall M10 + mensagem diferente

### Interações principais
- "Configurar notificações" → configuração de push nativa

### Dados necessários da API
- Nenhum adicional — estado determinado por feed vazio + trial_status

**Anti-AI checklist:**
- [x] Ícone de crescimento (não livro/escola genérico)
- [x] 2 pesos (h2 + body)
- [x] Tom esperançoso ("chega em breve") — não "nenhum dado"
- [x] Trial status visível (não escondido)
- [x] CTA push (ação real que ajuda o pai)

---

## M19 — Esqueci Senha — Pai/Mãe — Mobile

### Layout (ASCII wire)
```
┌─────────────────────────────┐
│  ← Voltar                   │
│                             │
│  Redefinir senha            │  ← text-h1 600
│  Enviaremos um link para    │  ← text-body color-text-muted
│  seu e-mail.                │
│                             │
│  ┌─────────────────────────┐│
│  │ Seu e-mail              ││  ← autofocus
│  └─────────────────────────┘│
│                             │
│  ┌─────────────────────────┐│
│  │   Enviar link de acesso ││  ← Button primary
│  └─────────────────────────┘│
│                             │
│  ─── pós-envio ───          │
│  ✓ Link enviado!            │  ← aparece após submit
│  Verifique o spam também    │
│  Reenviar em 60s            │
└─────────────────────────────┘
   bg: tokensPai.colorSurface
```

### Componentes usados e dados
- Idêntico a P17 (professor), mas com bg creme e tom "pai"
- `POST /auth/reset-password` `{ email, tipo: 'pai' }`

**Anti-AI checklist:**
- [x] Surface creme (contexto pai)
- [x] Countdown reenvio
- [x] Instrução "verifique spam"
- [x] Estado pós-envio substituindo o form (não aparece abaixo)
- [x] 2 pesos
