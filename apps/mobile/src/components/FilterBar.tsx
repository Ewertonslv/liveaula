import { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { colors, spacing } from '@/theme';

export type PeriodPreset = '7d' | '30d' | '90d' | 'custom';

export interface FilterValue {
  period: PeriodPreset;
  from?: string;
  to?: string;
  subjectIds: string[];
}

interface Props {
  visible: boolean;
  onDismiss: () => void;
  initial: FilterValue;
  availableSubjects: { id: string; name: string }[];
  onApply: (filters: FilterValue) => void;
  resultCount: number;
  onDraftChange?: (draft: FilterValue) => void;
}

const PERIOD_OPTIONS: { id: PeriodPreset; label: string }[] = [
  { id: '7d', label: '7 dias' },
  { id: '30d', label: '30 dias' },
  { id: '90d', label: '90 dias' },
];

export function FilterBar({
  visible,
  onDismiss,
  initial,
  availableSubjects,
  onApply,
  resultCount,
  onDraftChange,
}: Props) {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['65%'], []);
  const [period, setPeriod] = useState<PeriodPreset>(initial.period);
  const [subjectIds, setSubjectIds] = useState<string[]>(initial.subjectIds);

  useEffect(() => {
    if (visible) {
      setPeriod(initial.period);
      setSubjectIds(initial.subjectIds);
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible, initial.period, initial.subjectIds]);

  useEffect(() => {
    onDraftChange?.({ period, subjectIds });
  }, [period, subjectIds, onDraftChange]);

  const toggleSubject = (id: string) => {
    setSubjectIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  const applyClick = () => {
    onApply({ period, subjectIds });
    onDismiss();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={visible ? 0 : -1}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onDismiss}
      backgroundStyle={styles.sheetBg}
    >
      <BottomSheetView style={styles.content}>
        <Text style={styles.title}>Filtros</Text>

        <Text style={styles.section}>Período</Text>
        <View style={styles.chipRow}>
          {PERIOD_OPTIONS.map((opt) => {
            const active = opt.id === period;
            return (
              <TouchableOpacity
                key={opt.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setPeriod(opt.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.section}>Matéria</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subjectsRow}
        >
          {availableSubjects.map((s) => {
            const active = subjectIds.includes(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => toggleSubject(s.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {s.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.spacer} />

        <TouchableOpacity
          style={styles.applyButton}
          activeOpacity={0.85}
          onPress={applyClick}
        >
          <Text style={styles.applyText}>
            Aplicar ({resultCount})
          </Text>
        </TouchableOpacity>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 22,
    color: colors.textDark,
    marginBottom: spacing.lg,
  },
  section: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipRow: { flexDirection: 'row', gap: spacing.sm },
  subjectsRow: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    minHeight: spacing.touchTarget,
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.textDark,
  },
  chipTextActive: { color: colors.primary, fontFamily: 'Nunito_600SemiBold' },
  spacer: { flex: 1 },
  applyButton: {
    height: spacing.touchTarget,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  applyText: {
    color: '#FFFFFF',
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
  },
});
