import { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';
import { LessonHistoryCard } from '../../_components/LessonHistoryCard';

interface Lesson { id: string; createdAt: string; whatWasDone: string; subject: { id: string; name: string }; durationMin: number; emotion: string }
interface CursorPage<T> { items: T[]; nextCursor: string | null; hasMore: boolean }

export default function StudentHistory() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  const loadMore = useCallback(async (reset = false) => {
    if (isLoading) return;
    if (!reset && !hasMore) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ limit: '10' });
      if (!reset && cursor) params.set('cursor', cursor);
      if (selectedSubject) params.set('subjectId', selectedSubject);
      const data = await apiFetch<CursorPage<Lesson>>(`/students/${studentId}/lessons?${params}`);
      setLessons((prev) => reset ? data.items : [...prev, ...data.items]);
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
      const newSubjects = data.items.map((l) => l.subject);
      setSubjects((prev) => {
        const ids = new Set(prev.map(s => s.id));
        return [...prev, ...newSubjects.filter(s => !ids.has(s.id))];
      });
    } catch {} finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, cursor, studentId, selectedSubject]);

  useEffect(() => {
    loadMore(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubject]);

  const handleSubjectFilter = (subjectId: string | null) => {
    setSelectedSubject(subjectId);
    setLessons([]);
    setCursor(null);
    setHasMore(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Histórico de Aulas</Text>
      </View>

      {/* Subject filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, selectedSubject === null && styles.filterChipSelected]}
            onPress={() => handleSubjectFilter(null)}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterChipText, selectedSubject === null && styles.filterChipTextSelected]}>Todas</Text>
          </TouchableOpacity>
          {subjects.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.filterChip, selectedSubject === s.id && styles.filterChipSelected]}
              onPress={() => handleSubjectFilter(s.id)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterChipText, selectedSubject === s.id && styles.filterChipTextSelected]}>{s.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <FlashList
        data={lessons}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LessonHistoryCard lesson={item} />}
        onEndReached={() => loadMore(false)}
        onEndReachedThreshold={0.3}
        estimatedItemSize={100}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={isLoading ? <ActivityIndicator color="#1A6B74" style={{ marginVertical: 16 }} /> : null}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Nenhuma aula registrada ainda</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', gap: 12 },
  backButton: { minHeight: 44, justifyContent: 'center' },
  backText: { color: '#1A6B74', fontSize: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  filterScroll: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', maxHeight: 56 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterChip: { height: 36, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1, borderColor: '#D1D5DB', backgroundColor: '#fff', justifyContent: 'center' },
  filterChipSelected: { backgroundColor: '#1A6B74', borderColor: '#1A6B74' },
  filterChipText: { fontSize: 14, color: '#374151' },
  filterChipTextSelected: { color: '#fff', fontWeight: '500' },
  listContent: { padding: 16, paddingBottom: 40 },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
});
