import { notFound } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import UserTable from './_components/UserTable';
import type { UserPublic } from '@liveaula/shared';

interface UsersResponse {
  users: UserPublic[];
  nextCursor: string | null;
}

async function fetchUsers(sessionCookie: string): Promise<UsersResponse> {
  const baseUrl = process.env.API_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/admin/users?limit=20`, {
    headers: { Cookie: sessionCookie },
    cache: 'no-store',
  });
  if (!res.ok) return { users: [], nextCursor: null };
  return res.json() as Promise<UsersResponse>;
}

export default async function UsersPage() {
  const session = await getServerSession();
  if (!session || session.role !== 'ADMIN') notFound();

  const { users, nextCursor } = await fetchUsers(`accessToken=${session.id}`).catch(() => ({
    users: [] as UserPublic[],
    nextCursor: null,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Usuários</h1>
      <UserTable initialUsers={users} nextCursor={nextCursor} />
    </div>
  );
}
