import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, StyleSheet, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';
import { StudentListItem } from '../_components/StudentListItem';

interface Student {
  id: string; name: string; gradeLevel: string; avatarUrl?: string;
  subject: { id: string; name: string };
}

export default function StudentsIndex() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadStudents = useCallback(async () => {
    try {
      const data = await apiFetch<Student[]>('/students?isActive=true');
      setStudents(data);
    } catch {}
  }, []);

  useEffect(() => {
    setIsLoading(true);
    loadStudents().finally(() => setIsLoading(false));
  }, [loadStudents]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadStudents();
    setIsRefreshing(false);
  };

  const filtered = search
    ? students.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    : students;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Alunos</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(professor)/students/new' as never)} activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar aluno..."
          placeholderTextColor="#94A3B8"
          clearButtonMode="while-editing"
        />
      </View>

      {isLoading ? (
        <View style={styles.loading}><ActivityIndicator color="#1A6B74" /></View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StudentListItem
              student={item}
              onPress={() => router.push(`/(professor)/students/${item.id}` as never)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor="#1A6B74" />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>{search ? `Nenhum aluno para "${search}"` : 'Nenhum aluno cadastrado'}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  title: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  addButton: { height: 36, paddingHorizontal: 14, backgroundColor: '#1A6B74', borderRadius: 8, justifyContent: 'center' },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  searchInput: { height: 40, backgroundColor: '#F1F5F9', borderRadius: 8, paddingHorizontal: 12, fontSize: 15, color: '#0F172A' },
  list: { paddingHorizontal: 16, paddingVertical: 12, paddingBottom: 120 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#94A3B8', fontSize: 15 },
});
