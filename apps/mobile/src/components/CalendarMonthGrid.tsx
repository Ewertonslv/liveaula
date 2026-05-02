import { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

export interface DayCell {
  date: string;
  lessonCount: number;
}

interface Props {
  monthDate: Date;
  daysWithLessons: DayCell[];
  selectedDate: string | null;
  onSelectDay: (isoDate: string) => void;
  onChangeMonth: (direction: 'prev' | 'next') => void;
}

const WEEKDAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function buildGrid(monthDate: Date): { iso: string; day: number; inMonth: boolean }[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dayOfWeek = (firstDay.getDay() + 6) % 7;
  const cells: { iso: string; day: number; inMonth: boolean }[] = [];
  for (let i = 0; i < dayOfWeek; i++) cells.push({ iso: '', day: 0, inMonth: false });
  for (let d = 1; d <= lastDay.getDate(); d++) {
    cells.push({
      iso: `${year}-${pad(month + 1)}-${pad(d)}`,
      day: d,
      inMonth: true,
    });
  }
  while (cells.length % 7 !== 0) cells.push({ iso: '', day: 0, inMonth: false });
  return cells;
}

export function CalendarMonthGrid({
  monthDate,
  daysWithLessons,
  selectedDate,
  onSelectDay,
  onChangeMonth,
}: Props) {
  const cells = useMemo(() => buildGrid(monthDate), [monthDate]);
  const lessonsMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of daysWithLessons) m.set(d.date, d.lessonCount);
    return m;
  }, [daysWithLessons]);

  const monthLabel = monthDate.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => onChangeMonth('prev')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.chevron}
        >
          <Text style={styles.chevronText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity
          onPress={() => onChangeMonth('next')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.chevron}
        >
          <Text style={styles.chevronText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((wd) => (
          <Text key={wd} style={styles.weekday}>{wd}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, idx) => {
          if (!cell.inMonth) {
            return <View key={`empty-${idx}`} style={styles.cell} />;
          }
          const count = lessonsMap.get(cell.iso) ?? 0;
          const isSelected = cell.iso === selectedDate;
          return (
            <TouchableOpacity
              key={cell.iso}
              style={styles.cell}
              onPress={() => onSelectDay(cell.iso)}
              accessibilityLabel={`${cell.day}, ${count} aula${count === 1 ? '' : 's'}`}
            >
              <View
                style={[
                  styles.cellInner,
                  isSelected && styles.cellSelected,
                ]}
              >
                <Text
                  style={[
                    styles.cellText,
                    isSelected && styles.cellTextSelected,
                  ]}
                >
                  {cell.day}
                </Text>
                {count > 0 && !isSelected && <View style={styles.dot} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const CELL_SIZE = 44;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  chevron: {
    width: spacing.touchTarget,
    height: spacing.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronText: { fontSize: 24, color: colors.primary, fontWeight: '600' },
  monthLabel: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    color: colors.textDark,
    textTransform: 'capitalize',
  },
  weekdays: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    fontFamily: 'PlusJakartaSans_400Regular',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  cell: {
    width: `${100 / 7}%`,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: { backgroundColor: colors.primary },
  cellText: {
    fontSize: 14,
    color: colors.textDark,
    fontFamily: 'PlusJakartaSans_500Medium' as any,
  },
  cellTextSelected: { color: '#FFFFFF', fontWeight: '600' },
  dot: {
    position: 'absolute',
    bottom: 2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
