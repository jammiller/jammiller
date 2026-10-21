export type SequenceKey = "inbound" | "referral" | "outbound";
export type OutreachLead = {
  company: string;
  contact: string | null;
  email: string | null;
  source: string | null;
};

export const OUTREACH_TEMPLATES = [
  {
    step: 1,
    name: "Initial contact",
    delay: "Immediately",
    subjectA: "A growth idea for {{company}}",
    subjectB: "Could we help {{company}}?",
    bodyA: "I’m reaching out with an idea that may be relevant to {{company}}. {{source_intro}}\n\nWe help teams with [approved value proposition]. If [specific outcome] is on your roadmap, I’d be glad to share a few practical ideas.\n\nWould a 15-minute conversation next week be useful?\n\nBest,\n[Your name]",
    bodyB: "I work with teams looking to [specific problem you solve], and thought it could be relevant to {{company}}. {{source_intro}}\n\nOur approach is [approved value proposition]. Is this a priority for you right now?\n\nReply with a good time to talk, or let me know who owns this area.\n\nBest,\n[Your name]",
  },
  {
    step: 2,
    name: "Follow-up",
    delay: "2 days after the previous email",
    subjectA: "Re: A growth idea for {{company}}",
    subjectB: "Worth a quick conversation?",
    bodyA: "Hi {{contact}},\n\nJust following up on my note about [specific outcome]. If it’s useful, I can walk you through how [approved value proposition] could apply at {{company}}.\n\nWould Tuesday or Thursday work for a brief call?\n\nBest,\n[Your name]",
    bodyB: "Hi {{contact}},\n\nI know priorities shift, so I wanted to check whether [specific problem] is something you’re considering at {{company}}.\n\nIf so, reply with your biggest question and I’ll send a useful next step. If not, just let me know.\n\nBest,\n[Your name]",
  },
  {
    step: 3,
    name: "Value-add content",
    delay: "3 days after the previous email",
    subjectA: "A resource for {{company}}",
    subjectB: "A relevant customer example",
    bodyA: "Hi {{contact}},\n\nHere’s a resource that may help with [specific problem]: [link to useful guide or resource].\n\nIt covers [brief practical takeaway]. If you want to discuss how it applies to {{company}}, I’m happy to compare notes.\n\nBest,\n[Your name]",
    bodyB: "Hi {{contact}},\n\nI thought this example might be relevant: [approved case study and verifiable result]. The useful takeaway is [specific lesson], which may apply if {{company}} is working on [goal].\n\nWould you like the full case study or a quick walkthrough?\n\nBest,\n[Your name]",
  },
  {
    step: 4,
    name: "Offer and next step",
    delay: "4 days after the previous email",
    subjectA: "A practical next step for {{company}}",
    subjectB: "An offer to help with [goal]",
    bodyA: "Hi {{contact}},\n\nIf [goal] is a priority, I can offer [specific, approved offer] to help you evaluate the fit. The offer is available until [accurate expiry date, if applicable].\n\nWould a short planning call be useful?\n\nBest,\n[Your name]",
    bodyB: "Hi {{contact}},\n\nI don’t want to add noise to your inbox. If [goal] is timely, I’d be glad to [specific low-friction offer]. Otherwise, I’m happy to reconnect when it makes sense.\n\nWhat would be most useful?\n\nBest,\n[Your name]",
  },
  {
    step: 5,
    name: "Re-engagement",
    delay: "14 days after the previous email",
    subjectA: "Should I close the loop?",
    subjectB: "Still worth a conversation, {{contact}}?",
    bodyA: "Hi {{contact}},\n\nI haven’t heard back, so I’ll assume this isn’t a priority right now. If [goal] comes back onto the roadmap, reply here and I’ll be glad to help.\n\nShould I close the loop for now?\n\nBest,\n[Your name]",
    bodyB: "Hi {{contact}},\n\nChecking in once more about [goal]. If the timing is better now, reply with a good time to reconnect. If not, no problem—I’ll hand this over for personal follow-up rather than keep emailing.\n\nBest,\n[Your name]",
  },
] as const;

export function sourceIntroduction(sequence: SequenceKey) {
  switch (sequence) {
    case "referral":
      return "I was referred by [referrer name] and thought this might be relevant.";
    case "outbound":
      return "I’m reaching out because [specific, verified reason this is relevant].";
    default:
      return "I wanted to share a practical idea that may be useful to your team.";
  }
}

export function renderEmail(
  template: (typeof OUTREACH_TEMPLATES)[number],
  variant: "A" | "B",
  lead: OutreachLead,
  sequence: SequenceKey
) {
  const values: Record<string, string> = {
    company: lead.company,
    contact: lead.contact?.trim().split(/\s+/)[0] || "there",
    source_intro: sourceIntroduction(sequence),
  };
  const fill = (content: string) =>
    content.replace(/\{\{(company|contact|source_intro)\}\}/g, (_, key: string) => values[key]);
  return {
    subject: fill(variant === "A" ? template.subjectA : template.subjectB),
    body: fill(variant === "A" ? template.bodyA : template.bodyB),
  };
}
