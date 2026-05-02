import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '@/theme';

export interface ChildOption {
  studentId: string;
  name: string;
  gradeLevel: string;
  lessonCount30d?: number;
  avatarUrl?: string;
}

interface Props {
  children: ChildOption[];
  selectedChildId: string | null;
  onSelect: (studentId: string) => void;
  onAddChild: () => void;
}

export function ChildSwitcher({
  children,
  selectedChildId,
  onSelect,
  onAddChild,
}: Props) {
  if (children.length < 2) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {children.map((child) => {
        const selected = child.studentId === selectedChildId;
        return (
          <TouchableOpacity
            key={child.studentId}
            style={[styles.card, selected && styles.cardSelected]}
            activeOpacity={0.85}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              onSelect(child.studentId);
            }}
          >
            <Text
              style={[styles.name, selected && styles.nameSelected]}
              numberOfLines={1}
            >
              {child.name}
            </Text>
            <Text style={styles.meta}>{child.gradeLevel}</Text>
            {selected && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.addCard} onPress={onAddChild} activeOpacity={0.7}>
        <Ionicons name="add" size={24} color={colors.primary} />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  card: {
    width: 160,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  cardSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  name: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 15,
    color: colors.textDark,
  },
  nameSelected: { color: colors.primary },
  meta: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  addCard: {
    width: 64,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
