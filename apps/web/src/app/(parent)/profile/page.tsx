'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { apiFetch } from '@/lib/api';

interface Student {
  id: string;
  name: string;
  gradeLevel?: string;
  avatarUrl?: string;
}

interface Me {
  id: string;
  name: string;
  email: string;
}

interface CloudinarySignature {
  signature: string;
  apiKey: string;
  cloudName: string;
  timestamp: number;
  folder?: string;
}

interface ProfileFormValues {
  parentName: string;
}

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 3000);
    return () => clearTimeout(id);
  }, [onDone]);

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-[#1A6B74] text-white px-6 py-3 rounded-2xl shadow-lg font-nunito text-sm font-semibold">
      {message}
    </div>
  );
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm<ProfileFormValues>();

  useEffect(() => {
    async function load() {
      try {
        const [meData, studentsData] = await Promise.all([
          apiFetch<Me>('/me'),
          apiFetch<{ data: Student[] }>('/me/students'),
        ]);
        setMe(meData);
        const s = studentsData.data[0] ?? null;
        setStudent(s);
        setAvatarUrl(s?.avatarUrl);
        reset({ parentName: meData.name });
      } catch {
        // session expired or network error — layout will redirect
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [reset]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !student) return;

    setUploading(true);
    try {
      const sig = await apiFetch<CloudinarySignature>('/me/cloudinary-signature', {
        method: 'POST',
      });

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sig.apiKey);
      fd.append('timestamp', String(sig.timestamp));
      fd.append('signature', sig.signature);
      if (sig.folder) fd.append('folder', sig.folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: 'POST', body: fd },
      );
      if (!uploadRes.ok) throw new Error('Upload failed');
      const { secure_url } = await uploadRes.json();

      await apiFetch(`/students/${student.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ avatarUrl: secure_url }),
      });
      setAvatarUrl(secure_url);
      setToast('Foto atualizada');
    } catch {
      setToast('Erro ao atualizar foto');
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ProfileFormValues) {
    try {
      await apiFetch('/me', {
        method: 'PATCH',
        body: JSON.stringify({ name: values.parentName }),
      });
      setToast('Perfil atualizado');
    } catch {
      setToast('Erro ao salvar perfil');
    }
  }

  async function handleLogout() {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <div className="pt-6 flex justify-center">
        <div className="h-10 w-10 rounded-full border-4 border-[#1A6B74] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-6 pb-8 space-y-6">
      <h1 className="text-2xl font-bold text-[#1A6B74] font-nunito">Perfil</h1>

      {/* Child section */}
      <section className="rounded-2xl border border-gray-200 bg-white px-5 py-5 space-y-4">
        <h2 className="font-semibold text-gray-700 font-nunito">Dados do aluno</h2>

        {/* Avatar */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[#1A6B74] shrink-0 focus:outline-none focus:ring-2 focus:ring-[#1A6B74]"
            aria-label="Alterar foto do aluno"
          >
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center bg-[#1A6B74]/10 text-2xl">
                👤
              </span>
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <div className="h-5 w-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAvatarChange}
          />
          <div>
            <p className="font-semibold text-gray-800 font-nunito">{student?.name ?? '—'}</p>
            {student?.gradeLevel && (
              <p className="text-sm text-gray-500">{student.gradeLevel}</p>
            )}
            <p className="text-xs text-[#1A6B74] mt-0.5 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              Alterar foto
            </p>
          </div>
        </div>
      </section>

      {/* Parent account section */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-2xl border border-gray-200 bg-white px-5 py-5 space-y-4"
      >
        <h2 className="font-semibold text-gray-700 font-nunito">Minha conta</h2>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 font-nunito" htmlFor="parentName">
            Nome
          </label>
          <input
            id="parentName"
            type="text"
            {...register('parentName', { required: true })}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-nunito focus:outline-none focus:ring-2 focus:ring-[#1A6B74]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500 font-nunito">E-mail</label>
          <p className="w-full rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 font-nunito">
            {me?.email ?? '—'}
          </p>
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-[#1A6B74] text-white font-bold py-2.5 font-nunito hover:bg-[#155960] transition-colors"
        >
          Salvar
        </button>
      </form>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full rounded-xl border border-red-300 text-red-500 font-semibold py-2.5 font-nunito hover:bg-red-50 transition-colors"
      >
        Sair
      </button>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
