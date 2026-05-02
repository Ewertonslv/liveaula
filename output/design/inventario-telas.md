# Inventário de Telas — liveaula MVP

> Saída do Passo 1 (Strategist) da skill `liveaula-design`. Cobre sub-fases 1A (personas), 1B (arquitetura de informação), 1C (fluxos UX críticos) e 1D (inventário de telas).
>
> Aprovação no **Checkpoint 1** desbloqueia a Fase 2 (SystemBuilder).

---

## 1A. Personas — necessidades funcionais e emocionais

### Professor — UX de produtividade

| Dimensão | Detalhe |
|---|---|
| Funcional | Registrar aula rápido, gerenciar alunos, ver progresso financeiro, controlar quando o pai é notificado |
| Emocional | Sentir-se **profissional** (não auditado), reduzir ruído de WhatsApp, controlar a ferramenta |
| Densidade visual | **Alta** — tabelas, badges de status, ações rápidas |
| Tom | Direto, prático, sem decoração desnecessária |
| Trigger primário | Final da aula → quer fechar o ciclo em <30s |
| Anti-trigger | Sentir que está "prestando contas" — UX deve enquadrar como "comunicação rápida ao pai", não "registro de auditoria" |

### Pai/Mãe — UX de reassurance

| Dimensão | Detalhe |
|---|---|
| Funcional | Receber updates, ver histórico, ver progresso, pagar mensalidade |
| Emocional | **Tranquilidade**, conexão emocional com a vida escolar do filho, sensação de presença mesmo sem assistir |
| Densidade visual | **Baixa** — focado em emoção, visual, narrativa |
| Tom | Caloroso, humano, gentil — não corporativo |
| Trigger primário | Push notification chega → quer abrir e sentir alívio |
| Anti-trigger | Sentir que está "vigiando" o filho — UX deve enquadrar como "acompanhar a jornada", não "fiscalizar" |

### Admin — UX utilitária

| Dimensão | Detalhe |
|---|---|
| Funcional | Gerenciar usuários e cobranças, ver métricas, ativar/desativar contas |
| Emocional | Nenhum — utilitário puro |
| Densidade visual | **Alta** — tabelas, gráficos, ações batch |
| Tom | Sóbrio, eficiente, sem firula |

---

## 1B. Arquitetura de Informação (IA)

### Professor — Mobile (principal)

```
[Bottom Tab Navigation]
  ├── Dashboard          → home: lista de alunos com badges
  │     └── Perfil aluno → histórico, dados, link convite
  ├── Agenda             → calendário (Should-have)
  ├── Financeiro         → tabela de pagamentos (Should-have)
  └── Configurações      → perfil, plano, notificações

[FAB central — sempre visível]
  └── "+" → Registrar aula (BottomSheet modal)
```

**Decisão crítica:** o FAB de "Registrar aula" fica fora dos tabs — flutua sobre toda a navegação. Reforça que registrar é **a ação principal**.

### Professor — Web

```
[Sidebar Navigation]
  ├── Dashboard
  ├── Alunos              → lista + busca
  ├── Agenda
  ├── Financeiro
  └── Configurações

[Top bar] → CTA "Registrar aula" (botão primário, sempre visível)
```

Densidade web é maior — tabelas com mais colunas, filtros laterais.

### Pai/Mãe — Mobile (principal) e Web

```
[Bottom Tab Navigation - Mobile]
  ├── Feed              → home: cronologia de aulas
  │     └── Detalhe aula
  ├── Filho(s)          → perfis dos filhos
  │     └── Perfil filho → progresso, histórico
  ├── Notificações      → central de alertas
  └── Perfil            → conta, assinatura, sair
```

**Decisão crítica:** Web do pai/mãe é **secundária** — espelha mobile com ajustes mínimos (Feed em coluna única, sem sidebar densa). 90% do uso será mobile.

### Admin — Web (única superfície)

```
[Sidebar Navigation]
  ├── Professores       → lista + ações
  ├── Pais              → lista + filtro por filho
  ├── Assinaturas       → status de cobranças
  ├── Métricas          → DAU, churn, conversão
  └── Configurações
```

---

## 1C. Fluxos UX críticos

### Fluxo 1 — Professor registra aula (CORE LOOP, <30s)

```
1. Professor termina aula
2. [Mobile] Tap no FAB "+"
3. BottomSheet abre — Aluno (chips selecionáveis dos últimos 5 alunos no topo + lista)
4. Tap em aluno → Matéria pré-selecionada (último valor desse aluno) → confirma ou troca
5. Duração: chips 45min / 1h / 1h30 / 2h (default = última usada)
6. "O que foi feito" — textarea com contador 280 char
7. (Opcional) Humor do aluno: 😕 😐 😊 (1 toque)
8. (Opcional) Observação para o pai
9. Tap "Enviar"
10. Loading 1-2s → Confirmação verde + preview do push enviado ao pai
11. Auto-fecha BottomSheet, volta ao Dashboard com badge "última aula registrada agora"
```

**Estado vazio:** "Você ainda não tem alunos cadastrados — Adicionar aluno" (CTA primário).

**Estado de erro:** aluno sem pai vinculado → warning amarelo "Pai ainda não foi convidado, mas a aula será registrada. Você pode convidar agora ou depois." (não bloqueia o envio — Should-have é não atrapalhar o fluxo).

**Microinteração pós-envio:** animação de envio (avião subindo), depois preview do push como aparece no celular do pai (skin de notificação iOS/Android).

### Fluxo 2 — Pai recebe notificação e vê detalhe

```
1. Push chega no celular do pai (em <5s após registro do professor)
2. Notificação: "Aula de [matéria] de [filho] registrada — [duração]"
3. Tap na notificação
4. App abre direto no Detalhe da aula (deep link)
5. Pai lê: o que foi feito + observação + humor do filho
6. Pode voltar ao Feed ou tocar em "Perfil do filho" para ver histórico
```

**Estado offline:** push fica em fila, abre quando voltar online. App mostra badge no ícone até ser lida.

**Estado app fechado:** mesma navegação direta para Detalhe via deep link.

### Fluxo 3 — Onboarding professor + convite pai (cold-start)

```
PROFESSOR:
1. Baixa app / acessa web
2. Cadastro: e-mail, senha, foto, matéria(s)
3. Verifica e-mail
4. "Adicione seu primeiro aluno" (não pula este passo)
5. Cadastra: nome do aluno, série, matéria, contato
6. App gera link de convite único: liveaula.app.br/convite/abc123
7. Botão "Compartilhar via WhatsApp" (texto pré-preenchido com nome do filho)
8. Professor envia → loop de Registrar aula desbloqueado

PAI:
1. Recebe link no WhatsApp
2. Tap → abre web (ou app store se iOS/Android e tiver app)
3. Tela: "[Professor] te convidou para acompanhar [filho]"
4. Cria conta: e-mail, senha, foto
5. Confirma vínculo: "Sim, sou pai/mãe de [filho]" + foto/dados básicos do filho
6. Aceita LGPD (consentimento explícito por dados de menor — Art. 14)
7. Vai para Assinatura → adiciona forma de pagamento
8. Após 1 ciclo de cobrança OK → tem acesso completo ao Feed
```

**Decisão UX importante:** o pai pode usar o app **antes** de pagar (modo "trial" de 7 dias, ver as primeiras aulas) — reduz fricção do cold-start. Após 7 dias, paywall aparece no Feed.

### Fluxo 4 — Assinatura/pagamento pai (recorrência)

```
1. Pai está no Feed — vê banner "Seu trial termina em 3 dias"
2. Tap → tela "Liberar acesso completo"
3. Resumo: R$ 79/mês por filho + total mensal
4. Forma de pagamento: cartão de crédito (PIX ou boleto na fase 2)
5. Confirma → Cobrança imediata (1ª mensalidade)
6. Confirmação: "Pronto! Próxima cobrança em DD/MM"
7. Volta para Feed sem paywall
```

**Estado de falha:** cartão recusado → modal "Pagamento não autorizado" + botão "Tentar outro cartão" (não bloqueia uso por 3 dias de tolerância).

---

## 1D. Inventário de telas (Must-have e Should-have)

### Professor — Mobile (iOS + Android)

| # | Tela | Prioridade | Notas |
|---|---|---|---|
| P1 | Splash | Must | Logo + carregamento inicial |
| P2 | Onboarding (cadastro 3 steps) | Must | E-mail/senha → foto/matéria → primeiro aluno |
| P3 | Login | Must | E-mail + senha + esqueci senha |
| P4 | Dashboard (lista de alunos) | Must | Cards com badges de status |
| P5 | **Registrar aula (BottomSheet)** | **Must — HERO** | <30s, 4 campos, 1 botão |
| P6 | Confirmação de envio (modal) | Must | Preview do push enviado |
| P7 | Perfil do aluno | Must | Histórico + link convite |
| P8 | Histórico de aulas (lista) | Must | Cronológico, filtros simples |
| P9 | Detalhe de aula registrada | Must | Read-only, mostra o que o pai vê |
| P10 | Convidar pai (compartilhar link) | Must | Modal com botão WhatsApp |
| P11 | Configurações | Must | Perfil, plano, notificações, sair |
| P12 | Editar perfil professor | Must | Nome, foto, matérias, bio |
| P13 | Cadastrar/editar aluno | Must | Form simples |
| P14 | Agenda | Should | Calendário semana/mês |
| P15 | Financeiro | Should | Tabela aluno × mês × pagamento |
| P16 | Estado vazio Dashboard | Must | "Adicione seu primeiro aluno" |
| P17 | Esqueci senha | Must | E-mail → link |

### Professor — Web

| # | Tela | Prioridade | Notas |
|---|---|---|---|
| PW1 | Login | Must | Mesmo do mobile |
| PW2 | Dashboard (sidebar + tabela) | Must | Densidade maior |
| PW3 | Lista de alunos (tabela completa) | Must | Filtros laterais |
| PW4 | Perfil do aluno | Must | Layout 2 colunas |
| PW5 | Registrar aula (modal) | Must | Mesma lógica do BottomSheet |
| PW6 | Histórico de aulas | Must | Tabela com filtros |
| PW7 | Configurações | Must | Layout split |

### Pai/Mãe — Mobile (iOS + Android)

| # | Tela | Prioridade | Notas |
|---|---|---|---|
| M1 | Splash | Must | — |
| M2 | Tela de convite (entrada) | Must | "[Professor] te convidou para acompanhar [filho]" |
| M3 | Cadastro (3 steps) | Must | E-mail/senha → foto/perfil → vínculo filho |
| M4 | Login | Must | — |
| M5 | Aceite LGPD (Art. 14) | Must | Tela dedicada, scroll completo, checkbox explícito |
| M6 | Feed de aulas | Must | Cronológico, card por aula |
| M7 | Detalhe de aula | Must | Conteúdo + observação + humor + foto professor |
| M8 | Perfil do filho | Must | Foto, matérias, histórico, progresso |
| M9 | Notificações (central) | Must | Histórico de pushes + lidas/não lidas |
| M10 | Assinatura (paywall) | Must | Banner + tela de cobrança |
| M11 | Adicionar cartão | Must | Form de pagamento |
| M12 | Confirmação de pagamento | Must | Sucesso/falha |
| M13 | Configurações | Must | Conta, filhos, push, sair |
| M14 | Editar perfil pai | Must | — |
| M15 | Histórico filtrado | Should | Por matéria/período |
| M16 | Gráfico de progresso | Should | Visual simples |
| M17 | Múltiplos filhos (switch) | Should | Trocar contexto entre filhos |
| M18 | Estado vazio Feed (trial) | Must | "Sua primeira aula chega em breve" |
| M19 | Esqueci senha | Must | — |

### Pai/Mãe — Web

| # | Tela | Prioridade | Notas |
|---|---|---|---|
| MW1 | Tela de convite | Must | Landing simples + CTA |
| MW2 | Cadastro | Must | Mesma lógica mobile |
| MW3 | Login | Must | — |
| MW4 | Feed | Must | Coluna única centrada |
| MW5 | Detalhe de aula | Must | — |
| MW6 | Assinatura | Must | — |
| MW7 | Configurações | Must | — |

### Admin — Web (interno)

| # | Tela | Prioridade | Notas |
|---|---|---|---|
| A1 | Login admin | Must | — |
| A2 | Dashboard métricas | Must | Cards: DAU, MRR, churn, conversão |
| A3 | Lista professores | Must | Tabela + busca + ações |
| A4 | Detalhe professor | Must | Dados + alunos vinculados |
| A5 | Lista pais | Must | Tabela + filtro por filho |
| A6 | Lista assinaturas | Must | Status, próxima cobrança, ações |
| A7 | Ativar/desativar conta | Must | Modal de confirmação |

---

## Resumo numérico

| Superfície | Must-have | Should-have | Total |
|---|---|---|---|
| Professor Mobile | 15 | 2 | 17 |
| Professor Web | 7 | 0 | 7 |
| Pai Mobile | 16 | 3 | 19 |
| Pai Web | 7 | 0 | 7 |
| Admin Web | 7 | 0 | 7 |
| **TOTAL** | **52** | **5** | **57** |

**Telas Must-have a especificar na Fase 3 (SpecGen):** 52
**Tela hero (SpecGen 3A):** P5 — Registrar aula (recebe atenção 2x)

---

## Decisões UX já tomadas (não voltar atrás na Fase 2)

1. FAB central no mobile do professor para "Registrar aula" (não tab, não menu)
2. Trial de 7 dias para o pai antes do paywall (reduz fricção cold-start)
3. Aceite LGPD em tela dedicada, não checkbox no cadastro (peso jurídico do Art. 14)
4. Web do pai/mãe é secundária — design mobile-first adaptado, sem sidebar densa
5. Admin é separada e utilitária — não usa mesmos tokens emocionais do app pai/mãe
6. Convite por link único compartilhável via WhatsApp (não cadastro manual)
