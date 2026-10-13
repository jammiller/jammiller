"use client";
import ResourcePage from "@/components/ResourcePage";
import { money } from "@/components/format";

export default function ClientsPage() {
  return (
    <ResourcePage
      title="Clients"
      table="cc_clients"
      fields={[
        { key: "client_name", label: "Client Name", required: true },
        { key: "service", label: "Service" },
        { key: "monthly_value", label: "Monthly Value", type: "number", format: money },
        { key: "start_date", label: "Start Date", type: "date" },
        { key: "status", label: "Status", type: "select", options: ["Active", "Paused", "Churned"] },
      ]}
    />
  );
}
