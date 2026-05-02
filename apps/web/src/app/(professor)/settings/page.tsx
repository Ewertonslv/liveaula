'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiFetch } from '@/lib/api';

interface ProfileFormValues {
  name: string;
  bio: string;
  avatarUrl: string;
}

interface MeResponse {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
}

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
const CLOUDINARY_API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';

export default function SettingsPage() {
  const [toast, setToast] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    defaultValues: { name: '', bio: '', avatarUrl: '' },
  });

  const bioValue = watch('bio') ?? '';
  const avatarUrl = watch('avatarUrl');

  useEffect(() => {
    apiFetch<MeResponse>('/me')
      .then((me) => {
        setValue('name', me.name ?? '');
        setValue('bio', me.bio ?? '');
        setValue('avatarUrl', me.avatarUrl ?? '');
        if (me.avatarUrl) setAvatarPreview(me.avatarUrl);
      })
      .catch(() => {});
  }, [setValue]);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const reader = new FileReader();
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      // Get signature from API
      const sigData = await apiFetch<{
        signature: string;
        timestamp: number;
        folder: string;
      }>('/me/cloudinary-signature', { method: 'POST' });

      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', sigData.signature);
      formData.append('timestamp', String(sigData.timestamp));
      formData.append('api_key', CLOUDINARY_API_KEY);
      formData.append('folder', sigData.folder ?? 'avatars');
      if (CLOUDINARY_UPLOAD_PRESET) formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData },
      );

      if (!uploadRes.ok) throw new Error('Upload failed');
      const uploadData = await uploadRes.json();
      setValue('avatarUrl', uploadData.secure_url);
      setAvatarPreview(uploadData.secure_url);
    } catch {
      showToast('Erro ao fazer upload da imagem');
    } finally {
      setUploading(false);
    }
  }

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }

  async function onSubmit(values: ProfileFormValues) {
    try {
      await apiFetch('/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: values.name, bio: values.bio, avatarUrl: values.avatarUrl }),
      });
      showToast('Perfil atualizado');
    } catch {
      showToast('Erro ao atualizar perfil');
    }
  }

  const displayAvatar = avatarPreview || avatarUrl;

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold font-jakarta text-gray-900 mb-6">Configurações</h1>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar section */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Foto de perfil</h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
              {displayAvatar ? (
                <img
                  src={displayAvatar}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-2xl">👤</span>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {uploading ? 'Enviando...' : 'Alterar foto'}
              </button>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP. Máx 5MB.</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>

        {/* Profile fields */}
        <div className="bg-white rounded-lg p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Informações pessoais</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name', { required: 'Nome é obrigatório' })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              placeholder="Seu nome completo"
            />
            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio{' '}
              <span className="text-gray-400 font-normal">({bioValue.length}/300)</span>
            </label>
            <textarea
              {...register('bio', { maxLength: { value: 300, message: 'Máximo 300 caracteres' } })}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
              placeholder="Fale um pouco sobre você e sua metodologia..."
            />
            {errors.bio && (
              <p className="text-xs text-red-500 mt-1">{errors.bio.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || uploading}
            className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#1A6B74' }}
          >
            {isSubmitting ? 'Salvando...' : 'Salvar perfil'}
          </button>
        </div>
      </form>

      {/* Security section */}
      <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Segurança</h2>
        <a
          href="/forgot-password"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          🔑 Alterar senha
        </a>
        <p className="text-xs text-gray-400 mt-2">Você receberá um link por email para criar uma nova senha.</p>
      </div>
    </div>
  );
}
