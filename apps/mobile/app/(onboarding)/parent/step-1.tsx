import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';
import { secureStorage } from '@/lib/secureStorage';

interface InvitationInfo {
  parentEmail: string;
  studentName: string;
  studentId: string;
}

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
  role: string;
}

function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <View style={styles.dots}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i < current ? styles.dotActive : styles.dotInactive]} />
      ))}
    </View>
  );
}

export default function ParentStep1() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token } = useLocalSearchParams<{ token: string }>();

  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (!token) {
      Alert.alert('Erro', 'Token de convite inválido.');
      return;
    }
    apiFetch<InvitationInfo>(`/invitations/${token}/validate`)
      .then(setInvitation)
      .catch(() => Alert.alert('Erro', 'Convite inválido ou expirado.'))
      .finally(() => setIsFetching(false));
  }, [token]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Informe seu nome.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 8 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    if (!invitation) return;

    setIsLoading(true);
    try {
      const res = await apiFetch<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          role: 'PARENT',
          inviteToken: token,
          name: name.trim(),
          email: invitation.parentEmail,
          password,
        }),
      });
      await secureStorage.save('liveaula.accessToken', res.accessToken);
      await secureStorage.save('liveaula.refreshToken', res.refreshToken);
      await secureStorage.save('liveaula.userId', res.userId);
      await secureStorage.save('liveaula.userRole', res.role);

      router.push({
        pathname: '/(onboarding)/parent/step-2',
        params: {
          token,
          studentName: invitation.studentName,
          studentId: invitation.studentId,
        },
      } as never);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Não foi possível criar conta.';
      Alert.alert('Erro', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <ProgressDots total={4} current={1} />

        <Text style={styles.title}>Criar sua conta</Text>
        <Text style={styles.subtitle}>
          Você foi convidado(a) para acompanhar as aulas do seu filho.
        </Text>

        <View style={styles.field}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={[styles.input, styles.inputReadOnly]}
            value={isFetching ? 'Carregando...' : (invitation?.parentEmail ?? '')}
            editable={false}
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nome completo *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Ana Silva"
            placeholderTextColor="#94A3B8"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Senha *</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor="#94A3B8"
            secureTextEntry
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Confirmar senha *</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Repita a senha"
            placeholderTextColor="#94A3B8"
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.button, (isLoading || isFetching) && { opacity: 0.6 }]}
          onPress={handleSubmit}
          disabled={isLoading || isFetching}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{isLoading ? 'Criando conta...' : 'Criar conta →'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FFFBF5', paddingHorizontal: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: '#1A6B74' },
  dotInactive: { backgroundColor: '#CBD5E1' },
  title: { fontSize: 24, fontWeight: '700', color: '#0F172A', marginBottom: 8, fontFamily: 'Nunito_700Bold' },
  subtitle: { fontSize: 15, color: '#64748B', marginBottom: 24, fontFamily: 'Nunito_400Regular' },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#fff',
  },
  inputReadOnly: {
    backgroundColor: '#F1F5F9',
    color: '#64748B',
  },
  button: {
    height: 52,
    backgroundColor: '#1A6B74',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Nunito_600SemiBold' },
});
