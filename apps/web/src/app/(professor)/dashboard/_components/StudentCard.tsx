'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  avatarUrl?: string;
  subject: { name: string };
}

function AvatarFallback({ name }: { name: string }) {
  const initials = name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-primary-muted flex items-center justify-center">
      <span className="text-sm font-semibold text-primary">{initials}</span>
    </div>
  );
}

export function StudentCard({ student }: { student: Student }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="relative bg-white rounded-lg p-4 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group"
      onClick={() => router.push(`/students/${student.id}`)}
    >
      <div className="flex items-center gap-3 mb-3">
        {student.avatarUrl ? (
          <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <AvatarFallback name={student.name} />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate text-sm">{student.name}</p>
          <p className="text-xs text-gray-500">{student.gradeLevel}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-100 transition-opacity"
          aria-label="Ações"
        >
          ⋯
        </button>
      </div>

      <span className="inline-block px-2 py-0.5 bg-primary-muted text-primary text-xs rounded-full font-medium">
        {student.subject.name}
      </span>

      {menuOpen && (
        <div
          className="absolute right-2 top-10 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 min-w-40"
          onClick={(e) => e.stopPropagation()}
        >
          {[
            { label: 'Registrar Aula', href: `/register-lesson?studentId=${student.id}` },
            { label: 'Enviar Convite', href: `/students/${student.id}?sendInvite=1` },
            { label: 'Ver Perfil', href: `/students/${student.id}` },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              {label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
