"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import StatCard from "@/components/StatCard";
import { getSupabase } from "@/lib/supabase";

type Lead = {
  id: string;
  source: string | null;
  status: string;
  opportunity_value: number;
  created_at: string;
};
type Traffic = { date: string; visits: number };
type Campaign = {
  id: string;
  campaign_name: string;
  content_title: string | null;
  source: string | null;
  sent: number;
  opens: number;
  clicks: number;
  conversions: number;
};
type Stage = {
  lead_id: string;
  status: string;
  entered_at: string;
  exited_at: string | null;
};

const funnelStages = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];
const chartColors = ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24", "#f472b6", "#60a5fa"];
const tooltipStyle = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 };
const percent = (value: number) => `${(value * 100).toFixed(1)}%`;
const money = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function startOfPeriod(date: Date, granularity: "weekly" | "monthly") {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (granularity === "monthly") start.setUTCDate(1);
  else start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7));
  return start.toISOString().slice(0, 10);
}

function periods(granularity: "weekly" | "monthly", now: Date) {
  return Array.from({ length: granularity === "weekly" ? 12 : 6 }, (_, index) => {
    const start = granularity === "weekly"
      ? new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
      : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    if (granularity === "weekly") {
      start.setUTCDate(start.getUTCDate() - ((start.getUTCDay() + 6) % 7) - (11 - index) * 7);
    } else {
      start.setUTCMonth(start.getUTCMonth() - (5 - index));
    }
    return {
      key: start.toISOString().slice(0, 10),
      label: granularity === "monthly"
        ? start.toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" })
        : start.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    };
  });
}

export default function ReportsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [traffic, setTraffic] = useState<Traffic[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [granularity, setGranularity] = useState<"weekly" | "monthly">("weekly");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [now, setNow] = useState(() => new Date());

  const load = useCallback(async () => {
    try {
      const sb = getSupabase();
      const [leadResult, trafficResult, campaignResult, stageResult] = await Promise.all([
        sb.from("cc_leads").select("id,source,status,opportunity_value,created_at"),
        sb.from("cc_traffic").select("date,visits"),
        sb.from("cc_campaigns").select("id,campaign_name,content_title,source,sent,opens,clicks,conversions"),
        sb.from("cc_lead_stage_history").select("lead_id,status,entered_at,exited_at"),
      ]);
      const failed = [leadResult, trafficResult, campaignResult, stageResult].find((result) => result.error);
      if (failed?.error) throw new Error(failed.error.message);
      setLeads((leadResult.data as Lead[]) ?? []);
      setTraffic((trafficResult.data as Traffic[]) ?? []);
      setCampaigns((campaignResult.data as Campaign[]) ?? []);
      setStages((stageResult.data as Stage[]) ?? []);
      setError(null);
      setRefreshedAt(new Date());
      setNow(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const sourceNames = useMemo(
    () => Array.from(new Set(leads.map((lead) => lead.source?.trim() || "Unknown"))).sort(),
    [leads],
  );
  const leadVolume = useMemo(() => {
    const datePeriods = periods(granularity, now);
    return datePeriods.map(({ key, label }) => {
      const row: Record<string, string | number> = { period: label };
      for (const source of sourceNames) row[source] = 0;
      for (const lead of leads) {
        const source = lead.source?.trim() || "Unknown";
        if (startOfPeriod(new Date(lead.created_at), granularity) === key) {
          row[source] = Number(row[source] ?? 0) + 1;
        }
      }
      return row;
    });
  }, [granularity, leads, now, sourceNames]);

  const stageLeadIds = useMemo(() => {
    const seen = new Map<string, Set<string>>();
    for (const stage of stages) {
      if (!seen.has(stage.status)) seen.set(stage.status, new Set());
      seen.get(stage.status)?.add(stage.lead_id);
    }
    return seen;
  }, [stages]);
  const reachedQualified = new Set(
    [...(stageLeadIds.get("Qualified") ?? []), ...(stageLeadIds.get("Proposal") ?? []), ...(stageLeadIds.get("Won") ?? [])],
  ).size;
  const customers = stageLeadIds.get("Won")?.size ?? 0;
  const totalVisits = traffic.reduce((total, row) => total + Number(row.visits || 0), 0);
  const funnel = [
    { stage: "Visits", count: totalVisits },
    { stage: "Leads", count: leads.length },
    { stage: "Qualified", count: reachedQualified },
    { stage: "Customers", count: customers },
  ];
  const funnelRates = [
    totalVisits ? leads.length / totalVisits : 0,
    leads.length ? reachedQualified / leads.length : 0,
    reachedQualified ? customers / reachedQualified : 0,
  ];

  const averageStageHours = funnelStages.map((status) => {
    const durations = stages
      .filter((stage) => stage.status === status && stage.exited_at)
      .map((stage) => Math.max(0, Date.parse(stage.exited_at!) - Date.parse(stage.entered_at)) / 3_600_000);
    return {
      status,
      hours: durations.length
        ? Math.round((durations.reduce((total, hours) => total + hours, 0) / durations.length) * 10) / 10
        : null,
      completed: durations.length,
    };
  });

  const qualifiedLeads = leads.filter((lead) => ["Qualified", "Proposal"].includes(lead.status));
  const pipelineValue = qualifiedLeads.reduce((total, lead) => total + Number(lead.opportunity_value || 0), 0);
  const averageDeal = qualifiedLeads.length ? pipelineValue / qualifiedLeads.length : 0;
  const topCampaigns = [...campaigns].sort((a, b) => b.conversions - a.conversions || b.clicks - a.clicks).slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Sales &amp; Conversion Reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            {refreshedAt ? `Updated ${refreshedAt.toLocaleTimeString()}` : "Loading report data…"} · Auto-refreshes every minute
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="report-period" className="text-sm text-slate-400">Lead volume</label>
          <select
            id="report-period"
            value={granularity}
            onChange={(event) => setGranularity(event.target.value as "weekly" | "monthly")}
            className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button
            onClick={() => void load()}
            className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
          {error}. Apply the latest Supabase schema and confirm reporting data has been synced.
        </div>
      )}
      {loading && !error && <p className="text-sm text-slate-500">Loading report data…</p>}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Qualified Pipeline" value={money(pipelineValue)} sub={`${qualifiedLeads.length} qualified / proposal leads`} accent="text-cyan-300" />
        <StatCard label="Average Qualified Deal" value={money(averageDeal)} sub="Pipeline value ÷ qualified leads" />
        <StatCard label="Visit → Lead" value={percent(funnelRates[0])} sub={`${leads.length} leads · ${totalVisits.toLocaleString()} visits`} />
        <StatCard label="Lead → Customer" value={percent(leads.length ? customers / leads.length : 0)} sub={`${customers} customers · all-time`} accent="text-emerald-400" />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-300">Lead Volume by Source</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={leadVolume}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="period" stroke="#64748b" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                {sourceNames.map((source, index) => (
                  <Bar key={source} dataKey={source} stackId="leads" fill={chartColors[index % chartColors.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-300">Conversion Funnel · All-time</h2>
          <div className="h-56">
            <ResponsiveContainer>
              <BarChart data={funnel} layout="vertical">
                <CartesianGrid stroke="#1e293b" />
                <XAxis type="number" allowDecimals={false} stroke="#64748b" fontSize={12} />
                <YAxis type="category" dataKey="stage" width={82} stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-slate-800 pt-4 text-center text-xs text-slate-400">
            <div>Visit → lead <strong className="block pt-1 text-cyan-300">{percent(funnelRates[0])}</strong></div>
            <div>Lead → qualified <strong className="block pt-1 text-cyan-300">{percent(funnelRates[1])}</strong></div>
            <div>Qualified → customer <strong className="block pt-1 text-cyan-300">{percent(funnelRates[2])}</strong></div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-300">Average Time in Funnel Stage</h2>
          <div className="space-y-3">
            {averageStageHours.map(({ status, hours, completed }) => (
              <div key={status} className="grid grid-cols-[6rem_1fr_auto] items-center gap-3 text-sm">
                <span className="text-slate-400">{status}</span>
                <div className="h-2 rounded-full bg-slate-800">
                  {hours !== null && <div className="h-full rounded-full bg-violet-400" style={{ width: `${Math.min(100, hours / 168 * 100)}%` }} />}
                </div>
                <span className="min-w-28 text-right text-slate-300">
                  {hours === null ? "—" : `${hours} hrs`} <span className="text-xs text-slate-500">({completed})</span>
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">Completed stage durations only; open stages are excluded.</p>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-300">Top Email Campaigns &amp; Content</h2>
          {topCampaigns.length === 0 ? (
            <p className="text-sm text-slate-500">No campaigns synced yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-slate-500">
                  <tr>
                    <th className="pb-3 pr-4">Campaign / Content</th>
                    <th className="pb-3 px-2">Open</th>
                    <th className="pb-3 px-2">Click</th>
                    <th className="pb-3 px-2">Convert</th>
                  </tr>
                </thead>
                <tbody>
                  {topCampaigns.map((campaign) => (
                    <tr key={campaign.id} className="border-t border-slate-800/70">
                      <td className="max-w-56 py-3 pr-4">
                        <div className="truncate text-slate-200">{campaign.campaign_name}</div>
                        <div className="truncate text-xs text-slate-500">{campaign.content_title || campaign.source || "—"}</div>
                      </td>
                      <td className="px-2 text-slate-300">{percent(campaign.sent ? campaign.opens / campaign.sent : 0)}</td>
                      <td className="px-2 text-slate-300">{percent(campaign.sent ? campaign.clicks / campaign.sent : 0)}</td>
                      <td className="px-2 text-emerald-300">{percent(campaign.sent ? campaign.conversions / campaign.sent : 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <p className="text-xs text-slate-500">
        Dashboard metrics calculate automatically from synced Supabase records. Connectors and scheduled email/Slack delivery require configured provider credentials and automation.
      </p>
    </div>
  );
}
