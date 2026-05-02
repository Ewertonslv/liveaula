# Checkpoint 3 — Tela Hero: Registrar Aula (P5)

## O que está sendo decidido (1 frase)
Aprovar a especificação completa da tela mais importante do produto antes de especificar as 51 telas restantes.

## Resumo (≤150 palavras)
- **6 campos especificados:** 4 obrigatórios (aluno por chip, matéria por chip, duração por chip, conteúdo textarea 280 chars) + 2 opcionais (humor emoji, obs para o pai). Campos desbloqueados progressivamente — menos sobrecarga cognitiva, mais velocidade.
- **Smart defaults:** último aluno destacado, última matéria e duração pré-selecionadas. Caminho rápido (retorno): 4 interações, ~15–20s. Caminho completo: 6 interações, ~25–30s.
- **Coreografia pós-envio de 4200ms:** botão loading → haptic success → BottomSheet fecha (spring.modal) → toast "Aula registrada" → Notification Preview iMessage-style sobre gradient-celebration → StreakBadge pulsa → (primeiro registro: confetti).
- **5 estados cobertos:** normal, offline (SQLite local), erro de rede, aluno sem pai (aula salva mesmo assim), lista de alunos vazia (FAB oculto no Dashboard).
- **Anti-AI checklist 100%** — 8/8 itens verificados.

## Caso prático
Se aprovar: o StackAdapter implementa o BottomSheet com `spring.modal` (damping=26, stiffness=200), chips com `spring.snappy`, coreografia em `Reanimated.withSpring()` sequenciado, `expo-sqlite` para offline e o endpoint `POST /aulas` com os 7 campos do contrato de API definido na spec.

## Se rejeitar, o que acontece?
Volta para sub-fase 3A — o que pode mudar:
- **Fluxo de chips muito complexo:** simplificar para selects nativos (mais simples, menos rápido)
- **Coreografia muito longa (4200ms):** encurtar — remover Notification Preview ou StreakBadge
- **Campos opcionais visíveis por padrão:** colapsar em "Mostrar mais ›" para reduzir altura
- **Auto-focus no textarea:** desabilitar se quiser que professor controle o ritmo manualmente

## Fontes
- `output/design/spec-P5-registrar-aula.md` — especificação completa com wireframe, campos, estados, coreografia, API contract
- `squads/desenvolvimento/produto/liveaula/liveaula-dev/DESIGN.md` — seções 4.8 (BottomSheet), 4 (Motion), 5.1 (Button), 5.9 (Toast), 5.10 (StreakBadge), 5.11 (CelebrationOverlay)
