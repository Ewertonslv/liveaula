'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { SubscriptionCTA } from './SubscriptionCTA';
import { TrialBanner } from './TrialBanner';
import { PaymentModal } from './PaymentModal';

interface Payment {
  id: string;
  amountCents: number;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

interface SubscriptionData {
  status?: 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED';
  trialEndsAt?: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  payments?: Payment[];
}

interface SubscriptionViewProps {
  initialData: SubscriptionData | null;
}

function CancelButton() {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  if (cancelled) {
    return <p className="text-sm text-gray-500 mt-2">Assinatura cancelada. A cobrança não será renovada.</p>;
  }

  if (confirming) {
    return (
      <div className="mt-4 p-4 border border-red-200 rounded-xl bg-red-50">
        <p className="text-sm text-red-700 mb-3 font-medium">Tem certeza? Você perderá acesso ao acompanhamento das aulas.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              setLoading(true);
              try {
                await apiFetch('/subscription', { method: 'DELETE' });
                setCancelled(true);
              } catch {
                alert('Erro ao cancelar. Tente novamente.');
              } finally {
                setLoading(false);
                setConfirming(false);
              }
            }}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
          >
            Manter assinatura
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="mt-4 text-sm text-gray-400 hover:text-red-600 underline underline-offset-2 transition-colors"
    >
      Cancelar assinatura
    </button>
  );
}

export function SubscriptionView({ initialData }: SubscriptionViewProps) {
  const [updateCardOpen, setUpdateCardOpen] = useState(false);
  const [reactivateOpen, setReactivateOpen] = useState(false);

  const status = initialData?.status;

  if (!status) {
    return <SubscriptionCTA />;
  }

  if (status === 'TRIAL') {
    return (
      <div>
        <TrialBanner trialEndsAt={initialData!.trialEndsAt!} />
        <CancelButton />
      </div>
    );
  }

  if (status === 'ACTIVE') {
    const payments = initialData!.payments?.slice(0, 5) ?? [];
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-green-300 bg-green-50 px-5 py-4">
          <span className="h-3 w-3 rounded-full bg-green-500 shrink-0" />
          <div>
            <p className="font-bold text-green-800 font-nunito">Assinatura ativa</p>
            {initialData!.nextBillingDate && (
              <p className="text-sm text-green-700">
                Próxima cobrança:{' '}
                {new Date(initialData!.nextBillingDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        {payments.length > 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            <p className="px-5 py-3 font-semibold text-gray-700 font-nunito text-sm border-b border-gray-100">
              Histórico de pagamentos
            </p>
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between px-5 py-3 border-b border-gray-50 last:border-0 gap-2"
              >
                <span className="text-sm text-gray-600 shrink-0">
                  {new Date(p.paidAt ?? p.createdAt).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-sm font-medium text-gray-800 shrink-0">
                  R${(p.amountCents / 100).toFixed(2).replace('.', ',')}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    p.status === 'PAID'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {p.status === 'PAID' ? 'Pago' : p.status}
                </span>
                {p.status === 'PAID' && (
                  <a
                    href={`/subscription/payments/${p.id}/receipt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#1A6B74] hover:underline shrink-0 ml-auto"
                  >
                    Recibo
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <CancelButton />
      </div>
    );
  }

  if (status === 'PAST_DUE') {
    return (
      <>
        <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-5">
          <p className="font-bold text-red-700 font-nunito text-lg mb-1">Pagamento pendente</p>
          <p className="text-sm text-red-600 mb-4">
            Há um problema com seu pagamento. Atualize seus dados para continuar.
          </p>
          <button
            onClick={() => setUpdateCardOpen(true)}
            className="rounded-xl bg-[#D95F3B] text-white font-bold px-6 py-2.5 font-nunito hover:bg-[#bf5233] transition-colors"
          >
            Atualizar cartão
          </button>
        </div>

        <PaymentModal
          open={updateCardOpen}
          onClose={() => setUpdateCardOpen(false)}
          onSuccess={() => setUpdateCardOpen(false)}
        />
      </>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <>
        <div className="rounded-2xl border border-gray-200 bg-white px-5 py-5">
          <p className="font-semibold text-gray-700 font-nunito mb-1">Assinatura cancelada</p>
          {initialData!.cancelledAt && (
            <p className="text-sm text-gray-500 mb-4">
              Cancelada em {new Date(initialData!.cancelledAt).toLocaleDateString('pt-BR')}
            </p>
          )}
          <button
            onClick={() => setReactivateOpen(true)}
            className="rounded-xl bg-[#1A6B74] text-white font-bold px-6 py-2.5 font-nunito hover:bg-[#155960] transition-colors"
          >
            Reativar
          </button>
        </div>

        <PaymentModal
          open={reactivateOpen}
          onClose={() => setReactivateOpen(false)}
          onSuccess={() => setReactivateOpen(false)}
        />
      </>
    );
  }

  return null;
}
