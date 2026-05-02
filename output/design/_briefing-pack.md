# Briefing Pack — /liveaula-design (v1)

> Concatenação dos arquivos de contexto. Lido como **primeiro Read** por todos os 5 papéis da skill `liveaula-design` (Strategist, SystemBuilder, SpecGen, StackAdapter, Chef) para garantir prompt cache hit (TTL 5min Anthropic).
>
> **Não copie este conteúdo inline em prompts subsequentes** — apenas referencie via Read.

---

## 1. Company Profile (`_expxagents/_memory/company.md`)

# Company Profile

## Company
- **Name:** liveaula
- **Product:** liveaula
- **Website:** (em desenvolvimento)
- **Sector:** EdTech / Educação
- **Description:** liveaula é uma plataforma EdTech que integra agendamento de aulas particulares com acompanhamento de progresso em tempo real para pais/mães. Ecossistema de 3 atores: professor, aluno e pai/mãe.

## Target Audience
- **Primary:** Pais e mães com filhos em aulas particulares — R$ 79/mês, mercado 3M+ no Brasil
- **Secondary:** Professores particulares — R$ 19/mês (grátis a partir de 5 alunos com pais pagando)

## Differentials
- Monetização DUPLA (professor + pai/mãe)
- Modelo de REFERRAL viral (professor vira vendedor)
- Acompanhamento em TEMPO REAL (nenhum competidor direto faz)
- Marketplace integrado + agendamento + feedback automático

## Tone of Voice
- **Style:** Direto, empático, focado na dor real dos pais (tranquilidade sobre progresso do filho)
- **Keywords:** acompanhar, progresso, tempo real, tranquilidade, organizado, simples

## Products/Services
- Subscription Pai/Mãe: R$ 79/mês por filho (principal)
- Subscription Professor: R$ 19/mês até 4 alunos / grátis com 5+
- Comissão Professor: R$ 8-15/aluno a partir do 6º
- Premium (futuro): análise avançada, certificados, integração escolas

## Tech Stack (planejada)
- Backend: Node.js + Prisma
- Frontend Professor: Next.js
- Frontend Pai/Mãe: React Native
- Infra: Vercel + Stripe + Firebase + SendGrid

## Status
- Versão: 1.0 (28/04/2026)
- Fase: Pronto para desenvolvimento — MVP 4 semanas

---

## 2. Preferences (`_expxagents/_memory/preferences.md`)

- **User Name:** Ewerton
- **Language:** Portugues (Brasil)
- **IDE:** claude-code
- **Date Format:** DD/MM/YYYY

---

## 3. Product Spec (`squads/desenvolvimento/produto/liveaula/liveaula-dev/product-spec.md`)

# Product Spec — liveaula MVP

**Versão:** 1.0
**Data:** 29/04/2026
**Status:** Aprovado para desenvolvimento

## 1. Visão do Produto

**liveaula** é uma plataforma EdTech para acompanhamento de aulas particulares com 3 atores: professor, pai/mãe e aluno. O professor registra cada aula em menos de 30 segundos; o pai/mãe recebe notificação automática e visualiza o histórico do filho.

**Problema central:** Pais que contratam reforço particular não sabem o que acontece nas aulas — WhatsApp resolve reassurance imediata, mas não entrega histórico estruturado, rastreabilidade de progresso ou registro formal.

**Por que o professor vai usar:** O app reduz o ruído de WhatsApp com pais ansiosos e eleva a imagem profissional do professor — não apenas "dá transparência" (que poderia ser percebida como auditoria).

## 2. Atores e Responsabilidades

| Ator | Dispositivo principal | Papel no produto |
|---|---|---|
| **Professor** | Mobile (iOS + Android) + Web | Registra aulas, gerencia alunos, envia convite ao pai |
| **Pai/Mãe** | Mobile (iOS + Android) + Web | Recebe notificações, acompanha histórico, paga assinatura |
| **Aluno** | — (não tem app no MVP) | Representado pela conta do pai/mãe |
| **Admin** | Web (interno) | Gestão de usuários, assinaturas, métricas |

## 3. Modelo de Negócio

| Plano | Valor | Condição |
|---|---|---|
| Pai/mãe — por filho | R$ 79/mês | Acesso completo ao histórico e notificações |
| Professor — padrão | R$ 19/mês | Gestão de alunos e registro de aulas |
| Professor — gratuidade | R$ 0 | Quando 5+ pais pagantes vinculados |
| Professor — comissão | R$ 8–15/aluno a partir do 6º | Receita adicional por escala |

> **Preço não validado por WTP real** — testar com primeiros usuários antes de fixar.

## 4. Funcionalidades por Ator

### 4.1 Professor

| Feature | Prioridade | Notas |
|---|---|---|
| Cadastro + perfil profissional | Must-have | Nome, foto, matéria(s), bio curta |
| Login / autenticação | Must-have | JWT + refresh token |
| Cadastro de alunos | Must-have | Nome, série, matéria, contato |
| Convite ao pai/mãe (link) | Must-have | Único mecanismo de cold start |
| **Registrar aula** | Must-have | Core loop — < 30 segundos obrigatório |
| Dashboard de alunos | Must-have | Lista com status: aula hoje / última aula há X dias / sem pai vinculado |
| Histórico de aulas por aluno | Must-have | Linha do tempo com filtros |
| Agenda (próximas aulas) | Should-have | Vista semana/mês |
| Resumo financeiro | Should-have | Quanto recebeu por aluno/mês |
| Relatório de progresso (PDF simples) | Could-have | Para envio ao pai fora do app |
| Notificação de pai inativo | Could-have | Alerta quando pai não abre app há 7 dias |

### 4.2 Pai/Mãe

| Feature | Prioridade | Notas |
|---|---|---|
| Onboarding via link de convite | Must-have | Única entrada — nenhum cadastro sem convite no MVP |
| Login / autenticação | Must-have | JWT + refresh token |
| Perfil do filho | Must-have | Foto, nome, série, matéria(s) |
| **Notificação push pós-aula** | Must-have | Motivo primário de abrir o app |
| Feed de aulas (cronológico) | Must-have | Todas as aulas do filho |
| Detalhe de aula | Must-have | Conteúdo, duração, observações do professor |
| Assinatura / pagamento | Must-have | Recorrência mensal por filho |
| Histórico filtrado (por matéria / período) | Should-have | Retenção de longo prazo |
| Gráfico de progresso simples | Should-have | Contra a ansiedade quando tudo vai bem |
| Múltiplos filhos | Should-have | Um pai, vários filhos com professores diferentes |
| Contato com professor via plataforma | Could-have | Risco: vira outro WhatsApp |

### 4.3 Admin (Web interno)

| Feature | Prioridade |
|---|---|
| Lista de professores | Must-have |
| Lista de pais e assinaturas | Must-have |
| Métricas: DAU, churn, conversão | Must-have |
| Ativar/desativar conta | Must-have |

## 5. A Tela Mais Importante — Registrar Aula (Professor)

Esta tela define o sucesso ou não do produto. Requisitos inegociáveis:

- **Tempo de preenchimento:** < 30 segundos
- **Campos obrigatórios (máximo 4):**
  1. Aluno (seleção da lista — não digitar)
  2. Matéria (seleção — não digitar)
  3. Duração (opções pré-definidas: 45min / 1h / 1h30 / 2h)
  4. O que foi feito (texto livre, máximo 280 caracteres)
- **Campo opcional:**
  - Observação para o pai (texto livre)
  - Humor/engajamento do aluno (ícone rápido: 😕 😐 😊)
- **Ação de envio:** 1 botão → notificação ao pai automática
- **Feedback imediato:** confirmação + preview da notificação enviada

## 6. Telas Principais

### Professor — App Mobile

| Tela | Descrição |
|---|---|
| Onboarding | Cadastro, foto de perfil, matéria(s) que leciona |
| Login | E-mail + senha, "esqueci senha" |
| Dashboard | Grid/lista de alunos com badges de status |
| Perfil do aluno | Histórico de aulas, dados, link para convidar pai |
| **Registrar aula** | Formulário rápido (< 30s) + confirmação |
| Agenda | Calendário com aulas agendadas e realizadas |
| Financeiro | Tabela: aluno × mês × status de pagamento |
| Configurações | Perfil, plano, notificações, sair |

### Pai/Mãe — App Mobile + Web

| Tela | Descrição |
|---|---|
| Onboarding (via convite) | Criar conta, foto, vincular ao filho/professor |
| Login | E-mail + senha |
| Feed | Lista cronológica de aulas — card por aula |
| Detalhe de aula | Tudo que o professor registrou |
| Perfil do filho | Foto, matérias, histórico geral, progresso |
| Notificações | Central de alertas |
| Assinatura | Plano atual, histórico de cobranças, trocar cartão |
| Configurações | Perfil, filho(s), notificações, sair |

## 7. Fora do MVP (explicitamente)

- Videochamada integrada
- Chat / mensagens dentro do app
- Upload de material de estudo / exercícios / PDFs
- Gamificação para alunos
- App separado para o aluno
- Marketplace de professores (busca pública)
- Integração com escola / boletim
- Reconhecimento facial / check-in automático
- Agendamento de aulas pelo pai

## 8. Stack Técnica

| Componente | Tecnologia | Notas |
|---|---|---|
| Backend API | Node.js + Fastify + Prisma + PostgreSQL | Monorepo: `/apps/api` |
| Frontend Web | Next.js 14+ App Router + TypeScript + Tailwind | `/apps/web` — painel do professor + pai/web |
| Mobile | React Native + Expo (managed workflow) + TypeScript | `/apps/mobile` — iOS + Android |
| Auth | JWT (15min) + refresh token (7 dias, httpOnly cookie) | — |
| Push notifications | Firebase Cloud Messaging via Expo Notifications | — |
| Pagamentos | A definir: Pagar.me, Asaas ou Stripe | Avaliar suporte a recorrência BR |
| Storage | Cloudinary ou S3 (fotos de perfil) | — |

## 9. Restrições e Riscos Conhecidos (da Validação)

| Risco | Classificação | Mitigation no MVP |
|---|---|---|
| Professor vê registro como auditoria | CRÍTICO | UX do professor centrada em benefício para ele, não para o pai |
| Registro de aula leva > 3 min | CRÍTICO | Design obsessivo: < 30s, 4 campos, seleção visual |
| Churn do pai quando filho vai bem | IMPORTANTE | Gráfico de progresso + feature de conquistas simples (S1+) |
| Cold start (professor precisa convidar pai) | IMPORTANTE | Janelas de onboarding: março e agosto |
| WhatsApp já resolve reassurance imediata | IMPORTANTE | Diferencial: histórico estruturado + progresso longo prazo |
| Dados de menores — LGPD Art. 14 | CRÍTICO (legal) | Consentimento explícito no onboarding do pai; DPO definido |
| Preço R$ 79/mês sem validação de WTP | IMPORTANTE | Testar com primeiros 20 pais antes de fixar |

## 10. Critérios de Lançamento

- [ ] Professor consegue registrar aula em < 30 segundos
- [ ] Pai recebe push notification em < 5 segundos após registro
- [ ] Fluxo de convite professor → pai funciona sem assistência
- [ ] Pagamento recorrente funcionando (1 ciclo completo testado)
- [ ] LGPD: consentimento explícito no onboarding de ambos os atores
- [ ] Funciona em iOS 16+ e Android 12+
- [ ] Testes E2E dos 5 fluxos críticos passando

---

## 4. Squad Memory (`squads/desenvolvimento/produto/liveaula/liveaula-dev/_memory/memories.md`)

# Squad Memory — liveaula Dev

## Contexto
Squad de desenvolvimento completo do produto liveaula.
Criado em: 29/04/2026

## Decisões Tomadas
- Stack definida: Node.js + Prisma + PostgreSQL (API), Next.js 14+ (web), React Native + Expo (mobile iOS + Android)
- Paulo Lima (DevOps) é agnóstico de plataforma — não lock-in em Vercel
- Diego Moreira (Advogado do Diabo) é o último agente — revisa tudo antes de aprovar

## Execuções
(nenhuma execução registrada ainda)

## Aprendizados
(será preenchido após a primeira execução)

---

**FIM DO BRIEFING PACK** — total de 4 fontes consolidadas. Próximo papel deve ler este arquivo como primeiro Read.
