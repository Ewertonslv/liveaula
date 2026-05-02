'use client';

import { useEffect, useRef, useState } from 'react';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function PaymentModal({ open, onClose, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data && e.data.type === 'PAYMENT_SUCCESS') {
        onSuccess();
        onClose();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSuccess, onClose]);

  useEffect(() => {
    if (open) setLoading(true);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="font-bold text-[#1A6B74] font-nunito">Pagamento seguro</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="text-gray-400 hover:text-gray-700 transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
              <div className="h-10 w-10 rounded-full border-4 border-[#1A6B74] border-t-transparent animate-spin" />
            </div>
          )}
          <iframe
            ref={iframeRef}
            src="https://asaas.com/checkout"
            className="w-full h-96 block"
            title="Checkout Asaas"
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}
