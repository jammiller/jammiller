"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Lead = {
  id: string;
  company: string;
  contact: string | null;
  email: string | null;
  source: string | null;
  status: string;
  intent_tier: string;
  qualification_score: number;
};

type Enrollment = {
  id: string;
  lead_id: string;
  sequence_key: "standard" | "referral";
  status: "active" | "replied" | "booked" | "manual";
  current_step: number;
  enrolled_at: string;
  next_step_at: string;
};

type OutreachEvent = {
  id: string;
  enrollment_id: string;
  step_number: number;
  event_type: "sent" | "replied" | "booked" | "manual_handoff";
  subject_variant: "A" | "B" | null;
  cta_variant: "A" | "B" | null;
};

type Template = {
  name: string;
  day: number;
  subject: [string, string];
  cta: [string, string];
  body: string;
};

const sequences: Record<Enrollment["sequence_key"], Template[]> = {
  standard: [
    {
      name: "Initial contact",
      day: 0,
      subject: ["An idea for {{company}}", "Could we support {{company}}?"],
      cta: ["Book a short call: [booking link]", "Reply with a good time"],
      body: "Hi {{contact}},\n\nI’m reaching out because [add a specific, researched reason this is relevant to {{company}}]. We help with [insert your approved value proposition]. Would it be useful to compare notes?",
    },
    {
      name: "Two-day follow-up",
      day: 2,
      subject: ["Following up, {{contact}}", "Worth a quick conversation?"],
      cta: ["Choose a time: [booking link]", "Reply with any questions"],
      body: "Hi {{contact}},\n\nJust following up on my note about [relevant business outcome]. If this is a priority for {{company}}, I’d be happy to share how we approach it.",
    },
    {
      name: "Value-add",
      day: 5,
      subject: ["A resource for {{company}}", "Thought you might find this useful"],
      cta: ["View the resource: [link]", "Reply and I’ll send the resource"],
      body: "Hi {{contact}},\n\nHere’s a resource that may help with [relevant challenge]: [insert approved guide, case study, or social proof]. It covers [brief, accurate summary].",
    },
    {
      name: "Offer",
      day: 9,
      subject: ["An option for {{company}}", "A practical next step"],
      cta: ["Discuss the offer: [booking link]", "Reply to learn more"],
      body: "Hi {{contact}},\n\nIf helpful, we can offer [insert a real, approved offer and any applicable terms] to make it easier to evaluate [solution]. There’s no pressure if the timing isn’t right.",
    },
    {
      name: "14-day re-engagement",
      day: 14,
      subject: ["Should I close the loop?", "Still worth exploring?"],
      cta: ["Book a final check-in: [booking link]", "Reply whenever the timing is right"],
      body: "Hi {{contact}},\n\nI haven’t heard back, so I’ll close the loop for now. If [relevant outcome] becomes a priority for {{company}}, I’d be glad to reconnect.",
    },
  ],
  referral: [
    {
      name: "Referral introduction",
      day: 0,
      subject: ["{{company}} — an introduction", "Connecting about {{company}}"],
      cta: ["Book an introduction: [booking link]", "Reply with a good time"],
      body: "Hi {{contact}},\n\n[Referrer name] suggested I reach out because [specific reason]. We help with [insert your approved value proposition]. Would a short introduction be useful?",
    },
    {
      name: "Two-day follow-up",
      day: 2,
      subject: ["Following up on the introduction", "A quick follow-up, {{contact}}"],
      cta: ["Choose a time: [booking link]", "Reply with any questions"],
      body: "Hi {{contact}},\n\nFollowing up on [referrer name]’s introduction. If [relevant business outcome] is a priority for {{company}}, I’d be happy to share how we approach it.",
    },
    {
      name: "Value-add",
      day: 5,
      subject: ["A resource for {{company}}", "Thought you might find this useful"],
      cta: ["View the resource: [link]", "Reply and I’ll send the resource"],
      body: "Hi {{contact}},\n\nHere’s a resource that may help with [relevant challenge]: [insert approved guide, case study, or social proof]. It covers [brief, accurate summary].",
    },
    {
      name: "Offer",
      day: 9,
      subject: ["An option for {{company}}", "A practical next step"],
      cta: ["Discuss the offer: [booking link]", "Reply to learn more"],
      body: "Hi {{contact}},\n\nIf helpful, we can offer [insert a real, approved offer and any applicable terms] to make it easier to evaluate [solution]. There’s no pressure if the timing isn’t right.",
    },
    {
      name: "14-day re-engagement",
      day: 14,
      subject: ["Should I close the loop?", "Still worth exploring?"],
      cta: ["Book a final check-in: [booking link]", "Reply whenever the timing is right"],
      body: "Hi {{contact}},\n\nI haven’t heard back, so I’ll close the loop for now. If [relevant outcome] becomes a priority for {{company}}, I’d be glad to reconnect.",
    },
  ],
};

const card = "rounded-xl border border-slate-800 bg-slate-900/70 p-5";
const button =
  "rounded-md bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButton =
  "rounded-md border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800";
const day = 24 * 60 * 60 * 1000;

function variantFor(enrollment: Enrollment, step: number): "A" | "B" {
  const hash = [...enrollment.id].reduce((total, char) => total + char.charCodeAt(0), step);
  return hash % 2 === 0 ? "A" : "B";
}

function emailContent(lead: Lead, enrollment: Enrollment, step: number) {
  const template = sequences[enrollment.sequence_key][step - 1];
  const variant = variantFor(enrollment, step);
  const index = variant === "A" ? 0 : 1;
  const replace = (value: string) =>
    value
      .replaceAll("{{company}}", lead.company)
      .replaceAll("{{contact}}", lead.contact || "there");
  return {
    template,
    variant,
    subject: replace(template.subject[index]),
    cta: template.cta[index],
    body: `${replace(template.body)}\n\n${template.cta[index]}`,
  };
}

function dueAt(enrollment: Enrollment, step: number) {
  return Date.parse(enrollment.enrolled_at) + sequences[enrollment.sequence_key][step - 1].day * day;
}

export default function OutreachPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [events, setEvents] = useState<OutreachEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const sb = getSupabase();
      const [leadResult, enrollmentResult, eventResult] = await Promise.all([
        sb.from("cc_leads").select("id,company,contact,email,source,status,intent_tier,qualification_score"),
        sb.from("cc_outreach_enrollments").select("*").order("enrolled_at", { ascending: false }),
        sb.from("cc_outreach_events").select("*"),
      ]);
      const firstError = [leadResult, enrollmentResult, eventResult].find((result) => result.error)?.error;
      if (firstError) throw new Error(firstError.message);
      setLeads((leadResult.data as Lead[]) ?? []);
      setEnrollments((enrollmentResult.data as Enrollment[]) ?? []);
      setEvents((eventResult.data as OutreachEvent[]) ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const leadById = new Map(leads.map((lead) => [lead.id, lead]));
  const enrolledLeadIds = new Set(enrollments.map((enrollment) => enrollment.lead_id));
  const eligibleLeads = leads.filter((lead) =>
    lead.email &&
    lead.status !== "Booked" &&
    !["Won", "Lost"].includes(lead.status) &&
    lead.intent_tier !== "Unqualified" &&
    !enrolledLeadIds.has(lead.id)
  ).sort((a, b) => b.qualification_score - a.qualification_score);
  const active = enrollments
    .filter((enrollment) => enrollment.status === "active")
    .sort((a, b) => {
      const scoreDifference =
        (leadById.get(b.lead_id)?.qualification_score ?? 0) -
        (leadById.get(a.lead_id)?.qualification_score ?? 0);
      return scoreDifference || Date.parse(a.next_step_at) - Date.parse(b.next_step_at);
    });

  async function enrollEligible() {
    if (!eligibleLeads.length) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const rows = eligibleLeads.map((lead) => ({
      lead_id: lead.id,
      sequence_key: lead.source?.toLowerCase().includes("referr") ? "referral" : "standard",
    }));
    try {
      const { error: insertError } = await getSupabase().from("cc_outreach_enrollments").insert(rows);
      if (insertError) throw new Error(insertError.message);
      setNotice(`${rows.length} eligible lead${rows.length === 1 ? "" : "s"} enrolled. High-scoring leads appear first.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function markSent(enrollment: Enrollment) {
    const lead = leadById.get(enrollment.lead_id);
    if (!lead) return;
    setBusy(true);
    setError(null);
    const step = enrollment.current_step;
    const { variant } = emailContent(lead, enrollment, step);
    const sentEvent = {
      enrollment_id: enrollment.id,
      step_number: step,
      event_type: "sent",
      subject_variant: variant,
      cta_variant: variant,
    };
    try {
      const { error: eventError } = await getSupabase().from("cc_outreach_events").insert(sentEvent);
      if (eventError) throw new Error(eventError.message);
      if (step === 5) {
        const { error: handoffEventError } = await getSupabase()
          .from("cc_outreach_events")
          .insert({ enrollment_id: enrollment.id, step_number: step, event_type: "manual_handoff" });
        if (handoffEventError) throw new Error(handoffEventError.message);
        const { error: updateError } = await getSupabase()
          .from("cc_outreach_enrollments")
          .update({ status: "manual", last_sent_at: new Date().toISOString() })
          .eq("id", enrollment.id);
        if (updateError) throw new Error(updateError.message);
      } else {
        const nextStep = step + 1;
        const nextStepAt = new Date(dueAt(enrollment, nextStep)).toISOString();
        const { error: updateError } = await getSupabase()
          .from("cc_outreach_enrollments")
          .update({
            current_step: nextStep,
            next_step_at: nextStepAt,
            last_sent_at: new Date().toISOString(),
          })
          .eq("id", enrollment.id);
        if (updateError) throw new Error(updateError.message);
      }
      setNotice(step === 5 ? "Email logged; lead moved to the manual sales handoff queue." : "Email logged and next follow-up scheduled.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function stopSequence(enrollment: Enrollment, outcome: "replied" | "booked") {
    setBusy(true);
    setError(null);
    const lastSentStep = Math.max(1, enrollment.current_step - 1);
    const lead = leadById.get(enrollment.lead_id);
    const variant = lead && enrollment.current_step > 1
      ? variantFor(enrollment, lastSentStep)
      : null;
    try {
      if (outcome === "booked") {
        const { error: leadError } = await getSupabase()
          .from("cc_leads").update({ status: "Booked" }).eq("id", enrollment.lead_id);
        if (leadError) throw new Error(leadError.message);
      }
      const { error: eventError } = await getSupabase().from("cc_outreach_events").insert({
        enrollment_id: enrollment.id,
        step_number: lastSentStep,
        event_type: outcome,
        subject_variant: variant,
        cta_variant: variant,
      });
      if (eventError) throw new Error(eventError.message);
      const { error: updateError } = await getSupabase()
        .from("cc_outreach_enrollments").update({ status: outcome }).eq("id", enrollment.id);
      if (updateError) throw new Error(updateError.message);
      setNotice(outcome === "booked" ? "Lead marked as booked and removed from the sequence." : "Lead marked as replied and removed from the sequence.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  function metrics(step: number, variant: "A" | "B") {
    const matching = events.filter((event) =>
      event.step_number === step && event.subject_variant === variant
    );
    const sent = matching.filter((event) => event.event_type === "sent").length;
    const replies = matching.filter((event) => event.event_type === "replied").length;
    return { sent, replies, rate: sent ? `${Math.round((replies / sent) * 100)}%` : "—" };
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Outreach</h1>
          <p className="mt-1 text-sm text-slate-500">Score-prioritized sequences, follow-ups, and sales handoff.</p>
        </div>
        <button className={button} disabled={busy || !eligibleLeads.length} onClick={enrollEligible}>
          Enroll {eligibleLeads.length} eligible leads
        </button>
      </div>

      <div className="rounded-lg border border-amber-800/70 bg-amber-950/30 p-4 text-sm text-amber-200">
        Email delivery is not connected. Open each draft in your mail client, send it, then record it here;
        schedules and A/B metrics track recorded activity only.
      </div>
      {error && <div className="rounded-md border border-red-900 bg-red-950/50 p-3 text-sm text-red-300">{error}</div>}
      {notice && <div className="rounded-md border border-emerald-900 bg-emerald-950/40 p-3 text-sm text-emerald-300">{notice}</div>}

      <section className={card}>
        <h2 className="mb-4 text-lg font-medium text-slate-100">Active sequence queue</h2>
        {loading ? <p className="text-sm text-slate-500">Loading outreach data…</p> : active.length === 0 ? (
          <p className="text-sm text-slate-500">No active leads. Enroll eligible leads to begin.</p>
        ) : (
          <div className="space-y-4">
            {active.map((enrollment) => {
              const lead = leadById.get(enrollment.lead_id);
              if (!lead) return null;
              const step = enrollment.current_step;
              const { template, variant, subject, cta, body } = emailContent(lead, enrollment, step);
              const isDue = Date.parse(enrollment.next_step_at) <= Date.now();
              const draftUrl = `mailto:${encodeURIComponent(lead.email ?? "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              return (
                <article key={enrollment.id} className="rounded-lg border border-slate-800 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-slate-100">{lead.company}</h3>
                      <p className="text-sm text-slate-400">{lead.contact || "No contact"} · {lead.email}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {lead.intent_tier} · {lead.qualification_score}/100 · {enrollment.sequence_key === "referral" ? "Referral" : "Standard"} source
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-1 text-xs ${isDue ? "bg-amber-950 text-amber-300" : "bg-slate-800 text-slate-400"}`}>
                      {isDue ? "Due now" : `Due ${new Date(enrollment.next_step_at).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="mt-4 border-t border-slate-800 pt-4">
                    <div className="flex flex-wrap justify-between gap-2 text-sm">
                      <span className="font-medium text-cyan-300">Email {step}: {template.name}</span>
                      <span className="text-slate-500">Subject / CTA variant {variant} · Day {template.day}</span>
                    </div>
                    <p className="mt-2 text-slate-300">{subject}</p>
                    <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-slate-400">{body}</pre>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a className={secondaryButton} href={draftUrl}>Open email draft</a>
                      <button className={button} disabled={busy || !isDue} onClick={() => markSent(enrollment)}>
                        Record as sent
                      </button>
                      <button className={secondaryButton} disabled={busy || step === 1} onClick={() => stopSequence(enrollment, "replied")}>
                        Record reply
                      </button>
                      <button className={secondaryButton} disabled={busy} onClick={() => stopSequence(enrollment, "booked")}>
                        Mark booked
                      </button>
                      <span className="self-center text-xs text-slate-500">{cta}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className={card}>
        <h2 className="mb-1 text-lg font-medium text-slate-100">Template performance</h2>
        <p className="mb-4 text-sm text-slate-500">Replies are attributed to the most recently sent step and its recorded variant.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-slate-800 text-left text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="px-3 py-2">Email</th><th className="px-3 py-2">Variant</th><th className="px-3 py-2">Sent</th><th className="px-3 py-2">Replies</th><th className="px-3 py-2">Response rate</th></tr>
            </thead>
            <tbody>
              {sequences.standard.map((template, index) => (
                (["A", "B"] as const).map((variant) => {
                  const result = metrics(index + 1, variant);
                  return (
                    <tr className="border-b border-slate-800/60 text-slate-300" key={`${index}-${variant}`}>
                      <td className="px-3 py-2">{template.name}</td><td className="px-3 py-2">{variant}</td>
                      <td className="px-3 py-2">{result.sent}</td><td className="px-3 py-2">{result.replies}</td><td className="px-3 py-2">{result.rate}</td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={card}>
        <h2 className="mb-3 text-lg font-medium text-slate-100">Sequence outcomes &amp; manual handoff</h2>
        {enrollments.filter((enrollment) => enrollment.status !== "active").length === 0 ? (
          <p className="text-sm text-slate-500">Completed, replied, booked, and handoff leads will appear here.</p>
        ) : (
          <ul className="divide-y divide-slate-800">
            {enrollments.filter((enrollment) => enrollment.status !== "active").map((enrollment) => {
              const lead = leadById.get(enrollment.lead_id);
              return (
                <li key={enrollment.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm">
                  <span className="text-slate-200">{lead?.company ?? "Deleted lead"}</span>
                  <span className={enrollment.status === "manual" ? "text-amber-300" : "text-emerald-300"}>
                    {enrollment.status === "manual" ? "Manual sales follow-up required" : enrollment.status === "booked" ? "Booked — sequence stopped" : "Replied — sequence stopped"}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
