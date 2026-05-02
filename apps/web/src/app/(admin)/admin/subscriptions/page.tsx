import { notFound } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import SubscriptionsTable, { AdminSubscription } from './_components/SubscriptionsTable';

interface SubscriptionsResponse {
  subscriptions: AdminSubscription[];
  nextCursor: string | null;
}

async function fetchSubscriptions(): Promise<SubscriptionsResponse> {
  const baseUrl = process.env.API_URL || 'http://localhost:3001';
  const res = await fetch(`${baseUrl}/admin/subscriptions?limit=20`, {
    cache: 'no-store',
  });
  if (!res.ok) return { subscriptions: [], nextCursor: null };
  return res.json() as Promise<SubscriptionsResponse>;
}

export default async function SubscriptionsPage() {
  const session = await getServerSession();
  if (!session || session.role !== 'ADMIN') notFound();

  const { subscriptions, nextCursor } = await fetchSubscriptions().catch(() => ({
    subscriptions: [] as AdminSubscription[],
    nextCursor: null,
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-800">Assinaturas</h1>
      <SubscriptionsTable initialSubscriptions={subscriptions} nextCursor={nextCursor} />
    </div>
  );
}
