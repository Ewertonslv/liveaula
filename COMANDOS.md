# Comandos ExpxAgents — liveaula

## Onboarding e configuração

```bash
npx expxagents init              # inicializa o ExpxAgents no projeto
expxagents onboarding            # configura perfil da empresa
```

## Squads

```bash
/expxagents create               # criar um novo squad (abre o Arquiteto)
/expxagents list                 # listar todos os squads
/expxagents run <nome>           # executar um squad
/expxagents edit <nome>          # editar um squad existente
/expxagents delete <nome>        # deletar um squad
```

## Squads criados

| Squad | Comando para rodar | Descrição |
|---|---|---|
| Pesquisa de mercado | `/liveaula-pesquisa-mercado` | Valida mercado, hipóteses, modelo de negócio e passa pelo advogado do diabo |
| Design liveaula | `/liveaula-design` | Sistema de design, wireframes textuais e specs de componentes para Web (Next.js) + Mobile (React Native) |
| Dev liveaula | `/liveaula-dev` | Squad de desenvolvimento completo (12 papéis em 3 fases: Planejamento → Construção → Entrega). Recebe handoff do liveaula-design e entrega feature implementada, testada, revisada, segura, observável, documentada e pronta para deploy |

## Skills

```bash
/expxagents skills               # ver skills disponíveis
/expxagents install <nome>       # instalar uma skill
/expxagents uninstall <nome>     # remover uma skill
```

## Dashboard e Virtual Office

```bash
/expxagents dashboard            # abre o painel de controle
/expxagents virtual-office       # abre o escritório virtual no navegador
```

## MCP (integrações)

```bash
expxagents mcp setup <id>        # configurar integração (github, slack, notion, etc.)
```

## Menu principal

```bash
/expxagents                      # abre o menu principal
/expxagents help                 # ajuda
```
