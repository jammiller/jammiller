import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const eventNames = new Set([
  "page_view",
  "form_submission",
  "lead_created",
  "lead_stage_changed",
  "lead_qualified",
  "customer_acquired",
  "email_open",
  "audit_completed",
  "booking_completed",
  "payment_completed",
]);

function containsPersonalDataKey(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(([key, nested]) =>
    /email|phone|name|address|contact|message/i.test(key) || containsPersonalDataKey(nested)
  );
}

function isAuthorized(request: Request, secret: string) {
  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const actual = Buffer.from(token);
  const expected = Buffer.from(secret);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request: Request) {
  const secret = process.env.CONVERSION_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret || !supabaseUrl || !serviceRoleKey) {
    return Response.json({ error: "Conversion event ingestion is not configured." }, { status: 503 });
  }
  if (!isAuthorized(request, secret)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > 16_384) {
    return Response.json({ error: "Request body is too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    const text = await request.text();
    if (Buffer.byteLength(text) > 16_384) {
      return Response.json({ error: "Request body is too large." }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Expected an event object." }, { status: 400 });
  }
  const input = body as Record<string, unknown>;
  const { event_name: eventName, source, external_event_id: externalEventId, lead_id: leadId, metadata } = input;

  if (
    typeof eventName !== "string" || !eventNames.has(eventName) ||
    typeof source !== "string" || !/^[a-z0-9_-]{1,64}$/i.test(source) ||
    typeof externalEventId !== "string" || externalEventId.length < 1 || externalEventId.length > 200 ||
    (leadId !== undefined && leadId !== null &&
      (typeof leadId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(leadId))) ||
    (metadata !== undefined && (!metadata || typeof metadata !== "object" || Array.isArray(metadata)))
  ) {
    return Response.json({ error: "Invalid conversion event." }, { status: 400 });
  }
  if (metadata && Buffer.byteLength(JSON.stringify(metadata)) > 4_096) {
    return Response.json({ error: "Event metadata is too large." }, { status: 400 });
  }
  if (metadata && containsPersonalDataKey(metadata)) {
    return Response.json({ error: "Personal data is not allowed in event metadata." }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.from("cc_conversion_events").upsert(
    {
      event_name: eventName,
      source,
      external_event_id: externalEventId,
      lead_id: leadId ?? null,
      metadata: metadata ?? {},
    },
    { onConflict: "source,external_event_id", ignoreDuplicates: true }
  );
  if (error) {
    return Response.json({ error: "Could not record conversion event." }, { status: 500 });
  }
  return Response.json({ received: true });
}
