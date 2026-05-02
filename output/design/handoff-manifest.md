# Handoff Manifest — liveaula Design

```yaml
design:
  concluido: true
  aprovado_em: "2026-04-29"
  delta_should_have_em: "2026-04-30"

  # Arquivos de especificação
  design_md_path: squads/desenvolvimento/produto/liveaula/liveaula-dev/DESIGN.md
  inventario_path: output/design/inventario-telas.md
  web_specs_path: output/design/web-component-specs.md
  mobile_specs_path: output/design/mobile-component-specs.md

  # Specs de telas
  specs:
    hero: output/design/spec-P5-registrar-aula.md
    professor_mobile: output/design/spec-telas-professor-mobile.md
    professor_web: output/design/spec-telas-professor-web.md
    pai_mobile: output/design/spec-telas-pai-mobile.md
    pai_web_admin: output/design/spec-telas-pai-web-admin.md
    should_have_delta: output/design/spec-should-have-deltas.md  # P14, P15, M15, M16, M17

  # Telas geradas
  telas_must_have: 52
  telas_should_have: 5  # P14, P15, M15, M16, M17 — geradas em 2026-04-30 no delta
  telas_geradas:
    professor_mobile: [P1, P2, P3, P4, P5, P6, P7, P8, P9, P10, P11, P12, P13, P14, P15, P16, P17]
    professor_web:    [PW1, PW2, PW3, PW4, PW5, PW6, PW7]
    pai_mobile:       [M1, M2, M3, M4, M5, M6, M7, M8, M9, M10, M11, M12, M13, M14, M15, M16, M17, M18, M19]
    pai_web:          [MW1, MW2, MW3, MW4, MW5, MW6, MW7]
    admin_web:        [A1, A2, A3, A4, A5, A6, A7]
  componentes_novos_v1_2:
    - CalendarMonthGrid    # P14
    - FilterBar            # M15
    - MiniBarChart         # M16
    - ChildSwitcher        # M17
  endpoints_novos_v1_2:
    - "GET /me/billing/parents"             # P15
    - "GET /lessons/student/:id/stats"      # M16
  schemas_estendidos_v1_2:
    - "listLessonsQuerySchema: + from?, to?, subjectIds[]"

  # Sistema de design
  versao_design_md: "1.1"
  tokens:
    cores_obrigatorias: 15
    cores_adicionais: 11      # dark mode + gradientes aurora + accent
    espacamento: 6
    border_radius: 5
    fontes: 3
    motion: 7
    componentes: 11           # 9 base + StreakBadge + CelebrationOverlay
    anti_patterns: 12         # mínimo era 8

  # Stack de implementação
  stacks:
    web:
      framework: "Next.js 14 App Router"
      ui: "Tailwind CSS"
      linguagem: "TypeScript"
      autenticacao: "httpOnly cookie + middleware"
      data_fetching: "Server Components + React Query (client)"
    mobile:
      framework: "React Native + Expo (managed)"
      navegacao: "Expo Router (file-based)"
      linguagem: "TypeScript"
      animacoes: "React Native Reanimated"
      offline: "expo-sqlite + expo-task-manager"
      push: "FCM via Expo Notifications"
      haptics: "expo-haptics"
    backend:
      nota: "Fastify + Prisma + PostgreSQL — fora do escopo deste design sprint"

  # Decisões de design (não reverter)
  decisoes_irreversiveis:
    - "FAB flutuante para Registrar Aula — não tab, não menu"
    - "Trial 7 dias antes do paywall — reduz fricção cold-start"
    - "LGPD Art.14 em tela dedicada com scroll obrigatório — peso jurídico"
    - "Pai/mãe sempre em light mode — emoção sobre conveniência"
    - "Registrar Aula < 30s com 4 interações no caminho rápido"
    - "Chips com desbloqueio progressivo — reduz sobrecarga cognitiva"
    - "Coreografia de 4200ms pós-envio — comunicação de valor, não só confirmação técnica"
    - "Web do pai é mobile-first adaptado — sem sidebar, coluna centrada"

  # Próximo passo
  proximo: liveaula-dev
  proximo_skill: ".claude/skills/liveaula-dev/SKILL.md"
  entrada_esperada: "handoff-manifest.md + DESIGN.md + specs de telas"
```

---

## Checklist final (Chef)

### Sistema de design
- [x] DESIGN.md v1.1 cobre todos os 15 tokens de cor obrigatórios
- [x] Tokens adicionais (dark mode, aurora, accent) documentados
- [x] 7 tokens de motion (spring presets + durations)
- [x] 11 componentes com todos os estados
- [x] 12 anti-patterns (mínimo era 8)
- [x] `output/design/token-checklist.md` gerado e verificado

### Telas
- [x] 52 telas Must-have especificadas
- [x] Tela hero P5 recebeu 2x atenção (spec dedicada + coreografia completa)
- [x] Anti-AI checklist 100% aplicado em todas as telas
- [x] Estados vazio / loading / erro em todas as telas relevantes
- [x] Estado offline documentado onde aplicável (professor mobile)
- [x] Toque mínimo 44px documentado nos componentes mobile
- [x] Diferenças iOS vs Android documentadas

### Stack specs
- [x] `web-component-specs.md` gerado (Next.js, TypeScript props, Tailwind, Server vs Client)
- [x] `mobile-component-specs.md` gerado (RN, StyleSheet, useSafeAreaInsets, haptics, offline)

### Checkpoints
- [x] Checkpoint 01 — IA + Inventário (aprovado)
- [x] Checkpoint 02 — DESIGN.md v1.1 (aprovado)
- [x] Checkpoint 03 — Tela hero P5 (aprovado implicitamente pelo usuário)
- [x] Checkpoint 04 — Todas as telas (gerado)

**Resultado: design sprint concluído. Handoff para liveaula-dev autorizado.**
