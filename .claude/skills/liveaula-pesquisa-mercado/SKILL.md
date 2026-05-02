---
name: liveaula-pesquisa-mercado
description: "Pesquisa de mercado e validação estratégica para liveaula (4 papéis sequenciais). Valida mercado, hipóteses, modelo financeiro e passa pelo advogado do diabo antes de qualquer linha de código. Entrada: brief do produto/feature. Saída: relatório de validação com veredicto go/no-go."
---

# liveaula-pesquisa-mercado — Pesquisa de Mercado e Validação Estratégica

Substitui o squad `validacao-liveaula` (ExpxAgents). Mesmos 4 papéis, mesma profundidade, sem dependência de infraestrutura ExpxAgents.

**Definição de pronto:** veredicto do Advogado do Diabo entregue com objeção principal + critérios claros de go/no-go.

## Quando usar

Antes de iniciar desenvolvimento de qualquer nova feature significativa ou novo produto. Entrada mínima: descrição do conceito em 1 parágrafo. Entrada ideal: documento de produto com hipóteses, modelo de preço e target audience.

## Filosofia

4 papéis sequenciais. Briefing pack cacheado uma vez. Marcos é o único que usa ferramentas externas (WebSearch + WebFetch) — os outros 3 são puramente analíticos e críticos. André lê tudo e não suaviza nada.

```
Marcos   → poderoso → pesquisa de mercado com web_search + web_fetch
    ↓
Priscila → poderoso → hipóteses + JTBD + escopo MVP
    ↓
Roberto  → poderoso → modelo financeiro + experimentos priorizados
    ↓
André    → poderoso → advogado do diabo — ataca tudo, dá veredicto final
```

---

## Pipeline Obrigatório

### Passo 0 — Briefing Pack (uma vez)

Antes de qualquer papel, montar `output/pesquisa-mercado/_briefing-pack.md` concatenando:

1. `_expxagents/_memory/company.md`
2. `_expxagents/_memory/preferences.md`
3. O brief do produto/feature fornecido como input desta execução
4. `squads/estrategia/produto/validacao/validacao-liveaula/_memory/memories.md` (histórico de validações anteriores)

Cada papel passa este arquivo como **primeiro Read** → prompt cache hit (TTL 5min). Não copiar inline nos prompts seguintes.

---

### Passo 1 — Marcos Vieira · Pesquisa de Mercado

**Ferramentas:** WebSearch + WebFetch (obrigatório — sem pesquisa real, o papel não funciona)

**Foco:** mercado de aulas particulares + reforço escolar no Brasil. Sempre atualizar com dados recentes (2022+).

**1A. Dimensionar mercado (TAM/SAM/SOM)**
- Número de alunos em aulas particulares no Brasil (fontes: IBGE, INEP, Datafolha)
- Número de professores particulares ativos
- Número de pais/mãe pagantes estimado
- Ticket médio por matéria, por cidade, por formato (presencial/online)

**1B. Mapear competidores**

Para cada competidor direto e indireto:
- Modelo de preço atual
- Avaliações negativas (App Store / Play Store / Reclame Aqui)
- O que o produto faz vs. o que usuários reclamam que falta
- Sinais de tração (downloads, reviews recentes)

Competidores a verificar: Superprof, Profes, iProfe, Plurall, Google Classroom adaptado, WhatsApp (substituto informal).

**1C. Tendências de mercado**
- Crescimento de aulas particulares pós-pandemia
- Adoção de apps educacionais por pais brasileiros
- Comportamento digital de professores particulares no Brasil

**1D. Gaps verificados**
- O que os competidores prometem vs. o que usuários reclamam que falta
- Validar ou refutar o diferencial proposto no brief como gap real

**Saída:** `output/pesquisa-mercado/step-01-marcos-vieira.md`

**Regras:**
- Mínimo 5 fontes externas pesquisadas e citadas
- Dados com data — nenhuma fonte anterior a 2022 sem destaque explícito
- Se dado não encontrado: declarar "dado não encontrado" em vez de estimar
- Não validar automaticamente premissas do brief — questionar

---

### Passo 2 — Priscila Santos · Análise de Produto

**Entrada:** output de Marcos + briefing pack.

**2A. Mapa de hipóteses**

Para cada hipótese do produto (extrair do brief):
- Tipo: problema / solução / canal / preço / comportamento
- Probabilidade de estar errada: baixa / média / alta
- Impacto se errada: baixo / médio / alto / fatal
- Prioridade de validação: P0 (crítica) / P1 (urgente) / P2 (pode esperar)

**2B. Hipóteses críticas (P0)**
- Listar apenas as que, se falsas, invalidam o negócio
- Para cada uma: por que é crítica, o que seria necessário para validá-la

**2C. Jobs-to-be-Done**
- Job funcional e emocional do pai/mãe
- Job funcional e emocional do professor
- Tensões entre os dois públicos (o que um quer pode conflitar com o que o outro quer)
- O substituto informal que já resolve parte da dor hoje (ex: WhatsApp)

**2D. Avaliação do MVP proposto**
- O que é absolutamente necessário para testar as hipóteses críticas
- O que pode ser cortado sem comprometer o aprendizado
- MVP mais simples possível: o que um dev faz em 4 semanas?

**Saída:** `output/pesquisa-mercado/step-02-priscila-santos.md`

**Regras:**
- Toda hipótese classificada tem justificativa de risco
- MVP proposto viável em 4 semanas com 1 desenvolvedor
- Conflitos entre públicos tratados com honestidade — sem diplomacia
- Não validar pricing sem questionar se há pesquisa de WTP

---

### Passo 3 — Roberto Alves · Modelo de Negócio

**Entrada:** outputs de Marcos + Priscila + briefing pack.

**3A. Auditoria financeira**
- Revisar projeções do brief (se existirem)
- Identificar premissas implícitas e questionar a base de cada uma
- Calcular 3 cenários: conservador / base / otimista com premissas explícitas
- Break-even real considerando churn e custo de aquisição

**3B. Avaliação do modelo de monetização**
- O pricing proposto é sustentável? Comparar com benchmarks do mercado
- O modelo de gratuidade para professores cria incentivo real ou pode ser abusado?
- LTV real considerando churn educacional (férias, troca de professor, fim de ano letivo)
- CAC estimado para cada canal

**3C. Dependências críticas do flywheel**
- Diagrama textual: A → B → C → flywheel
- Onde o flywheel pode quebrar e por quê
- O que acontece se a taxa de conversão for 20% do previsto

**3D. Plano de experimentos priorizados**

Para cada hipótese crítica de Priscila, propor o experimento mais barato e rápido:

| Experimento | Hipótese que testa | Tipo | Custo (R$) | Tempo | Métrica de sucesso | O que a falha revela |
|---|---|---|---|---|---|---|

Tipos válidos: landing page, entrevista, smoke test, wizard of oz, fake door, A/B.

**3E. Experimento #1 — Próximo passo absoluto**
- O que fazer antes de qualquer linha de código
- Como executar (passo a passo)
- Critério de go/no-go com número concreto

**Saída:** `output/pesquisa-mercado/step-03-roberto-alves.md`

**Regras:**
- Nunca aceitar projeções de conversão >30% sem evidência
- Cenário conservador genuinamente conservador (não apenas 20% abaixo do base)
- Experimentos propostos com orçamento máximo de R$ 500
- Recomendação final honesta mesmo se desfavorável

---

### Passo 4 — André Lima · Advogado do Diabo

**Entrada:** outputs completos de Marcos + Priscila + Roberto + briefing pack.

André não resume o que os outros disseram bem. Entra apenas onde há brecha, suposição fraca ou otimismo injustificado.

**4A. Premissas que os outros não questionaram**
- O que Marcos concluiu com premissa fraca não explicitada?
- O que Priscila classificou como "risco médio" que deveria ser "crítico"?
- O que Roberto validou no modelo que, na prática, pode não funcionar?
- Cada item tem: a premissa + por que ela é mais frágil do que parece

**4B. Reclassificação de riscos**
- Hipóteses subestimadas pelos anteriores com justificativa para reclassificação
- Para cada risco reclassificado: impacto real + o que precisaria ser verdade para não ser um problema

**4C. Cenário de morte do produto**
- Sequência de 5-7 passos concretos que levam ao fracasso em 6-12 meses
- Específico para esta stack, este mercado, este modelo — não genérico
- O erro de execução #1 que fundadores desse tipo de produto cometem

**4D. Perguntas que ninguém fez**
- Qual pergunta os 3 agentes não fizeram e deveriam ter feito?
- Qual dado ninguém buscou que poderia mudar tudo?
- Há um competidor ou substituto não considerado?

**4E. Veredicto final**
- A objeção principal de um investidor experiente
- O que o fundador precisa provar ANTES de qualquer outra coisa
- Classificação: 🟢 Go (com condições) / 🟡 Validar antes (experimento específico) / 🔴 No-go (motivo)

**Saída:** `output/pesquisa-mercado/step-04-andre-lima.md`

**Regras:**
- Cada crítica tem argumento — sem "pode não funcionar" sem explicar por que
- Cenário de morte plausível, não apocalíptico
- Perguntas genuinamente não respondidas pelos anteriores
- Veredicto acionável — não apenas "é arriscado"
- Não suavizar para não desanimar o fundador — esse não é o papel

---

### Passo 5 — Atualizar memória do squad

Após André concluir, atualizar `squads/estrategia/produto/validacao/validacao-liveaula/_memory/memories.md`:

```markdown
## Validação [data ISO] — [nome do produto/feature]

### Veredicto
🟢 Go / 🟡 Validar / 🔴 No-go

### Riscos principais identificados
- [risco 1]
- [risco 2]

### Experimento #1 recomendado
- [descrição]

### Próxima execução sugerida
- [quando e sob qual condição rodar novamente]
```

---

## Estrutura de saída

```
output/pesquisa-mercado/
  _briefing-pack.md
  step-01-marcos-vieira.md
  step-02-priscila-santos.md
  step-03-roberto-alves.md
  step-04-andre-lima.md
squads/estrategia/produto/validacao/validacao-liveaula/
  _memory/memories.md  ← atualizado pelo passo 5
```

---

## Regras inegociáveis

- **Marcos** usa WebSearch + WebFetch — sem pesquisa real, o papel não executa
- **Priscila** não suaviza conflitos entre professor e pai/mãe
- **Roberto** sempre apresenta cenário conservador genuíno (não cosmético)
- **André** é o último — lê tudo antes de escrever uma palavra
- **Nenhum papel** declara conclusão sem base explicitada
- **Veredicto** de André é acionável — não filosófico

---

## Triângulo de delivery liveaula

```
brief do produto  →  liveaula-pesquisa-mercado  →  product-spec.md  →  liveaula-design  →  liveaula-dev
```
