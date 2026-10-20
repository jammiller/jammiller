"use client";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { getSupabase } from "@/lib/supabase";
import StatCard from "@/components/StatCard";
import type { Agent, Client, Domain, Lead, Revenue } from "@/lib/types";

const COLORS = ["#22d3ee", "#a78bfa", "#34d399", "#fbbf24"];
const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
    <h2 className="mb-4 text-sm font-medium text-slate-400">{title}</h2>
    <div className="h-64">{children}</div>
  </div>
);

const tally = <T,>(items: T[], key: (i: T) => string, val: (i: T) => number = () => 1) => {
  const m: Record<string, number> = {};
  items.forEach((i) => (m[key(i)] = (m[key(i)] ?? 0) + val(i)));
  return m;
};

export default function Dashboard() {
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    (async () => {
      try {
        const sb = getSupabase();
        const [r, l, c, d, a] = await Promise.all([
          sb.from("cc_revenue").select("*"),
          sb.from("cc_leads").select("*"),
          sb.from("cc_clients").select("*"),
          sb.from("cc_domains").select("*"),
          sb.from("cc_agents").select("*"),
        ]);
        const err = [r, l, c, d, a].find((x) => x.error)?.error;
        if (err) setError(err.message);
        setRevenue((r.data as Revenue[]) ?? []);
        setLeads((l.data as Lead[]) ?? []);
        setClients((c.data as Client[]) ?? []);
        setDomains((d.data as Domain[]) ?? []);
        setAgents((a.data as Agent[]) ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    })();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const monthDate = new Date(now);
  const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
  const revenueThisMonth = revenue
    .filter((r) => r.date.startsWith(monthKey))
    .reduce((s, r) => s + Number(r.amount), 0);

  const activeClients = clients.filter((c) => c.status === "Active");
  const mrr = activeClients.reduce((s, c) => s + Number(c.monthly_value), 0);
  const activeOpps = leads.filter((l) => !["Won", "Lost"].includes(l.status));
  const oppValue = activeOpps.reduce((s, l) => s + Number(l.opportunity_value), 0);
  const leadTiers = ["High", "Medium", "Low", "Unqualified"] as const;
  const urgentLeads = leads
    .filter((lead) => lead.intent_tier === "High" && lead.status === "New")
    .sort((a, b) => Date.parse(a.created_at) - Date.parse(b.created_at));
  const overdueLeads = urgentLeads.filter(
    (lead) => now - Date.parse(lead.created_at) >= 2 * 60 * 60 * 1000
  );
  const today = new Date(now).toISOString().slice(0, 10);
  const tremonixLeads = leads.filter((lead) => lead.asset === "Tremonix");
  const followUpsDue = tremonixLeads.filter(
    (lead) =>
      lead.next_follow_up_at &&
      lead.next_follow_up_at <= today &&
      !["Won", "Lost"].includes(lead.status)
  ).length;
  const auditRequests = tremonixLeads.filter((lead) => lead.audit_status !== "Not Started");
  const paidAudits = auditRequests.filter((lead) => lead.audit_status === "Paid").length;
  const auditConversion = auditRequests.length
    ? Math.round((paidAudits / auditRequests.length) * 100)
    : 0;

  const healthyDomains = domains.filter((d) => d.health_status === "Healthy").length;
  const domainHealth = domains.length ? Math.round((healthyDomains / domains.length) * 100) : 0;
  const agentHealth = agents.length
    ? Math.round(agents.reduce((s, a) => s + a.health_score, 0) / agents.length)
    : 0;

  const byMonth = Object.entries(tally(revenue, (r) => r.date.slice(0, 7), (r) => Number(r.amount)))
    .sort().slice(-6).map(([month, total]) => ({ month, total }));
  const byAsset = Object.entries(tally(revenue, (r) => r.asset, (r) => Number(r.amount)))
    .map(([name, value]) => ({ name, value }));
  const byStatus = Object.entries(tally(leads, (l) => l.status))
    .map(([status, count]) => ({ status, count }));

  const tooltipStyle = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: 8 };
  const healthColor = (n: number) => (n >= 80 ? "text-emerald-400" : n >= 50 ? "text-amber-400" : "text-red-400");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue This Month" value={fmt(revenueThisMonth)} />
        <StatCard label="MRR" value={fmt(mrr)} accent="text-emerald-400" sub={`${activeClients.length} active clients`} />
        <StatCard label="Total Clients" value={clients.length} accent="text-violet-400" />
        <StatCard label="Total Leads" value={leads.length} accent="text-amber-400" />
        {leadTiers.map((tier) => (
          <StatCard
            key={tier}
            label={`${tier} Intent`}
            value={leads.filter((lead) => lead.intent_tier === tier).length}
            accent={tier === "High" ? "text-red-400" : tier === "Medium" ? "text-amber-400" : "text-slate-400"}
          />
        ))}
        <StatCard
          label="High-Intent Follow-up Due"
          value={overdueLeads.length}
          accent={overdueLeads.length ? "text-red-400" : "text-emerald-400"}
          sub="New leads past the 2-hour SLA"
        />
        <StatCard label="Active Opportunities" value={activeOpps.length} sub={`${fmt(oppValue)} pipeline`} />
        <StatCard
          label="Tremonix Follow-ups Due"
          value={followUpsDue}
          accent={followUpsDue ? "text-amber-400" : "text-emerald-400"}
        />
        <StatCard label="Tremonix Audit Requests" value={auditRequests.length} />
        <StatCard label="Tremonix Paid Audits" value={paidAudits} accent="text-emerald-400" />
        <StatCard
          label="Tremonix Audit Conversion"
          value={`${auditConversion}%`}
          sub={`${paidAudits}/${auditRequests.length} requests paid`}
        />
        <StatCard label="Domain Health" value={`${domainHealth}%`} accent={healthColor(domainHealth)} sub={`${healthyDomains}/${domains.length} healthy`} />
        <StatCard label="Agent Health" value={`${agentHealth}%`} accent={healthColor(agentHealth)} sub={`${agents.length} agents`} />
      </div>

      <section className="rounded-xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="mb-4 text-sm font-medium text-slate-400">High-Intent Lead Alerts</h2>
        {urgentLeads.length === 0 ? (
          <p className="text-sm text-slate-500">No new high-intent leads need outreach.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {urgentLeads.map((lead) => {
              const overdue = now - Date.parse(lead.created_at) >= 2 * 60 * 60 * 1000;
              return (
                <li key={lead.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="font-medium text-slate-200">{lead.company}</span>
                  <span className={overdue ? "text-red-400" : "text-amber-400"}>
                    {overdue ? "2-hour follow-up overdue" : "Immediate manual outreach"}
                  </span>
                  <span className="text-slate-500">{lead.qualification_score}/100 · {lead.routing_queue}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Revenue by Month">
          <ResponsiveContainer>
            <LineChart data={byMonth}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="total" stroke="#22d3ee" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Revenue by Asset">
          <ResponsiveContainer>
            <PieChart>
              <Pie data={byAsset} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} label>
                {byAsset.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Leads by Status">
          <ResponsiveContainer>
            <BarChart data={byStatus}>
              <CartesianGrid stroke="#1e293b" />
              <XAxis dataKey="status" stroke="#64748b" fontSize={12} />
              <YAxis allowDecimals={false} stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Agent Health Scores">
          <ResponsiveContainer>
            <BarChart data={agents} layout="vertical">
              <CartesianGrid stroke="#1e293b" />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
              <YAxis type="category" dataKey="agent_name" stroke="#64748b" fontSize={12} width={100} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="health_score" fill="#34d399" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
