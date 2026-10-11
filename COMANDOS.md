# Comandos — liveaula

Skills locais do projeto (ficam em `.claude/skills/`, só funcionam com o Claude Code aberto na raiz do repo):

| Squad | Comando para rodar | Descrição |
|---|---|---|
| Pesquisa de mercado | `/liveaula-pesquisa-mercado` | Valida mercado, hipóteses, modelo de negócio e passa pelo advogado do diabo |
| Design liveaula | `/liveaula-design` | Sistema de design, wireframes textuais e specs de componentes para Web (Next.js) + Mobile (React Native) |
| Dev liveaula | `/liveaula-dev` | Squad de desenvolvimento completo (12 papéis em 3 fases: Planejamento → Construção → Entrega). Recebe handoff do liveaula-design e entrega feature implementada, testada, revisada, segura, observável, documentada e pronta para deploy |

Contexto lido pelas três skills: `_expxagents/_memory/company.md` e `_expxagents/_memory/preferences.md`.
Saídas históricas das rodadas ficam em `output/` e `squads/`.
