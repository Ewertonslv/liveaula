import { notFound } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import DateFilter from './_components/DateFilter';

interface MetricsData {
  dau: number;
  mau: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  churnRate: number;
  conversionRate: number;
}

async function fetchMetrics(from?: string, to?: string): Promise<MetricsData | null> {
  const baseUrl = process.env.API_URL || 'http://localhost:3001';
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`${baseUrl}/admin/metrics${query}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json() as Promise<MetricsData>;
}

interface MetricCard {
  label: string;
  value: string | number;
}

function MetricCard({ label, value }: MetricCard) {
  return (
    <div className="bg-white rounded-md border border-slate-200 p-5 flex flex-col gap-1">
      <span className="text-3xl font-bold text-slate-800">{value}</span>
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}

export default async function MetricsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const session = await getServerSession();
  if (!session || session.role !== 'ADMIN') notFound();

  const { from, to } = await searchParams;
  const metrics = await fetchMetrics(from, to).catch(() => null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold text-slate-800">Métricas</h1>
        <DateFilter from={from} to={to} />
      </div>

      {metrics ? (
        <div className="grid grid-cols-2 gap-4">
          <MetricCard label="DAU (Daily Active Users)" value={metrics.dau} />
          <MetricCard label="MAU (Monthly Active Users)" value={metrics.mau} />
          <MetricCard label="Assinaturas Ativas" value={metrics.activeSubscriptions} />
          <MetricCard
            label="Taxa de Conversão"
            value={`${(metrics.conversionRate * 100).toFixed(1)}%`}
          />
        </div>
      ) : (
        <p className="text-sm text-slate-400">Não foi possível carregar as métricas.</p>
      )}
    </div>
  );
}
