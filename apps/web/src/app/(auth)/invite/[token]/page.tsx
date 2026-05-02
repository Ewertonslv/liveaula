import { redirect } from 'next/navigation';
import Link from 'next/link';

interface InviteData {
  studentName: string;
  professorName: string;
  subjectName: string;
  parentEmail: string;
}

async function getInviteData(token: string): Promise<InviteData | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const res = await fetch(`${apiUrl}/invitations/${token}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function InvitePage({ params }: { params: { token: string } }) {
  const invite = await getInviteData(params.token);

  if (!invite) {
    return (
      <div className="min-h-screen bg-surface-parent flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Convite inválido</h1>
          <p className="text-gray-600 mb-6">Este convite é inválido ou já expirou.</p>
          <Link href="/" className="text-primary hover:underline">Voltar ao início</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-parent flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg p-8 shadow-sm text-center">
          <div className="w-16 h-16 bg-primary-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📚</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {invite.professorName} convidou você para acompanhar as aulas de {invite.studentName}
          </h1>
          <p className="text-gray-500 text-sm mb-6">Matéria: {invite.subjectName}</p>
          <Link
            href={`/onboarding/parent?token=${params.token}&email=${encodeURIComponent(invite.parentEmail)}`}
            className="block w-full py-3 bg-primary text-white rounded font-medium text-center hover:bg-primary-hover transition-colors"
          >
            Criar minha conta
          </Link>
        </div>
      </div>
    </div>
  );
}
