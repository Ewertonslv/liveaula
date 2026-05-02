import { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { apiFetch } from '@/lib/api';

interface CloudinarySignature {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  uploadPreset?: string;
  folder?: string;
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

export default function ParentStep2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { token, studentName, studentId } = useLocalSearchParams<{
    token: string;
    studentName: string;
    studentId: string;
  }>();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para escolher uma foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async (uri: string): Promise<string> => {
    const sig = await apiFetch<CloudinarySignature>('/me/cloudinary-signature', { method: 'POST' });

    const formData = new FormData();
    formData.append('file', { uri, type: 'image/jpeg', name: 'avatar.jpg' } as unknown as Blob);
    formData.append('signature', sig.signature);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('api_key', sig.apiKey);
    if (sig.folder) formData.append('folder', sig.folder);
    if (sig.uploadPreset) formData.append('upload_preset', sig.uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Falha no upload da imagem.');
    const data = await res.json();
    return data.secure_url as string;
  };

  const handleContinue = async () => {
    if (!imageUri) {
      navigateNext();
      return;
    }
    setIsUploading(true);
    try {
      const avatarUrl = await uploadToCloudinary(imageUri);
      await apiFetch(`/students/${studentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl }),
      });
      navigateNext();
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar a foto. Você pode adicionar depois.');
      navigateNext();
    } finally {
      setIsUploading(false);
    }
  };

  const navigateNext = () => {
    router.push({
      pathname: '/(onboarding)/parent/step-3',
      params: { token, studentName, studentId },
    } as never);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <ProgressDots total={4} current={2} />

      <Text style={styles.title}>Adicione uma foto para {studentName || 'o aluno'}</Text>
      <Text style={styles.subtitle}>Uma foto ajuda a personalizar o perfil</Text>

      <View style={styles.imageArea}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage} activeOpacity={0.8}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderIcon}>📷</Text>
              <Text style={styles.avatarPlaceholderText}>Toque para escolher</Text>
            </View>
          )}
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity onPress={pickImage} activeOpacity={0.7}>
            <Text style={styles.changePhoto}>Trocar foto</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.skipButton} onPress={navigateNext} activeOpacity={0.7}>
          <Text style={styles.skipText}>Pular</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, isUploading && { opacity: 0.6 }]}
          onPress={handleContinue}
          disabled={isUploading}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{isUploading ? 'Enviando...' : 'Continuar →'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF5', paddingHorizontal: 20 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 32 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotActive: { backgroundColor: '#1A6B74' },
  dotInactive: { backgroundColor: '#CBD5E1' },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 8, fontFamily: 'Nunito_700Bold' },
  subtitle: { fontSize: 15, color: '#64748B', marginBottom: 32, fontFamily: 'Nunito_400Regular' },
  imageArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarWrapper: { marginBottom: 16 },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: '#1A6B74' },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarPlaceholderIcon: { fontSize: 32, marginBottom: 8 },
  avatarPlaceholderText: { fontSize: 13, color: '#94A3B8', textAlign: 'center' },
  changePhoto: { fontSize: 14, color: '#1A6B74', fontWeight: '500', textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 12 },
  skipButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  skipText: { color: '#374151', fontSize: 16 },
  button: {
    flex: 2,
    height: 52,
    backgroundColor: '#1A6B74',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600', fontFamily: 'Nunito_600SemiBold' },
});
