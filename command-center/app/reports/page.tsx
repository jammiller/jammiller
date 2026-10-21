"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { getSupabase } from "@/lib/supabase";
import StatCard from "@/components/StatCard";

type ConversionEvent = {
  id: string;
  lead_id: string | null;
  event_name: string;
  created_at: string;
};

type DailyCount = {
  day: string;
  event_name: string;
  event_count: number;
  lead_count: number;
};

type EventSummary = {
  event_name: string;
  event_count: number;
  lead_count: number;
};

type DropAlert = {
  event_name: string;
  current_count: number;
  previous_count: number;
  drop_percent: number;
};

const funnel = [
  { event: "page_view", label: "Page views" },
  { event: "lead_created", label: "Leads" },
  { event: "lead_qualified", label: "Qualified" },
  { event: "customer_acquired", label: "Customers" },
] as const;

const labels: Record<string, string> = {
  page_view: "Page view",
  form_submission: "Form submission",
  lead_created: "Lead",
  lead_stage_changed: "Stage transition",
  lead_qualified: "Qualified",
  customer_acquired: "Customer",
  email_open: "Email open",
  audit_completed: "Audit completed",
  booking_completed: "Booking",
  payment_completed: "Payment",
};

export default function ReportsPage() {
  const [events, setEvents] = useState<ConversionEvent[]>([]);
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([]);
  const [summary, setSummary] = useState<EventSummary[]>([]);
  const [alerts, setAlerts] = useState<DropAlert[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const sb = getSupabase();
      const [eventResult, dailyResult, summaryResult, alertResult] = await Promise.all([
        sb.from("cc_conversion_events")
          .select("id, lead_id, event_name, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        sb.from("cc_conversion_daily").select("*").order("day", { ascending: true }),
        sb.from("cc_conversion_summary").select("*"),
        sb.from("cc_conversion_drop_alerts").select("*"),
      ]);
      const queryError = eventResult.error ?? dailyResult.error ?? summaryResult.error ?? alertResult.error;
      if (queryError) throw queryError;
      setEvents((eventResult.data as ConversionEvent[]) ?? []);
      setDailyCounts((dailyResult.data as DailyCount[]) ?? []);
      setSummary((summaryResult.data as EventSummary[]) ?? []);
      setAlerts((alertResult.data as DropAlert[]) ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const countLeads = (eventName: string) =>
    Number(summary.find((item) => item.event_name === eventName)?.lead_count ?? 0);
  const countEvents = (eventName: string) =>
    Number(summary.find((item) => item.event_name === eventName)?.event_count ?? 0);
  const stageCounts = funnel.slice(1).map((stage) => ({
    stage: stage.label,
    leads: countLeads(stage.event),
  }));
  const pageViews = countEvents("page_view");
  const leads = countLeads("lead_created");
  const customers = countLeads("customer_acquired");
  const daily = dailyCounts.reduce<Record<string, { day: string; views: number; leads: number; qualified: number; customers: number }>>((result, item) => {
    const day = item.day.slice(5);
    result[day] ??= { day, views: 0, leads: 0, qualified: 0, customers: 0 };
    if (item.event_name === "page_view") result[day].views = Number(item.event_count);
    if (item.event_name === "lead_created") result[day].leads = Number(item.event_count);
    if (item.event_name === "lead_qualified") result[day].qualified = Number(item.lead_count);
    if (item.event_name === "customer_acquired") result[day].customers = Number(item.lead_count);
    return result;
  }, {});
  const chartData = Object.values(daily);
  const conversionRate = (numerator: number, denominator: number) =>
    denominator ? `${((numerator / denominator) * 100).toFixed(1)}%` : "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-100">Conversion Funnel</h1>
        <button onClick={() => void load()} className="rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
          Refresh
        </button>
      </div>
      <p className="text-sm text-slate-500">Last 30 days · refreshes every minute</p>
      {error && <div className="rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">{error}</div>}

      {alerts.length > 0 && (
        <section className="rounded-xl border border-amber-800 bg-amber-950/30 p-5" role="status">
          <h2 className="mb-3 text-sm font-medium text-amber-300">Conversion drop alerts · previous 7 days</h2>
          <ul className="space-y-2 text-sm text-amber-100">
            {alerts.map((alert) => (
              <li key={alert.event_name}>
                {labels[alert.event_name] ?? alert.event_name} is down {alert.drop_percent}% ({alert.current_count} vs. {alert.previous_count}).
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Page Views" value={pageViews} />
        <StatCard label="Leads" value={leads} accent="text-amber-400" />
        <StatCard label="Lead → Qualified" value={conversionRate(countLeads("lead_qualified"), leads)} accent="text-violet-400" />
        <StatCard label="Lead → Customer" value={conversionRate(customers, leads)} accent="text-emerald-400" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-400">Funnel stages · distinct leads</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={stageCounts}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="stage" stroke="#64748b" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="leads" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="mb-4 text-sm font-medium text-slate-400">Daily conversions · 30 days</h2>
          <div className="h-72">
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Line dataKey="views" stroke="#22d3ee" dot={false} />
                <Line dataKey="leads" stroke="#fbbf24" dot={false} />
                <Line dataKey="qualified" stroke="#a78bfa" dot={false} />
                <Line dataKey="customers" stroke="#34d399" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="mb-4 text-sm font-medium text-slate-400">Recent funnel events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-slate-500">No conversion events recorded in the last 30 days.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
              <tr><th className="py-3 pr-4">Event</th><th className="py-3 pr-4">Lead</th><th className="py-3">Time</th></tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="border-b border-slate-800/60 text-slate-300">
                  <td className="py-3 pr-4">{labels[event.event_name] ?? event.event_name}</td>
                  <td className="py-3 pr-4 font-mono text-xs">{event.lead_id?.slice(0, 8) ?? "—"}</td>
                  <td className="py-3 text-slate-500">{new Date(event.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
