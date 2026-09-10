import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    let isMember = false;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        userId = user.id;

        const { data: customer } = await supabase
          .from('stripe_customers')
          .select('customer_id')
          .eq('user_id', user.id)
          .is('deleted_at', null)
          .maybeSingle();

        if (customer) {
          const { data: sub } = await supabase
            .from('stripe_subscriptions')
            .select('status')
            .eq('customer_id', customer.customer_id)
            .is('deleted_at', null)
            .maybeSingle();

          if (sub && (sub.status === 'active' || sub.status === 'trialing')) {
            isMember = true;
          }
        }
      }
    }

    const contentType = new URL(req.url).searchParams.get('type') || 'all';

    let prompts: unknown[] = [];
    let trends: unknown[] = [];
    let templates: unknown[] = [];

    if (contentType === 'all' || contentType === 'prompts') {
      const { data } = await supabase
        .from('insider_prompts')
        .select('*')
        .order('sort_order', { ascending: true });
      prompts = (data || []).map((p: Record<string, unknown>) => ({
        id: p.id,
        title: p.title,
        category: p.category,
        platform: p.platform,
        promptText: isMember ? p.prompt_text : null,
        previewText: p.preview_text,
        useCase: p.use_case,
      }));
    }

    if (contentType === 'all' || contentType === 'trends') {
      const { data } = await supabase
        .from('insider_trends')
        .select('*')
        .order('sort_order', { ascending: true });
      trends = (data || []).map((t: Record<string, unknown>) => ({
        id: t.id,
        title: t.title,
        platform: t.platform,
        type: t.type,
        priority: t.priority,
        spottedDate: t.spotted_date,
        description: isMember ? t.description : null,
        previewDescription: t.preview_description,
        action: isMember ? t.action : null,
      }));
    }

    if (contentType === 'all' || contentType === 'templates') {
      const { data } = await supabase
        .from('insider_templates')
        .select('*')
        .order('sort_order', { ascending: true });
      templates = (data || []).map((t: Record<string, unknown>) => ({
        id: t.id,
        title: t.title,
        type: t.type,
        platform: t.platform,
        templateText: isMember ? t.template_text : null,
        previewText: t.preview_text,
        useCase: t.use_case,
      }));
    }

    return new Response(
      JSON.stringify({ isMember, prompts, trends, templates }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Insider access error:', error);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
