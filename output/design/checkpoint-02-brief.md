# Checkpoint 2 — DESIGN.md v1.1 (Sistema de Design + Tendências 2025)

## O que está sendo decidido (1 frase)
Aprovar o sistema de design completo do liveaula — paleta bifurcada, dark mode, gradientes aurora, motion system, 11 componentes — antes do SpecGen especificar as 52 telas.

## Resumo (≤150 palavras)
- **3 modos visuais:** professor light (alta densidade, cinza frio), professor dark (produtividade noturna, GitHub-dark calibrado), pai/mãe light (baixa densidade, creme quente). Pai sempre light — emoção sobre conveniência.
- **Cor accent terracotta `#D95F3B`:** usada apenas em celebração e streak. Não conflita com WhatsApp green nem PIX blue. Tendência 2025 no lugar do laranja genérico.
- **Gradientes aurora para cards pai:** sutil, baseado na hora da aula (morning/afternoon/evening). O pai não vai perceber conscientemente, mas vai sentir.
- **Sistema de motion com spring physics:** 4 presets (snappy, modal, bounce, micro). Coreografia completa de 4200ms para o momento pós-registro.
- **2 componentes novos:** StreakBadge (gamification adulta — dias consecutivos) e CelebrationOverlay (confetti apenas em 3 gatilhos, não em toda ação).
- **12 anti-patterns**, incluindo AP-11 (gamification infantil) e AP-12 (ease linear).

## Caso prático
Se aprovar: o SpecGen especifica P5 (Registrar Aula) com FAB `#1A6B74` shadow colorida `rgba(26,107,116,0.4)`, BottomSheet spring.modal, botão loading, coreografia de 4200ms pós-envio com StreakBadge pulsando e Notification Preview iMessage-style sobre gradient-celebration. Cada detalhe já definido — sem inventar na spec.

## Se rejeitar
Volta para sub-fase 2A — o que muda:
- **Cor accent errada:** trocar `#D95F3B` e propagar em StreakBadge e CelebrationOverlay
- **Dark mode não desejado:** remover tokens `*-dark` e mencionar no AP
- **Gradientes aurora excessivos:** reduzir para apenas 1 variante ou eliminar
- **Springs não desejados:** substituir por durations fixas (regressão de qualidade)
- **StreakBadge não desejado:** remover componente + AP-11

## Fontes
- `squads/desenvolvimento/produto/liveaula/liveaula-dev/DESIGN.md` — documento completo v1.1
- `output/design/token-checklist.md` — 26 tokens de cor, 11 componentes, 12 anti-patterns ✅
