"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  OUTREACH_TEMPLATES,
  renderEmail,
  type OutreachLead,
  type SequenceKey,
} from "@/lib/outreach";

type Enrollment = {
  id: string;
  lead_id: string;
  sequence_key: SequenceKey;
  status: "active" | "manual" | "responded" | "booked" | "suppressed";
  current_step: number;
  variant: "A" | "B";
  next_send_at: string | null;
  enrolled_at: string;
  lead: OutreachLead & {
    id: string;
    qualification_score: number;
    intent_tier: string;
    status: string;
  };
};

type OutreachEvent = {
  event_type: string;
  template_step: number;
  variant: "A" | "B" | null;
};

const card = "rounded-xl border border-slate-800 bg-slate-900/70 p-5";
const button =
  "rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-300 hover:border-cyan-500 hover:text-cyan-300 disabled:opacity-50";

const sequenceName: Record<SequenceKey, string> = {
  inbound: "Inbound",
  referral: "Referral / partner",
  outbound: "Outbound",
};

function formatDate(value: string | null) {
  return value
    ? new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "—";
}

export default function OutreachPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [events, setEvents] = useState<OutreachEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const load = useCallback(async () => {
    try {
      const sb = getSupabase();
      const [enrollmentResult, eventResult] = await Promise.all([
        sb.from("cc_outreach_enrollments")
          .select("id,lead_id,sequence_key,status,current_step,variant,next_send_at,enrolled_at,lead:cc_leads(id,company,contact,email,source,qualification_score,intent_tier,status)")
          .order("enrolled_at", { ascending: false }),
        sb.from("cc_outreach_events")
          .select("event_type,template_step,variant")
          .order("occurred_at", { ascending: false })
          .limit(5000),
      ]);
      const issue = enrollmentResult.error ?? eventResult.error;
      if (issue) {
        setError(issue.message);
      } else {
        setError(null);
        setEnrollments((enrollmentResult.data as unknown as Enrollment[]) ?? []);
        setEvents((eventResult.data as OutreachEvent[]) ?? []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const active = enrollments.filter((row) => row.status === "active");
  const due = active.filter((row) => row.next_send_at && Date.parse(row.next_send_at) <= now);
  const handoffs = enrollments.filter((row) => ["manual", "responded"].includes(row.status));
  const month = new Date(now).toISOString().slice(0, 7);
  const enrolledThisMonth = enrollments.filter((row) => row.enrolled_at.startsWith(month)).length;
  const sent = events.filter((event) => event.event_type === "sent").length;
  const replies = events.filter((event) => event.event_type === "replied").length;
  const responseRate = sent ? Math.round((replies / sent) * 100) : 0;

  const performance = useMemo(() => {
    const values = new Map<string, { sent: number; opened: number; clicked: number; replied: number }>();
    for (const event of events) {
      const key = `${event.template_step}-${event.variant ?? "A"}`;
      const row = values.get(key) ?? { sent: 0, opened: 0, clicked: 0, replied: 0 };
      if (event.event_type === "sent") row.sent += 1;
      if (event.event_type === "opened") row.opened += 1;
      if (event.event_type === "clicked") row.clicked += 1;
      if (event.event_type === "replied") row.replied += 1;
      values.set(key, row);
    }
    return values;
  }, [events]);

  async function record(enrollment: Enrollment, eventType: string) {
    if (eventType === "sent" && !window.confirm("Record this email as sent? Do this only after sending it from your email client.")) return;
    setBusyId(enrollment.id);
    setError(null);
    try {
      const { error: rpcError } = await getSupabase().rpc("cc_record_outreach_event", {
        p_enrollment_id: enrollment.id,
        p_event_type: eventType,
      });
      if (rpcError) setError(rpcError.message);
      else await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  function draftUrl(enrollment: Enrollment) {
    const template = OUTREACH_TEMPLATES.find((item) => item.step === enrollment.current_step);
    if (!template || !enrollment.lead.email) return "#";
    const message = renderEmail(template, enrollment.variant, enrollment.lead, enrollment.sequence_key);
    return `mailto:${encodeURIComponent(enrollment.lead.email)}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`;
  }

  function enrollmentActions(enrollment: Enrollment) {
    const busy = busyId === enrollment.id;
    return (
      <div className="flex flex-wrap gap-2">
        {enrollment.status === "active" && enrollment.current_step <= 5 && (
          <>
            <a className={button} href={draftUrl(enrollment)}>Open email draft</a>
            <button className={button} disabled={busy} onClick={() => void record(enrollment, "sent")}>Mark sent</button>
          </>
        )}
        {enrollment.status === "active" && (
          <>
            <button className={button} disabled={busy} onClick={() => void record(enrollment, "opened")}>Log open</button>
            <button className={button} disabled={busy} onClick={() => void record(enrollment, "clicked")}>Log click</button>
            <button className={button} disabled={busy} onClick={() => void record(enrollment, "replied")}>Log reply</button>
            <button className={button} disabled={busy} onClick={() => void record(enrollment, "booked")}>Booked</button>
            <button className={button} disabled={busy} onClick={() => void record(enrollment, "unsubscribed")}>Unsubscribe</button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-100">Outreach sequences</h1>
        <button className={button} onClick={() => void load()}>Refresh</button>
      </div>

      <div className="rounded-lg border border-amber-800/70 bg-amber-950/30 p-4 text-sm text-amber-200">
        Sequences auto-enroll eligible leads and schedule follow-ups, but no email provider is connected. Open each draft in your email client and mark it sent only after sending; opens and clicks must also be logged here. Connect a provider before enabling unattended delivery.
      </div>
      {error && (
        <div className="rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">
          {error}. Apply <code>supabase/schema.sql</code> to the command-center Supabase project if outreach tables are missing.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className={card}><p className="text-xs text-slate-500">Enrolled this month</p><p className="mt-2 text-2xl font-semibold">{enrolledThisMonth}<span className="text-base text-slate-500"> / 100</span></p><p className="mt-1 text-xs text-slate-500">Monthly funnel target</p></div>
        <div className={card}><p className="text-xs text-slate-500">Follow-ups due</p><p className="mt-2 text-2xl font-semibold text-amber-300">{due.length}</p><p className="mt-1 text-xs text-slate-500">Of {active.length} active enrollments</p></div>
        <div className={card}><p className="text-xs text-slate-500">Response rate</p><p className="mt-2 text-2xl font-semibold text-emerald-300">{responseRate}%</p><p className="mt-1 text-xs text-slate-500">{replies} replies / {sent} emails sent</p></div>
        <div className={card}><p className="text-xs text-slate-500">Manual handoffs</p><p className="mt-2 text-2xl font-semibold text-violet-300">{handoffs.length}</p><p className="mt-1 text-xs text-slate-500">Includes high-intent leads and completed sequences</p></div>
      </div>

      <section className={card}>
        <h2 className="mb-4 text-sm font-medium text-slate-300">A/B performance by email</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Variant</th><th className="py-2 pr-4">Sent</th><th className="py-2 pr-4">Opened</th><th className="py-2 pr-4">Clicked</th><th className="py-2">Replies / sent</th></tr>
            </thead>
            <tbody>
              {OUTREACH_TEMPLATES.map((template) => (["A", "B"] as const).map((variant) => {
                const result = performance.get(`${template.step}-${variant}`) ?? { sent: 0, opened: 0, clicked: 0, replied: 0 };
                return (
                  <tr key={`${template.step}-${variant}`} className="border-t border-slate-800 text-slate-300">
                    <td className="py-2 pr-4">{template.step}. {template.name}</td><td className="py-2 pr-4">{variant}</td>
                    <td className="py-2 pr-4">{result.sent}</td><td className="py-2 pr-4">{result.opened}</td><td className="py-2 pr-4">{result.clicked}</td>
                    <td className="py-2">{result.replied} / {result.sent} {result.sent ? `(${Math.round(result.replied / result.sent * 100)}%)` : ""}</td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-4 text-sm font-medium text-slate-300">Due and scheduled emails</h2>
        {loading ? <p className="text-sm text-slate-500">Loading outreach…</p> : active.length === 0 ? (
          <p className="text-sm text-slate-500">No active enrollments. Eligible leads with an email address are enrolled automatically.</p>
        ) : (
          <div className="space-y-3">
            {active.map((enrollment) => {
              const template = OUTREACH_TEMPLATES.find((item) => item.step === enrollment.current_step);
              const isDue = enrollment.next_send_at && Date.parse(enrollment.next_send_at) <= now;
              return (
                <article key={enrollment.id} className="rounded-lg border border-slate-800 p-4">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-slate-100">{enrollment.lead.company} <span className="text-xs font-normal text-slate-500">· {enrollment.lead.contact ?? enrollment.lead.email}</span></h3>
                      <p className="mt-1 text-xs text-slate-400">{sequenceName[enrollment.sequence_key]} sequence · Variant {enrollment.variant} · Score {enrollment.lead.qualification_score}/100</p>
                      <p className="mt-1 text-xs text-slate-500">Step {enrollment.current_step}: {template?.name ?? "Complete"} · Scheduled {formatDate(enrollment.next_send_at)}</p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${isDue ? "bg-amber-500/10 text-amber-300" : "bg-slate-800 text-slate-400"}`}>{isDue ? "Due now" : "Scheduled"}</span>
                  </div>
                  {enrollmentActions(enrollment)}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={card}>
        <h2 className="mb-4 text-sm font-medium text-slate-300">Manual sales handoff</h2>
        {handoffs.length === 0 ? <p className="text-sm text-slate-500">No leads are awaiting manual follow-up.</p> : (
          <ul className="divide-y divide-slate-800">
            {handoffs.map((enrollment) => (
              <li key={enrollment.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="text-slate-200">{enrollment.lead.company} · {enrollment.lead.contact ?? enrollment.lead.email}</span>
                <span className="text-slate-400">{enrollment.status === "responded" ? "Replied — follow up personally" : enrollment.lead.intent_tier === "High" ? "High intent — immediate outreach" : "Sequence complete — follow up personally"}</span>
                <span className="text-xs text-slate-500">{enrollment.lead.email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={card}>
        <h2 className="mb-1 text-sm font-medium text-slate-300">Email template library</h2>
        <p className="mb-4 text-xs text-slate-500">Replace bracketed proof, offer, and value-proposition placeholders with audited, approved claims before sending. Source selects an inbound, referral/partner, or outbound sequence.</p>
        <div className="grid gap-3 md:grid-cols-2">
          {OUTREACH_TEMPLATES.map((template) => (
            <article key={template.step} className="rounded-lg border border-slate-800 p-4">
              <div className="flex justify-between gap-2">
                <h3 className="text-sm font-medium text-slate-200">{template.step}. {template.name}</h3>
                <span className="text-xs text-slate-500">{template.delay}</span>
              </div>
              <p className="mt-2 text-xs text-slate-400">A: {template.subjectA} · B: {template.subjectB}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
