import { useEffect, useMemo, useState } from 'react';
import { LayoutDashboard, Search, Lightbulb, GitMerge, FileText, Mail, KanbanSquare, Flame, Printer, Plus } from 'lucide-react';
import {
  ORG_TYPES, OFFER_RULES, PIPELINE_STAGES, computeMetrics, estimateProjectValue, generateOutreach, generateProposal,
  matchOffer, revenueScore, scoreBand, searchProspects, topOpportunities, usd,
  type Deal, type OrgType, type Prospect, type Stage,
} from '../../lib/pis';
import { SEED_PROSPECTS, SEED_STAGES } from '../../lib/pis-data';

type Screen = 'dashboard' | 'discovery' | 'intelligence' | 'match' | 'proposal' | 'outreach' | 'pipeline';

const SCREENS: { id: Screen; label: string; icon: typeof Search }[] = [
  { id: 'dashboard', label: 'Revenue Dashboard', icon: LayoutDashboard },
  { id: 'discovery', label: 'Prospect Discovery', icon: Search },
  { id: 'intelligence', label: 'Opportunity Intelligence', icon: Lightbulb },
  { id: 'match', label: 'Revenue Match Engine', icon: GitMerge },
  { id: 'proposal', label: 'Proposal Generator', icon: FileText },
  { id: 'outreach', label: 'Outreach Generator', icon: Mail },
  { id: 'pipeline', label: 'Pipeline', icon: KanbanSquare },
];

const STORAGE_KEY = 'pis-deals-v1';

function initialDeals(): Deal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Deal[];
  } catch { /* ignore */ }
  return SEED_PROSPECTS.filter((p) => SEED_STAGES[p.id]).map((p) => ({
    prospectId: p.id, stage: SEED_STAGES[p.id], value: estimateProjectValue(p),
  }));
}

const bandColor: Record<string, string> = {
  'Hot Prospect': 'bg-rose-100 text-rose-700',
  Qualified: 'bg-emerald-100 text-emerald-700',
  Nurture: 'bg-amber-100 text-amber-700',
  Low: 'bg-slate-100 text-slate-600',
};

function ScoreBadge({ p }: { p: Prospect }) {
  const s = revenueScore(p.factors);
  const b = scoreBand(s);
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${bandColor[b]}`}>{s} · {b}</span>;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold text-slate-800">{title}</h3>
      {children}
    </div>
  );
}

function List({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{items.map((i) => <li key={i}>{i}</li>)}</ul>;
}

export function ProspectIntelligence() {
  const [screen, setScreen] = useState<Screen>('dashboard');
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [selectedId, setSelectedId] = useState<string>(SEED_PROSPECTS[0].id);
  const [query, setQuery] = useState<{ industry: string; location: string; orgType: OrgType | '' }>({ industry: '', location: 'Florida', orgType: '' });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(deals)); } catch { /* ignore */ }
  }, [deals]);

  const byId = useMemo(() => new Map(SEED_PROSPECTS.map((p) => [p.id, p])), []);
  const selected = byId.get(selectedId) ?? SEED_PROSPECTS[0];
  const metrics = computeMetrics(deals);
  const results = useMemo(() => searchProspects(SEED_PROSPECTS, query), [query]);
  const stageOf = (id: string) => deals.find((d) => d.prospectId === id)?.stage;

  const addToPipeline = (p: Prospect) =>
    setDeals((ds) => (ds.some((d) => d.prospectId === p.id) ? ds : [...ds, { prospectId: p.id, stage: 'Identified', value: estimateProjectValue(p) }]));
  const setStage = (id: string, stage: Stage) => setDeals((ds) => ds.map((d) => (d.prospectId === id ? { ...d, stage } : d)));
  const open = (id: string, s: Screen) => { setSelectedId(id); setScreen(s); };

  const metricCards: [string, string][] = [
    ['Prospects Found', String(metrics.prospectsFound)],
    ['Organizations Researched', String(metrics.organizationsResearched)],
    ['Qualified Leads', String(metrics.qualifiedLeads)],
    ['Meetings Booked', String(metrics.meetingsBooked)],
    ['Proposals Sent', String(metrics.proposalsSent)],
    ['Pipeline Value', usd(metrics.pipelineValue)],
    ['Revenue Closed', usd(metrics.revenueClosed)],
  ];
  const primary = new Set(['Meetings Booked', 'Proposals Sent', 'Pipeline Value', 'Revenue Closed']);

  const outreach = generateOutreach(selected);
  const proposal = generateProposal(selected);

  const input = 'rounded-lg border border-slate-300 px-3 py-2 text-sm';

  const ProspectPicker = (
    <select className={input} value={selectedId} onChange={(e) => setSelectedId(e.target.value)} aria-label="Select prospect">
      {SEED_PROSPECTS.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
    </select>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white px-6 py-4 print:hidden">
        <h1 className="text-xl font-bold">PIS · Prospect Intelligence System</h1>
        <p className="text-sm text-slate-600">Generate revenue for every PulseOS asset. Sample data shown for demonstration.</p>
        <nav className="mt-3 flex flex-wrap gap-2">
          {SCREENS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setScreen(id)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium ${screen === id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              <Icon className="h-4 w-4" />{label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl space-y-4 p-6">
        {screen === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {metricCards.map(([label, value]) => (
                <div key={label} className={`rounded-xl border p-4 ${primary.has(label) ? 'border-slate-900 bg-white' : 'border-slate-200 bg-white'}`}>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
                  <div className="mt-1 text-2xl font-bold">{value}</div>
                </div>
              ))}
            </div>
            <Card title="Top 10 Revenue Opportunities">
              <ol className="divide-y divide-slate-100">
                {topOpportunities(SEED_PROSPECTS, deals).map((p, i) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                    <span className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-rose-500" />{i + 1}. <button className="font-medium underline" onClick={() => open(p.id, 'intelligence')}>{p.name}</button>
                      <span className="text-slate-500">{matchOffer(p.orgType)}</span>
                    </span>
                    <span className="flex items-center gap-3"><ScoreBadge p={p} /><strong>{usd(estimateProjectValue(p))}</strong><span className="text-slate-500">{stageOf(p.id)}</span></span>
                  </li>
                ))}
              </ol>
            </Card>
          </>
        )}

        {screen === 'discovery' && (
          <>
            <div className="flex flex-wrap gap-2">
              <input className={input} placeholder="Industry (e.g. Higher Education)" value={query.industry} onChange={(e) => setQuery({ ...query, industry: e.target.value })} aria-label="Industry" />
              <input className={input} placeholder="Location (e.g. Florida, FL)" value={query.location} onChange={(e) => setQuery({ ...query, location: e.target.value })} aria-label="Location" />
              <select className={input} value={query.orgType} onChange={(e) => setQuery({ ...query, orgType: e.target.value as OrgType | '' })} aria-label="Organization Type">
                <option value="">All organization types</option>
                {ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <p className="text-xs text-slate-500">Examples: Florida School Districts, Community Colleges, Workforce Boards, Construction Companies, Training Companies. Tip: use "FL" or a city for location.</p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600">
                  <tr><th className="p-3">Organization</th><th className="p-3">Website</th><th className="p-3">Size</th><th className="p-3">Contact</th><th className="p-3">Revenue Score</th><th className="p-3" /></tr>
                </thead>
                <tbody>
                  {results.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100">
                      <td className="p-3"><button className="font-medium underline" onClick={() => open(p.id, 'intelligence')}>{p.name}</button><div className="text-xs text-slate-500">{p.orgType} · {p.location}</div></td>
                      <td className="p-3">{p.website}</td>
                      <td className="p-3">{p.size}</td>
                      <td className="p-3">{p.contact.name}, {p.contact.title}<div className="text-xs text-slate-500">{p.contact.email} · {p.contact.phone}</div></td>
                      <td className="p-3"><ScoreBadge p={p} /></td>
                      <td className="p-3">
                        {stageOf(p.id) ? <span className="text-xs text-slate-500">{stageOf(p.id)}</span> : (
                          <button className="flex items-center gap-1 rounded-lg bg-slate-900 px-2 py-1 text-xs text-white" onClick={() => addToPipeline(p)}><Plus className="h-3 w-3" />Pipeline</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {results.length === 0 && <tr><td className="p-4 text-slate-500" colSpan={6}>No prospects match this search.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {screen === 'intelligence' && (
          <>
            {ProspectPicker}
            <div className="grid gap-3 md:grid-cols-2">
              <Card title="Organization Summary"><p className="text-sm text-slate-700">{selected.summary}</p><div className="mt-2"><ScoreBadge p={selected} /></div></Card>
              <Card title="Recommended Offer"><p className="text-sm font-semibold">{matchOffer(selected.orgType)}</p><p className="mt-2 text-sm text-slate-600">Estimated Project Value: <strong>{usd(estimateProjectValue(selected))}</strong></p></Card>
              <Card title="Current Challenges"><List items={selected.challenges} /></Card>
              <Card title="Training Opportunities"><List items={selected.trainingOpportunities} /></Card>
              <Card title="Likely Funding Sources"><List items={selected.fundingSources} /></Card>
              <Card title="Decision Makers"><List items={selected.decisionMakers} /></Card>
              <Card title="Revenue Score Breakdown">
                <div className="space-y-1 text-sm">
                  <div>Urgency (30%): {selected.factors.urgency}</div>
                  <div>Budget (25%): {selected.factors.budget}</div>
                  <div>Strategic Fit (25%): {selected.factors.strategicFit}</div>
                  <div>Ease of Access (20%): {selected.factors.easeOfAccess}</div>
                </div>
              </Card>
            </div>
            <div className="flex gap-2">
              <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white" onClick={() => setScreen('outreach')}>Generate outreach</button>
              <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm text-white" onClick={() => setScreen('proposal')}>Generate proposal</button>
              {!stageOf(selected.id) && <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm" onClick={() => addToPipeline(selected)}>Add to pipeline</button>}
            </div>
          </>
        )}

        {screen === 'match' && (
          <>
            <Card title="Matching rules">
              <ul className="space-y-1 text-sm">
                {ORG_TYPES.map((t) => <li key={t}><strong>{t}</strong> → {OFFER_RULES[t]}</li>)}
              </ul>
            </Card>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase text-slate-600"><tr><th className="p-3">Prospect</th><th className="p-3">Type</th><th className="p-3">Matched Offer</th><th className="p-3">Est. Value</th></tr></thead>
                <tbody>
                  {SEED_PROSPECTS.map((p) => (
                    <tr key={p.id} className="border-t border-slate-100"><td className="p-3">{p.name}</td><td className="p-3">{p.orgType}</td><td className="p-3 font-medium">{matchOffer(p.orgType)}</td><td className="p-3">{usd(estimateProjectValue(p))}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {screen === 'proposal' && (
          <>
            <div className="flex items-center gap-2 print:hidden">
              {ProspectPicker}
              <button className="flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white" onClick={() => window.print()}><Printer className="h-4 w-4" />Save as PDF</button>
            </div>
            <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-8">
              <h2 className="text-2xl font-bold">Proposal: {matchOffer(selected.orgType)}</h2>
              <p className="text-sm text-slate-500">Prepared for {selected.name} · Attn: {selected.contact.name}, {selected.contact.title}</p>
              <section><h3 className="font-semibold">Executive Summary</h3><p className="text-sm text-slate-700">{proposal.executiveSummary}</p></section>
              <section><h3 className="font-semibold">Scope</h3><List items={proposal.scope} /></section>
              <section><h3 className="font-semibold">Deliverables</h3><List items={proposal.deliverables} /></section>
              <section><h3 className="font-semibold">Timeline</h3><List items={proposal.timeline.map((t) => `${t.phase}: ${t.duration}`)} /></section>
              <section><h3 className="font-semibold">Investment</h3><p className="text-sm text-slate-700"><strong>{usd(proposal.investment.value)}</strong>. {proposal.investment.terms}</p></section>
              <section><h3 className="font-semibold">Next Steps</h3><List items={proposal.nextSteps} /></section>
            </article>
          </>
        )}

        {screen === 'outreach' && (
          <>
            {ProspectPicker}
            <div className="grid gap-3 md:grid-cols-2">
              <Card title="Cold Email"><pre className="whitespace-pre-wrap text-sm text-slate-700">{outreach.coldEmail}</pre></Card>
              <Card title="LinkedIn Message"><p className="text-sm text-slate-700">{outreach.linkedIn}</p></Card>
              <Card title="Call Script"><pre className="whitespace-pre-wrap text-sm text-slate-700">{outreach.callScript}</pre></Card>
              <Card title="Meeting Agenda"><List items={outreach.meetingAgenda} /></Card>
              <Card title="Discovery Questions"><List items={outreach.discoveryQuestions} /></Card>
            </div>
          </>
        )}

        {screen === 'pipeline' && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {PIPELINE_STAGES.map((stage) => {
              const inStage = deals.filter((d) => d.stage === stage);
              return (
                <div key={stage} className="w-60 shrink-0 rounded-xl bg-slate-100 p-2">
                  <div className="mb-2 flex justify-between px-1 text-xs font-semibold uppercase text-slate-600"><span>{stage}</span><span>{inStage.length} · {usd(inStage.reduce((s, d) => s + d.value, 0))}</span></div>
                  <div className="space-y-2">
                    {inStage.map((d) => {
                      const p = byId.get(d.prospectId);
                      if (!p) return null;
                      return (
                        <div key={d.prospectId} className="rounded-lg border border-slate-200 bg-white p-2 text-sm">
                          <button className="text-left font-medium underline" onClick={() => open(p.id, 'intelligence')}>{p.name}</button>
                          <div className="text-xs text-slate-500">{matchOffer(p.orgType)} · {usd(d.value)}</div>
                          <select className="mt-1 w-full rounded border border-slate-300 text-xs" value={d.stage} onChange={(e) => setStage(p.id, e.target.value as Stage)} aria-label={`Stage for ${p.name}`}>
                            {PIPELINE_STAGES.map((s) => <option key={s}>{s}</option>)}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
