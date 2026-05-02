import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, StyleSheet, RefreshControl,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';
import { StudentListItem } from './_components/StudentListItem';

interface Student {
  id: string; name: string; gradeLevel: string; avatarUrl?: string;
  subject: { id: string; name: string };
}

export default function ProfessorDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      const data = await apiFetch<Student[]>('/students?isActive=true');
      setStudents(data);
    } catch {
      // silently ignore
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await loadStudents();
      setIsLoading(false);
    };
    init();
  }, [loadStudents]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadStudents();
    setIsRefreshing(false);
  };

  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (isLoading) {
    return (
      <View style={[styles.loading, { paddingTop: insets.top }]}>
        <ActivityIndicator color="#1A6B74" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Olá, professor! 👋</Text>
        <Text style={styles.date}>{today}</Text>
      </View>

      {students.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>Nenhum aluno ainda</Text>
          <Text style={styles.emptySubtitle}>Toque no [+] para registrar uma aula ou adicione um aluno</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(professor)/students' as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>Adicionar aluno</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StudentListItem
              student={item}
              onPress={() => router.push(`/(professor)/students/${item.id}` as never)}
            />
          )}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#1A6B74" />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  loading: { flex: 1, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  greeting: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  date: { fontSize: 13, color: '#64748B', marginTop: 2, textTransform: 'capitalize' },
  list: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 140 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#0F172A', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  addButton: { height: 48, backgroundColor: '#1A6B74', borderRadius: 8, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
});
