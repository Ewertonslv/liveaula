'use client';

export function TrialWelcomeStep({ onFinish }: { onFinish: () => void }) {
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 7);
  const expiryStr = trialEnd.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="bg-white rounded-lg p-8 shadow-sm text-center">
      <div className="text-5xl mb-4">🎁</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Trial gratuito ativado!</h2>
      <p className="text-gray-500 mb-2">7 dias para acompanhar as aulas sem custo</p>
      <p className="text-sm text-gray-400 mb-6">Expira em {expiryStr}</p>
      <div className="mb-6 p-4 bg-surface-parent rounded-lg border border-amber-100">
        <p className="text-sm text-gray-700">Você receberá notificações sempre que seu filho tiver uma nova aula registrada.</p>
      </div>
      <button
        onClick={onFinish}
        className="w-full py-3 bg-primary text-white rounded font-medium hover:bg-primary-hover transition-colors"
      >
        Ver as aulas →
      </button>
    </div>
  );
}
