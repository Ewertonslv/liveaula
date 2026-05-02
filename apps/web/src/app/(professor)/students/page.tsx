import { cookies } from 'next/headers';
import { StudentGrid } from '../dashboard/_components/StudentGrid';
import Link from 'next/link';

interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  avatarUrl?: string;
  isActive: boolean;
  subject: { id: string; name: string };
}

async function getStudents(): Promise<Student[]> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${apiUrl}/students`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : ({} as Record<string, string>),
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-jakarta text-gray-900">Alunos</h1>
          <p className="text-gray-500 text-sm mt-1">{students.length} aluno{students.length !== 1 ? 's' : ''} cadastrado{students.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/students/new"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          + Novo aluno
        </Link>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">👥</p>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Nenhum aluno cadastrado</h2>
          <p className="text-gray-500 text-sm mb-6">Adicione seu primeiro aluno para começar a registrar aulas.</p>
          <Link href="/students/new" className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors">
            Adicionar aluno
          </Link>
        </div>
      ) : (
        <StudentGrid initialStudents={students} />
      )}
    </div>
  );
}
