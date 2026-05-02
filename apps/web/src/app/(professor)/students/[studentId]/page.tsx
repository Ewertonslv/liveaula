import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import LessonTimeline from './_components/LessonTimeline';

interface Student {
  id: string; name: string; gradeLevel: string; avatarUrl?: string;
  subject: { id: string; name: string };
}
async function fetchStudentData(studentId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

  const studentRes = await fetch(`${apiUrl}/students/${studentId}`, { headers, cache: 'no-store' });
  if (!studentRes.ok) return null;
  const student: Student = await studentRes.json();
  return { student };
}

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params;
  const data = await fetchStudentData(studentId);
  if (!data) notFound();

  const { student } = data;

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard" className="text-primary text-sm hover:underline mb-4 block">← Dashboard</Link>

      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-muted flex items-center justify-center text-2xl font-bold text-primary">
          {student.avatarUrl
            ? <img src={student.avatarUrl} className="w-16 h-16 rounded-full object-cover" alt={student.name} />
            : student.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
        </div>
        <div>
          <h1 className="text-xl font-semibold font-jakarta text-gray-900">{student.name}</h1>
          <p className="text-gray-500 text-sm">{student.gradeLevel} • {student.subject.name}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg p-4 shadow-sm mb-6 flex flex-wrap gap-3">
        <Link
          href={`/register-lesson?studentId=${student.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          ✏️ Registrar Aula
        </Link>
        <Link
          href={`/students/${student.id}/invite`}
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          📧 Convidar pai/mãe
        </Link>
      </div>

      {/* Lesson timeline */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Histórico de aulas</h2>
        <LessonTimeline studentId={student.id} />
      </div>
    </div>
  );
}
