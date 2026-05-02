import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Lesson {
  id: string; createdAt: string; whatWasDone: string;
  subject: { name: string }; durationMin: number; emotion: string;
}

const EMOTION_EMOJI: Record<string, string> = {
  GREAT: '😊', GOOD: '🙂', NEUTRAL: '😐', DIFFICULT: '😕', CHALLENGING: '💪',
};

export function LessonHistoryCard({ lesson }: { lesson: Lesson }) {
  const [expanded, setExpanded] = useState(false);
  const date = new Date(lesson.createdAt);
  const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' });

  return (
    <TouchableOpacity style={styles.card} onPress={() => setExpanded(!expanded)} activeOpacity={0.8}>
      <View style={styles.header}>
        <Text style={styles.date}>{dateStr}</Text>
        <View style={styles.right}>
          <Text style={styles.emotion}>{EMOTION_EMOJI[lesson.emotion] || '😐'}</Text>
          <View style={styles.subjectBadge}>
            <Text style={styles.subjectText}>{lesson.subject.name}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.content} numberOfLines={expanded ? undefined : 2}>
        {lesson.whatWasDone}
      </Text>
      {!expanded && lesson.whatWasDone.length > 100 && (
        <Text style={styles.expandHint}>Toque para ver completo</Text>
      )}
      <Text style={styles.duration}>{lesson.durationMin}min</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  date: { fontSize: 12, color: '#64748B', textTransform: 'capitalize' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emotion: { fontSize: 18 },
  subjectBadge: { backgroundColor: '#e8f4f5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  subjectText: { fontSize: 11, color: '#1A6B74', fontWeight: '600' },
  content: { fontSize: 14, color: '#374151', lineHeight: 20 },
  expandHint: { fontSize: 11, color: '#94A3B8', marginTop: 4 },
  duration: { fontSize: 12, color: '#94A3B8', marginTop: 6 },
});
