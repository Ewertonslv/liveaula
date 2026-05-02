import { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { apiFetch } from '@/lib/api';

interface Me { id: string; name: string; email: string; bio?: string; avatarUrl?: string; planStatus?: string }
interface CloudinarySignature { signature: string; timestamp: number; cloudName: string; apiKey: string; uploadPreset?: string; folder?: string }

async function uploadToCloudinary(uri: string, sig: CloudinarySignature): Promise<string> {
  const form = new FormData();
  const filename = uri.split('/').pop() ?? 'avatar.jpg';
  form.append('file', { uri, name: filename, type: 'image/jpeg' } as unknown as Blob);
  form.append('api_key', sig.apiKey);
  form.append('timestamp', String(sig.timestamp));
  form.append('signature', sig.signature);
  if (sig.uploadPreset) form.append('upload_preset', sig.uploadPreset);
  if (sig.folder) form.append('folder', sig.folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Falha no upload');
  const data = await res.json();
  return data.secure_url as string;
}

export default function Settings() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { logout } = useAuth();

  const [me, setMe] = useState<Me | null>(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    apiFetch<Me>('/me').then(data => {
      setMe(data);
      setName(data.name ?? '');
      setBio(data.bio ?? '');
      if (data.avatarUrl) setAvatarUri(data.avatarUrl);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria para alterar sua foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;
    const uri = result.assets[0].uri;

    setUploadingAvatar(true);
    try {
      const sig = await apiFetch<CloudinarySignature>('/me/cloudinary-signature', { method: 'POST' });
      const avatarUrl = await uploadToCloudinary(uri, sig);
      await apiFetch('/me', { method: 'PATCH', body: JSON.stringify({ avatarUrl }) });
      setAvatarUri(avatarUrl);
    } catch {
      Alert.alert('Erro', 'Não foi possível atualizar a foto.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Nome é obrigatório'); return; }
    setSaving(true);
    try {
      await apiFetch('/me', { method: 'PATCH', body: JSON.stringify({ name: name.trim(), bio: bio.trim() }) });
      Alert.alert('Sucesso', 'Perfil atualizado!');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#1A6B74" />
      </View>
    );
  }

  const initials = (me?.name ?? 'P').split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageTitle}>Configurações</Text>

      {/* Avatar */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>FOTO DE PERFIL</Text>
        <View style={styles.avatarRow}>
          <TouchableOpacity onPress={handlePickAvatar} disabled={uploadingAvatar} activeOpacity={0.8} style={styles.avatarWrapper}>
            {uploadingAvatar ? (
              <View style={styles.avatarCircle}>
                <ActivityIndicator color="#fff" />
              </View>
            ) : avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarCircle} />
            ) : (
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={styles.cameraIcon}><Text>📷</Text></View>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.avatarName}>{me?.name}</Text>
            <Text style={styles.avatarEmail}>{me?.email}</Text>
            {me?.planStatus === 'FREE' && (
              <View style={styles.freeBadge}>
                <Text style={styles.freeBadgeText}>🎉 Plano gratuito ativo</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Profile fields */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>INFORMAÇÕES PESSOAIS</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nome *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Seu nome completo"
            placeholderTextColor="#94A3B8"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bio <Text style={styles.optional}>({bio.length}/300)</Text></Text>
          <TextInput
            style={styles.textarea}
            value={bio}
            onChangeText={setBio}
            maxLength={300}
            multiline
            numberOfLines={4}
            placeholder="Fale sobre sua metodologia e experiência..."
            placeholderTextColor="#94A3B8"
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveButtonText}>Salvar perfil</Text>}
        </TouchableOpacity>
      </View>

      {/* Account */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>CONTA</Text>
        <Text style={styles.readOnlyField}>{me?.email}</Text>
        <TouchableOpacity
          style={styles.linkRow}
          activeOpacity={0.7}
          onPress={() => router.push('/(professor)/financeiro' as never)}
        >
          <Text style={styles.linkLabel}>Financeiro</Text>
          <Text style={styles.linkChevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F1F5F9' },
  content: { paddingHorizontal: 20, gap: 16 },
  centered: { flex: 1, backgroundColor: '#F1F5F9', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { fontSize: 24, fontWeight: '700', color: '#0F172A' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, gap: 12, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8', letterSpacing: 0.8, textTransform: 'uppercase' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrapper: { position: 'relative' },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1A6B74', alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontSize: 26, fontWeight: '700' },
  cameraIcon: { position: 'absolute', bottom: 0, right: -4, backgroundColor: '#fff', borderRadius: 12, padding: 2 },
  avatarName: { fontSize: 17, fontWeight: '700', color: '#0F172A' },
  avatarEmail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  freeBadge: { marginTop: 6, backgroundColor: '#ECFDF5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  freeBadgeText: { fontSize: 11, color: '#065F46', fontWeight: '600' },
  linkRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, minHeight: 44 },
  linkLabel: { fontSize: 15, color: '#0F172A', fontWeight: '500' },
  linkChevron: { fontSize: 22, color: '#94A3B8' },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  optional: { fontWeight: '400', color: '#94A3B8' },
  input: { height: 44, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, fontSize: 15, color: '#0F172A', backgroundColor: '#F8FAFC' },
  textarea: { minHeight: 90, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, paddingTop: 10, fontSize: 14, color: '#0F172A', backgroundColor: '#F8FAFC' },
  saveButton: { height: 48, backgroundColor: '#1A6B74', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  readOnlyField: { fontSize: 15, color: '#94A3B8', paddingVertical: 8 },
  logoutButton: { height: 52, borderWidth: 1.5, borderColor: '#FCA5A5', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#DC2626', fontSize: 15, fontWeight: '700' },
});
