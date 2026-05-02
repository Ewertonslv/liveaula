# Pesquisa de mercado — concorrentes liveaula (2026-05-01)

> Compilado por subagente em 2026-05-01. Fontes citadas inline.

## Diretos / nicho EdTech parental BR

### ClassDojo (US, líder global) — classdojo.com
- **Modelo:** Freemium. Core grátis. ClassDojo Plus para famílias: US$4,99/mês ou US$59,99/ano. Licença escolar/distrital. Merch (pelúcias). [TechCrunch 2021](https://techcrunch.com/2021/01/26/classdojos-second-act-comes-with-first-profits/)
- **Pai vê:** feed Stories (foto/vídeo da turma), mensagens traduzidas (190+ idiomas), portfolio, calendário.
- **Professor vê:** pontos comportamentais, presença, portfolio, mensagens.
- **Único:** Big Ideas (pontos socioemocionais) + tradução automática + portfolio áudio/vídeo.
- **Tração:** 45M+ usuários globais; em 95% das escolas K-8 dos EUA; 1 em 6 famílias com filho <14 anos usa diariamente.
- **Resolve:** "ver o dia do filho na escola sem ligar pra professora."
- **Ignora:** aula 1-1 fora da escola; pagamento de professor avulso; registro <30s.

### iProfe (BR) — iprofe.com.br
- **Modelo:** Freemium. Grátis até 3 alunos; R$29,90/mês para até 150. Quem paga: **professor**. Sem app voltado ao pai.
- **Professor vê:** roster, agenda semanal, status pagamento, histórico, anotações, PDF.
- **Pai:** não há tela. Recebe PDF.
- **Único:** controle financeiro + agenda integrados.
- **Tração:** Play/App Store + PWA, sem números públicos.
- **Resolve:** "professor controlar agenda+caixa+presença."
- **Ignora:** experiência do pai como cliente; engajamento; B2C.

### Classr (BR) — classr.pro/br
- **Modelo:** Trial 14d → assinatura mensal (preço não público). **Professor paga.** Site instável (ECONNREFUSED no momento da pesquisa).
- **Professor vê:** agenda, perfil aluno, financeiro, página pública (bio + matérias + avaliações).
- **Comunicação:** delegada — "confirmar aula via WhatsApp, telefone ou email".
- **Único:** página pública estilo marketplace.
- **Tração:** sem presença Play Store; site instável.
- **Resolve:** "professor profissionalizar negócio (página + agenda + caixa)."
- **Ignora:** pai como pagante recorrente.

### ClassApp / Agenda Edu (BR, B2B-escola, indireto)
- **Modelo:** B2B-escola. ClassApp: R$900 setup + R$1/aluno/mês (pago pela escola) [TechTudo 2019]. Agenda Edu: 3.000+ escolas, 3,5M famílias [agendaedu.com].
- **Pai vê:** agenda escolar, comunicados, calendário, boletim, autorizações.
- **Professor vê:** envio em massa.
- **Único:** comunicados broadcast, autorizações digitais.
- **Tração:** dominam B2B-escola. Irrelevante como concorrente direto de aula 1-1.
- **Resolve:** "agenda de papel digitalizada da escola."
- **Ignora:** relação avulsa pai↔professor particular.

### Schoolastico (BR)
- Sem presença mensurável online; provavelmente fora de operação. **[especulação]**

## Indiretos (substitutos reais)

### WhatsApp Business — DEFAULT REAL DO MERCADO
- 93,4% dos brasileiros 16-64 usam WhatsApp [Blip / SM Educação].
- Grátis, ubíquo.
- **Resolve** comunicação básica.
- **Limitações:** sem persistência estruturada, sem trilha LGPD, sem métrica longitudinal, sem cobrança embutida, mídia perdida no scroll.

### Google Classroom
- B2B-escola/turma, grátis para escolas. UX-ref para professor (postar tarefa + anexo).
- **Não atende** 1-1 com pai pagante.

### Brainly / Photomath
- Substituem o professor (aluno tira dúvida sozinho).
- **Não competem** em willingness-to-pay parental.

---

## 3 perguntas estratégicas

### Q1 — Dor #1 do PAI que justifica R$79/mês?

**Hipótese mais forte:** "Estou pagando R$200-400 em aula particular e não tenho ideia se está funcionando, se meu filho fez, se o professor apareceu."

Dor de **accountability do investimento**, não comunicação. Concorrentes atacam comunicação (ClassDojo, ClassApp) ou gestão do professor (iProfe, Classr) — **ninguém entrega ao pai pagante de aula particular um dashboard de "ROI educacional"** (frequência + progresso + comprovante). Gap real existe, mas R$79 é alto: equivale a ~10% do custo médio mensal de aula/semana (R$80/aula × 4 = R$320). Aceitável só se o app virar prova de "esta aula vale a pena" e reduzir churn de aulas particulares.

### Q2 — Por que ClassDojo (free) tem 50M e BR pago não escala?

Três motivos combinados:
1. **ClassDojo monetiza famílias só no upsell Plus.** Core grátis viabilizou rede; BR pago morre na barreira inicial.
2. **Willingness-to-pay parental BR é baixa para SaaS educacional.** Pai brasileiro paga professor (serviço), não software (commodity). WhatsApp grátis fixou referência mental "comunicação não custa."
3. **iProfe/Classr cobram do professor** (lado pobre da equação, R$29,90 dói no autônomo). ClassApp cobra da escola (B2B, ticket alto).

**Implicação para liveaula:** cobrar R$79 do pai diretamente é contracorrente em BR — só funciona se o valor entregue for visivelmente premium ao pai (não ao professor).

### Q3 — Diferencial real vs. WhatsApp (3 hipóteses ranqueadas)

1. **(MAIS FORTE) Trilha estruturada e auditável da aula.** Registro <30s vira histórico longitudinal pesquisável. WhatsApp afoga em scroll + mídia perdida. Defensabilidade alta + LGPD para menores.
2. **(MÉDIA) Push contextual + comprovante de aula dada.** Pai recebe "aula realizada às 14h, tópico X" sem digitar nada. WhatsApp exige professor lembrar; em escala (5+ alunos) ele para.
3. **(MAIS FRACA) Pagamento embutido + plano grátis ao professor com 5 pagantes.** Diferencial econômico, não de produto. Pix direto via WhatsApp já resolve; vira só conveniência marginal.

## Veredicto preliminar

Dor real existe (accountability parental), mas R$79/mês exige UX premium e prova rápida de valor. Cold-start pelo professor é correto, porém modelo "5 pagantes = grátis" pressiona LTV. **Validar com 10-20 pais entrevistados antes de codar paywall final.**

## Sources

- [TechCrunch — ClassDojo profits 2021](https://techcrunch.com/2021/01/26/classdojos-second-act-comes-with-first-profits/)
- [Contrary Research — ClassDojo breakdown](https://research.contrary.com/company/classdojo)
- [iProfe site](https://iprofe.com.br/)
- [Classr.pro Brasil](https://classr.pro/br)
- [TechTudo — ClassApp pricing](https://www.techtudo.com.br/noticias/2019/04/conheca-o-classapp-aplicativo-que-cria-comunicacao-entre-pais-e-escola.ghtml)
- [Agenda Edu](https://www.agendaedu.com/)
- [Blip — WhatsApp educação BR](https://www.blip.ai/blog/whatsapp/whatsapp-para-educacao/)
- [SM Educação — grupos WhatsApp escola](https://www.smeducacao.com.br/grupos-de-pais-whatsapp-como-a-escola-pode-lidar-2/)
