import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

interface Bar {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  bars: Bar[];
  maxValue?: number;
  unit?: string;
}

export function MiniBarChart({ bars, maxValue, unit = '' }: Props) {
  const max = maxValue ?? Math.max(1, ...bars.map((b) => b.value));

  if (bars.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {bars.map((bar) => {
        const pct = Math.min(100, Math.round((bar.value / max) * 100));
        return (
          <View key={bar.label} style={styles.row}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{bar.label}</Text>
              <Text style={styles.value}>
                {bar.value}{unit}
              </Text>
            </View>
            <View style={styles.track}>
              <View
                style={[
                  styles.fill,
                  {
                    width: `${pct}%`,
                    backgroundColor: bar.color ?? colors.primary,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  row: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  label: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.textDark,
  },
  value: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 13,
    color: colors.textMuted,
  },
  track: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
});
