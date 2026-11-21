export type Audience = 'entrepreneurs' | 'sales_leaders' | 'consultants' | 'agencies';
export type Channel = 'email' | 'linkedin' | 'x' | 'sms';
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

type ChannelMessage = {
  channel: Channel;
  title: string;
  subject?: string;
  body: string;
  cta: string;
};

type AudienceProfile = {
  label: string;
  challenge: string;
};

const audiences: Record<Audience, AudienceProfile> = {
  entrepreneurs: {
    label: 'Entrepreneurs',
    challenge: 'turning inbound interest into consistent revenue',
  },
  sales_leaders: {
    label: 'Sales leaders',
    challenge: 'keeping response times and follow-up consistent across the team',
  },
  consultants: {
    label: 'Consultants',
    challenge: 'building a reliable follow-up process without adding busywork',
  },
  agencies: {
    label: 'Agencies',
    challenge: 'converting client inquiries into booked conversations',
  },
};

const seasonThemes: Record<Season, string> = {
  Spring: 'Refresh your follow-up process and turn new interest into clear next steps.',
  Summer: 'Keep every promising conversation moving while schedules get busy.',
  Autumn: 'Build a focused pipeline before year-end priorities take over.',
  Winter: 'Review this year’s pipeline and plan a more consistent follow-up rhythm.',
};

export const audienceOptions = Object.entries(audiences).map(([value, profile]) => ({
  value: value as Audience,
  label: profile.label,
}));

export const channelOptions: { value: Channel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'x', label: 'X' },
  { value: 'sms', label: 'SMS' },
];

export const defaultAudience: Audience = 'sales_leaders';

export function getCurrentSeason(date = new Date()): Season {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
}

export function getSeasonTheme(season: string): string {
  return seasonThemes[season as Season] ?? seasonThemes[getCurrentSeason()];
}

export function generateMarketingPackage({ audience }: { audience: Audience }) {
  const profile = audiences[audience];
  const challenge = profile.challenge;
  const cta = 'Reply to schedule a 15-minute Revenue Recovery Audit.';
  const channels: ChannelMessage[] = [
    {
      channel: 'email',
      title: 'Email outreach',
      subject: 'A practical way to strengthen your follow-up',
      body: `Hi,\n\nI work with ${profile.label.toLowerCase()} focused on ${challenge}. Tremonix helps identify where prospects stall and provides a prioritized plan to improve the process.\n\nWould a short conversation be useful?`,
      cta,
    },
    {
      channel: 'linkedin',
      title: 'LinkedIn outreach',
      body: `Hi — I work with ${profile.label.toLowerCase()} on ${challenge}. Tremonix offers a focused audit to identify gaps and practical next steps. Would you be open to a short conversation?`,
      cta,
    },
    {
      channel: 'x',
      title: 'X post',
      body: `A stronger pipeline starts with consistent follow-up. Tremonix helps ${profile.label.toLowerCase()} find the gaps and prioritize practical fixes.`,
      cta,
    },
    {
      channel: 'sms',
      title: 'SMS follow-up',
      body: `Hi, this is Tremonix. Would a short audit to review ${challenge} be useful?`,
      cta,
    },
  ];

  return {
    summary: `Outreach for ${profile.label.toLowerCase()} focused on ${challenge}.`,
    channels,
  };
}
