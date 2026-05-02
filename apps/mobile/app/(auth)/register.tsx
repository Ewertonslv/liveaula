import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (name.trim().length < 2) e.name = 'Nome obrigatório';
    if (!email.includes('@')) e.email = 'Email inválido';
    if (password.length < 8) e.password = 'Mínimo 8 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'Senhas não conferem';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role: 'PROFESSOR' }),
      });
      await login(email.trim(), password);
      router.replace('/(onboarding)/professor/step-1' as never);
    } catch (e: unknown) {
      const err = e as { status?: number };
      if (err.status === 409) Alert.alert('Erro', 'Este email já está cadastrado');
      else Alert.alert('Erro', 'Não foi possível criar a conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { key: 'name', label: 'Nome completo', value: name, setter: setName, keyboard: 'default' as const, secure: false },
    { key: 'email', label: 'Email', value: email, setter: setEmail, keyboard: 'email-address' as const, secure: false },
    { key: 'password', label: 'Senha', value: password, setter: setPassword, keyboard: 'default' as const, secure: true },
    { key: 'confirmPassword', label: 'Confirmar senha', value: confirmPassword, setter: setConfirmPassword, keyboard: 'default' as const, secure: true },
  ];

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          <Text style={styles.title}>Criar conta de professor</Text>

          {fields.map(({ key, label, value, setter, keyboard, secure }) => (
            <View key={key} style={styles.field}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={[styles.input, errors[key] ? styles.inputError : null]}
                value={value}
                onChangeText={setter}
                keyboardType={keyboard}
                autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
                secureTextEntry={secure}
                placeholderTextColor="#94a3b8"
              />
              {errors[key] && <Text style={styles.errorText}>{errors[key]}</Text>}
            </View>
          ))}

          <TouchableOpacity style={[styles.button, isLoading && styles.buttonDisabled]} onPress={handleRegister} disabled={isLoading} activeOpacity={0.8}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar conta</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { flexGrow: 1, paddingHorizontal: 16 },
  backButton: { minHeight: 44, justifyContent: 'center', marginBottom: 8 },
  backText: { color: '#1A6B74', fontSize: 16 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 20, fontWeight: '600', color: '#0F172A', marginBottom: 20 },
  field: { marginBottom: 14 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { height: 44, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 12, fontSize: 16, color: '#0F172A' },
  inputError: { borderColor: '#EF4444' },
  errorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },
  button: { height: 48, backgroundColor: '#1A6B74', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
