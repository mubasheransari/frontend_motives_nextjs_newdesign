'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type Row = { id: number; name: string; email: string; phoneNumber: string; createdAt?: string; };

export default function DistributorsPage() {
  const { user, loading } = useRequireAuth(['admin']);
  const [rows, setRows] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() { const all = await apiFetch<Row[]>('/api/distributors'); setRows(all); }
  useEffect(() => { if (!loading && user) load().catch((e:any) => setErr(e?.message || 'Failed to load distributors')); }, [loading, user]);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setSubmitting(true);
    try {
      await apiFetch('/api/distributors', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phoneNumber, password, confirmPassword }) });
      setName(''); setEmail(''); setPhoneNumber(''); setPassword(''); setConfirmPassword('');
      await load();
    } catch (e:any) { setErr(e?.message || 'Failed to create distributor'); } finally { setSubmitting(false); }
  }

  return (
    <Shell title="Distributors" subtitle="Create distributors and assign DSF under them.">
      {err ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</div> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardTitle>Add distributor</CardTitle><form onSubmit={create} className="mt-4 grid gap-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <Button disabled={submitting} type="submit">{submitting ? 'Saving…' : 'Create distributor'}</Button>
        </form></Card>
        <Card><div className="flex items-center justify-between"><CardTitle>Distributors</CardTitle><Button variant="ghost" onClick={() => load().catch(() => {})}>Refresh</Button></div>
          <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-xs font-bold text-black/50"><th className="py-2">Name</th><th className="py-2">Email</th><th className="py-2">Phone</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-t border-black/5"><td className="py-3 font-semibold">{r.name}</td><td className="py-3 text-black/70">{r.email}</td><td className="py-3 text-black/70">{r.phoneNumber}</td></tr>)}{!rows.length ? <tr><td className="py-6 text-center text-black/60" colSpan={3}>No distributors found.</td></tr> : null}</tbody></table></div>
        </Card>
      </div>
    </Shell>
  );
}
