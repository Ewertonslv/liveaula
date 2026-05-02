# Step 03 — Roberto Alves · Modelo de Negócio
**Status:** Concluído · 29/04/2026

---

# ANÁLISE FINANCEIRA — PRODUTO ACOMPANHA
**Roberto Alves | Analista de Negócios | Abril 2026**

---

## 1. AUDITORIA FINANCEIRA

### 1.1 Projeção original vs. realidade implícita

| Período | Receita Declarada | Pais Pagantes | Crescimento MoM Implícito |
|---|---|---|---|
| Mês 1 | R$ 1.580 | 20 | — |
| Mês 3 | R$ 4.100 | ~52 | +62% |
| Mês 6 | R$ 16.100 | ~200 | +56% |
| Mês 9 | R$ 40.700 | ~500 | +36% |
| Mês 12 | — | 1.000 | +26% |

**Problema crítico:** A projeção não contabiliza churn. Com 10%/mês, para ter 200 pais líquidos no mês 6, você precisaria ter adquirido 350–380 pais totais. A projeção trata os 200 como acumulação líquida simples — erro metodológico grave.

```
Coorte do mês 1 sobrevivente no mês 6 = 20 × 0,90^5 = 11,8 pais
```

### 1.2 Modelo Corrigido com Churn Explícito

| Mês | Novos Pais | Churn | Base Líquida | Receita Total |
|---|---|---|---|---|
| 1 | 20 | 0 | 20 | R$ 1.580 |
| 3 | 30 | 4 | 69 | R$ 5.641 |
| 6 | 45 | 13 | 159 | R$ 13.321 |
| 7 (jul) | 30 | 24 | 165 | R$ 13.985 |
| 9 | 50 | 19 | 219 | R$ 18.821 |
| 12 | 80 | 30 | 351 | R$ 30.579 |
| Jan (M13) | 20 | 88 | 283 | R$ 24.447 |
| Fev (M14) | 15 | 71 | 227 | R$ 19.643 |

**Conclusão:** Mês 12 gera R$ 30.579 — não os R$ 40.700+ prometidos para o mês 9. Diferença de ~50%.

### 1.3 Três Cenários

| Cenário | Premissas-chave | Receita Mês 12 |
|---|---|---|
| **Conservador** | Conversão 20%, churn 15%, CAC R$ 60 | ~R$ 7.000 |
| **Base** | Conversão 8% end-to-end, churn 10%, CAC R$ 40 | ~R$ 30.579 |
| **Otimista** | Conversão 15%, churn 6%, CAC R$ 35 | ~R$ 73.200 |

### 1.4 Break-Even Real

| Cálculo | Resultado |
|---|---|
| Custo mínimo (sem salário fundador) | R$ 1.450–2.500/mês |
| **Break-even real (sem salário)** | **25,3 pais pagantes** |
| Custo com custo de oportunidade do fundador | R$ 4.450–10.500/mês |
| **Break-even real (com custo de oportunidade)** | **63,3 pais pagantes** |

**O número de 4,2 do documento só funciona se custo total = R$ 332/mês — impossível com qualquer investimento em aquisição.**

---

## 2. AVALIAÇÃO DO MODELO DE MONETIZAÇÃO

### R$ 79/mês para pais
Numericamente não é a barreira. O problema é percepção de valor antes do hábito ser formado. Pais perguntarão: "já falo com o professor pelo WhatsApp — por que pagar R$ 79?"

**Recomendação:** Trial de 14 dias sem cartão (7 dias é curto demais para criar hábito).

### R$ 19/mês para professores — elo mais fraco do modelo
- iProfe e Classr tentaram monetizar professores particulares no Brasil → baixíssima tração
- Professor autônomo vê qualquer custo recorrente como diminuição de margem
- R$ 19 = R$ 228/ano = ~3 horas de aula cedidas para a plataforma

**Alternativas:**
- **Opção A:** Professor sempre grátis. Monetização 100% no lado pai. Remove cold start.
- **Opção B:** Sucesso compartilhado — 5–8% de cada hora agendada via app.
- **Opção C:** Manter R$ 19 mas posicionar como ferramenta de negócios (recibo, financeiro), não como comunicação com pais.

### Modelo de comissão (R$ 8–15 a partir do 6º aluno)
Com média de 5 alunos/professor no mês 12, nenhum professor atingiria o gatilho. Comissão real estimada: ~R$ 920/mês no mês 12 — relevante mas não transformador.

### LTV real ajustado por sazonalidade
- LTV sem sazonalidade: R$ 79 × 10 meses = R$ 790
- LTV coortes de 2º semestre (risco em janeiro): R$ 514
- LTV coortes de 1º semestre: R$ 672
- **LTV médio real: R$ 593**

Com CAC R$ 40 → LTV:CAC = 14,8x. Saudável se churn de 10% se confirmar. Se churn real for 20% → LTV cai para R$ 276, CAC não é mais sustentável.

---

## 3. DEPENDÊNCIAS CRÍTICAS DO FLYWHEEL

```
[A] Professor cadastra e usa a plataforma
        ↓
[B] Professor convida pais dos seus alunos
        ↓
[C] Pai recebe convite, vê valor de acompanhamento centralizado
        ↓
[D] Pai assina R$ 79/mês
        ↓
[E] Professor com 5+ pais pagantes fica grátis → incentivo a indicar mais pais
        ↓
[F] Mais pais → mais dados → melhor produto → NPS sobe
        ↓
[G] Pais indicam para outros pais (boca a boca)
        ↓
        → Volta para [D], flywheel acelera
```

### Pontos de Ruptura

**Ruptura 1 (A→B) — mais crítica:** Se o produto sem pais não tem valor para o professor, o flywheel nunca começa.

**Ruptura 2 (B→C):** Convite do professor para o pai precisa de proposta de valor clara — "Entre no app do professor" não funciona.

**Ruptura 3 (C→D) — segunda mais crítica:** Pai não paga antes de experimentar. Sem trial, é um penhasco. Com trial, precisa de "momento aha" antes dos 14 dias.

**Ruptura 4 (E→F):** Desincentivo perverso — com 5 alunos grátis, a partir do 6º a plataforma cobra comissão. Desincentivo de crescimento no momento em que o flywheel deveria acelerar.

**Ruptura 5 — Sazonalidade como reset:** Janeiro/fevereiro podem resetar o flywheel para próximo de zero. Startups sem caixa para 60 dias sem receita nova morrem aqui.

---

## 4. PLANO DE EXPERIMENTOS PRIORIZADOS

| # | Experimento | Hipótese | Custo | Tempo | Métrica de Sucesso |
|---|---|---|---|---|---|
| 1 | Entrevistas com 20 pais sobre dor de acompanhamento | Pais têm dor real e recorrente | R$ 300–400 | 2 sem | 12/20 descrevem episódio concreto sem indução |
| 2 | Landing page + email de interesse | Pais deixam contato antes do produto existir | R$ 200–300 | 2 sem | Conversão visita→email ≥ 8% |
| 3 | Teste de WTP com 3 preços (R$ 49/79/99) via split | Pais têm WTP para R$ 79 | R$ 300–500 | 3 sem | ≥30% escolhe R$ 79 ou R$ 99 |
| 4 | Entrevistas com 15 professores | Professores usariam ferramenta gratuita | R$ 0 | 2 sem | 8/15 usariam grátis; 3/15 pagariam R$ 19 |
| 5 | Convite professor→pai via WhatsApp manual | Professor é o melhor canal de aquisição de pais | R$ 0 | 1 sem | Taxa de abertura do link ≥ 40% |
| 6 | Grupo WhatsApp de professores + conteúdo de gestão | Professores se engajam antes do produto | R$ 0 | 4 sem | 50+ membros ativos; 5 pedem acesso antecipado |
| 7 | Teste de retenção via protótipo Figma com 10 pais | Pais retornam sem push notification | R$ 0 | 1 sem | 6/10 acessam mais de 2 vezes sem convite |

---

## 5. EXPERIMENTO #1 — PRÓXIMO PASSO

**Entrevistas de problema com pais — ANTES de qualquer código**

**Recrutamento (3 dias):** Grupos de WhatsApp de pais de escola. Oferecer R$ 20 (vale-presente). NÃO mencionar app ou solução.

**Roteiro (estrutura JTBD):**
1. "Me conta como funciona hoje a relação com o professor do seu filho."
2. "Como você sabe se a aula foi bem ou mal?"
3. "Você já teve um momento em que sentiu que estava 'no escuro'? Me conta."
4. "O que você faz quando quer dar feedback para o professor?"
5. "Se pudesse mudar uma coisa nessa relação, o que seria?"
6. [Só se houver dor clara] "Se existisse uma ferramenta que resolvesse isso por R$ 79/mês, o que te faria hesitar?"

**Critério de go/no-go:**

✅ **GO se:** 12+ de 20 pais descrevem episódio concreto de frustração sem indução; ≥6 mencionam WhatsApp como inadequado; ≥4 aceitam R$ 79.

❌ **NO-GO se:** <10 pais identificam a dor como real; maioria diz "funciona bem pelo WhatsApp"; ninguém menciona R$ 79 como aceitável.

**Custo:** R$ 300–400 | **Tempo:** 2 semanas

---

## 6. RECOMENDAÇÃO FINAL

**Não lance o produto ainda. Execute o Experimento #1 nas próximas 2 semanas.**

O ACOMPANHA tem modelo economicamente coerente SE as premissas forem verdadeiras. O trabalho do próximo mês não é construir — é descobrir se as premissas são verdadeiras.

**O que precisa ser verdade para escalar:**
1. Pais sentem dor ativa (não latente) com falta de acompanhamento estruturado
2. Professores embarcam voluntariamente como canal de aquisição não pago
3. Produto entrega "momento aha" nos primeiros 5 dias de trial
4. Plataforma sobrevive aos dois invernos educacionais (janeiro e julho)
5. Churn real converge para 8–12% após os primeiros 90 dias
6. Boca a boca começa antes dos ads ficarem caros
