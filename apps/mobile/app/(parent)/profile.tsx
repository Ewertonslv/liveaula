import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  avatarUrl: string | null;
}

interface Me {
  id: string;
  name: string;
  email: string;
}

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  uploadPreset?: string;
  folder?: string;
}

async function uploadToCloudinary(
  uri: string,
  sig: CloudinarySignature
): Promise<string> {
  const form = new FormData();
  const filename = uri.split('/').pop() ?? 'avatar.jpg';
  const type = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
  form.append('file', { uri, name: filename, type } as unknown as Blob);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  if (sig.uploadPreset) form.append('upload_preset', sig.uploadPreset);
  if (sig.folder) form.append('folder', sig.folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
    { method: 'POST', body: form }
  );
  if (!res.ok) throw new Error('Falha ao fazer upload da imagem');
  const data = await res.json();
  return data.secure_url as string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const [me, setMe] = useState<Me | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parentName, setParentName] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [meData, students] = await Promise.all([
          apiFetch<Me>('/me'),
          apiFetch<Student[]>('/me/students'),
        ]);
        setMe(meData);
        setParentName(meData.name);
        if (students.length > 0) setStudent(students[0]);
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar seu perfil.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handlePickAvatar() {
    if (!student) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria para trocar a foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || result.assets.length === 0) return;

    const uri = result.assets[0].uri;
    setUploadingAvatar(true);
    try {
      const sig = await apiFetch<CloudinarySignature>('/me/cloudinary-signature');
      const avatarUrl = await uploadToCloudinary(uri, sig);
      await apiFetch(`/students/${student.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl }),
      });
      setStudent((prev) => (prev ? { ...prev, avatarUrl } : prev));
    } catch (err) {
      Alert.alert('Erro', err instanceof Error ? err.message : 'Falha ao atualizar foto.');
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSaveParentName() {
    if (!me || parentName.trim() === me.name) return;
    setSaving(true);
    try {
      const updated = await apiFetch<Me>('/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: parentName.trim() }),
      });
      setMe(updated);
      Alert.alert('Sucesso', 'Nome atualizado com sucesso.');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o nome.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: () => logout() },
      ]
    );
  }

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1A6B74" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.pageTitle}>Perfil</Text>

      {/* Child section */}
      {student ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Meu filho(a)</Text>
          <View style={styles.childRow}>
            <TouchableOpacity
              onPress={handlePickAvatar}
              activeOpacity={0.8}
              style={styles.avatarWrapper}
              accessibilityLabel="Trocar foto do aluno"
              accessibilityRole="button"
            >
              {uploadingAvatar ? (
                <View style={styles.avatarCircle}>
                  <ActivityIndicator color="#fff" />
                </View>
              ) : student.avatarUrl ? (
                <Image source={{ uri: student.avatarUrl }} style={styles.avatarCircle} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitials}>
                    {student.name
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')
                      .toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.cameraIcon}>
                <Text style={styles.cameraIconText}>📷</Text>
              </View>
            </TouchableOpacity>
            <View style={styles.childInfo}>
              <Text style={styles.childName}>{student.name}</Text>
              <Text style={styles.childGrade}>{student.gradeLevel}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* My account section */}
      {me ? (
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Minha conta</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Nome</Text>
            <TextInput
              style={styles.textInput}
              value={parentName}
              onChangeText={setParentName}
              placeholder="Seu nome"
              placeholderTextColor="#94A3B8"
              returnKeyType="done"
              onSubmitEditing={handleSaveParentName}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>E-mail</Text>
            <Text style={styles.readOnlyField}>{me.email}</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveParentName}
            disabled={saving}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Salvar nome"
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar alterações</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel="Sair da conta"
      >
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFBF5',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    gap: 20,
  },
  centered: {
    flex: 1,
    backgroundColor: '#FFFBF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
    color: '#0F172A',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1A6B74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  cameraIconText: {
    fontSize: 16,
  },
  childInfo: {
    flex: 1,
    gap: 4,
  },
  childName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
    color: '#0F172A',
  },
  childGrade: {
    fontSize: 14,
    color: '#64748B',
    fontFamily: 'Nunito_400Regular',
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Nunito_600SemiBold',
    color: '#64748B',
  },
  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#0F172A',
    fontFamily: 'Nunito_400Regular',
    backgroundColor: '#F8FAFC',
  },
  readOnlyField: {
    height: 44,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#94A3B8',
    fontFamily: 'Nunito_400Regular',
    backgroundColor: '#F1F5F9',
    lineHeight: 44,
  },
  saveButton: {
    backgroundColor: '#1A6B74',
    borderRadius: 10,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
  },
  logoutButton: {
    borderWidth: 1.5,
    borderColor: '#D95F3B',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#D95F3B',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Nunito_700Bold',
  },
});
