'use client';

import { useEffect, useState } from 'react';
import { useRequireAuth } from '../lib/auth';
import { apiFetch } from '../lib/api';
import { Shell } from '../components/shell';
import { Card, CardTitle } from '../components/ui/card';

type Highlight = { employeeName?: string; locationName?: string; totalQuantity: number; totalWeight: number; };
type HighlightResult = { weekFrom: string; weekTo: string; monthFrom: string; monthTo: string; topEmployeeThisWeek: Highlight | null; topEmployeeThisMonth: Highlight | null; topMartThisWeek: Highlight | null; topMartThisMonth: Highlight | null; };
type Stats = { pending: number; employees: number; distributors: number; dsfs: number; cities: number; locations: number; products: number; };

const sparkBars = [92, 58, 43, 70, 85, 51, 96, 62, 88];
const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const lineA = [16, 12, 44, 28, 76, 40, 62, 31, 79];
const lineB = [7, 16, 20, 24, 48, 55, 50, 29, 63];

export default function DashboardPage() {
  const { user, loading } = useRequireAuth(['admin']);
  const [stats, setStats] = useState<Stats | null>(null);
  const [high, setHigh] = useState<HighlightResult | null>(null);
  const [topMode, setTopMode] = useState<'week' | 'month'>('week');
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    Promise.all([apiFetch<Stats>('/api/admin/stats'), apiFetch<HighlightResult>('/api/sales/highlights')])
      .then(([s, h]) => {
        setStats(s);
        setHigh(h);
      })
      .catch((e: any) => setErr(e?.message || 'Failed to load stats'));
  }, [loading, user]);

  const statCards = [
    { title: "Today's Sales", value: '0', change: '0%', accent: 'text-emerald-500' },
    { title: "Total's Users", value: String(stats?.employees ?? 3200), change: '0%', accent: 'text-emerald-500' },
    { title: 'Total Distributors', value: '0', change: '0%', accent: 'text-red-500' },
    { title: "Today's oRDER", value: '0', change: '0%', accent: 'text-emerald-500' },
  ];

  return (
    <Shell title="Dashboard" subtitle="">
      {err ? <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</div> : null}

      <div className="grid-stats">
        {statCards.map((item, index) => (
          <div key={item.title} className="mini-card px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-black/35">{item.title}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <div className="text-[32px] font-black leading-none text-slate-900">{item.value}</div>
                  <div className={`text-xs font-bold ${item.accent}`}>{item.change}</div>
                </div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-soft">{index + 1}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1.35fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Activity Users</CardTitle>
              <div className="mt-1 text-sm text-black/45">Visual summary similar to the reference dashboard.</div>
            </div>
            <div className="text-xs font-bold text-emerald-500">+23%</div>
          </div>

          <div className="mt-5 rounded-[22px] bg-gradient-to-r from-[#2f80ff] to-[#8b6cff] p-5 text-white shadow-soft">
            <div className="flex h-[190px] items-end gap-3">
              {sparkBars.map((v, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className="mx-auto w-full max-w-[34px] rounded-t-xl bg-white/90" style={{ height: `${v * 1.4}px` }} />
                  <div className="mt-2 text-[10px] font-semibold text-white/80">0{i + 1}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-4 gap-3 text-center">
            <div className="rounded-2xl bg-slate-50 p-3"><div className="text-2xl font-black">0</div><div className="text-xs text-black/45">Users</div></div>
            <div className="rounded-2xl bg-slate-50 p-3"><div className="text-2xl font-black">0</div><div className="text-xs text-black/45">Clicks</div></div>
            <div className="rounded-2xl bg-slate-50 p-3"><div className="text-2xl font-black">0</div><div className="text-xs text-black/45">Sales</div></div>
            <div className="rounded-2xl bg-slate-50 p-3"><div className="text-2xl font-black">0</div><div className="text-xs text-black/45">Items</div></div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Sales Overview</CardTitle>
              <div className="mt-1 text-sm text-black/45">Traffic vs sales trend</div>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-2 text-sky-500"><span className="h-2 w-2 rounded-full bg-sky-500" />Traffic</div>
              <div className="flex items-center gap-2 text-violet-500"><span className="h-2 w-2 rounded-full bg-violet-500" />Sales</div>
            </div>
          </div>

          <div className="mt-5 h-[330px] rounded-[22px] bg-slate-50 px-4 py-5">
            <svg viewBox="0 0 760 300" className="h-full w-full">
              {[0, 1, 2, 3].map((n) => (
                <line key={n} x1="40" y1={50 + n * 60} x2="730" y2={50 + n * 60} stroke="rgba(15,23,42,0.08)" strokeDasharray="4 8" />
              ))}
              {months.map((m, i) => (
                <text key={m} x={55 + i * 82} y="285" fontSize="12" fill="rgba(15,23,42,0.4)">{m}</text>
              ))}
              <polyline fill="none" stroke="#2f80ff" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={lineA.map((v, i) => `${55 + i * 82},${250 - v * 2.2}`).join(' ')} />
              <polyline fill="none" stroke="#a36dff" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={lineB.map((v, i) => `${55 + i * 82},${250 - v * 2.2}`).join(' ')} />
            </svg>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Projects</CardTitle>
            <div className="text-xs font-bold text-sky-500">done this month +40%</div>
          </div>
          <div className="mt-4 table-scroll">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-[0.16em] text-black/35">
                  <th className="py-3">Project</th>
                  <th className="py-3">Members</th>
                  <th className="py-3">Budget</th>
                  <th className="py-3">Completion</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Distributor Flow', '4', '$14,000', '60%'],
                  ['Journey Plan Upgrade', '3', '$8,000', '10%'],
                  ['Locations & Products', '2', '$6,500', '42%'],
                  ['Sales Graph Refresh', '5', '$12,500', '83%'],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-black/5">
                    <td className="py-4 font-bold text-slate-900">{row[0]}</td>
                    <td className="py-4 text-black/55">{row[1]}</td>
                    <td className="py-4 text-black/55">{row[2]}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-full max-w-[180px] overflow-hidden rounded-full bg-black/5">
                          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-blue-600" style={{ width: row[3] }} />
                        </div>
                        <span className="text-xs font-bold text-black/55">{row[3]}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Order History</CardTitle>
            <button className="rounded-xl bg-sky-50 px-3 py-2 text-xs font-bold text-sky-600">this month +20%</button>
          </div>

          <div className="mt-4 space-y-4">
            {[
              ['New order #354323', 'Jun 24 2026', 'bg-emerald-500'],
              // ['New order #354323', 'Jun 18 2026', 'bg-green-400'],
              // ['New order #354323', 'Jun 13 2026', 'bg-sky-500'],
              // ['New order #354323', 'Jun 12 2026', 'bg-blue-400'],
            ].map((item) => (
              <div key={item[0]} className="flex gap-3">
                <div className={`mt-1 h-3 w-3 rounded-full ${item[2]}`} />
                <div>
                  <div className="font-bold text-slate-900">{item[0]}</div>
                  <div className="text-xs text-black/45">{item[1]}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-[20px] bg-slate-50 p-4">
            <div className="text-xs font-bold uppercase tracking-[0.16em] text-black/35">Top Sales</div>
            <div className="mt-3 flex items-center gap-2">
              <button className={`rounded-xl px-3 py-2 text-xs font-bold ${topMode === 'week' ? 'bg-slate-900 text-white' : 'bg-white text-black/55'}`} onClick={() => setTopMode('week')}>Week</button>
              <button className={`rounded-xl px-3 py-2 text-xs font-bold ${topMode === 'month' ? 'bg-slate-900 text-white' : 'bg-white text-black/55'}`} onClick={() => setTopMode('month')}>Month</button>
            </div>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <div className="text-black/45">Top Employee</div>
                <div className="font-black text-slate-900">{topMode === 'week' ? high?.topEmployeeThisWeek?.employeeName || '—' : high?.topEmployeeThisMonth?.employeeName || '—'}</div>
              </div>
              <div>
                <div className="text-black/45">Top Location</div>
                <div className="font-black text-slate-900">{topMode === 'week' ? high?.topMartThisWeek?.locationName || '—' : high?.topMartThisMonth?.locationName || '—'}</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Shell>
  );
}
