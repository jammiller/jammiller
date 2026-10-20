export const ASSETS = ["DataPulse Social", "PulseOS", "Tremonix", "VoltEcho"] as const;
export type Asset = (typeof ASSETS)[number];

export type Lead = {
  id: string; company: string; contact: string | null; email: string | null;
  phone: string | null; source: string | null; opportunity_value: number;
  status: string; notes: string | null; qualification_score: number;
  asset: Asset | null; next_follow_up_at: string | null;
  audit_status: "Not Started" | "Requested" | "Booked" | "Completed" | "Paid" | "Declined";
  audit_booked_at: string | null; audit_paid_at: string | null;
  intent_tier: "High" | "Medium" | "Low" | "Unqualified";
  routing_queue: string; qualified_at: string | null; created_at: string;
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
