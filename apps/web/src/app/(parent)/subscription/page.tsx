import { cookies } from 'next/headers';
import { SubscriptionView } from './_components/SubscriptionView';

interface SubscriptionData {
  status?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  trialEndsAt?: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  payments?: Array<{ id: string; amountCents: number; paidAt: string | null; createdAt: string; status: string }>;
}

async function fetchSubscription(): Promise<SubscriptionData | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  try {
    const res = await fetch(`${baseUrl}/subscription`, {
      headers,
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SubscriptionPage() {
  const subscription = await fetchSubscription();

  return (
    <div className="pt-6">
      <h1 className="text-2xl font-bold text-[#1A6B74] mb-6 font-nunito">Assinatura</h1>
      <SubscriptionView initialData={subscription} />
    </div>
  );
}
