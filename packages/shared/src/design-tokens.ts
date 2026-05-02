export const colors = {
  primary: '#1A6B74', primaryHover: '#145760', primaryMuted: '#E0F2F4', primaryText: '#FFFFFF',
  accent: '#D95F3B', accentHover: '#BA4E2F', accentMuted: '#FDEEE9',
  professor: {
    surface: '#F1F5F9',
    surfaceRaised: '#FFFFFF',
    surfaceAlt: '#F8FAFC',
    text: '#0F172A',
    textMuted: '#475569',
    border: '#CBD5E1',
    borderWhisper: 'rgba(15,23,42,0.06)',
  },
  professorDark: {
    surface: '#0D1117',
    surfaceRaised: '#161B22',
    surfaceAlt: '#11161D',
    text: '#E6EDF3',
    textMuted: '#8D96A0',
    border: '#30363D',
    borderWhisper: 'rgba(230,237,243,0.07)',
  },
  parent: {
    surface: '#FFFBF5',
    surfaceRaised: '#FFFFFF',
    surfaceAlt: '#FBF6EE',
    text: '#1C1917',
    textMuted: '#57534E',
    border: '#E7E5E4',
    borderWhisper: 'rgba(28,25,23,0.06)',
  },
  success: '#15803D', successMuted: '#DCFCE7', warning: '#B45309', warningMuted: '#FEF3C7',
  error: '#B91C1C', errorMuted: '#FEE2E2',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40, '2xl': 64, touchTarget: 44, fabBottom: 88 } as const;
export const radius = { sm: 4, md: 6, lg: 12, xl: 20, full: 9999 } as const;
export const typography = { fontFamily: { professor: 'Plus Jakarta Sans', parent: 'Nunito', admin: 'Inter', mono: 'DM Mono' } } as const;
export const gradients = {
  cardMorning: ['#FFF9F0', '#F0F9FF'] as const,
  cardAfternoon: ['#FFF9F0', '#F5F0FF'] as const,
  cardEvening: ['#FFF5F0', '#FFF9F0'] as const,
  celebration: ['#FDEEE9', '#E0F2F4'] as const,
} as const;

// v1.2 — Shadow stack inspired by Notion + Stripe (multi-layer, brand-tinted)
// Pai: tinted with primary teal — feels emotionally branded, not generic neutral
// Professor: neutral subtle — produtividade não precisa de afetividade
export const shadows = {
  parentSoft: {
    shadowColor: '#1A6B74',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  parentLifted: {
    shadowColor: '#1A6B74',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 4,
  },
  professorSoft: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  // CSS-side equivalents for web (Tailwind utilities will reference these)
  parentSoftCss: '0 2px 8px rgba(26,107,116,0.08)',
  parentLiftedCss: '0 6px 16px rgba(26,107,116,0.10), 0 2px 4px rgba(26,107,116,0.06)',
  professorSoftCss: '0 1px 4px rgba(15,23,42,0.04)',
} as const;
