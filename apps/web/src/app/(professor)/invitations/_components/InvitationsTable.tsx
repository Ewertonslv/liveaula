'use client';

import { useState } from 'react';

interface Invitation {
  id: string;
  token: string;
  studentName: string;
  parentEmail: string;
  status: 'PENDING' | 'CLAIMED' | 'EXPIRED';
  createdAt: string;
  expiresAt: string;
}

interface InvitationsTableProps {
  invitations: Invitation[];
}

const STATUS_BADGE: Record<Invitation['status'], { label: string; className: string }> = {
  PENDING: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
  CLAIMED: { label: 'Aceito', className: 'bg-green-100 text-green-800' },
  EXPIRED: { label: 'Expirado', className: 'bg-gray-100 text-gray-600' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function InvitationsTable({ invitations }: InvitationsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function handleCopy(invitation: Invitation) {
    const link = `https://liveaula.com/invite/${invitation.token}`;
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(invitation.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement('textarea');
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopiedId(invitation.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }

  if (invitations.length === 0) {
    return (
      <p className="text-gray-400 text-sm text-center py-10">
        Nenhum convite enviado — convide um pai pelo perfil do aluno
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left text-gray-500 text-xs uppercase tracking-wide">
            <th className="pb-3 pr-4 font-medium">Aluno</th>
            <th className="pb-3 pr-4 font-medium">Email do pai</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 pr-4 font-medium">Criado em</th>
            <th className="pb-3 pr-4 font-medium">Expira em</th>
            <th className="pb-3 font-medium">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invitations.map((inv) => {
            const badge = STATUS_BADGE[inv.status];
            return (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4 font-medium text-gray-900">{inv.studentName}</td>
                <td className="py-3 pr-4 text-gray-600">{inv.parentEmail}</td>
                <td className="py-3 pr-4">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="py-3 pr-4 text-gray-500">{formatDate(inv.createdAt)}</td>
                <td className="py-3 pr-4 text-gray-500">{formatDate(inv.expiresAt)}</td>
                <td className="py-3">
                  <button
                    onClick={() => handleCopy(inv)}
                    className="text-xs px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition-colors text-gray-700"
                  >
                    {copiedId === inv.id ? 'Copiado!' : 'Copiar link'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
