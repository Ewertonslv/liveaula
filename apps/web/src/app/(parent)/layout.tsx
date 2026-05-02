import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth';
import Link from 'next/link';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session || session.role !== 'PARENT') redirect('/login');

  return (
    <div className="min-h-screen bg-surface-parent font-nunito print:bg-white">
      <div className="print:hidden">
        <EmailVerificationBanner />
      </div>
      <main className="max-w-[640px] mx-auto px-4 pb-24 print:max-w-none print:px-0 print:pb-0">
        {children}
      </main>

      {/* Bottom navigation — mobile-first, whisper border + soft tint */}
      <nav
        className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur flex border-t print:hidden"
        style={{
          borderColor: 'var(--border-whisper-parent)',
          boxShadow: '0 -2px 12px rgba(26,107,116,0.06)',
        }}
      >
        {[
          { href: '/feed', label: 'Feed', icon: '📚' },
          { href: '/notifications', label: 'Avisos', icon: '🔔' },
          { href: '/subscription', label: 'Assinatura', icon: '💳' },
          { href: '/profile', label: 'Perfil', icon: '👤' },
        ].map(({ href, label, icon }) => (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center py-3 text-warm-500 hover:text-primary transition-colors"
          >
            <span className="text-xl">{icon}</span>
            <span className="text-xs mt-0.5 font-semibold tracking-tight">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
