'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

type Dsf = { id: number; name: string; email: string; distributorId?: number; distributorName?: string; };
type Location = { id: number | string; name: string; lat: number; lng: number; ownerName?: string; ownerPhoneNumber?: string; };
type JourneyPlan = { id: number | string; dsfId: number; distributorId?: number; periodType: 'weekly' | 'monthly'; startDate: string; endDate: string; days: Record<string, string[]>; daysCount?: number; selectedDaysCount?: number; createdAt?: string; updatedAt?: string; };

function pad2(n: number) { return n.toString().padStart(2, '0'); }
function toDayKey(d: Date) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function parseDayKey(s: string): Date | null { const m = /^\d{4}-\d{2}-\d{2}$/.exec(s); if (!m) return null; const [y, mo, da] = s.split('-').map((x) => Number(x)); const dt = new Date(y, mo - 1, da); return isNaN(dt.getTime()) ? null : dt; }
function addDays(d: Date, n: number) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() + n); return x; }
function daysInRange(start: Date, end: Date) { const out: Date[] = []; let cur = new Date(start.getFullYear(), start.getMonth(), start.getDate()); const last = new Date(end.getFullYear(), end.getMonth(), end.getDate()); while (cur.getTime() <= last.getTime()) { out.push(new Date(cur)); cur = addDays(cur, 1); } return out; }
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
function prettyDate(d: Date) { const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']; return `${pad2(d.getDate())}-${months[d.getMonth()]}-${d.getFullYear()}`; }

export default function JourneyPlansPage() {
  const searchParams = useSearchParams();
  const { user, loading } = useRequireAuth(['admin']);
  const [dsfs, setDsfs] = useState<Dsf[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [plans, setPlans] = useState<JourneyPlan[]>([]);
  const [selectedDsfId, setSelectedDsfId] = useState<number | ''>('');
  const dsfIdFromQuery = searchParams.get('dsfId');
  useEffect(() => { if (!dsfIdFromQuery || selectedDsfId !== '') return; const n = Number(dsfIdFromQuery); if (Number.isFinite(n)) setSelectedDsfId(n); }, [dsfIdFromQuery, selectedDsfId]);
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('weekly');
  const [startDate, setStartDate] = useState<string>(() => toDayKey(new Date()));
  const startDt = useMemo(() => parseDayKey(startDate) ?? new Date(), [startDate]);
  const endDt = useMemo(() => periodType === 'weekly' ? addDays(startDt, 6) : addDays(startDt, 29), [startDt, periodType]);
  const days = useMemo(() => daysInRange(startDt, endDt), [startDt, endDt]);
  const [activeDayKey, setActiveDayKey] = useState<string>(() => toDayKey(new Date()));
  const [dayToLocationIds, setDayToLocationIds] = useState<Record<string, Set<string>>>({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function ensureDays(nextDays: Date[]) {
    setDayToLocationIds((prev) => {
      const allowed = new Set(nextDays.map((d) => toDayKey(d)));
      const out: Record<string, Set<string>> = {};
      for (const k of Object.keys(prev)) if (allowed.has(k)) out[k] = new Set(Array.from(prev[k] || []));
      for (const d of nextDays) { const k = toDayKey(d); if (!out[k]) out[k] = new Set(); }
      return out;
    });
    const first = nextDays.length ? toDayKey(nextDays[0]) : '';
    setActiveDayKey((prev) => (prev && nextDays.some((d) => toDayKey(d) === prev) ? prev : first));
  }
  useEffect(() => { ensureDays(days); }, [periodType, startDate]);

  async function loadAll() {
    setErr(null); setInfo(null);
    const [dsfRows, locs, ps] = await Promise.all([apiFetch<Dsf[]>('/api/dsf'), apiFetch<Location[]>('/api/locations'), apiFetch<JourneyPlan[]>('/api/journey-plans?limit=30')]);
    setDsfs(dsfRows); setLocations(locs); setPlans(ps);
  }
  useEffect(() => { if (!loading && user) loadAll().catch((e:any) => setErr(e?.message ?? String(e))); }, [loading, user]);

  const locationById = useMemo(() => { const m = new Map<string, Location>(); for (const l of locations) m.set(String(l.id), l); return m; }, [locations]);
  const activeSet = dayToLocationIds[activeDayKey] ?? new Set<string>();
  const activeDate = parseDayKey(activeDayKey);
  const selectedDsf = dsfs.find((x) => Number(x.id) === Number(selectedDsfId));

  function toggleLocation(id: string) {
    setDayToLocationIds((prev) => { const cur = new Set(Array.from(prev[activeDayKey] || [])); if (cur.has(id)) cur.delete(id); else cur.add(id); return { ...prev, [activeDayKey]: cur }; });
  }
  function copyActiveDayToAll() {
    setDayToLocationIds((prev) => { const src = new Set(Array.from(prev[activeDayKey] || [])); const out: Record<string, Set<string>> = { ...prev }; for (const d of days) out[toDayKey(d)] = new Set(Array.from(src)); return out; });
  }

  async function savePlan() {
    setErr(null); setInfo(null);
    if (!selectedDsfId) return setErr('Select DSF');
    const daysMap: Record<string, string[]> = {};
    let any = false;
    for (const d of days) { const k = toDayKey(d); const ids = Array.from(dayToLocationIds[k] || new Set()).map(String).sort(); daysMap[k] = ids; if (ids.length) any = true; }
    if (!any) return setErr('Select at least one location in at least one day');
    const locationsSnapshot: Record<string, any> = {};
    for (const loc of locations) { locationsSnapshot[String(loc.id)] = { id: String(loc.id), name: loc.name, ownerName: loc.ownerName, ownerPhoneNumber: loc.ownerPhoneNumber, lat: loc.lat, lng: loc.lng }; }
    setSaving(true);
    try {
      await apiFetch('/api/journey-plans', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dsfId: selectedDsfId, distributorId: selectedDsf?.distributorId || null, periodType, startDate, endDate: toDayKey(endDt), days: daysMap, locationsSnapshot }) });
      setInfo('Journey plan saved successfully');
      await loadAll();
    } catch (e:any) { setErr(e?.message || 'Failed to save plan'); } finally { setSaving(false); }
  }

  return (
    <Shell title="Journey Plans" subtitle="Assign daily locations to each DSF.">
      {err ? <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</div> : null}
      {info ? <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{info}</div> : null}
      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardTitle>Create / Update DSF Journey Plan</CardTitle>
          <div className="mt-4 grid gap-3">
            <label className="block"><span className="mb-1 block text-xs font-semibold text-black/60">DSF</span><select className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-violet-500" value={selectedDsfId} onChange={(e) => setSelectedDsfId(e.target.value ? Number(e.target.value) : '')}><option value="">Select DSF</option>{dsfs.map((s) => <option key={s.id} value={s.id}>{s.name}{s.distributorName ? ` — ${s.distributorName}` : ''}</option>)}</select></label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="block"><span className="mb-1 block text-xs font-semibold text-black/60">Plan Type</span><select className="h-11 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-violet-500" value={periodType} onChange={(e) => setPeriodType(e.target.value as 'weekly' | 'monthly')}><option value="weekly">Weekly</option><option value="monthly">Monthly</option></select></label>
              <Input label="Start date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div className="rounded-xl bg-black/5 p-3 text-sm text-black/70">End date: <span className="font-bold text-slate-900">{toDayKey(endDt)}</span></div>
            <Button variant="ghost" onClick={copyActiveDayToAll}>Copy active day locations to all days</Button>
            <Button onClick={savePlan} disabled={saving}>{saving ? 'Saving…' : 'Save journey plan'}</Button>
          </div>
        </Card>

        <div className="grid gap-4">
          <Card>
            <div className="flex items-center justify-between gap-3"><CardTitle>{activeDate ? `${WD[activeDate.getDay()]} • ${prettyDate(activeDate)}` : 'Select a day'}</CardTitle><div className="text-xs text-black/50">Choose day tabs below, then select locations for that day.</div></div>
            <div className="mt-4 flex flex-wrap gap-2">{days.map((d) => { const key = toDayKey(d); const active = key === activeDayKey; const count = (dayToLocationIds[key] || new Set()).size; return <button key={key} onClick={() => setActiveDayKey(key)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${active ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-black/10 bg-white text-black/70 hover:bg-black/5'}`}>{WD[d.getDay()]}<div className="text-xs font-normal">{prettyDate(d)}</div><div className="mt-1 text-[10px] text-black/45">{count} location{count === 1 ? '' : 's'}</div></button>; })}</div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3"><CardTitle>Locations for active day</CardTitle><div className="text-xs text-black/50">Selected: {activeSet.size}</div></div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">{locations.map((loc) => { const checked = activeSet.has(String(loc.id)); return <label key={loc.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${checked ? 'border-violet-300 bg-violet-50' : 'border-black/10 bg-white hover:bg-black/[0.02]'}`}><input type="checkbox" checked={checked} onChange={() => toggleLocation(String(loc.id))} className="mt-1 h-4 w-4 rounded border-black/20 text-violet-600 focus:ring-violet-500" /><div><div className="font-bold text-slate-900">{loc.name}</div><div className="mt-1 text-xs text-black/60">Owner: {loc.ownerName || '-'} • {loc.ownerPhoneNumber || '-'}</div><div className="mt-1 text-xs text-black/60">Lat: {loc.lat} • Lng: {loc.lng}</div></div></label>; })}{!locations.length ? <div className="text-sm text-black/60">No locations found. Add locations first.</div> : null}</div>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-3"><CardTitle>Saved Plans</CardTitle><Button variant="ghost" onClick={() => loadAll().catch(() => {})}>Refresh</Button></div>
            <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-xs font-bold text-black/50"><th className="py-2">DSF</th><th className="py-2">Distributor</th><th className="py-2">Type</th><th className="py-2">Start</th><th className="py-2">End</th><th className="py-2">Selected days</th></tr></thead><tbody>{plans.map((p) => <tr key={p.id} className="border-t border-black/5"><td className="py-3 font-semibold">{dsfs.find((x) => Number(x.id) === Number(p.dsfId))?.name || p.dsfId}</td><td className="py-3 text-black/70">{dsfs.find((x) => Number(x.id) === Number(p.dsfId))?.distributorName || p.distributorId || '-'}</td><td className="py-3 text-black/70">{p.periodType}</td><td className="py-3 text-black/70">{p.startDate}</td><td className="py-3 text-black/70">{p.endDate}</td><td className="py-3 text-black/70">{p.selectedDaysCount || 0}</td></tr>)}{!plans.length ? <tr><td className="py-6 text-center text-black/60" colSpan={6}>No journey plans found.</td></tr> : null}</tbody></table></div>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
