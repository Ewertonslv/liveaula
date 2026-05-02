'use client';
import { useEffect, useState } from 'react';

interface Lesson { id: string; whatWasDone: string; student?: { name: string } }

export function NotificationPreview({
  lesson,
  onRegisterAnother,
  onViewHistory,
}: {
  lesson: Lesson;
  onRegisterAnother: () => void;
  onViewHistory: () => void;
}) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          onRegisterAnother();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onRegisterAnother]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm text-center max-w-md mx-auto">
      {/* Simulated notification */}
      <div className="mb-6 mx-auto max-w-xs rounded-xl bg-gray-50 border border-gray-200 p-4 text-left">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">L</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">liveaula</p>
            <p className="text-xs text-gray-500">agora</p>
          </div>
        </div>
        <p className="text-sm font-medium text-gray-900">Relatório de aula enviado!</p>
        <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{lesson.whatWasDone.slice(0, 100)}</p>
      </div>

      <div className="text-4xl mb-3">✅</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Aula registrada com sucesso!</h2>
      <p className="text-gray-500 text-sm mb-6">Notificação enviada ao pai/mãe</p>

      <div className="flex gap-3">
        <button
          onClick={onRegisterAnother}
          className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors"
        >
          Registrar outra aula ({countdown}s)
        </button>
        <button
          onClick={onViewHistory}
          className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Ver histórico
        </button>
      </div>
    </div>
  );
}
