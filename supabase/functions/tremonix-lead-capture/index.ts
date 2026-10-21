import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const allowedOrigins = new Set([
  'https://tremonix.com',
  'https://www.tremonix.com',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  ...(Deno.env.get('TREMONIX_ALLOWED_ORIGINS') ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

const quizOptions = [
  ['Within 5 minutes', 'Within 1 hour', 'Within 24 hours', 'Longer than 24 hours, or not sure'],
  ['5 or more attempts', '3-4 attempts', '1-2 attempts', 'We follow up once, then move on'],
  ['Less than 10%', '10-30%', '30-50%', 'More than 50%, or not sure'],
  [
    'Yes, we actively win back churned customers',
    'Somewhat, but it is informal',
    'No, we focus on new acquisition',
    'Not sure',
  ],
  [
    'All four Kirkpatrick levels (Reaction, Learning, Behavior, Results)',
    'Reaction and Learning only',
    'Just a satisfaction survey',
    'We do not measure training impact',
  ],
];

type LeadInput = {
  name: string;
  email: string;
  company: string;
  phone: string;
  source: string;
  campaign: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  landing_page: string | null;
  referrer: string | null;
  quiz_answers: Record<string, string>;
  quiz_score: number;
  leak_severity: 'critical' | 'moderate' | 'manageable' | null;
  marketing_consent: boolean;
  marketing_consent_at: string | null;
  engagement_score: number;
  tags: string[];
};

function jsonResponse(body: unknown, status: number, origin: string) {
  return new Response(status === 204 ? null : JSON.stringify(body), {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      'Content-Type': 'application/json',
      Vary: 'Origin',
    },
  });
}

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= maxLength ? trimmed : null;
}

function optionalText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed.slice(0, maxLength) : null;
}

function safeTag(value: string | null, prefix: string): string | null {
  if (!value) return null;
  const tag = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
  return tag ? `${prefix}-${tag}` : null;
}

function parseQuizAnswers(value: unknown): Record<string, string> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const answers: Record<string, string> = {};
  for (const [key, answer] of Object.entries(value)) {
    if (/^[0-4]$/.test(key) && typeof answer === 'string' && answer.length <= 200) {
      answers[key] = answer;
    }
  }
  return answers;
}

function buildLead(body: Record<string, unknown>): LeadInput | null {
  const name = readText(body.name, 120);
  const email = readText(body.email, 254)?.toLowerCase() ?? null;
  const company = readText(body.company, 200);
  const phone = readText(body.phone, 40);
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !company || !phone) {
    return null;
  }

  const quizAnswers = parseQuizAnswers(body.quiz_answers);
  const quizScore = Object.entries(quizAnswers).reduce((score, [question, answer]) => {
    const optionIndex = quizOptions[Number(question)]?.indexOf(answer) ?? -1;
    return score + (optionIndex < 0 ? 0 : optionIndex * 20);
  }, 0);
  const answerCount = Object.keys(quizAnswers).length;
  const marketingConsent = body.marketing_consent === true;
  const utmSource = optionalText(body.utm_source, 120);
  const utmCampaign = optionalText(body.utm_campaign, 120);
  const tags = [
    'tremonix',
    'audit-inquiry',
    safeTag(utmSource, 'source'),
    safeTag(utmCampaign, 'campaign'),
    marketingConsent ? 'marketing-opt-in' : 'marketing-opt-out',
  ].filter((tag): tag is string => Boolean(tag));

  return {
    name,
    email,
    company,
    phone,
    source: 'tremonix_audit_inquiry',
    campaign: optionalText(body.campaign, 120) ?? utmCampaign,
    utm_source: utmSource,
    utm_medium: optionalText(body.utm_medium, 120),
    utm_campaign: utmCampaign,
    utm_content: optionalText(body.utm_content, 120),
    utm_term: optionalText(body.utm_term, 120),
    landing_page: optionalText(body.landing_page, 2048),
    referrer: optionalText(body.referrer, 2048),
    quiz_answers: quizAnswers,
    quiz_score: quizScore,
    leak_severity: answerCount === 0 ? null : quizScore >= 60 ? 'critical' : quizScore >= 40 ? 'moderate' : 'manageable',
    marketing_consent: marketingConsent,
    marketing_consent_at: marketingConsent ? new Date().toISOString() : null,
    engagement_score: Math.min(100, 30 + answerCount * 10),
    tags,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[character];
  });
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function sendEmail(
  apiKey: string | undefined,
  sender: string | undefined,
  recipient: string | undefined,
  subject: string,
  html: string,
  text: string,
): Promise<'sent' | 'failed' | 'not_configured'> {
  if (!apiKey || !sender || !recipient) return 'not_configured';
  try {
    const response = await fetchWithTimeout('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: ['Bearer', apiKey].join(' '),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: sender, to: [recipient], subject, html, text }),
    });
    return response.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}

Deno.serve(async (request) => {
  const origin = request.headers.get('origin');
  if (!origin || !allowedOrigins.has(origin)) {
    return new Response(JSON.stringify({ error: 'Origin not allowed' }), { status: 403 });
  }

  if (request.method === 'OPTIONS') return jsonResponse({}, 204, origin);
  if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, origin);

  const rawBody = await request.text();
  if (rawBody.length > 16_384) return jsonResponse({ error: 'Request is too large' }, 413, origin);

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, origin);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonResponse({ error: 'Invalid request' }, 400, origin);
  }

  const lead = buildLead(body as Record<string, unknown>);
  if (!lead) return jsonResponse({ error: 'Please check the required contact details.' }, 400, origin);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Lead capture is not configured.' }, 500, origin);
  }

  const restUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/tremonix_audit_leads`;
  let savedLead: { id: string };
  try {
    const response = await fetch(restUrl, {
      method: 'POST',
      headers: {
        apikey: serviceRoleKey,
        Authorization: ['Bearer', serviceRoleKey].join(' '),
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(lead),
    });
    const rows = await response.json();
    if (!response.ok || !Array.isArray(rows) || !rows[0]?.id) {
      return jsonResponse({ error: 'Unable to save your request. Please try again.' }, 500, origin);
    }
    savedLead = rows[0];
  } catch {
    return jsonResponse({ error: 'Unable to save your request. Please try again.' }, 500, origin);
  }

  const crmUrl = Deno.env.get('CRM_WEBHOOK_URL');
  const crmSecret = Deno.env.get('CRM_WEBHOOK_SECRET');
  const crmPromise: Promise<'sent' | 'failed' | 'not_configured'> = !crmUrl
    ? Promise.resolve('not_configured')
    : (async () => {
        try {
          const parsedUrl = new URL(crmUrl);
          if (parsedUrl.protocol !== 'https:') return 'failed';
          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (crmSecret) headers['x-webhook-secret'] = crmSecret;
          const response = await fetchWithTimeout(crmUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              event: 'lead.created',
              lead: { id: savedLead.id, ...lead },
              automation: {
                welcome_sequence: lead.marketing_consent ? 'tremonix_welcome' : null,
                notify_owner: true,
              },
            }),
          });
          return response.ok ? 'sent' : 'failed';
        } catch {
          return 'failed';
        }
      })();

  const apiKey = Deno.env.get('RESEND_API_KEY');
  const sender = Deno.env.get('RESEND_FROM_EMAIL');
  const firstName = lead.name.split(/\s+/)[0];
  const welcomePromise = sendEmail(
    apiKey,
    sender,
    lead.email,
    'We received your Revenue Recovery Audit request',
    `<p>Hi ${escapeHtml(firstName)},</p><p>Thanks for requesting a Revenue Recovery Audit. We have your details and will follow up with the next steps shortly.</p><p>— Tremonix</p>`,
    `Hi ${firstName},\n\nThanks for requesting a Revenue Recovery Audit. We have your details and will follow up with the next steps shortly.\n\n— Tremonix`,
  );
  const notificationEmail = Deno.env.get('LEAD_NOTIFICATION_EMAIL');
  const notificationPromise = sendEmail(
    apiKey,
    sender,
    notificationEmail,
    'New Tremonix audit inquiry',
    `<p>A new audit inquiry was received.</p><ul><li>Name: ${escapeHtml(lead.name)}</li><li>Email: ${escapeHtml(lead.email)}</li><li>Company: ${escapeHtml(lead.company)}</li><li>Phone: ${escapeHtml(lead.phone)}</li><li>Campaign: ${escapeHtml(lead.campaign ?? 'Not specified')}</li><li>Engagement score: ${lead.engagement_score}</li></ul>`,
    `A new audit inquiry was received.\nName: ${lead.name}\nEmail: ${lead.email}\nCompany: ${lead.company}\nPhone: ${lead.phone}\nCampaign: ${lead.campaign ?? 'Not specified'}\nEngagement score: ${lead.engagement_score}`,
  );

  const [crmStatus, welcomeEmailStatus, notificationEmailStatus] = await Promise.all([
    crmPromise,
    welcomePromise,
    notificationPromise,
  ]);
  try {
    const updateResponse = await fetch(`${restUrl}?id=eq.${encodeURIComponent(savedLead.id)}`, {
      method: 'PATCH',
      headers: {
        apikey: serviceRoleKey,
        Authorization: ['Bearer', serviceRoleKey].join(' '),
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        crm_sync_status: crmStatus,
        welcome_email_status: welcomeEmailStatus,
        notification_email_status: notificationEmailStatus,
        updated_at: new Date().toISOString(),
      }),
    });
    if (!updateResponse.ok) console.error('Unable to update lead automation statuses.');
  } catch {
    console.error('Unable to update lead automation statuses.');
  }

  return jsonResponse({
    success: true,
    lead_id: savedLead.id,
    automation: {
      crm_sync_status: crmStatus,
      welcome_email_status: welcomeEmailStatus,
      notification_email_status: notificationEmailStatus,
    },
  }, 200, origin);
});
