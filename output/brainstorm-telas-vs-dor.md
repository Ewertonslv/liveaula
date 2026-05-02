# Brainstorm — Telas atuais × Dor real do mercado

> Análise estratégica gerada em 2026-05-01 cruzando o inventário de 64 telas existentes com:
> 1. Pesquisa de mercado (5 concorrentes diretos + 3 indiretos, ver `output/competitor-research-2026-05-01.md`)
> 2. Memória do squad de validação (`squads/estrategia/.../validacao-liveaula/_memory/memories.md`)
> 3. Avaliação honesta do que cobra R$79/mês do pai

---

## 1. A dor real (validação do mercado)

**Hipótese mais forte sustentada por dados de concorrentes:**

> "Estou pagando R$200-400 por mês em aula particular e **não tenho ideia se está funcionando**, se meu filho fez, se o professor apareceu, se o conteúdo evoluiu."

Esta é a dor de **accountability do investimento**, não de "comunicação".

**Por que essa distinção é crítica:**
- ClassDojo (50M+ usuários, líder global) atende dor de comunicação → free
- iProfe / Classr (BR) atendem dor de gestão do professor → cobram do professor → não escalam
- WhatsApp atende comunicação básica → grátis, ubíquo
- **Ninguém entrega ao pai-pagante de aula particular um dashboard de "comprovante + progresso" auditável.** Gap real.

**O que isso implica para o liveaula:**
- O pai paga R$79 SE vê *prova* concreta. Reassurance fluffy ("aurora gradient bonito", "carinho narrativo") não vale R$79 — vale grátis.
- Aurora gradient e copy emocional são **embalagem**, não produto. O produto é a trilha auditável.

---

## 2. Inventário atual: 64 telas em 3 grupos

### Grupo A — Professor (24 telas: 17 mobile + 7 web)

| Tela | Resolve dor real? | Veredito |
|---|---|---|
| P1 Splash, P2 Onboarding, P3 Cadastro, P4 Login, P17 Esqueci senha | Não resolve dor; é necessidade técnica | **Manter** (mas tirar afetividade) |
| P5 Registrar Aula (<30s) — HERO | **Sim — fundação do produto.** Sem registro rápido, professor abandona, pai não recebe nada. | **Manter e proteger.** Anti-pattern: NUNCA adicionar campo obrigatório que aumente atrito. |
| P6 Confirmação pós-envio (4200ms coreografia) | Parcial — confirma técnica, mas a "celebração" é gamification que pode parecer infantil. | **Reduzir.** Cortar coreografia de 4200ms para 1200ms. Manter feedback claro, tirar ornamento. |
| P7 Perfil do aluno + P8 Histórico | Sim — é onde o professor consulta o que já foi feito. Crítico para preparar próxima aula. | **Manter, amplificar.** Adicionar busca por palavra-chave no histórico ("equação", "redação"). |
| P9 Detalhe de aula registrada | Médio — espelha o que o pai vê, útil para auditoria. | **Manter.** |
| P10 Convidar pai (link WhatsApp) | **Sim — esse é o cold-start.** Sem convite, não há pai pagante. | **Manter, instrumentar.** Métrica: % de convites que viram cadastro pago. |
| P11/P12 Settings + Editar perfil | Necessidade técnica | **Manter, simplificar.** |
| P13 Cadastrar aluno | Necessidade técnica | **Manter.** |
| P14 Agenda (calendário histórico) | **Médio.** Para professor com 10+ alunos é útil. Para professor com 2-3 alunos é decoração. | **Adiar.** Não é Must-have v1. Cortar do MVP até validar uso. |
| P15 Financeiro (X/5 pais ativos) | **Importante para retenção do professor** — é o anzol "ganhe FREE com 5 pais". | **Manter, evidenciar.** Mover do menu Settings para tab principal ou link no Dashboard. |
| P16 Estado vazio dashboard | UX | **Manter.** |
| StreakBadge (gamification) | **Não.** Adulto profissional não se motiva por 🔥 streak igual criança no Duolingo. Pode até afastar professores experientes. | **Cortar do produto.** Anti-pattern AP-11 já restringe, mas a presença confunde positioning. |
| CelebrationOverlay (1ª aula, 10ª aula) | Marginal | **Cortar para 0 triggers OU mover para email/notificação fora do app.** |
| **Dashboard que acabei de fazer** (stats + recent + plan) | Sim — orienta ação | **Manter mas focar em "X pais sem novidade há 3+ dias"** (alerta acionável > vanity metric) |

### Grupo B — Pai/Mãe (26 telas: 19 mobile + 7 web)

**Aqui está o coração do produto. É quem paga R$79.**

| Tela | Resolve dor real? | Veredito |
|---|---|---|
| M1 Splash, M2 Convite-entrada, M3 Cadastro 3 steps, M4 Login, M19 Esqueci senha | Necessidade técnica | **Manter, otimizar.** |
| **M5 LGPD Art. 14** (scroll obrigatório) | Sim — compliance + proteção do menor | **Manter, juridicamente blindado.** |
| **M6 Feed de aulas** (cards aurora gradient) | **PARCIAL.** Resolve "ver que aula aconteceu" mas não "saber se valeu a pena". É o equivalente do feed do WhatsApp — bonito mas sem accountability. | **Reposicionar.** Manter como entrada, mas substituir o título "Aulas de [filho]" por algo decisional como "Investimento de outubro: 8 aulas, R$640". |
| **M7 Detalhe da aula** | Sim, mas hoje é só texto livre. | **Amplificar com "comprovante":** timestamp + duração + tópico + status (CONFIRMADA / EM-DISPUTA). Pode virar PDF exportável. |
| M8 Perfil do filho | Médio | **Manter, mover métricas pra cá.** |
| **M9 Notificações central** | Sim — push é primary channel | **Manter.** |
| **M10 Paywall** (após trial 7d) | **Crítico — é onde a conversão acontece.** Hoje o copy provavelmente fala "continue acompanhando" — fraco. | **Reescrever.** Copy precisa quantificar: "Você acompanhou 6 aulas em 7 dias. R$79 mantém o registro completo, ou vire seu filho 'sem rastro' como antes." |
| M11 Cartão, M12 Confirmação pagamento | Necessidade técnica | **Manter.** |
| M13 Settings, M14 Editar perfil | Necessidade técnica | **Manter.** |
| **M15 Histórico filtrado (NEW)** | **Sim — esse é o produto.** Filtro por matéria + período = "ROI por matéria." | **Promover ao status de hero junto com M6.** Mover acesso pro topo do feed (não escondido em ícone funnel). |
| **M16 Progresso (NEW)** | **Parcial — frequência é honesta mas não é "progresso real".** Pai quer saber "está aprendendo?", não "quantas aulas." | **Repensar.** Adicionar dimensão semântica: tópicos cobertos × matéria. Ex: "Português: 4 redação, 6 gramática, 0 interpretação." |
| M17 Múltiplos filhos | Resolve dor de quem tem 2+ filhos | **Manter.** |
| M18 Estado vazio trial | UX | **Manter.** |

### Grupo C — Admin (7 telas)

Métricas internas. Sem impacto no usuário pagante. **Manter como está.**

---

## 3. Lacunas: o que NÃO temos e que move agulha

Cruzando dor real × concorrentes × estado atual, **estas 5 features são as que mais provavelmente convertem trial → paid**:

### 3.1 Confirmação de presença pelo pai/aluno (CRÍTICO)
- **Problema:** hoje só o professor declara "aula aconteceu". Pai aceita sem prova. Vira "ele disse que rolou, vou acreditar". WhatsApp já faz isso.
- **Diferencial:** notificação push pede ao pai "Confirme que [filho] teve aula com [professor] hoje" → 1 toque → vira evidência auditável. Se pai não confirmar em 24h, sistema marca "PENDENTE".
- **Telas novas:** M-confirm (push action), painel "aulas pendentes confirmação" no M9.
- **Justifica R$79:** "WhatsApp não tem trilha de confirmação cruzada."

### 3.2 Relatório mensal exportável em PDF (CRÍTICO)
- **Problema:** pai brasileiro adora documento. Plano de saúde, escola, contador — tudo é PDF mensal. Pai paga R$79 e não tem nada para "guardar / mostrar".
- **Diferencial:** "Relatório de outubro — Pedro Santos" com 8 aulas, 12h, tópicos por matéria, frequência, comparativo com mês anterior. Email automático no dia 1.
- **Telas novas:** PDF gerado server-side. Botão "Baixar relatório" em M16.
- **Justifica R$79:** entrega tangível mensal. Reduz churn.

### 3.3 Alerta de irregularidade (IMPORTANTE)
- **Problema:** professor sumiu há 7 dias? Aula cancelada 2× seguidas? Pai descobre quando reclama.
- **Diferencial:** sistema alerta proativo: "Sem aula há 9 dias" — pai pode acionar professor sem se sentir chato.
- **Telas novas:** banner em M6 + push.

### 3.4 Q&A estruturado pai → professor (IMPORTANTE)
- **Problema:** WhatsApp vira terapia gratuita ("como ele tá em frações?", "ele tá nervoso?"). Professor cansa, deixa de responder. Pai sente abandonado.
- **Diferencial:** pai manda 1 pergunta/semana via app, professor responde no fluxo de "registrar aula" (chip "responder pergunta da Maria" antes de enviar). Estruturado, com SLA.
- **Telas novas:** M-question (compose pai), P-answer-inline (chip no P5 BottomSheet).

### 3.5 "Tópicos cobertos × matéria" semantic (DIFERENCIAL)
- **Problema:** pai vê "8 aulas" mas não "do que se trata". Pai tem filho em recuperação de matemática — quer saber se 8 aulas cobriram **frações** ou se ficou em equação 8×.
- **Diferencial:** professor escolhe 1-3 chips de "tópico" (taxonomia mínima por matéria). M16 mostra "Frações: 4 aulas | Equação 1º: 3 | Geometria: 1".
- **Telas mudadas:** P5 BottomSheet ganha 1 campo `topics` (chips multi). M16 ganha breakdown semântico.

---

## 4. Cortes recomendados

Para reduzir escopo MVP até validação:

- **CelebrationOverlay** (3 triggers atualmente) — corta para 0
- **StreakBadge** (≥2 dias) — corta
- **P14 Agenda completa** — corta v1, retorna v1.3 se uso comprovar
- **Coreografia 4200ms pós-aula** — reduz para 1200ms (manter ack visual, cortar ornamento)
- **A6/A7 admin metrics avançado** — adia, foco em A1-A5

---

## 5. Reposicionamento sugerido

### 5.1 Reposicionar a copy

| Tela | Copy atual (estimada) | Copy sugerida |
|---|---|---|
| Login do pai | "Entrar — continue acompanhando as aulas" | "Entrar — veja o que o professor fez por R$ X este mês" |
| Feed M6 título | "Aulas de [filho]" | "Outubro: 8 aulas confirmadas · R$640 investidos" |
| Paywall M10 título | "Liberar acesso completo" | "Você acompanhou 6 aulas em 7 dias. Continue antes de virar 'sem rastro'." |
| App store description | "EdTech para acompanhamento de aulas particulares" | "Saiba se a aula particular do seu filho aconteceu, o que foi feito, e se vale o que custa." |

### 5.2 Reposicionar o produto

**Hoje:** "EdTech para acompanhar aulas." Genérico. Compete com WhatsApp (perde) e ClassDojo (perde).

**Sugestão:** "Comprovante de aula particular." Pega a dor de accountability frontal. Compete com PDF/Excel/WhatsApp e ganha por estruturação. R$79 fica defensável porque entrega documento.

---

## 6. Ordem de prioridade (se for codar antes de validar com 20 pais)

> ⚠️ **A memória do squad de validação diz: parar de codar até 12/20 entrevistas com dor confirmada.** O brainstorm abaixo só é válido se a hipótese de accountability for confirmada nas entrevistas.

Se mesmo assim a decisão for codar:

**P0 (semana 1)** — Reposicionar copy de M10 Paywall + título do M6 Feed. Custo: 2h. Impacto: testa willingness-to-pay sem mexer em código além de strings.

**P1 (semana 2-3)** — Confirmação de presença pelo pai (3.1). Costas: rota nova `POST /lessons/:id/confirm` + push action + tela. Tela: 1. Esforço: 1 sprint.

**P2 (semana 3-4)** — Relatório mensal PDF (3.2). Backend: cron mensal + PDF lib (puppeteer/pdfkit). Frontend: botão download. Esforço: 1 sprint.

**P3 (semana 5+)** — Tópicos semânticos (3.5). Mais arriscado porque exige professor adotar taxonomia. Pilotar com 2-3 professores antes de generalizar.

**Cortes imediatos:** StreakBadge, CelebrationOverlay, P14 Agenda.

---

## 7. Veredicto franco

O produto atual tem **boa fundação técnica** (registro <30s funciona, push funciona, LGPD funciona, design tem identidade). Mas o **valor percebido pelo pagante** está abaixo da linha de R$79/mês.

Sem as 5 lacunas (especialmente 3.1 confirmação + 3.2 relatório), o pai vai pagar 1-2 meses pela curiosidade e cancelar. Churn silencioso de pais → professor não atinge 5 ATIVOS → flywheel não vira → produto morre.

**A pergunta certa não é "que telas adicionar"** — é "o pai brasileiro paga por isso?" — e essa pergunta tem resposta nas 20 entrevistas que o squad de validação pediu.

**Recomendação:** rodar 20 entrevistas guiadas pelo Roberto Alves antes de codar P0/P1/P2. Se 12/20 confirmarem dor de accountability + interesse em "comprovante de aula", aí sim ataca P0-P3 nesta ordem. Senão, pivota antes de gastar 4 semanas implementando algo que ninguém quer pagar.
