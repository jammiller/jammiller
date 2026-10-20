import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Supabase-Api-Version',
};

type LeadRequest = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  phone?: unknown;
  source?: unknown;
  campaign?: unknown;
  marketing_consent?: unknown;
  website_url?: unknown;
};

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function text(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 && normalized.length <= maxLength ? normalized : null;
}

async function sendEmail(apiKey: string, from: string, to: string, subject: string, textBody: string) {
  const result = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [to], subject, text: textBody }),
    signal: AbortSignal.timeout(10000),
  });
  return result.ok;
}

async function sendCrmWebhook(url: string, payload: Record<string, unknown>): Promise<'sent' | 'failed'> {
  try {
    const endpoint = new URL(url);
    if (endpoint.protocol !== 'https:') return 'failed';
    const result = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'error',
      signal: AbortSignal.timeout(10000),
    });
    return result.ok ? 'sent' : 'failed';
  } catch {
    return 'failed';
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders });
  if (req.method !== 'POST') return response({ error: 'Method not allowed' }, 405);

  try {
    const rawBody = await req.text();
    if (rawBody.length > 8192) return response({ error: 'Request is too large' }, 413);

    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      return response({ error: 'Invalid request body' }, 400);
    }
    if (!parsedBody || typeof parsedBody !== 'object' || Array.isArray(parsedBody)) {
      return response({ error: 'Invalid request body' }, 400);
    }

    const body = parsedBody as LeadRequest;
    if (typeof body.website_url === 'string' && body.website_url.trim()) {
      return response({ success: true, integrations: { crm: 'ignored', welcome: 'ignored', notification: 'ignored' } });
    }

    const name = text(body.name, 120);
    const email = text(body.email, 320);
    const company = text(body.company, 160);
    const phone = text(body.phone, 40);
    const source = text(body.source, 120) ?? 'tremonix_website';
    const campaign = text(body.campaign, 160);
    const marketingConsent = body.marketing_consent === true;

    if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !company || !phone) {
      return response({ error: 'Please provide valid contact details.' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Lead capture is missing Supabase service configuration.');
      return response({ error: 'Unable to save your request right now.' }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: lead, error } = await supabase
      .from('tremonix_leads')
      .insert({
        name,
        email,
        company,
        phone,
        service_interest: 'Revenue Recovery Audit',
        message: `New audit request from ${company}`,
        source,
        campaign,
        marketing_consent: marketingConsent,
      })
      .select('id')
      .single();

    if (error || !lead) {
      console.error('Failed to save Tremonix audit inquiry:', error?.message);
      return response({ error: 'Unable to save your request right now.' }, 500);
    }

    const crmWebhookUrl = Deno.env.get('CRM_WEBHOOK_URL');
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const emailFrom = Deno.env.get('LEAD_EMAIL_FROM');
    const notificationEmail = Deno.env.get('LEAD_NOTIFICATION_EMAIL');

    const crmPromise = crmWebhookUrl
      ? sendCrmWebhook(crmWebhookUrl, {
            event: 'lead.created',
            lead: { id: lead.id, name, email, company, phone, source, campaign, marketing_consent: marketingConsent },
            tags: ['Tremonix', 'audit-inquiry', source, ...(campaign ? [campaign] : [])],
            automation: marketingConsent ? 'tremonix-audit-welcome' : null,
          })
      : Promise.resolve('not_configured');

    const welcomePromise = resendApiKey && emailFrom
      ? sendEmail(
          resendApiKey,
          emailFrom,
          email,
          'We received your Tremonix audit request',
          `Hi ${name},\n\nThanks for requesting a Revenue Recovery Audit. We have received your request and will follow up shortly with scheduling details.\n\nTremonix`,
        ).then((sent) => sent ? 'sent' : 'failed').catch(() => 'failed')
      : Promise.resolve('not_configured');

    const notificationPromise = resendApiKey && emailFrom && notificationEmail
      ? sendEmail(
          resendApiKey,
          emailFrom,
          notificationEmail,
          `New Tremonix audit inquiry from ${company}`,
          `A new Revenue Recovery Audit request was received.\n\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nPhone: ${phone}\nSource: ${source}\nCampaign: ${campaign ?? 'none'}\nLead ID: ${lead.id}`,
        ).then((sent) => sent ? 'sent' : 'failed').catch(() => 'failed')
      : Promise.resolve('not_configured');

    const [crm, welcome, notification] = await Promise.all([crmPromise, welcomePromise, notificationPromise]);
    const { error: statusError } = await supabase
      .from('tremonix_leads')
      .update({
        crm_sync_status: crm,
        welcome_email_status: welcome,
        notification_status: notification,
      })
      .eq('id', lead.id);
    if (statusError) {
      console.error('Failed to save Tremonix integration statuses:', statusError.message, lead.id);
    }

    if (crm !== 'sent' || welcome !== 'sent' || notification !== 'sent') {
      console.error('Tremonix lead integrations require attention:', { crm, welcome, notification, leadId: lead.id });
    }

    return response({ success: true, integrations: { crm, welcome, notification } });
  } catch (error) {
    console.error('Tremonix lead capture error:', error);
    return response({ error: 'Unable to save your request right now.' }, 500);
  }
});
