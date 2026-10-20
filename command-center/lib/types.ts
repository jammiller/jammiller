export const ASSETS = ["DataPulse Social", "PulseOS", "Tremonix", "VoltEcho"] as const;
export type Asset = (typeof ASSETS)[number];

export type Lead = {
  id: string; company: string; contact: string | null; email: string | null;
  phone: string | null; source: string | null; opportunity_value: number;
  status: string; notes: string | null; qualification_score: number;
  intent_tier: "High" | "Medium" | "Low" | "Unqualified";
  routing_queue: string; qualified_at: string | null; created_at: string;
};
export type LeadStageHistory = {
  id: string; lead_id: string; stage: string; entered_at: string; exited_at: string | null;
};
export type Campaign = {
  id: string; campaign_name: string; channel: string; source: string | null;
  content_title: string | null; date: string; sent_count: number; open_count: number;
  click_count: number; conversions: number;
};
export type Traffic = {
  id: string; date: string; source: string; page_title: string | null;
  page_path: string; sessions: number; leads: number;
};
export type Revenue = {
  id: string; date: string; amount: number; asset: Asset;
  revenue_type: string; notes: string | null;
};
export type Client = {
  id: string; client_name: string; service: string | null;
  monthly_value: number; start_date: string | null; status: string;
};
export type Domain = {
  id: string; domain: string; ssl_status: string;
  renewal_date: string | null; health_status: string;
};
export type Agent = {
  id: string; agent_name: string; status: string;
  last_run: string | null; health_score: number;
};
