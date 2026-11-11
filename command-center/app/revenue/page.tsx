"use client";
import ResourcePage from "@/components/ResourcePage";
import { money } from "@/components/format";
import { ASSETS } from "@/lib/types";

export default function RevenuePage() {
  return (
    <ResourcePage
      title="Revenue"
      table="cc_revenue"
      orderBy="date"
      fields={[
        { key: "date", label: "Date", type: "date", required: true },
        { key: "amount", label: "Amount", type: "number", required: true, format: money },
        { key: "asset", label: "Asset", type: "select", options: ASSETS, required: true },
        { key: "revenue_type", label: "Revenue Type", type: "select",
          options: ["Recurring", "One-time", "Affiliate", "Other"] },
        { key: "notes", label: "Notes", type: "textarea" },
      ]}
    />
  );
}
