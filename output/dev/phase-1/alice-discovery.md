## Confidence: 0.95

## Summary
MVP completo da plataforma liveaula: fluxo crítico professor→pai (registro de aula <30s, notificação <5s) + onboarding, autenticação, pagamento recorrente e conformidade LGPD Art.14 em web+mobile.

## Feature type
fullstack

## Complexity
critical

## Affected actors
- Professor (mobile + web)
- Pai/Mãe (mobile + web)
- Admin (web interno)
- Aluno (representado pelo pai, sem app próprio no MVP)

## Affected areas
- api
- web
- mobile
- infra

## Acceptance criteria
- Professor registra aula em <30s (timer test: 4 campos obrigatórios: aluno, matéria, duração, descrição)
- Pai recebe push notification em <5s após registro de aula (FCM latência baseline)
- Fluxo cold start completo: professor cria aluno → gera link convite → pai aceita convite → cria conta → vincula professor (sem assistência humana)
- Assinatura pai recorrente funcionando: 1º pagamento + renovação automática em 30 dias testada com provedor real
- Consentimento LGPD Art.14 explícito: checkboxes no onboarding do pai e professor, termos de uso vinculados, sem pré-marcados
- Compatibilidade garantida: iOS 16+ e Android 12+ (Expo testado em 2+ versões acima do mínimo)
- 5 fluxos críticos com testes E2E automáticos passando:
  1. Professor cadastro → registra aula → notificação entregue ao pai
  2. Pai onboarding via link → aceita → faz pagamento → acesso liberado
  3. Admin visualiza lista de professores com conversão/churn
  4. Logout e re-login (refresh token 7 dias funciona)
  5. Pai visualiza histórico filtrado de aulas do filho por matéria/período

## Out of scope
- Videochamada integrada
- Chat/mensagens diretas dentro da plataforma
- Upload de material educacional (PDFs, exercícios)
- Gamificação para alunos (streaks, badges no MVP)
- App nativo separado para aluno
- Marketplace público de professores
- Integração com escolas/boletins
- Reconhecimento facial ou check-in automático
- Agendamento de aulas pelo pai
- Relatório de progresso em PDF
- Notificação de pai inativo (7+ dias sem abrir app)
- Contato direto professor↔pai via plataforma (risco de virar WhatsApp 2.0)
- Múltiplos filhos por pai (fase 1: 1 pai = 1 filho)
- Gráfico de progresso/conquistas (fase 2+)

## Concerns
- **Latência de notificação (<5s):** Dependência crítica em FCM via Expo Notifications; requer monitoramento em produção com SLA. Pipeline: professor submete → API valida → publica em FCM → Expo delivery. Possível bottleneck: propagação Expo (2-3s base + rede). Mitigação: job queue (Bull/Temporal) + logging de cada etapa.
- **Conformidade LGPD Art.14 (dados de menores):** Risco legal. Requer: (a) consentimento explícito do detentor (pai), (b) não compartilhar dados sem consentimento expansivo, (c) direito de exclusão implementado no admin. Sem DPO nomeado formalmente, qualquer auditoria falha. Decisão: implementar toggle de consentimento + audit log, mas nomear DPO é responsabilidade externa (legal/compliance).
- **Cold start (professor precisa convidar pai):** Fluxo não-viral. Se professor não convidar ninguém, plataforma não gera uso. Sem dados iniciais, curva de adoção é lenta. Mitigação de negócio (fora do escopo dev): janelas de lançamento em março/agosto (volta às aulas), marketing direcionado.
- **Preço R$ 79/mês não validado:** Willingness-to-pay não testada com usuários reais. Risco de churn alto se muito caro ou percepção de low-value. Implementação deve permitir fácil mudança de preço (feature flag ou admin panel de configuração).
- **Validação de pagamento recorrente:** Provedor a decidir (Pagar.me/Asaas/Stripe). BR-specific: Pix, boleto recorrente são diferenciais. Todas têm rate limiters diferentes. Testes E2E devem usar sandbox real do provedor, não mock.
- **Stack decision: Refresh token em httpOnly cookie (7 dias):** Segurança boa, mas incompatível com alguns clients (React Native via Expo pode ter limitações de cookie persistence). Requer validação prática no Expo — possivelmente usar SecureStore como fallback.
- **Design system bifurcado (professor high-density + pai warm):** Aumenta surface de teste (2 modos visuais + dark mode professor = 3 variantes visuais). Testes Playwright/Detox precisam cobrir ambas as personas. Risco: inconsistências visuais pós-implementação.
- **Dados do aluno só acessíveis via pai:** Aluno não tem app. Sem conta própria ou recuperação de dados, qualquer erro gera perda (vínculo pai-professor quebrado = histórico inacessível). Requer backup/recovery. Decisão: implementar relink de professor dentro da conta do pai.
