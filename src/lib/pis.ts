export type OrgType = 'School District' | 'College' | 'Construction' | 'Workforce Board' | 'Training Company';

export const ORG_TYPES: OrgType[] = ['School District', 'College', 'Construction', 'Workforce Board', 'Training Company'];

export const OFFER_RULES: Record<OrgType, string> = {
  'School District': 'Learner Variability Audit',
  College: 'Program Alignment Review',
  Construction: 'Competency & Safety Framework',
  'Workforce Board': 'Career Pathway Design',
  'Training Company': 'AI Course Design Accelerator',
};

export const PIPELINE_STAGES = [
  'Identified',
  'Researched',
  'Qualified',
  'Contacted',
  'Meeting Scheduled',
  'Proposal Sent',
  'Negotiation',
  'Closed Won',
  'Closed Lost',
] as const;
export type Stage = (typeof PIPELINE_STAGES)[number];

export interface ScoreFactors {
  urgency: number;
  budget: number;
  strategicFit: number;
  easeOfAccess: number;
}

export interface Prospect {
  id: string;
  name: string;
  orgType: OrgType;
  industry: string;
  location: string;
  website: string;
  size: string;
  contact: { name: string; title: string; email: string; phone: string };
  factors: ScoreFactors;
  summary: string;
  challenges: string[];
  trainingOpportunities: string[];
  fundingSources: string[];
  decisionMakers: string[];
}

export type ScoreBand = 'Low' | 'Nurture' | 'Qualified' | 'Hot Prospect';

const clamp = (n: number) => Math.max(0, Math.min(100, n));

export function revenueScore(f: ScoreFactors): number {
  return Math.round(
    clamp(f.urgency) * 0.3 + clamp(f.budget) * 0.25 + clamp(f.strategicFit) * 0.25 + clamp(f.easeOfAccess) * 0.2,
  );
}

export function scoreBand(score: number): ScoreBand {
  if (score >= 90) return 'Hot Prospect';
  if (score >= 70) return 'Qualified';
  if (score >= 50) return 'Nurture';
  return 'Low';
}

export function matchOffer(orgType: OrgType): string {
  return OFFER_RULES[orgType];
}

const BASE_VALUE: Record<OrgType, number> = {
  'School District': 45000,
  College: 60000,
  Construction: 75000,
  'Workforce Board': 55000,
  'Training Company': 30000,
};

const SIZE_MULTIPLIER = (size: string): number => {
  const n = parseInt(size.replace(/[^0-9]/g, ''), 10) || 0;
  if (n >= 10000) return 1.5;
  if (n >= 1000) return 1.2;
  return 1;
};

export function estimateProjectValue(p: Prospect): number {
  const raw = BASE_VALUE[p.orgType] * SIZE_MULTIPLIER(p.size) * (0.8 + revenueScore(p.factors) / 250);
  return Math.round(raw / 500) * 500;
}

export const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export interface Outreach {
  coldEmail: string;
  linkedIn: string;
  callScript: string;
  meetingAgenda: string[];
  discoveryQuestions: string[];
}

export function generateOutreach(p: Prospect): Outreach {
  const offer = matchOffer(p.orgType);
  const first = p.contact.name.split(' ')[0];
  const challenge = p.challenges[0] ?? 'your current priorities';
  return {
    coldEmail: `Subject: ${offer} for ${p.name}\n\nHi ${first},\n\nI work with ${p.orgType.toLowerCase()} teams on ${challenge.toLowerCase()}. Based on our research, ${p.name} may benefit from a ${offer}, and funding such as ${p.fundingSources[0] ?? 'existing grants'} could cover it.\n\nWould you be open to a 20-minute call next week to see whether it fits?\n\nBest,\nPulseOS`,
    linkedIn: `Hi ${first}, I've been following ${p.name}'s work. We help ${p.orgType.toLowerCase()} leaders with ${challenge.toLowerCase()} through a ${offer}. Happy to share a short example if useful.`,
    callScript: `Opener: "Hi ${first}, this is [Name] from PulseOS. I know I'm calling out of the blue; do you have 30 seconds?"\nReason: "We help ${p.orgType.toLowerCase()} teams address ${challenge.toLowerCase()}."\nValue: "Our ${offer} gives ${p.name} a clear, fundable plan."\nAsk: "Could we book 20 minutes this week or next?"\nObjection (no budget): "That's common; many clients use ${p.fundingSources[0] ?? 'grant funds'}."`,
    meetingAgenda: [
      `Introductions and goals for ${p.name} (5 min)`,
      `Current challenges: ${p.challenges.slice(0, 2).join('; ')} (10 min)`,
      `Overview of the ${offer} (10 min)`,
      'Scope, timeline and funding fit (10 min)',
      'Next steps and owners (5 min)',
    ],
    discoveryQuestions: [
      `How is ${p.name} currently handling ${challenge.toLowerCase()}?`,
      'What outcomes must improve this year, and how are they measured?',
      'Who else must be involved in approving a project like this?',
      'What budget or funding is earmarked for training and curriculum work?',
      'What is your ideal timeline to start?',
    ],
  };
}

export interface Proposal {
  executiveSummary: string;
  scope: string[];
  deliverables: string[];
  timeline: { phase: string; duration: string }[];
  investment: { value: number; terms: string };
  nextSteps: string[];
}

export function generateProposal(p: Prospect): Proposal {
  const offer = matchOffer(p.orgType);
  const value = estimateProjectValue(p);
  return {
    executiveSummary: `${p.name} faces ${p.challenges.slice(0, 2).join(' and ').toLowerCase()}. We propose a ${offer} that turns these into a prioritized, evidence-based action plan, aligned with likely funding from ${p.fundingSources.slice(0, 2).join(' or ')}.`,
    scope: [
      `Discovery sessions with ${p.decisionMakers.slice(0, 2).join(' and ')}`,
      `Analysis of current state against ${offer} criteria`,
      ...p.trainingOpportunities.slice(0, 2).map((t) => `Focus area: ${t}`),
    ],
    deliverables: [`${offer} report`, 'Prioritized recommendations roadmap', 'Executive briefing and presentation', 'Implementation support plan'],
    timeline: [
      { phase: 'Kickoff and discovery', duration: 'Weeks 1-2' },
      { phase: 'Analysis and design', duration: 'Weeks 3-6' },
      { phase: 'Review and delivery', duration: 'Weeks 7-8' },
    ],
    investment: { value, terms: '50% at kickoff, 50% on delivery. Valid for 30 days.' },
    nextSteps: ['Review this proposal with stakeholders', 'Schedule a scope-confirmation call', 'Sign agreement and schedule kickoff'],
  };
}

export interface Deal {
  prospectId: string;
  stage: Stage;
  value: number;
}

export function stageIndex(s: Stage): number {
  return PIPELINE_STAGES.indexOf(s);
}

const reached = (d: Deal, stage: Stage) => d.stage !== 'Closed Lost' && stageIndex(d.stage) >= stageIndex(stage);

export interface DashboardMetrics {
  prospectsFound: number;
  organizationsResearched: number;
  qualifiedLeads: number;
  meetingsBooked: number;
  proposalsSent: number;
  pipelineValue: number;
  revenueClosed: number;
}

export function computeMetrics(deals: Deal[]): DashboardMetrics {
  return {
    prospectsFound: deals.length,
    organizationsResearched: deals.filter((d) => reached(d, 'Researched')).length,
    qualifiedLeads: deals.filter((d) => reached(d, 'Qualified')).length,
    meetingsBooked: deals.filter((d) => reached(d, 'Meeting Scheduled')).length,
    proposalsSent: deals.filter((d) => reached(d, 'Proposal Sent')).length,
    pipelineValue: deals
      .filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
      .reduce((s, d) => s + d.value, 0),
    revenueClosed: deals.filter((d) => d.stage === 'Closed Won').reduce((s, d) => s + d.value, 0),
  };
}

export function topOpportunities(prospects: Prospect[], deals: Deal[], limit = 10): Prospect[] {
  const open = new Set(deals.filter((d) => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost').map((d) => d.prospectId));
  return prospects
    .filter((p) => open.has(p.id))
    .sort((a, b) => revenueScore(b.factors) * estimateProjectValue(b) - revenueScore(a.factors) * estimateProjectValue(a))
    .slice(0, limit);
}

export function searchProspects(
  all: Prospect[],
  q: { industry: string; location: string; orgType: OrgType | '' },
): Prospect[] {
  const ind = q.industry.trim().toLowerCase();
  const loc = q.location.trim().toLowerCase();
  return all
    .filter(
      (p) =>
        (!q.orgType || p.orgType === q.orgType) &&
        (!ind || `${p.industry} ${p.orgType}`.toLowerCase().includes(ind)) &&
        (!loc || p.location.toLowerCase().includes(loc)),
    )
    .sort((a, b) => revenueScore(b.factors) - revenueScore(a.factors));
}
