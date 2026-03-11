'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { Button } from './ui/button';

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: '▣' },
  { href: '/distributors', label: 'Distributors', icon: '⌘' },
  { href: '/dsf', label: 'DSF', icon: '◫' },
  { href: '/locations', label: 'Locations', icon: '⌖' },
  { href: '/products', label: 'Products', icon: '◧' },
  { href: '/journey-plans', label: 'Journey Plans', icon: '☷' },
  { href: '/sales', label: 'Sales', icon: '◔' },
];

export function Shell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode; }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="app-shell">
      <div className="dashboard-wrap">
        <div className="dashboard-panel">
          <aside className="hidden w-[260px] shrink-0 border-r border-black/5 bg-white/70 p-5 lg:block">
            <div className="mb-7 px-2">
              <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-black/35">Motives Dashboard</div>
              <div className="mt-2 text-2xl font-black tracking-tight text-slate-900">Motives</div>
            </div>

            <div className="space-y-1.5">
              {nav.map((n) => {
                const active = pathname === n.href;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      active
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-soft'
                        : 'text-black/55 hover:bg-black/[0.04] hover:text-slate-900'
                    }`}
                  >
                    <span className="grid h-7 w-7 place-items-center rounded-xl bg-white/20 text-xs">{n.icon}</span>
                    <span>{n.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-10 px-2">
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.22em] text-black/30">Account</div>
              <div className="rounded-[22px] bg-gradient-to-br from-sky-500 to-blue-600 p-5 text-white shadow-soft">
                <div className="text-xs font-semibold text-white/80">Signed in as</div>
                <div className="mt-1 text-lg font-black">{user?.name || 'Admin'}</div>
                <div className="text-xs text-white/85">{user?.email || 'admin@motives.com'}</div>
                <Button
                  variant="secondary"
                  className="mt-4 w-full border-0 bg-white text-slate-900 hover:bg-slate-100"
                  onClick={() => {
                    logout();
                    router.replace('/login');
                  }}
                >
                  Logout
                </Button>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 p-4 md:p-6 xl:p-7">
            <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-black/30">Pages / {title}</div>
                <div className="mt-1 text-3xl font-black tracking-tight text-slate-900">{title}</div>
                {subtitle ? <div className="mt-1 text-sm text-black/50">{subtitle}</div> : null}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="mini-card flex h-11 items-center gap-3 px-4 text-sm text-black/45">
                  <span>⌕</span>
                  <input
                    placeholder="Type here..."
                    className="w-[180px] bg-transparent outline-none placeholder:text-black/30"
                  />
                </div>
                <div className="mini-card grid h-11 w-11 place-items-center text-sm text-black/60">⚙</div>
                <div className="mini-card grid h-11 w-11 place-items-center text-sm text-black/60">🔔</div>
                <div className="mini-card flex h-11 items-center gap-2 px-3 text-sm font-bold text-slate-900">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-r from-sky-500 to-violet-500 text-white">A</div>
                  <span className="hidden sm:inline">Admin</span>
                </div>
              </div>
            </div>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
