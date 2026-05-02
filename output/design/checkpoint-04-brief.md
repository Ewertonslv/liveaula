# Checkpoint 4 — Todas as Telas Must-have Especificadas

## O que está sendo decidido (1 frase)
Aprovar as specs de 52 telas (51 + hero P5) antes de gerar as specs de implementação por stack (Next.js e React Native).

## Resumo (≤150 palavras)
- **52 telas especificadas:** 15 Professor Mobile + 7 Professor Web + 16 Pai Mobile + 7 Pai Web + 7 Admin Web.
- **Identidade visual consistente:** Professor usa surface cinza frio + alta densidade; Pai usa surface creme (#FFFBF5) + aurora gradients + baixa densidade; Admin é utilitário, sem gradientes.
- **Anti-AI checklist aplicado em 100% das telas** — nenhuma tela com centered-card-on-gradient, todas com mínimo 2 pesos tipográficos, tokens semânticos em todos os lugares.
- **5 arquivos de spec:** `spec-P5-registrar-aula.md` (hero) + `spec-telas-professor-mobile.md` + `spec-telas-professor-web.md` + `spec-telas-pai-mobile.md` + `spec-telas-pai-web-admin.md`.
- **Estados cobertos:** vazio, loading (skeletons), erro (retry), offline (mobile), paywall (pai) — em todas as telas relevantes.

## Caso prático
Se aprovar: StackAdapter gera `web-component-specs.md` (Server vs Client Component, TypeScript props, Tailwind classes) e `mobile-component-specs.md` (StyleSheet, useSafeAreaInsets, iOS vs Android). O desenvolvedor implementa sem ambiguidade.

## Se rejeitar, o que acontece?
Volta para sub-fase 3B — o que pode mudar:
- **Tela específica errada:** refazer só aquela tela (as demais estão aprovadas)
- **Padrão visual do pai muito baixo:** adicionar mais gradientes aurora nos cards
- **Admin muito simples:** adicionar gráficos (Chart.js) no A2 Dashboard

## Fontes
- `output/design/spec-P5-registrar-aula.md` — tela hero
- `output/design/spec-telas-professor-mobile.md` — P1–P17
- `output/design/spec-telas-professor-web.md` — PW1–PW7
- `output/design/spec-telas-pai-mobile.md` — M1–M19
- `output/design/spec-telas-pai-web-admin.md` — MW1–MW7 + A1–A7
