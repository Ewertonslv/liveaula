'use client';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${document.cookie.match(/accessToken=([^;]+)/)?.[1] ?? ''}`,
        },
      });
    } catch {
      // best-effort
    }
    document.cookie = 'accessToken=; path=/; max-age=0; SameSite=lax';
    router.push('/login');
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm w-full"
    >
      <span>🚪</span>
      Sair
    </button>
  );
}
