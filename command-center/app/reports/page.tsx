"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import StatCard from "@/components/StatCard";
import { getSupabase } from "@/lib/supabase";
import type { Campaign, Lead, LeadStageHistory, Traffic } from "@/lib/types";

const STAGES = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];
const COLORS = ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#fb7185", "#818cf8"];
const tooltipStyle = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 };
const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const percent = (numerator: number, denominator: number) =>
  denominator ? `${((numerator / denominator) * 100).toFixed(1)}%` : "—";
const labelSource = (source: string | null) => source?.trim() || "Unknown";
const weekStart = (date: string) => {
  const start = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  return start.toISOString().slice(0, 10);
};
const periodLabel = (period: string, weekly: boolean) =>
  weekly
    ? new Date(`${period}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
    : period;

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
      <h2 className="mb-4 text-sm font-medium text-slate-300">{title}</h2>
      {children}
    </section>
  );
}

export default function SalesReportsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [history, setHistory] = useState<LeadStageHistory[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [weekly, setWeekly] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const sb = getSupabase();
      const [leadResult, historyResult, campaignResult, trafficResult] = await Promise.all([
        sb.from("cc_leads").select("*"),
        sb.from("cc_lead_stage_history").select("*"),
        sb.from("cc_campaigns").select("*"),
        sb.from("cc_traffic").select("*"),
      ]);
      const queryError = [leadResult, historyResult, campaignResult, trafficResult].find((result) => result.error)?.error;
      if (queryError) {
        setError(queryError.message);
        return;
      }
      setLeads((leadResult.data as Lead[]) ?? []);
      setHistory((historyResult.data as LeadStageHistory[]) ?? []);
      setCampaigns((campaignResult.data as Campaign[]) ?? []);
      setTraffic((trafficResult.data as Traffic[]) ?? []);
      setError(null);
      setLastUpdated(Date.now());
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const leadCountByPeriod = new Map<string, Record<string, number | string>>();
  const sources = [...new Set(leads.map((lead) => labelSource(lead.source)))].sort();
  for (const lead of leads) {
    const key = weekly ? weekStart(lead.created_at) : lead.created_at.slice(0, 7);
    const point = leadCountByPeriod.get(key) ?? { period: key };
    const source = labelSource(lead.source);
    point[source] = Number(point[source] ?? 0) + 1;
    leadCountByPeriod.set(key, point);
  }
  const leadVolume = [...leadCountByPeriod.values()]
    .sort((a, b) => String(a.period).localeCompare(String(b.period)))
    .slice(-12)
    .map((point) => ({ ...point, period: periodLabel(String(point.period), weekly) }));

  const qualifiedLeads = leads.filter((lead) => ["Qualified", "Proposal", "Won"].includes(lead.status));
  const customers = leads.filter((lead) => lead.status === "Won");
  const activeQualified = leads.filter((lead) => ["Qualified", "Proposal"].includes(lead.status));
  const pipelineValue = activeQualified.reduce((total, lead) => total + Number(lead.opportunity_value || 0), 0);
  const averageDealValue = activeQualified.length ? pipelineValue / activeQualified.length : 0;
  const sessions = traffic.reduce((total, row) => total + Number(row.sessions || 0), 0);
  const attributedLeads = traffic.reduce((total, row) => total + Number(row.leads || 0), 0);
  const funnel = [
    { stage: "Visits", count: sessions },
    { stage: "Leads", count: attributedLeads },
    { stage: "Qualified", count: qualifiedLeads.length },
    { stage: "Customers", count: customers.length },
  ];

  const completedDurations = new Map<string, number[]>();
  for (const row of history) {
    if (!row.exited_at) continue;
    const duration = Date.parse(row.exited_at) - Date.parse(row.entered_at);
    if (!Number.isFinite(duration) || duration < 0) continue;
    completedDurations.set(row.stage, [...(completedDurations.get(row.stage) ?? []), duration]);
  }
  const stageAverages = STAGES.map((stage) => {
    const durations = completedDurations.get(stage) ?? [];
    const averageHours = durations.length
      ? durations.reduce((sum, value) => sum + value, 0) / durations.length / 3_600_000
      : null;
    return { stage, averageHours, count: durations.length };
  });

  const emailCampaigns = campaigns.filter((campaign) => campaign.channel === "Email");
  const campaignTotals = emailCampaigns.reduce(
    (totals, campaign) => ({
      sent: totals.sent + Number(campaign.sent_count || 0),
      opens: totals.opens + Number(campaign.open_count || 0),
      clicks: totals.clicks + Number(campaign.click_count || 0),
      conversions: totals.conversions + Number(campaign.conversions || 0),
    }),
    { sent: 0, opens: 0, clicks: 0, conversions: 0 },
  );
  const topCampaigns = [...campaigns]
    .sort((a, b) => Number(b.conversions) - Number(a.conversions) || Number(b.click_count) - Number(a.click_count))
    .slice(0, 5);

  const pageTotals = new Map<string, { title: string; sessions: number; leads: number }>();
  for (const row of traffic) {
    const page = pageTotals.get(row.page_path) ?? {
      title: row.page_title || row.page_path,
      sessions: 0,
      leads: 0,
    };
    page.sessions += Number(row.sessions || 0);
    page.leads += Number(row.leads || 0);
    pageTotals.set(row.page_path, page);
  }
  const overallPageConversion = traffic.reduce((total, row) => total + Number(row.leads || 0), 0) / (sessions || 1);
  const lowConversionPages = [...pageTotals.entries()]
    .map(([path, metrics]) => ({ path, ...metrics, conversion: metrics.leads / (metrics.sessions || 1) }))
    .filter((page) => page.sessions >= 20 && overallPageConversion > 0 && page.conversion < overallPageConversion / 2)
    .sort((a, b) => a.conversion - b.conversion)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Sales &amp; Conversion Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : "Loading reporting data…"}
            {" · "}Auto-refreshes every minute
          </p>
        </div>
        <button
          onClick={() => void load()}
          disabled={loading}
          className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Visit → Lead" value={percent(attributedLeads, sessions)} sub={`${sessions.toLocaleString()} tracked sessions`} accent="text-cyan-400" />
        <StatCard label="Lead → Qualified" value={percent(qualifiedLeads.length, leads.length)} sub={`${qualifiedLeads.length} qualified or later`} accent="text-violet-400" />
        <StatCard label="Qualified → Customer" value={percent(customers.length, qualifiedLeads.length)} sub={`${customers.length} won leads`} accent="text-emerald-400" />
        <StatCard label="Qualified Pipeline" value={money(pipelineValue)} sub={`${activeQualified.length} qualified leads · ${money(averageDealValue)} avg. deal`} accent="text-amber-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Lead Volume by Source">
          <div className="mb-3 flex justify-end gap-2 text-xs">
            <button onClick={() => setWeekly(true)} className={weekly ? "text-cyan-300" : "text-slate-500"}>Weekly</button>
            <button onClick={() => setWeekly(false)} className={!weekly ? "text-cyan-300" : "text-slate-500"}>Monthly</button>
          </div>
          {leadVolume.length ? (
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={leadVolume}>
                  <CartesianGrid stroke="#1e293b" />
                  <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend />
                  {sources.map((source, index) => (
                    <Bar key={source} dataKey={source} stackId="leads" fill={COLORS[index % COLORS.length]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="py-16 text-center text-sm text-slate-500">No lead records to report yet.</p>}
        </Card>

        <Card title="Conversion Funnel">
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={funnel} layout="vertical" margin={{ left: 12, right: 16 }}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis type="number" allowDecimals={false} stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="stage" stroke="#64748b" fontSize={12} width={76} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-slate-500">Visits and attributed leads come from traffic data; later stages come from lead statuses.</p>
        </Card>

        <Card title="Average Time in Funnel Stage">
          {history.some((row) => row.exited_at) ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr><th className="py-2">Stage</th><th className="py-2">Avg. completed time</th><th className="py-2">Records</th></tr>
                </thead>
                <tbody>
                  {stageAverages.map(({ stage, averageHours, count }) => (
                    <tr key={stage} className="border-t border-slate-800">
                      <td className="py-3 text-slate-300">{stage}</td>
                      <td className="py-3 text-slate-200">
                        {averageHours == null ? "—" : averageHours >= 24 ? `${(averageHours / 24).toFixed(1)} days` : `${averageHours.toFixed(1)} hours`}
                      </td>
                      <td className="py-3 text-slate-500">{count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="py-12 text-center text-sm text-slate-500">Stage duration reporting starts after stage changes are tracked.</p>}
          <p className="mt-3 text-xs text-slate-500">Completed stage intervals only. History begins when the schema trigger is installed.</p>
        </Card>

        <Card title="Email Campaign Performance">
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-xs text-slate-500">Open rate</p><p className="mt-1 text-lg font-semibold text-cyan-300">{percent(campaignTotals.opens, campaignTotals.sent)}</p></div>
            <div><p className="text-xs text-slate-500">Click rate</p><p className="mt-1 text-lg font-semibold text-violet-300">{percent(campaignTotals.clicks, campaignTotals.sent)}</p></div>
            <div><p className="text-xs text-slate-500">Click → conversion</p><p className="mt-1 text-lg font-semibold text-emerald-300">{percent(campaignTotals.conversions, campaignTotals.clicks)}</p></div>
          </div>
          <p className="mt-2 text-xs text-slate-500">Rates are aggregated from campaign totals; click rate uses sent as its denominator.</p>
          <p className="mt-4 text-xs text-slate-500">{emailCampaigns.length} email campaigns included in these rates.</p>
        </Card>

        <Card title="Top Performing Content & Campaigns">
          {topCampaigns.length ? (
            <div className="space-y-3">
              {topCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-sm first:border-0 first:pt-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-200">{campaign.content_title || campaign.campaign_name}</p>
                    <p className="text-xs text-slate-500">{campaign.campaign_name} · {campaign.channel}</p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-slate-400">
                    {campaign.conversions} conversions · {campaign.click_count} clicks
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="py-10 text-center text-sm text-slate-500">No campaign metrics available yet.</p>}
        </Card>
      </div>

      <Card title="Potential Low-Conversion Pages">
        {lowConversionPages.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr><th className="py-2">Page</th><th className="py-2">Sessions</th><th className="py-2">Leads</th><th className="py-2">Conversion</th></tr>
              </thead>
              <tbody>
                {lowConversionPages.map((page) => (
                  <tr key={page.path} className="border-t border-slate-800">
                    <td className="py-3 text-slate-300">{page.title} <span className="text-slate-600">{page.path}</span></td>
                    <td className="py-3 text-slate-400">{page.sessions}</td>
                    <td className="py-3 text-slate-400">{page.leads}</td>
                    <td className="py-3 text-amber-300">{percent(page.leads, page.sessions)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-slate-500">Flags pages with at least 20 sessions and less than half the overall traffic conversion rate.</p>
          </div>
        ) : <p className="text-sm text-slate-500">No low-conversion pages detected. At least 20 sessions per page are required.</p>}
      </Card>
    </div>
  );
}
