import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'PROFESSOR') router.replace('/(professor)/' as never);
      else if (user.role === 'PARENT') router.replace('/(parent)/' as never);
    } catch {
      Alert.alert('Erro de login', 'Email ou senha inválidos. Tente novamente.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>liveaula</Text>
          <Text style={styles.subtitle}>Acompanhamento de aulas particulares</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Entrar</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="seu@email.com"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
              placeholderTextColor="#94a3b8"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => router.push('/(auth)/register' as never)}
            activeOpacity={0.7}
          >
            <Text style={styles.linkText}>Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scroll: { flexGrow: 1, paddingHorizontal: 16, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 28, fontWeight: '700', color: '#1A6B74', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  title: { fontSize: 20, fontWeight: '600', color: '#0F172A', marginBottom: 20 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 6 },
  input: { height: 44, borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 6, paddingHorizontal: 12, fontSize: 16, color: '#0F172A', backgroundColor: '#fff' },
  button: { height: 48, backgroundColor: '#1A6B74', borderRadius: 6, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  linkButton: { alignItems: 'center', marginTop: 16, minHeight: 44, justifyContent: 'center' },
  linkText: { fontSize: 14, color: '#64748B' },
  linkBold: { color: '#1A6B74', fontWeight: '600' },
});
