'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/students', label: 'Alunos', icon: '👥' },
  { href: '/register-lesson', label: 'Registrar Aula', icon: '✏️' },
  { href: '/invitations', label: 'Convites', icon: '📧' },
  { href: '/settings', label: 'Configurações', icon: '⚙️' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 px-3 space-y-1">
      {links.map(({ href, label, icon }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${
              isActive
                ? 'bg-primary-muted text-primary'
                : 'text-gray-700 hover:bg-primary-muted hover:text-primary'
            }`}
          >
            <span>{icon}</span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNavLinks() {
  const pathname = usePathname();
  const bottomLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { href: '/students', label: 'Alunos', icon: '👥' },
    { href: '/invitations', label: 'Convites', icon: '📧' },
    { href: '/settings', label: 'Config', icon: '⚙️' },
  ];

  return (
    <>
      {bottomLinks.map(({ href, label, icon }) => {
        const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-2 transition-colors ${
              isActive ? 'text-primary' : 'text-gray-500 hover:text-primary'
            }`}
          >
            <span className="text-xl">{icon}</span>
            <span className="text-xs mt-0.5">{label}</span>
          </Link>
        );
      })}
    </>
  );
}
