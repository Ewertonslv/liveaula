'use client';

import { useEffect, useState } from 'react';
import { PaymentModal } from './PaymentModal';

interface TrialBannerProps {
  trialEndsAt: string;
}

function calcCountdown(endsAt: string) {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, diff: 0 };
  const totalSec = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSec / 86400),
    hours: Math.floor((totalSec % 86400) / 3600),
    minutes: Math.floor((totalSec % 3600) / 60),
    seconds: totalSec % 60,
    diff,
  };
}

export function TrialBanner({ trialEndsAt }: TrialBannerProps) {
  const [countdown, setCountdown] = useState(() => calcCountdown(trialEndsAt));
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setCountdown(calcCountdown(trialEndsAt)), 1000);
    return () => clearInterval(id);
  }, [trialEndsAt]);

  const urgent = countdown.diff > 0 && countdown.diff < 48 * 3600 * 1000;
  const bg = urgent ? 'bg-orange-100 border-orange-300' : 'bg-yellow-50 border-yellow-300';

  return (
    <>
      <div className={`rounded-2xl border px-5 py-4 ${bg} transition-colors`}>
        <p className="font-bold text-gray-800 font-nunito text-lg mb-1">Período de avaliação</p>
        <p className="text-sm text-gray-600 mb-3">
          Expira em:{' '}
          <span className="font-semibold text-gray-900">
            {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
          </span>
        </p>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-[#1A6B74] text-white font-semibold px-5 py-2 text-sm hover:bg-[#155960] transition-colors font-nunito"
        >
          Garantir acesso contínuo
        </button>
      </div>

      <PaymentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setModalOpen(false)}
      />
    </>
  );
}
