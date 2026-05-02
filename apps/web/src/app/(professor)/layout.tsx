import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import Link from 'next/link';
import { LogoutButton } from './_components/LogoutButton';
import { NavLinks, BottomNavLinks } from './_components/NavLinks';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';

export default async function ProfessorLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session || session.role !== 'PROFESSOR') redirect('/login');

  return (
    <div className="min-h-screen bg-surface-professor">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:fixed lg:inset-y-0 lg:w-64 flex-col bg-white border-r border-gray-200">
        <div className="p-6">
          <span className="text-xl font-bold font-jakarta text-primary">liveaula</span>
        </div>
        <NavLinks />
        <div className="px-3 pb-6">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <EmailVerificationBanner />
        {/* Mobile top nav */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-bold font-jakarta text-primary">liveaula</span>
          <Link href="/register-lesson" className="px-3 py-1.5 bg-primary text-white rounded text-sm font-medium">
            + Aula
          </Link>
        </header>

        <main className="p-6">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 flex">
          <BottomNavLinks />
        </nav>
      </div>
    </div>
  );
}
