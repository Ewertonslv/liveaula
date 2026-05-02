import { StyleSheet, ViewStyle } from 'react-native';

export const colors = {
  primary: '#1A6B74',
  primaryHover: '#155a62',
  primaryMuted: '#e8f4f5',
  accent: '#D95F3B',
  surfaceProfessor: '#F1F5F9',
  surfaceProfessorAlt: '#F8FAFC',
  surfaceParent: '#FFFBF5',
  surfaceParentAlt: '#FBF6EE',
  surfaceDark: '#0D1117',
  textDark: '#0F172A',
  textLight: '#E6EDF3',
  textMuted: '#64748B',
  border: '#E2E8F0',
  // v1.2 whisper borders — quase invisíveis, criam separação sem peso
  borderWhisperParent: 'rgba(28,25,23,0.06)',
  borderWhisperProfessor: 'rgba(15,23,42,0.06)',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  touchTarget: 44,
  fabBottom: 88,
};

// v1.2 shadow stack — tinted brand color para o lado pai, neutro para professor
export const shadows: Record<string, ViewStyle> = {
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
};

export const typography = StyleSheet.create({
  displayProfessor: { fontFamily: 'PlusJakartaSans_700Bold', fontSize: 32 },
  h1Professor: { fontFamily: 'PlusJakartaSans_600SemiBold', fontSize: 24 },
  bodyProfessor: { fontFamily: 'PlusJakartaSans_400Regular', fontSize: 14 },
  displayParent: { fontFamily: 'Nunito_700Bold', fontSize: 28 },
  h1Parent: { fontFamily: 'Nunito_600SemiBold', fontSize: 22 },
  bodyParent: { fontFamily: 'Nunito_400Regular', fontSize: 16 },
});
