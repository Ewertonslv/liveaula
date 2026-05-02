'use client';
import { RegisterLessonForm } from './_components/RegisterLessonForm';

export default function RegisterLessonPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold font-jakarta text-gray-900">Registrar Aula</h1>
        <p className="text-gray-500 text-sm mt-1">Registre rapidamente o conteúdo da aula de hoje</p>
      </div>
      <RegisterLessonForm />
    </div>
  );
}
