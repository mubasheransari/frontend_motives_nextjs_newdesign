'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type Distributor = { id: number; name: string; };
type Row = { id: number; name: string; email: string; phoneNumber: string; distributorId: number; distributorName?: string; };

export default function DsfPage() {
  const { user, loading } = useRequireAuth(['admin']);
  const [rows, setRows] = useState<Row[]>([]);
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [distributorId, setDistributorId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    const [dists, dsf] = await Promise.all([apiFetch<Distributor[]>('/api/distributors'), apiFetch<Row[]>('/api/dsf')]);
    setDistributors(dists); setRows(dsf);
  }
  useEffect(() => { if (!loading && user) load().catch((e:any) => setErr(e?.message || 'Failed to load DSF')); }, [loading, user]);

  async function create(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setSubmitting(true);
    try {
      await apiFetch('/api/dsf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, email, phoneNumber, distributorId, password, confirmPassword }) });
      setName(''); setEmail(''); setPhoneNumber(''); setDistributorId(''); setPassword(''); setConfirmPassword('');
      await load();
    } catch (e:any) { setErr(e?.message || 'Failed to create DSF'); } finally { setSubmitting(false); }
  }

  return (
    <Shell title="DSF" subtitle="Each DSF belongs to one distributor and has its own journey plan.">
      {err ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</div> : null}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardTitle>Add DSF</CardTitle><form onSubmit={create} className="mt-4 grid gap-3">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Phone number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          <label className="block"><span className="mb-1 block text-xs font-semibold text-black/60">Distributor</span><select className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-violet-500" value={distributorId} onChange={(e) => setDistributorId(e.target.value)} required><option value="">Select distributor</option>{distributors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select></label>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Input label="Confirm password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
          </div>
          <Button disabled={submitting} type="submit">{submitting ? 'Saving…' : 'Create DSF'}</Button>
        </form></Card>
        <Card><div className="flex items-center justify-between"><CardTitle>DSF List</CardTitle><Button variant="ghost" onClick={() => load().catch(() => {})}>Refresh</Button></div>
          <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-xs font-bold text-black/50"><th className="py-2">Name</th><th className="py-2">Email</th><th className="py-2">Phone</th><th className="py-2">Distributor</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-t border-black/5"><td className="py-3 font-semibold">{r.name}</td><td className="py-3 text-black/70">{r.email}</td><td className="py-3 text-black/70">{r.phoneNumber}</td><td className="py-3 text-black/70">{r.distributorName || distributors.find((d) => d.id === Number(r.distributorId))?.name || '-'}</td></tr>)}{!rows.length ? <tr><td className="py-6 text-center text-black/60" colSpan={4}>No DSF found.</td></tr> : null}</tbody></table></div>
        </Card>
      </div>
    </Shell>
  );
}
