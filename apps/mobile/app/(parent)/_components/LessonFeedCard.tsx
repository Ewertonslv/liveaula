import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { LessonListItem } from '@liveaula/shared';
import { colors, shadows } from '@/theme';

const EMOTION_EMOJI: Record<string, string> = {
  GREAT: '😄',
  GOOD: '🙂',
  NEUTRAL: '😐',
  DIFFICULT: '😤',
  CHALLENGING: '😰',
};

// Aurora gradient escolhido pelo horário da aula (spec design v1.1)
function gradientForHour(dateStr: string): readonly [string, string] {
  const h = new Date(dateStr).getHours();
  if (h >= 5 && h < 12) return ['#FFF9F0', '#F0F9FF'] as const;       // morning — cream → blue-white
  if (h >= 12 && h < 18) return ['#FFF9F0', '#F5F0FF'] as const;      // afternoon — cream → lilac
  return ['#FFF5F0', '#FFF9F0'] as const;                              // evening — peach → cream
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `há ${diffMin || 1} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `há ${diffH} ${diffH === 1 ? 'hora' : 'horas'}`;
  const diffD = Math.floor(diffH / 24);
  return `há ${diffD} ${diffD === 1 ? 'dia' : 'dias'}`;
}

function Initials({ name, size }: { name: string; size: number }) {
  const letters = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <View
      style={[
        styles.avatarCircle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarInitials, { fontSize: size * 0.38 }]}>{letters}</Text>
    </View>
  );
}

interface LessonFeedCardProps {
  lesson: LessonListItem;
  index: number;
}

export function LessonFeedCard({ lesson, index }: LessonFeedCardProps) {
  const router = useRouter();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [index, opacity, translateY]);

  const gradientColors = gradientForHour(lesson.createdAt);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, styles.wrapper]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push(`/(parent)/lesson/${lesson.id}` as never)}
        accessibilityRole="button"
        accessibilityLabel={`Aula de ${lesson.subject.name} com ${lesson.professor.name}`}
        style={[styles.cardWrapper, shadows.parentSoft]}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Header */}
          <View style={styles.header}>
            <Initials name={lesson.professor.name} size={36} />
            <View style={styles.headerText}>
              <Text style={styles.professorName}>{lesson.professor.name}</Text>
              <Text style={styles.timeAgo}>{timeAgo(lesson.createdAt)}</Text>
            </View>
            <View style={styles.badgeColumn}>
              {lesson.confirmedByParentAt ? (
                <View style={styles.confirmedBadge}>
                  <Text style={styles.confirmedBadgeText}>✓ Confirmada</Text>
                </View>
              ) : (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>Pendente</Text>
                </View>
              )}
              <View style={styles.subjectBadge}>
                <Text style={styles.subjectText}>{lesson.subject.name}</Text>
              </View>
            </View>
          </View>

          {/* Body */}
          <Text style={styles.whatWasDone}>{lesson.whatWasDone}</Text>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.emotionEmoji}>{EMOTION_EMOJI[lesson.emotion] ?? '🙂'}</Text>
            <Text style={styles.duration}>{lesson.durationMin} min</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  cardWrapper: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF', // base under gradient — needed for shadow on iOS
  },
  card: {
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.borderWhisperParent,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    backgroundColor: '#1A6B74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
  },
  headerText: {
    flex: 1,
  },
  professorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1917',
    fontFamily: 'Nunito_600SemiBold',
  },
  timeAgo: {
    fontSize: 12,
    color: '#78716C',
    fontFamily: 'Nunito_400Regular',
    marginTop: 1,
  },
  subjectBadge: {
    backgroundColor: 'rgba(26,107,116,0.10)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  subjectText: {
    color: '#1A6B74',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
  },
  badgeColumn: {
    alignItems: 'flex-end',
    gap: 4,
  },
  confirmedBadge: {
    backgroundColor: '#DCFCE7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  confirmedBadgeText: {
    color: '#166534',
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 0.4,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pendingBadgeText: {
    color: '#92400E',
    fontSize: 10,
    fontFamily: 'Nunito_700Bold',
    letterSpacing: 0.4,
  },
  whatWasDone: {
    fontSize: 15,
    color: '#1C1917',
    lineHeight: 22,
    fontFamily: 'Nunito_400Regular',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
  },
  emotionEmoji: {
    fontSize: 22,
  },
  duration: {
    fontSize: 13,
    color: '#57534E',
    fontFamily: 'Nunito_600SemiBold',
    fontWeight: '600',
  },
});
