"use client";
import ResourcePage from "@/components/ResourcePage";
import { money } from "@/components/format";

export default function LeadsPage() {
  return (
    <ResourcePage
      title="Leads"
      table="cc_leads"
      fields={[
        { key: "company", label: "Company", required: true },
        { key: "contact", label: "Contact" },
        { key: "email", label: "Email", type: "email" },
        { key: "phone", label: "Phone" },
        { key: "source", label: "Source" },
        { key: "opportunity_value", label: "Opportunity Value", type: "number", format: money },
        { key: "status", label: "Status", type: "select",
          options: ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"] },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  );
}
