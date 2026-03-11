'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { GradText } from '../components/grad';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login, logout } = useAuth();
  const [email, setEmail] = useState('admin@motives.com');
  const [password, setPassword] = useState('Admin@12345');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace('/dashboard');
  }, [user, loading, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/dashboard');
    } catch (e: any) {
      setErr(e?.message || 'Login failed');
      if (String(e?.message || '').toLowerCase().includes('admin')) logout();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="dashboard-wrap">
        <div className="grid min-h-[calc(100vh-56px)] items-center gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div className="px-4 lg:px-10">
            <div className="inline-flex rounded-full border border-white/60 bg-white/65 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-black/40 shadow-soft">
              Motives Admin Dashboard
            </div>
            <div className="mt-6 text-5xl font-black leading-[1.02] tracking-tight text-slate-900 md:text-6xl">
              Modern admin control
              <div><GradText>for distributors and DSF</GradText></div>
            </div>
            <div className="mt-5 max-w-xl text-base leading-7 text-black/55">
              Clean glassmorphism layout, larger working area, and a dashboard theme inspired by your reference design. Sign in to manage distributors, DSF, locations, products, and journey plans.
            </div>
          </div>

          <Card className="p-8 lg:p-10">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-black/35">Welcome back</div>
            <div className="mt-2 text-3xl font-black tracking-tight text-slate-900">Sign in</div>
            <div className="mt-2 text-sm text-black/55">Admin accounts only. Signup is disabled.</div>

            <form onSubmit={onSubmit} className="mt-8 space-y-5">
              {err ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {err}
                </div>
              ) : null}
              <Input label="Email" placeholder="admin@motives.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" placeholder="••••••••" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</Button>
              <div className="text-xs text-black/45">Uses <span className="font-mono">NEXT_PUBLIC_API_BASE_URL</span> from <span className="font-mono">.env.local</span>.</div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
