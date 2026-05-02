# Checkpoint 1 — IA + Inventário de telas

## O que está sendo decidido (1 frase)
Aprovar a arquitetura de informação, os 4 fluxos UX críticos e o inventário de **52 telas Must-have + 5 Should-have** antes do SystemBuilder começar a definir tokens e DESIGN.md.

## Resumo (≤150 palavras)
- **Personas mapeadas com tensões opostas:** Professor = UX de produtividade (alta densidade, controle, anti-auditoria); Pai/Mãe = UX de reassurance (baixa densidade, emocional, anti-vigilância); Admin = utilitária pura.
- **Decisão de IA crítica:** FAB central no mobile do professor para "Registrar aula" — fora dos tabs, sempre visível. Reforça que registrar é a ação principal do produto.
- **Cold-start endereçado:** trial de 7 dias para o pai antes do paywall (reduz fricção do convite professor→pai).
- **LGPD Art. 14:** tela dedicada de aceite (não checkbox), scroll completo obrigatório.
- **Inventário:** 52 telas Must-have distribuídas — Professor (Mobile 15 + Web 7), Pai (Mobile 16 + Web 7), Admin (7). Tela hero = P5 Registrar Aula.

## Caso prático
Se aprovar: o SystemBuilder gera o DESIGN.md com 2 conjuntos de tokens semânticos (alta densidade para professor/admin; baixa densidade para pai/mãe), tipografia com pesos diferentes para cada persona, e o SpecGen tem 52 telas claras para especificar — sem voltar a discutir escopo.

## Se rejeitar
Volta para a sub-fase 1B/1D — o que muda:
- Querendo mais telas: adicionamos ao inventário (afeta Fase 3 e 4)
- Querendo menos telas: cortamos Should-have ou pulamos algumas Must
- Querendo mudar IA: refatoramos navegação principal (ex: tirar FAB, mover registrar aula para tab)

## Pontos para sua atenção
1. **FAB de Registrar Aula no mobile do professor** — quer manter como FAB ou prefere botão fixo na tab bar?
2. **Trial de 7 dias do pai** — concorda em deixar pai usar antes de pagar, ou prefere paywall imediato?
3. **Web do pai é secundária (mobile-first adaptado)** — ok ou quer paridade total com mobile?
4. **Tela de aceite LGPD dedicada** — ok ou prefere checkbox inline no cadastro?
5. **52 telas Must-have é muito ou pouco?** — se quiser cortar, melhor agora antes de gastar tokens em specs.

## Fontes
- `output/design/_briefing-pack.md` — contexto consolidado
- `output/design/inventario-telas.md` — todo o detalhe (personas, IA, fluxos, inventário)
