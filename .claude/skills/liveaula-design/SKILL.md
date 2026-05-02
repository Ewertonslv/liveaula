---
name: liveaula-design
description: "Squad de design enxuto para liveaula (5 papéis). Lê product-spec.md, produz DESIGN.md, wireframes textuais detalhados e specs de componentes para React (Next.js) + React Native (Expo). Sem Stitch MCP — text-first design."
---

# liveaula-design — Squad de Design Enxuto

Adaptação do `viggo-design` para o projeto liveaula. Mesma filosofia de token-efficiency e taste-design, sem dependência de Stitch MCP nem stack Viggo.

**Definição de pronto:** pacote final entregue ao `liveaula-dev` contém DESIGN.md aprovado + wireframes textuais de todas as telas + specs de componentes por stack (Web Next.js + Mobile React Native).

## Quando usar

Disparado antes de qualquer implementação visual. Entrada: `product-spec.md` na pasta do squad de desenvolvimento.

## Filosofia

5 papéis sequenciais. Briefing pack cacheado uma vez (prompt cache hit). Sem Stitch MCP — design é produzido como especificação textual detalhada que o desenvolvedor implementa diretamente. Mais rápido que geração visual quando o time é pequeno (1–2 devs).

```
Strategist  → poderoso → product-spec + 3 atores + IA + flows + inventário de telas
    ↓
SystemBuilder → poderoso → DESIGN.md + tokens + anti-patterns
    ↓
SpecGen     → poderoso → wireframes ASCII + specs de componentes por tela
    ↓
StackAdapter → poderoso → specs específicas: Web (Next.js) + Mobile (React Native/Expo)
    ↓
Chef        → rápido (Haiku) → checklist + handoff manifest
```

---

## Pipeline Obrigatório

### Passo 0 — Briefing Pack (uma vez)

Antes de qualquer papel, montar `output/design/_briefing-pack.md` concatenando:

1. `_expxagents/_memory/company.md`
2. `_expxagents/_memory/preferences.md`
3. `squads/desenvolvimento/produto/liveaula/liveaula-dev/product-spec.md`
4. `squads/desenvolvimento/produto/liveaula/liveaula-dev/_memory/memories.md`

Cada papel passa este arquivo como **primeiro Read** → prompt cache hit (TTL 5min Anthropic cache). Não copiar inline nos prompts seguintes.

---

### Passo 1 — Strategist

**Entrada:** Briefing pack.

**Sub-fases no mesmo papel:**

**1A. Contexto dos 3 atores**
- Mapear necessidades emocionais e funcionais de cada ator (product-spec seção 2)
- Professor: ocupado, eficiência, < 30s por ação → UX de produtividade
- Pai/mãe: ansioso, quer tranquilidade → UX de reassurance
- Admin: interno, funcional → UX utilitária

**1B. Arquitetura de Informação (IA)**
- Hierarquia de telas por ator
- Navegação principal (tabs / sidebar / stack)
- Estados vazios e de erro que precisam de design

**1C. Fluxos UX críticos**
- Fluxo 1: Professor → registrar aula (< 30s obrigatório — seção 5 do product-spec)
- Fluxo 2: Pai → receber notificação → ver detalhe de aula
- Fluxo 3: Onboarding professor + convite pai
- Fluxo 4: Assinatura / pagamento pai

**1D. Inventário de telas**
- Produzir `output/design/inventario-telas.md` com lista completa por ator + superfície (web/mobile)
- Marcar telas Must-have vs Should-have (conforme product-spec seção 4)

**Checkpoint-01:** aprovar IA + inventário antes de continuar.

---

### Passo 2 — SystemBuilder

**Entrada:** Checkpoint-01 aprovado + briefing pack.

**2A. DESIGN.md**

Criar/atualizar `squads/desenvolvimento/produto/liveaula/liveaula-dev/DESIGN.md` cobrindo:

**Identidade visual:**
- Nome das fontes (titular + corpo) — evitar Inter/Roboto sem justificativa forte
- Paleta: máximo 4 cores + neutros. Proibido: `#3B82F6` (blue-500), `#10B981` (green-500), `#F59E0B` (amber-500) como cor primária
- Border-radius padrão (4px / 8px / 12px — escolher um sistema)
- Espaçamento base (grid 4px ou 8px)

**Tokens de design (nomes semânticos):**
```
color-primary, color-primary-hover, color-primary-muted
color-surface, color-surface-raised, color-surface-overlay
color-text, color-text-muted, color-text-disabled
color-border, color-border-focus
color-success, color-warning, color-error, color-info
spacing-xs (4), spacing-sm (8), spacing-md (16), spacing-lg (24), spacing-xl (40)
radius-sm, radius-md, radius-lg, radius-full
font-heading, font-body, font-mono
```

**Escala tipográfica:**
| Token | Tamanho | Peso | Uso |
|---|---|---|---|
| text-display | 32–40px | 700 | Títulos de página |
| text-h1 | 24–28px | 600 | Seções principais |
| text-h2 | 20–22px | 600 | Subtítulos |
| text-body-lg | 16px | 400 | Corpo principal |
| text-body | 14px | 400 | Corpo padrão |
| text-caption | 12px | 400 | Labels, datas |

**Componentes base com todos os estados (default / hover / focus / disabled / error / loading):**
- Button (primary / secondary / ghost / destructive)
- Input (text / select / textarea)
- Card (default / elevated / bordered)
- Badge (status: sucesso / alerta / erro / neutro)
- Avatar (professor / pai / filho)
- Notification (push card preview)
- ProgressBar (progresso do aluno)
- BottomSheet (mobile — registro rápido de aula)
- Toast (feedback de ação)

**Anti-patterns visuais do liveaula (mínimo 8 itens):**
- Não usar card genérico com sombra exagerada (shadow-lg em tudo)
- Não usar ícones de "escola" ou "livro" como ícone principal
- Não usar azul corporativo padrão como cor primária
- Não projetar professor e pai/mãe com a mesma densidade de informação
- Não usar tipografia única em todo o app (pelo menos 2 pesos distintos)
- Não usar illustration-style genérico de EdTech (crianças sentadas com lápis)
- Não usar fonte Inter sem justificativa (é a Arial do design moderno)
- Não usar layout centralizado em card sobre gradiente nas telas principais

**Checkpoint-02:** aprovar DESIGN.md antes de continuar.

**2B. Checklist de tokens**
- Verificar que todos os tokens obrigatórios acima estão definidos
- Gerar `output/design/token-checklist.md` com status de cada token

---

### Passo 3 — SpecGen

**Entrada:** DESIGN.md aprovado + inventário de telas + briefing pack.

Para cada tela do inventário, produzir:

**3A. Tela hero do professor: Registrar Aula**
Esta tela recebe atenção especial — é o core loop do produto (product-spec seção 5).

Especificação completa:
- Layout ASCII wire (mobile, 375px)
- Cada campo com: tipo, placeholder, validação, estado vazio, estado erro
- Sequência de interação: qual campo recebe foco primeiro, ordem de tab
- Botão de envio: estado loading + confirmação
- Microinteração pós-envio: o que aparece depois dos 30 segundos
- Notificação preview: o que o pai vê no celular

**Checkpoint-03:** aprovar hero antes de gerar restante.

**3B. Telas restantes**
Para cada tela do inventário Must-have:

```markdown
## [Nome da Tela] — [Ator] — [Superfície: Web / Mobile]

### Layout (ASCII wire)
[representação textual da estrutura]

### Componentes usados
- [componente]: [variante] — [estado relevante]

### Estados da tela
- Estado vazio: [o que mostrar quando não há dados]
- Estado loading: [skeleton ou spinner?]
- Estado erro: [mensagem + ação de retry]

### Interações principais
- [ação] → [o que acontece]

### Dados necessários da API
- GET/POST [endpoint]: [campos relevantes]
```

**Checklist anti-IA (obrigatório por tela):**
- [ ] Layout não é centered-card-on-gradient
- [ ] Tipografia tem pelo menos 2 pesos distintos
- [ ] Paleta usa tokens semânticos, não literais
- [ ] Componentes têm variação (não todos iguais)
- [ ] Estado vazio tem conteúdo significativo (não "nenhum dado")

**Checkpoint-04:** aprovar todas as telas.

---

### Passo 4 — StackAdapter

**Entrada:** Specs de telas aprovadas + DESIGN.md + briefing pack.

Produzir specs de implementação diferenciadas por stack:

**4A. Web — Next.js (App Router)**
Para cada tela web (professor):
- Estrutura de componentes com Server vs Client Component decision
- Props interface TypeScript de cada componente
- Tailwind classes alinhadas com tokens do DESIGN.md
- Estratégia de data fetching (Server Component fetch vs. SWR/React Query)
- Salvar em `output/design/web-component-specs.md`

**4B. Mobile — React Native + Expo**
Para cada tela mobile (professor + pai/mãe):
- Componente React Native com StyleSheet ou NativeWind
- Safe area handling (useSafeAreaInsets)
- Toque mínimo: todos elementos interativos ≥ 44px
- Diferenças iOS vs Android documentadas (status bar, back button, haptics)
- Salvar em `output/design/mobile-component-specs.md`

---

### Passo 5 — Chef (Haiku)

**Modelo:** `claude-haiku-4-5-20251001`

**5A. Checklist final:**
- DESIGN.md cobre todos tokens obrigatórios
- Todas telas Must-have do inventário têm spec
- Web-specs e Mobile-specs gerados
- Anti-patterns aplicados em todas as telas
- Todos checkpoints aprovados

**5B. Handoff manifest** → `output/design/handoff-manifest.md`:
```yaml
design:
  concluido: true
  design_md_path: squads/desenvolvimento/produto/liveaula/liveaula-dev/DESIGN.md
  inventario_path: output/design/inventario-telas.md
  web_specs_path: output/design/web-component-specs.md
  mobile_specs_path: output/design/mobile-component-specs.md
  telas_geradas: [lista]
  aprovado_em: <ISO date>
  proximo: liveaula-dev
```

**5C. Atualizar squad memory:**
- Adicionar entrada em `squads/desenvolvimento/produto/liveaula/liveaula-dev/_memory/memories.md`:
  - Data da execução
  - Decisões de design relevantes
  - Anti-patterns encontrados

---

## Checkpoints obrigatórios

Antes de cada checkpoint, gerar `output/design/checkpoint-NN-brief.md`:

```markdown
# Checkpoint NN — <título>

## O que está sendo decidido (1 frase)

## Resumo (≤150 palavras)
- bullet 1
- bullet 2
- bullet 3

## Caso prático
<exemplo concreto do que muda se aprovar>

## Se rejeitar
<qual fase refaz, o que muda>

## Fontes
- `output/design/<arquivo>.md`
```

| # | Checkpoint | Quem gera | Quando |
|---|---|---|---|
| 01 | IA + inventário de telas | Strategist | Após 1D |
| 02 | DESIGN.md | SystemBuilder | Após 2A |
| 03 | Tela hero (registrar aula) | SpecGen | Após 3A |
| 04 | Todas as telas | SpecGen | Após 3B |

---

## Estrutura de saída

```
output/design/
  _briefing-pack.md
  inventario-telas.md
  token-checklist.md
  checkpoint-01-brief.md
  checkpoint-02-brief.md
  checkpoint-03-brief.md
  checkpoint-04-brief.md
  web-component-specs.md
  mobile-component-specs.md
  handoff-manifest.md
squads/desenvolvimento/produto/liveaula/liveaula-dev/
  DESIGN.md
```

---

## Regras inegociáveis

- **Tela "Registrar Aula"** é a hero — recebe 2x mais atenção que qualquer outra
- **DESIGN.md** cobre todos os tokens listados no passo 2A sem exceção
- **Nenhuma tela** entrega sem estados: vazio / loading / erro
- **Mobile:** toque mínimo 44px em todos os elementos interativos
- **Anti-IA checklist** aplicado em 100% das telas antes do Checkpoint-04
- **Chef não assina** sem todos os checkpoints aprovados
