import { useState } from 'react';
import { Activity, Bot, ClipboardList, Gauge, ScrollText, ShieldCheck } from 'lucide-react';
import type { Anomaly, RiskLevel } from '../../lib/trust-center/types';
import { useTrustCenterData } from './useTrustCenterData';

export type TrustCenterView = 'overview' | 'risk-monitor' | 'investigations' | 'audit-logs' | 'integrity-ai';

const nav: { id: TrustCenterView; label: string; icon: typeof Gauge }[] = [
  { id: 'overview', label: 'Overview', icon: Gauge },
  { id: 'risk-monitor', label: 'Risk Monitor', icon: Activity },
  { id: 'investigations', label: 'Investigations', icon: ClipboardList },
  { id: 'audit-logs', label: 'Audit Logs', icon: ScrollText },
  { id: 'integrity-ai', label: 'Integrity AI', icon: Bot },
];

const riskStyle: Record<RiskLevel, string> = {
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

const Badge = ({ level }: { level: RiskLevel }) => (
  <span className={`rounded-full border px-2 py-0.5 text-xs font-bold uppercase ${riskStyle[level]}`}>{level}</span>
);

const Card = ({ label, value, level }: { label: string; value: string | number; level?: RiskLevel }) => (
  <div className={`rounded-2xl border p-5 ${level ? riskStyle[level] : 'border-slate-200 bg-white text-navy-950'}`}>
    <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
    <p className="mt-2 text-3xl font-black">{value}</p>
  </div>
);

function InvestigationList({ items }: { items: Anomaly[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-500">No open investigations.</p>;
  return (
    <ul className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
      {items.map((a) => (
        <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-bold text-navy-950">{a.type.replace(/_/g, ' ')} · {a.entity_type} {a.entity_id}</p>
            <p className="text-sm text-slate-600">{a.description}</p>
          </div>
          <div className="flex items-center gap-2"><Badge level={a.severity} /><span className="text-xs font-semibold uppercase text-slate-500">{a.status}</span></div>
        </li>
      ))}
    </ul>
  );
}

export function TrustCenter({ initialView = 'overview' }: { initialView?: TrustCenterView }) {
  const [view, setView] = useState<TrustCenterView>(initialView);
  const { data, demo, loading, reload } = useTrustCenterData();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-navy-950 px-6 py-5 text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3"><ShieldCheck className="h-7 w-7 text-gold-400" /><h1 className="text-xl font-black">PulseOS Trust Center</h1></div>
          <nav aria-label="PulseOS" className="flex gap-4 text-sm font-semibold text-white/80">
            <a href="/" className="hover:text-white">Workforce</a>
            <a href="/learning-intelligence" className="hover:text-white">Learning</a>
            <a href="/course-builder" className="hover:text-white">Competencies</a>
            <a href="/course-builder/analytics" className="hover:text-white">Analytics</a>
          </nav>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-6 md:grid-cols-[200px_1fr]">
        <nav aria-label="Trust Center" className="flex gap-2 md:flex-col">
          {nav.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => { setView(id); window.history.replaceState(null, '', id === 'overview' ? '/trust-center' : `/trust-center/${id}`); }}
              aria-current={view === id ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold ${view === id ? 'bg-navy-950 text-white' : 'text-slate-700 hover:bg-slate-200'}`}>
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </nav>
        <main className="space-y-5">
          {demo && <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">Showing dev-only sample data. Apply the Trust Center migration and ingest events to see live data.</p>}
          {loading || !data ? <p className="text-sm text-slate-500">Loading…</p> : <>
            {view === 'overview' && <>
              <h2 className="text-lg font-black">Overview</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Card label="Overall trust score" value={data.overview.overallScore} />
                <Card label="Low risk" value={data.overview.riskCounts.low} level="low" />
                <Card label="Medium risk" value={data.overview.riskCounts.medium} level="medium" />
                <Card label="High risk" value={data.overview.riskCounts.high} level="high" />
                <Card label="Open investigations" value={data.overview.openInvestigations} />
                <Card label="Resolved" value={data.overview.resolved} />
              </div>
              <h3 className="font-black">High-risk items</h3>
              <InvestigationList items={data.investigations.filter((a) => a.severity === 'high').slice(0, 5)} />
            </>}
            {view === 'risk-monitor' && <>
              <h2 className="text-lg font-black">Risk Monitor</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.scores.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase text-slate-500">{s.entity_type}</p><Badge level={s.risk_level} /></div>
                    <p className="mt-1 truncate font-bold text-navy-950">{s.entity_id}</p>
                    <p className="text-2xl font-black">{s.score}<span className="text-sm font-semibold text-slate-500"> / 100</span></p>
                  </div>
                ))}
              </div>
            </>}
            {view === 'investigations' && <>
              <h2 className="text-lg font-black">Investigations</h2>
              <InvestigationList items={data.investigations} />
            </>}
            {view === 'audit-logs' && <>
              <h2 className="text-lg font-black">Audit Logs</h2>
              <ol className="space-y-2 border-l-2 border-slate-200 pl-4">
                {data.audit.map((e) => (
                  <li key={e.id} className="text-sm">
                    <p className="font-bold text-navy-950">{e.event_type} <span className="font-normal text-slate-600">· {e.entity_type} {e.entity_id} · by {e.actor_id}</span></p>
                    <time className="text-xs text-slate-500" dateTime={e.timestamp}>{new Date(e.timestamp).toLocaleString()}</time>
                  </li>
                ))}
              </ol>
            </>}
            {view === 'integrity-ai' && <>
              <h2 className="text-lg font-black">Integrity AI</h2>
              <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">PulseAI Integrity Agent (risk narratives, executive summaries, recommendations) is planned for the next sprint. It will consume the same trust scores, anomalies, and audit log shown here.</p>
            </>}
            <button type="button" onClick={() => void reload()} className="text-sm font-bold text-navy-950 underline">Refresh</button>
          </>}
        </main>
      </div>
    </div>
  );
}
