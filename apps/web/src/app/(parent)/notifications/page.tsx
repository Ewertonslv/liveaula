import { cookies } from 'next/headers';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  lessonId: string | null;
}

async function fetchNotifications(): Promise<Notification[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  try {
    const res = await fetch(`${apiUrl}/me/notifications?limit=50`, { headers, cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export default async function NotificationsPage() {
  const notifications = await fetchNotifications();

  return (
    <div className="pt-6">
      <h1 className="text-xl font-bold text-gray-900 font-nunito mb-4">Notificações</h1>

      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔔</p>
          <p className="text-gray-500 font-medium">Nenhuma notificação ainda</p>
          <p className="text-gray-400 text-sm mt-1">Quando o professor registrar uma aula, você verá aqui.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`rounded-xl border px-4 py-3 ${n.readAt ? 'bg-white border-gray-100' : 'bg-amber-50 border-amber-200'}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${n.readAt ? 'text-gray-700' : 'text-gray-900'}`}>
                    {!n.readAt && <span className="inline-block w-2 h-2 bg-amber-500 rounded-full mr-1.5 mb-0.5" />}
                    {n.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                </div>
                {n.lessonId && (
                  <Link
                    href={`/lessons/${n.lessonId}`}
                    className="shrink-0 text-xs text-[#1A6B74] font-medium hover:underline"
                  >
                    Ver aula
                  </Link>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
