# Step 02 — Priscila Santos · Análise de Produto
**Status:** Concluído · 29/04/2026

---

# Relatório de Análise de Produto — ACOMPANHA
**Por Priscila Santos, Analista de Produto**

---

## 1. Mapa de Hipóteses

| Hipótese | Tipo | Prob. errada | Impacto | Prioridade |
|---|---|---|---|---|
| Pais têm dor real e recorrente de não saber o que acontece nas aulas | Problema | Média (40%) | Catastrófico | **P0 — imediata** |
| Professores querem transparência com os pais | Comportamento | Alta (65%) | Catastrófico | **P0 — imediata** |
| Pais pagariam R$ 79/mês por esse acesso | WTP | Alta (60%) | Fatal | **P0 — imediata** |
| WhatsApp não resolve o problema adequadamente | Mercado | Alta (60%) | Fatal | **P0 — imediata** |
| Professor pagaria R$ 19/mês | WTP | Alta (55%) | Grave | **P1 — urgente** |
| Pai tem tempo e disposição para usar um app | Comportamento | Alta (55%) | Grave | **P1 — urgente** |
| Notificação pós-aula é o diferencial que cria retenção | Valor | Média (45%) | Grave | **P1 — urgente** |
| Cold start pode ser resolvido pelos professores trazendo os pais | Crescimento | Alta (65%) | Grave | **P1 — urgente** |
| Professores usariam o app consistentemente após cada aula | Comportamento | Alta (60%) | Grave | **P1 — urgente** |
| 5 alunos pagantes é limiar viável de gratuidade | Modelo | Média (40%) | Moderado | **P2** |
| Referral orgânico entre pais sustenta crescimento | Crescimento | Alta (70%) | Moderado | **P2** |
| Mercado de 47,3 mi alunos é endereçável | Mercado | Alta (50%) | Moderado | **P2** |

---

## 2. Hipóteses Críticas (validar ANTES de construir)

**#1 — O professor quer ser transparente com os pais.**
A mais perigosa. Professor opera em "caixa preta" funcional — transparência pode ser percebida como vigilância. Sem professor preenchendo, não há notificação. Sem notificação, não há produto.

**#2 — Pais pagariam R$ 79/mês por acompanhamento estruturado.**
Zero evidência de WTP. O argumento "11–20% do gasto com reforço" é racionalização, não validação. Sem teste de preço real, o modelo não tem base.

**#3 — WhatsApp não resolve o problema de acompanhamento parental.**
É o concorrente mais perigoso — gratuito, já instalado, já usado. Uma mensagem informal pós-aula pode ser suficiente para a maioria dos pais. A hipótese precisa ser testada com comportamento real, não com opinião declarada em entrevista.

**#4 — Pais adotariam e usariam o app consistentemente.**
17% dos pais brasileiros usam apps de monitoramento digital (TIC Kids Online 2024). App passivo (só recebe) tem pior retenção. Risco real de instalar, usar 3 semanas, abandonar.

**#5 — O cold start pode ser resolvido pelos professores como vetor de aquisição.**
Professor pedindo que o pai pague R$ 79/mês para um app de terceiro = professor vendendo algo que aumenta sua própria transparência. Conflito de interesse real.

---

## 3. Jobs-to-be-Done

### Pai/mãe
**Trabalho funcional aparente:** "Quero saber o que aconteceu na aula do meu filho."
**Trabalho emocional real:** "Quero ter certeza de que estou sendo um bom pai/mãe e que o dinheiro com reforço não está sendo desperdiçado."

O pai compra **tranquilidade**, não dados. Se o WhatsApp já entrega tranquilidade, o produto não tem vantagem perceptível.

**Segmento com maior dor real (ausente do documento):** Pais de crianças com dificuldade de aprendizagem diagnosticada (dislexia, TDAH) que precisam de rastreabilidade formal — WTP significativamente maior neste grupo.

### Professor
**Trabalho funcional aparente:** "Quero organizar minha agenda e meus alunos."
**Trabalho real:** "Quero reduzir atrito administrativo sem aumentar minha exposição ou vulnerabilidade."

A plataforma oferece organização (resolve o JTBD do professor) mas cobra transparência (vai contra o interesse). Professores em crescimento podem aceitar — professores estabelecidos não têm incentivo.

### Conflito estrutural entre os públicos

| Dimensão | O que o pai quer | O que o professor quer |
|---|---|---|
| Transparência | Máxima | Mínima |
| Frequência de relatórios | Alta (cada aula) | Baixa (sem burocracia) |
| Controle da narrativa | Co-participação | Exclusividade |
| Permanência na plataforma | Alta (histórico) | Baixa (pode migrar) |

**O conflito é estrutural. O documento não o endereça.**

---

## 4. Avaliação do MVP Proposto

**Stack proposta:** Backend Node.js + Prisma, Next.js (professor), React Native (pais), Firebase, Stripe — 4 semanas, 1 desenvolvedor.

**Problema central:** Este MVP não valida as hipóteses críticas. Pressupõe que elas já estão validadas e vai direto para construção. 4 semanas de engenharia podem descobrir que o professor não preenche ou o pai não instala.

### Cortar imediatamente
- **React Native para pais** — app nativo para público passivo em validação é inviável e desnecessário. E-mail resolve o mesmo teste.
- **Stripe** — integração de pagamento consome tempo. Use links manuais ou PagSeguro básico. Você precisa de comportamento, não de receita no dia 1.
- **Backend completo com Prisma** — over-engineering para validação. Google Forms + planilha valida o comportamento do professor mais rápido.

### Manter
- **Conceito da notificação pós-aula** — é o core, mas pode ser testado com e-mail + Zapier.
- **Interface do professor (simplificada)** — formulário de registro de aula é o único side que precisa ser digital desde o início.

### O que está faltando para validar as hipóteses críticas
1. Conversa honesta com professores sobre o que a plataforma pede deles (não pitch de venda)
2. Teste de abertura de notificação por pais (e-mail por 4 semanas, medir abertura e resposta)
3. Entrevista de WTP com metodologia van Westendorp com 15 pais
4. Teste de churn do professor: 5 professores, Google Form por 30 dias, ver quem ainda preenche no dia 30

### MVP real para 4 semanas com 1 desenvolvedor
- **Semana 1:** 10 entrevistas com professores + 10 com pais. Zero código.
- **Semana 2:** Formulário de registro de aula (Google Forms) + automação de e-mail para pais (Zapier). Custo: zero.
- **Semana 3:** Rodar com 5–10 professores reais. Medir abertura de e-mail, feedback de pais, consistência de preenchimento.
- **Semana 4:** Análise dos dados. Decisão de continuar/pivotar/parar. Se sinal positivo: aí o desenvolvedor começa.

---

## 5. Suposições Perigosas

| Suposição | Por que é perigosa |
|---|---|
| Pais têm dificuldade real de acompanhar as aulas | Problema não testado — dificuldade ≠ motivação para pagar |
| 47,3 mi de alunos é o mercado endereçável | TAM real é 5–10% desse número |
| Professores precisam de ferramenta de gestão de agenda | Muitos já usam Google Agenda + WhatsApp com satisfação adequada |
| Notificação automática cria retenção | Notificação genérica vira spam em 2 semanas — sem teste de conteúdo |
| 5 alunos pagantes incentivam adesão do professor | Resolve problema financeiro, não problema de percepção de valor |
| Referral entre pais cresce organicamente | Sem benchmarks; pais podem ter resistência por privacidade |
| 1 dev entrega backend + 2 frontends + integrações em 4 semanas | Tecnicamente possível mas frágil o suficiente para arruinar os primeiros usuários |

---

## Recomendação

O ACOMPANHA tem hipótese de problema genuinamente interessante. O gap existe. O erro é tratar isso como validação suficiente para construir produto completo.

**O próximo passo não é código. É descoberta.**

3 semanas de pesquisa qualitativa + experimento Mágico de Oz (formulário + e-mail) custam menos de R$ 2.000 e respondem as perguntas que, sem resposta, podem custar meses de desenvolvimento na direção errada.
