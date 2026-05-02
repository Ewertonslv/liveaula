import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';

interface Student { id: string; name: string; gradeLevel: string; avatarUrl?: string; subject: { name: string } }
interface Lesson { id: string; createdAt: string; whatWasDone: string; subject: { name: string }; durationMin: number }

export default function StudentDetail() {
  const { studentId } = useLocalSearchParams<{ studentId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [student, setStudent] = useState<Student | null>(null);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deactivating, setDeactivating] = useState(false);

  useEffect(() => {
    if (!studentId) return;
    Promise.all([
      apiFetch<Student>(`/students/${studentId}`),
      apiFetch<{ data: Lesson[] }>(`/lessons/student/${studentId}?limit=3`),
    ]).then(([s, l]) => {
      setStudent(s);
      setRecentLessons(l.data ?? []);
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, [studentId]);

  const sendInvite = async () => {
    if (!inviteEmail.includes('@')) { Alert.alert('Email inválido'); return; }
    setInviteSending(true);
    try {
      await apiFetch('/invitations', { method: 'POST', body: JSON.stringify({ studentId, parentEmail: inviteEmail }) });
      Alert.alert('Convite enviado!', `Link de convite gerado para ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar o convite.');
    } finally {
      setInviteSending(false);
    }
  };

  const handleDeactivate = () => {
    Alert.alert(
      'Arquivar aluno',
      `Tem certeza que deseja arquivar ${student?.name}? O aluno não aparecerá mais na lista principal.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Arquivar',
          style: 'destructive',
          onPress: async () => {
            setDeactivating(true);
            try {
              await apiFetch(`/students/${studentId}`, {
                method: 'PATCH',
                body: JSON.stringify({ isActive: false }),
              });
              Alert.alert('Aluno arquivado', 'O aluno foi removido da lista principal.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch {
              Alert.alert('Erro', 'Não foi possível arquivar o aluno.');
            } finally {
              setDeactivating(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) return <View style={[styles.loading, { paddingTop: insets.top }]}><ActivityIndicator color="#1A6B74" /></View>;
  if (!student) return null;

  const initials = student.name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <ScrollView style={[styles.container, { paddingTop: insets.top }]} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.meta}>{student.gradeLevel} • {student.subject.name}</Text>
      </View>

      {/* Invite section */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Convidar pai/mãe</Text>
        <TouchableOpacity style={styles.inviteButton} onPress={() => setShowInviteModal(true)} activeOpacity={0.8}>
          <Text style={styles.inviteButtonText}>📧 Enviar convite</Text>
        </TouchableOpacity>
      </View>

      {/* Recent lessons */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Aulas recentes</Text>
          <TouchableOpacity onPress={() => router.push(`/(professor)/students/${studentId}/history` as never)} activeOpacity={0.7}>
            <Text style={styles.seeAll}>Ver todas →</Text>
          </TouchableOpacity>
        </View>
        {recentLessons.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma aula registrada ainda</Text>
        ) : (
          recentLessons.map((l) => (
            <View key={l.id} style={styles.lessonRow}>
              <Text style={styles.lessonDate}>{new Date(l.createdAt).toLocaleDateString('pt-BR')}</Text>
              <Text style={styles.lessonText} numberOfLines={2}>{l.whatWasDone}</Text>
            </View>
          ))
        )}
      </View>

      {/* Deactivate */}
      <TouchableOpacity
        style={[styles.deactivateButton, deactivating && { opacity: 0.6 }]}
        onPress={handleDeactivate}
        disabled={deactivating}
        activeOpacity={0.8}
      >
        <Text style={styles.deactivateText}>{deactivating ? 'Arquivando...' : 'Arquivar aluno'}</Text>
      </TouchableOpacity>

      {/* Invite Modal */}
      <Modal visible={showInviteModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Convidar pai/mãe</Text>
            <Text style={styles.modalSubtitle}>Para {student.name}</Text>
            <TextInput
              style={styles.emailInput}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              placeholder="email@exemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setShowInviteModal(false)} activeOpacity={0.7}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.sendButton, inviteSending && { opacity: 0.6 }]} onPress={sendInvite} disabled={inviteSending} activeOpacity={0.8}>
                {inviteSending ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.sendText}>Enviar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  loading: { flex: 1, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  backButton: { minHeight: 44, justifyContent: 'center' },
  backText: { color: '#1A6B74', fontSize: 16 },
  header: { alignItems: 'center', paddingVertical: 20 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#e8f4f5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 24, fontWeight: '700', color: '#1A6B74' },
  name: { fontSize: 20, fontWeight: '700', color: '#0F172A' },
  meta: { fontSize: 14, color: '#64748B', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#374151' },
  seeAll: { color: '#1A6B74', fontSize: 13 },
  inviteButton: { height: 44, backgroundColor: '#1A6B74', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  inviteButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  lessonRow: { paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  lessonDate: { fontSize: 11, color: '#94A3B8', marginBottom: 2 },
  lessonText: { fontSize: 14, color: '#374151' },
  emptyText: { color: '#94A3B8', fontSize: 14, textAlign: 'center', paddingVertical: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  modalSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  emailInput: { height: 48, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, color: '#0F172A', marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, height: 48, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  cancelText: { color: '#374151', fontSize: 15 },
  sendButton: { flex: 1, height: 48, backgroundColor: '#1A6B74', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sendText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  deactivateButton: { height: 48, borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  deactivateText: { color: '#DC2626', fontSize: 14, fontWeight: '600' },
});
