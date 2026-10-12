"use client";
import ResourcePage from "@/components/ResourcePage";
import { dateTime } from "@/components/format";

export default function AgentsPage() {
  return (
    <ResourcePage
      title="Agents"
      table="cc_agents"
      fields={[
        { key: "agent_name", label: "Agent Name", required: true },
        { key: "status", label: "Status", type: "select",
          options: ["Running", "Idle", "Error", "Disabled"] },
        { key: "last_run", label: "Last Run", type: "datetime-local", format: dateTime },
        { key: "health_score", label: "Health Score", type: "number" },
      ]}
    />
  );
}
