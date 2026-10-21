import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { handleTrustCenterRequest } from '../../../src/lib/trust-center/api.ts';
import { createIntegrityMonitor } from '../../../src/lib/trust-center/monitor.ts';
import { SupabaseTrustCenterStore } from '../../../src/lib/trust-center/supabaseStore.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 200, headers: corsHeaders });

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);
  const store = new SupabaseTrustCenterStore(supabase);

  // Reads need a PulseOS admin session; ingest needs the service-role key (internal callers) or an admin.
  const authorize = async (request: Request, action: 'read' | 'ingest') => {
    const token = (request.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '');
    if (!token) return false;
    if (action === 'ingest' && token === serviceKey) return true;
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return false;
    const { data } = await supabase.from('pulseos_user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle();
    return !!data;
  };

  try {
    const res = await handleTrustCenterRequest(req, { store, monitor: createIntegrityMonitor(store), authorize });
    const headers = new Headers(res.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));
    return new Response(res.body, { status: res.status, headers });
  } catch (err) {
    console.error('pulseos-trust-center error', err);
    return new Response(JSON.stringify({ error: 'internal error' }), { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } });
  }
});
