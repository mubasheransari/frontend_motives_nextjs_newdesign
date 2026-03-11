'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

type LocationRow = { id: number; name: string; ownerName: string; ownerPhoneNumber: string; lat: number; lng: number; };

export default function LocationsPage() {
  const { user, loading } = useRequireAuth(['admin']);
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhoneNumber, setOwnerPhoneNumber] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  async function loadAll() {
    const list = await apiFetch<LocationRow[]>('/api/locations');
    setRows(list);
  }

  useEffect(() => {
    if (loading || !user) return;
    loadAll().catch((e:any) => setErr(e?.message || 'Failed to load locations'));
  }, [loading, user]);

  async function addLocation() {
    setErr(null); setSaving(true);
    try {
      await apiFetch('/api/locations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, ownerName, ownerPhoneNumber, lat, lng }) });
      setName(''); setOwnerName(''); setOwnerPhoneNumber(''); setLat(''); setLng('');
      await loadAll();
    } catch (e:any) { setErr(e?.message || 'Failed to add location'); } finally { setSaving(false); }
  }

  return (
    <Shell title="Locations" subtitle="Manage locations with owner details and map coordinates.">
      {err ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</div> : null}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1"><CardTitle>Add Location</CardTitle><div className="mt-4 space-y-3">
          <Input label="Location name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Owner name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />
          <Input label="Owner phone number" value={ownerPhoneNumber} onChange={(e) => setOwnerPhoneNumber(e.target.value)} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Latitude" value={lat} onChange={(e) => setLat(e.target.value)} />
            <Input label="Longitude" value={lng} onChange={(e) => setLng(e.target.value)} />
          </div>
          <Button onClick={addLocation} disabled={saving || !name || !ownerName || !ownerPhoneNumber || !lat || !lng}>{saving ? 'Saving…' : 'Add Location'}</Button>
        </div></Card>
        <Card className="lg:col-span-2"><div className="flex items-center justify-between gap-3"><CardTitle>Locations</CardTitle><Button variant="ghost" onClick={() => loadAll().catch(() => {})}>Refresh</Button></div>
          <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-xs font-bold text-black/50"><th className="py-2">ID</th><th className="py-2">Name</th><th className="py-2">Owner</th><th className="py-2">Phone</th><th className="py-2">Lat</th><th className="py-2">Lng</th></tr></thead><tbody>{rows.map((r) => <tr key={r.id} className="border-t border-black/5"><td className="py-3 text-black/60">{r.id}</td><td className="py-3 font-semibold">{r.name}</td><td className="py-3 text-black/70">{r.ownerName}</td><td className="py-3 text-black/70">{r.ownerPhoneNumber}</td><td className="py-3 text-black/70">{r.lat}</td><td className="py-3 text-black/70">{r.lng}</td></tr>)}{!rows.length ? <tr><td className="py-6 text-center text-black/60" colSpan={6}>No locations found.</td></tr> : null}</tbody></table></div>
        </Card>
      </div>
    </Shell>
  );
}
