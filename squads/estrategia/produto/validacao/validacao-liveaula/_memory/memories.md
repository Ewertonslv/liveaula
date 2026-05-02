# Squad Memory — Validação liveaula (ACOMPANHA)

## Contexto do Projeto
- Produto: ACOMPANHA (plataforma de agendamento e acompanhamento de aulas particulares)
- Empresa: liveaula
- Documento de referência: brain-liveaula.PDF (28/04/2026)
- Status: pré-validação — nenhuma linha de código ainda

## Execuções Anteriores

### v1 — 29/04/2026
Pipeline completo executado com 4 agentes. Outputs em `output/v1/`.

**Marcos Vieira:** Gap de acompanhamento parental em tempo real confirmado como real. Risco crítico: apenas 17% dos pais brasileiros usam apps de monitoramento digital. Professores são pagadores relutantes (iProfe e Classr com baixíssima tração). Cold start duplo identificado. WhatsApp como concorrente real.

**Priscila Santos:** Hipóteses P0 (validar antes de qualquer código): professor quer transparência (65% prob. errada), pais pagarão R$ 79 (60%), WhatsApp não resolve (60%), cold start via professor (65%). MVP real = pesquisa qualitativa + Mágico de Oz (Google Forms + e-mail). Conflito estrutural entre públicos identificado.

**Roberto Alves:** Projeções do documento têm erro metodológico grave (ignoram churn). Break-even real = 25,3 pais (não 4,2). Cenário conservador = R$ 7k/mês no M12. LTV real = R$ 593. Modelo "5 alunos = grátis" cria desincentivo no flywheel. Próximo passo: 20 entrevistas com pais antes de qualquer código.

**André Lima (advogado do diabo):** Efeito de seleção adversa: professores bons não precisam do produto, inseguros não adotam. Problema real pode ser confiança, não comunicação — e relatórios gerados pelo próprio professor não resolvem confiança. Janelas de adoção são março e agosto (perder = 4 meses de atraso). Custo de tempo do professor não calculado (~6h/mês não remuneradas). Cenário de morte: validação do problema errado → MVP para o público errado → primeiros professores atípicos → churn silencioso de pais → flywheel não vira → janeiro reseta tudo.

**3 provas que o fundador precisa (André Lima):**
1. Um professor independente convence um pai a pagar sem intervenção do time
2. Um pai paga por 90 dias incluindo semana sem aula
3. O professor inclui a plataforma na apresentação para novos alunos

## Decisões Tomadas
- Próximo passo: NÃO escrever código. Executar 20 entrevistas com pais (roteiro JTBD definido por Roberto Alves).
- Critério de go/no-go: 12/20 pais descrevem episódio concreto de frustração sem indução.

## Próximos Experimentos (priorizados)
1. Entrevistas com 20 pais — R$ 300–400, 2 semanas, critério: 12/20 com dor ativa
2. Landing page + email de interesse — R$ 200–300, 2 semanas, meta: conversão ≥ 8%
3. Teste de WTP (R$ 49/79/99) via split de landing — R$ 300–500, 3 semanas
4. Entrevistas com 15 professores — R$ 0, 2 semanas
