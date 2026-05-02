'use client';
import { useState } from 'react';
import { StudentCard } from './StudentCard';

interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  avatarUrl?: string;
  isActive: boolean;
  subject: { id: string; name: string };
}

export function StudentGrid({ initialStudents }: { initialStudents: Student[] }) {
  const [search, setSearch] = useState('');

  const filtered = initialStudents.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar aluno..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary flex-1 max-w-xs"
        />
        <a
          href="/students/new"
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors"
        >
          + Novo aluno
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
      </div>

      {filtered.length === 0 && search && (
        <p className="text-center text-gray-500 mt-8">Nenhum aluno encontrado para &quot;{search}&quot;</p>
      )}
    </div>
  );
}
