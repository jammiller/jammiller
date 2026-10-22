"use client";
import ResourcePage from "@/components/ResourcePage";
import { dateTime, money } from "@/components/format";
import { ASSETS } from "@/lib/types";

export default function LeadsPage() {
  return (
    <ResourcePage
      title="Leads"
      table="cc_leads"
      fields={[
        { key: "company", label: "Company", required: true },
        { key: "asset", label: "Product", type: "select", options: ASSETS, required: true },
        { key: "contact", label: "Contact" },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone" },
        { key: "website", label: "Website" },
        { key: "source", label: "Source" },
        { key: "industry", label: "Industry" },
        { key: "opportunity_value", label: "Opportunity Value", type: "number", format: money },
        { key: "employee_count", label: "Employees", type: "number", step: "1" },
        { key: "annual_revenue", label: "Annual Revenue", type: "number", format: money },
        { key: "industry_match", label: "Industry Match", type: "boolean", format: (v) => v ? "Yes" : "No" },
        { key: "email_opens", label: "Email Opens", type: "number", step: "1" },
        { key: "pages_visited", label: "Pages Visited", type: "number", step: "1" },
        { key: "time_on_site_seconds", label: "Time on Site (seconds)", type: "number", step: "1" },
        { key: "form_completeness", label: "Form Completeness (0–100)", type: "number", step: "1" },
        { key: "engagement_score", label: "Engagement Score", readOnly: true, format: (v) => `${v ?? 0}/100` },
        { key: "budget_indicator", label: "Budget Identified", type: "boolean", format: (v) => v ? "Yes" : "No" },
        { key: "purchase_intent", label: "Purchase Intent", type: "boolean", format: (v) => v ? "Yes" : "No" },
        { key: "qualification_score", label: "Score", readOnly: true, format: (v) => `${v ?? 0}/100` },
        { key: "intent_tier", label: "Intent Tier", readOnly: true },
        { key: "routing_queue", label: "Routing Queue", readOnly: true },
        { key: "qualified_at", label: "Qualified At", readOnly: true, format: dateTime },
        { key: "next_follow_up_at", label: "Next Follow-up", type: "date", clearable: true },
        { key: "audit_status", label: "Audit Status", type: "select", required: true,
          options: ["Not Started", "Requested", "Booked", "Completed", "Paid", "Declined"] },
        { key: "audit_booked_at", label: "Audit Booked", type: "date", clearable: true },
        { key: "audit_paid_at", label: "Audit Paid", type: "date", clearable: true },
        { key: "status", label: "Status", type: "select",
          options: ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"], required: true },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  );
}
