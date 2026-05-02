'use client';

import { useState } from 'react';
import { PaymentModal } from './PaymentModal';

export function SubscriptionCTA() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-[#1A6B74]/30 bg-white px-6 py-8 text-center shadow-sm">
        <p className="text-4xl mb-3">💳</p>
        <h2 className="text-xl font-bold text-[#1A6B74] font-nunito mb-2">Assine o Liveaula</h2>
        <p className="text-gray-500 text-sm mb-6 leading-relaxed">
          Acompanhe as aulas do seu filho em tempo real por apenas{' '}
          <span className="font-semibold text-gray-700">R$79/mês</span>.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-[#D95F3B] text-white font-bold px-8 py-3 font-nunito hover:bg-[#bf5233] transition-colors"
        >
          Assinar agora
        </button>
      </div>

      <PaymentModal
        open={open}
        onClose={() => setOpen(false)}
        onSuccess={() => setOpen(false)}
      />
    </>
  );
}
