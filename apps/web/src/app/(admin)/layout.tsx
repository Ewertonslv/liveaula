import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@/lib/auth';

const NAV_LINKS = [
  { href: '/admin/metrics', label: 'Métricas' },
  { href: '/admin/users', label: 'Usuários' },
  { href: '/admin/subscriptions', label: 'Assinaturas' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session || session.role !== 'ADMIN') notFound();

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[200px] border-r border-slate-200 bg-white shrink-0">
        <div className="px-4 py-5 border-b border-slate-200">
          <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Admin</span>
        </div>
        <nav className="flex flex-col py-2">
          {NAV_LINKS.map(({ href, label }) => (
            <AdminNavLink key={href} href={href} label={label} />
          ))}
        </nav>
      </aside>

      {/* Mobile top nav */}
      <div className="flex flex-col flex-1 min-w-0">
        <nav className="md:hidden flex border-b border-slate-200 bg-white">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="flex-1 text-center py-3 text-sm font-medium text-slate-600 hover:text-[#1A6B74] transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

// Separate component for active link styling — works server-side via pathname cookie trick
// Since we cannot use usePathname in Server Component we use a thin wrapper
function AdminNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-[#1A6B74] hover:bg-slate-50 transition-colors border-l-2 border-transparent hover:border-[#1A6B74]"
    >
      {label}
    </Link>
  );
}
