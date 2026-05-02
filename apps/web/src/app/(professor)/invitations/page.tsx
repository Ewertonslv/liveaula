import { cookies } from 'next/headers';
import Link from 'next/link';
import InvitationsTable from './_components/InvitationsTable';

interface Invitation {
  id: string;
  token: string;
  studentName: string;
  parentEmail: string;
  status: 'PENDING' | 'CLAIMED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
}

async function fetchInvitations(status?: string): Promise<Invitation[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const url = status
    ? `${apiUrl}/invitations?status=${status}`
    : `${apiUrl}/invitations`;

  const res = await fetch(url, { headers, cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : (data.items ?? []);
}

const STATUS_OPTIONS = [
  { value: undefined, label: 'Todos' },
  { value: 'PENDING', label: 'Pendentes' },
  { value: 'CLAIMED', label: 'Aceitos' },
  { value: 'EXPIRED', label: 'Expirados' },
] as const;

export default async function InvitationsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status as 'PENDING' | 'CLAIMED' | 'EXPIRED' | undefined;
  const invitations = await fetchInvitations(status);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold font-jakarta text-gray-900">Convites</h1>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt.value || (!status && !opt.value);
          const href = opt.value ? `/invitations?status=${opt.value}` : '/invitations';
          return (
            <Link
              key={opt.label}
              href={href}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={isActive ? { backgroundColor: '#1A6B74' } : undefined}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <InvitationsTable invitations={invitations} />
      </div>
    </div>
  );
}
