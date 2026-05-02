import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A6B74',
          hover: '#155a62',
          muted: '#e8f4f5',
        },
        accent: {
          DEFAULT: '#D95F3B',
          hover: '#BA4E2F',
          muted: '#FDEEE9',
        },
        surface: {
          professor: '#F1F5F9',
          'professor-alt': '#F8FAFC',
          'professor-raised': '#FFFFFF',
          parent: '#FFFBF5',
          'parent-alt': '#FBF6EE',
          'parent-raised': '#FFFFFF',
          dark: '#0D1117',
          'dark-raised': '#161B22',
          'dark-alt': '#11161D',
        },
        // v1.2 whisper borders — usar como `border-whisper-parent` etc.
        'border-whisper': {
          parent: 'rgba(28,25,23,0.06)',
          professor: 'rgba(15,23,42,0.06)',
          'professor-dark': 'rgba(230,237,243,0.07)',
        },
        // Warm parent text scale (Notion/Claude inspired)
        warm: {
          900: '#1C1917',
          700: '#44403C',
          600: '#57534E',
          500: '#78716C',
          400: '#A8A29E',
          300: '#D6D3D1',
          200: '#E7E5E4',
          100: '#F5F5F4',
        },
      },
      fontFamily: {
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        // v1.2 — radius-xl para cards aurora (papel-feel)
        'aurora': '20px',
      },
      boxShadow: {
        // v1.2 brand-tinted shadows (Stripe-inspired multi-layer)
        'parent-soft': '0 2px 8px rgba(26,107,116,0.08)',
        'parent-lifted': '0 6px 16px rgba(26,107,116,0.10), 0 2px 4px rgba(26,107,116,0.06)',
        'parent-aurora': '0 8px 24px rgba(26,107,116,0.12), 0 2px 6px rgba(217,95,59,0.05)',
        'professor-soft': '0 1px 4px rgba(15,23,42,0.04)',
        'professor-card': '0 2px 6px rgba(15,23,42,0.05), 0 1px 2px rgba(15,23,42,0.03)',
      },
      backgroundImage: {
        // v1.2 aurora gradients para o lado pai (cards, hero sections)
        'aurora-morning': 'linear-gradient(135deg, #FFF9F0 0%, #F0F9FF 100%)',
        'aurora-afternoon': 'linear-gradient(135deg, #FFF9F0 0%, #F5F0FF 100%)',
        'aurora-evening': 'linear-gradient(135deg, #FFF5F0 0%, #FFF9F0 100%)',
        'aurora-celebration': 'linear-gradient(135deg, #FDEEE9 0%, #E0F2F4 100%)',
      },
    },
  },
  plugins: [],
};

export default config;
