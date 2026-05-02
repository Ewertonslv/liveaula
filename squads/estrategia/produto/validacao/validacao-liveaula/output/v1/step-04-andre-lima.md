# Step 04 — André Lima · Advogado do Diabo
**Status:** Concluído · 29/04/2026

---

# André Lima — Advogado do Diabo
## Análise Final: Projeto ACOMPANHA

---

## 1. Premissas que os outros não questionaram (deveriam)

**"O professor é o vetor de aquisição"**
Tratado como axioma pelos três. Ninguém perguntou: *por que o professor faria isso?*
Professor já tem o WhatsApp do pai. Já tem o controle da relação. Adotar a plataforma é criar trabalho onde não havia trabalho — e transferir visibilidade da relação para uma empresa terceira que ele não conhece. O professor não é ingênuo: ele sabe que um sistema de registro de aulas é, na prática, um sistema de auditoria sobre ele. "Transparência para o pai" e "transparência sobre o professor" são a mesma coisa.
- Professor com bom relacionamento com pai: não precisa do produto
- Professor com mau relacionamento: não vai adotá-lo voluntariamente
O produto filtra exatamente o segmento que não deve ser o cliente.

**"O problema é de comunicação"**
Todos trataram o produto como solução de comunicação. Ninguém questionou se o problema real é *confiança*. Se for confiança, comunicação não resolve. Pai que desconfia do professor não vai confiar mais nele porque passou a receber relatórios gerados pelo próprio professor. A plataforma não tem mecanismo de verificação independente — o professor registra o que quiser. Isso não é lacuna de produto, é limitação estrutural do modelo.

**"Pais de crianças com dificuldade têm maior dor"**
Priscila apontou esse segmento como promissor. O problema: pais de crianças com TDAH ou dislexia diagnosticada já têm psicopedagogo, neurologista, escola especializada. O professor particular nesse contexto não é o elo fraco — o elo fraco é a integração entre todos esses profissionais. O ACOMPANHA resolve a parte errada do problema para esse segmento.

**"R$ 79/mês é preço testável"**
De onde veio R$ 79? Não há benchmark de WTP para esse produto específico. Não há análise de sensibilidade. O número parece ter sido escolhido por parecer razoável, não por evidência.

---

## 2. Reclassificação de Riscos

| Hipótese | Classificação original | Reclassificação | Motivo |
|---|---|---|---|
| Professor quer transparência | Médio (65%) | **CRÍTICO** | Efeito de seleção adversa: professores bons não precisam, professores inseguros não adotam |
| Cold start via professor | Alta dificuldade, não crítico | **CRÍTICO COM PRAZO** | Janelas de adoção são março e agosto — errar o timing = perder 4 meses, não 1 |
| WhatsApp não resolve | Médio | **CRÍTICO** | WhatsApp serve reassurance imediata (maior necessidade); ACOMPANHA serve histórico estruturado (necessidade menor) |
| Modelo freemium para professor | Não classificado | **MÉDIO-ALTO** | Professor que chega a 5 alunos nunca avaliou se o produto vale o dinheiro — vai fazer essa avaliação pela primeira vez sem urgência |

---

## 3. Cenário de Morte do Produto

**Passo 1 — O fundador valida o problema errado**
As 20 entrevistas acontecem. Pais dizem que querem mais acompanhamento. Fundador interpreta como validação. O problema: pais dizem que querem coisas que não pagariam para ter. Entrevista confirma a dor, não a disposição de pagar.

**Passo 2 — O MVP é construído para o pai, não para o professor**
Por clareza da dor dos pais, o produto é construído com foco na experiência do pai. O painel do professor fica funcional mas não encantador. Assimetria de produto: a parte que precisa de adoção ativa tem a pior UX.

**Passo 3 — Os primeiros professores são os errados**
Cold start via rede pessoal do fundador — professores amigos, atípicos, mais abertos a tecnologia. Dados de uso iniciais são promissores. Esses professores não representam o mercado.

**Passo 4 — Churn silencioso dos pais**
Pais cadastrados usam o produto por 3–6 semanas. Engajamento cai. Não porque o produto é ruim — porque o filho está indo bem e não há mais ansiedade para resolver. O produto foi construído para um estado de ansiedade que é, por definição, temporário quando tudo vai bem. Fundador interpreta como problema de engajamento e aumenta notificações. As notificações aumentam o churn real ao lembrar os pais de que o produto existe mas eles não estão usando.

**Passo 5 — O flywheel não vira**
Professores que ficaram têm 2–4 alunos — nunca chegaram ao limiar de 5. Sem receita, sem recursos para aquisição paga. Rede pessoal de professores esgotada. Professores particulares têm baixíssima densidade de rede profissional estruturada — não têm comunidade de troca como médicos ou advogados.

**Passo 6 — Janeiro chega**
Alunos trocam de professor, mudam de escola, param as aulas. Professores perdem 30–50% dos alunos. O produto perde usuários sem que ninguém clique em "cancelar".

**Passo 7 — O fundador persiste no problema errado**
Com métricas ruins e caixa curto, a pergunta errada é feita: "o que mudar no produto?" A certa seria: "estou resolvendo o problema que as pessoas pagam para resolver?" Sem essa distinção, o produto entra em pivot incremental sem nunca endereçar que aquisição (professor como vetor) e retenção (pai como pagador) são estruturalmente desalinhados.

---

## 4. Perguntas que Ninguém Fez

**O professor sabe quem é o seu cliente?**
Em muitos casos, o professor é contratado por recomendação e o pai é o pagador, não quem escolheu. Se o pai não escolheu o professor, ele tem menos autoridade para exigir transparência — e menos motivação para pagar por ela.

**Qual é o comportamento do pai 90 dias após a primeira aula sem problema?**
Todos os relatórios falam sobre aquisição. Nenhum fala sobre o estado emocional do pai bem-sucedido. Se o filho está indo bem, a ansiedade sumiu. Sem ansiedade, não há retenção. O produto foi desenhado para um estado que melhora se funcionar — armadilha estrutural de retenção.

**Quanto tempo o professor gasta para registrar uma aula?**
Se são 3 minutos por aula e o professor dá 6 aulas/dia → 18 min/dia → ~6 horas/mês de trabalho não remunerado. Custo de oportunidade: R$ 480–900/mês em tempo não cobrado. Ninguém calculou isso.

**Existe precedente de produto B2B2C com este incentivo assimétrico no Brasil?**
Professor usa de graça, pai paga. Professor é o vetor de distribuição mas não tem incentivo financeiro direto no volume de vendas. Diferente de delivery (restaurante tem incentivo no volume). Qual o incentivo real do professor para garantir que o pai pague?

**O que acontece quando o professor para de usar mas o pai continua pagando?**
O pai recebe relatórios vazios. Quem é responsável? A plataforma vai notificar o pai? Isso cria um conflito de suporte que pode destruir a relação entre pai e plataforma — e indiretamente a relação pai-professor.

---

## 5. Veredicto do Advogado do Diabo

**Objeção principal:**

Você tem um produto onde quem precisa trabalhar para ele funcionar (o professor) não é quem paga (o pai). E quem paga só percebe valor quando está ansioso — estado que o próprio sucesso do produto elimina.

O concorrente real não é o WhatsApp. É a **inércia do professor** e a **tranquilidade do pai cujo filho está indo bem**.

O segmento com dor real suficiente para pagar (pais de crianças com dificuldades) é exatamente onde o modelo de distribuição (professor como vetor) menos funciona.

**O que o fundador precisa provar para silenciar essa objeção:**

Três provas, nesta ordem, sem intervenção do time:

1. **Um professor** (não amigo do fundador, não early adopter atípico) convenceu **um pai a pagar** pelo produto de forma independente. Prova que o vetor de distribuição funciona sem pessoas extraordinariamente motivadas.

2. **Um pai pagou por 90 dias consecutivos** incluindo pelo menos uma semana sem aula. Prova que a retenção não é puramente contratual e o produto tem valor além da ansiedade imediata.

3. **O professor que mediou a venda** considera o produto parte permanente do seu serviço e o inclui na apresentação para novos alunos. Prova que o flywheel tem possibilidade real de existir.

**Sem essas três provas, o que você tem é uma hipótese bem articulada. Não um negócio.**

---

*André Lima. Não estou aqui para matar o projeto — estou aqui para que, se ele sobreviver, seja porque sobreviveu por motivos reais.*
