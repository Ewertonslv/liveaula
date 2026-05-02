import Link from 'next/link';

export function EmptyState() {
  return (
    <div
      className="bg-white rounded-xl p-10 text-center border"
      style={{
        borderColor: 'var(--border-whisper-professor)',
        boxShadow: 'var(--shadow-professor-soft)',
      }}
    >
      <div className="text-5xl mb-4">📚</div>
      <h2 className="text-xl font-semibold font-jakarta text-gray-900 tracking-tight mb-2">
        Nenhum aluno ainda
      </h2>
      <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto mb-6">
        Adicione seu primeiro aluno para começar a registrar aulas. O cadastro leva menos de 30 segundos
        — depois é só registrar aula e o pai recebe a notificação.
      </p>
      <Link
        href="/students/new"
        className="inline-block px-5 py-2.5 bg-primary text-white rounded-lg font-semibold text-sm hover:bg-primary-hover transition-colors shadow-professor-soft"
      >
        Adicionar primeiro aluno →
      </Link>
    </div>
  );
}
