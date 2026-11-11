"use client";
import ResourcePage from "@/components/ResourcePage";

export default function DomainsPage() {
  return (
    <ResourcePage
      title="Domains"
      table="cc_domains"
      fields={[
        { key: "domain", label: "Domain", required: true },
        { key: "ssl_status", label: "SSL Status", type: "select",
          options: ["Valid", "Expiring", "Expired", "None"] },
        { key: "renewal_date", label: "Renewal Date", type: "date" },
        { key: "health_status", label: "Health Status", type: "select",
          options: ["Healthy", "Warning", "Critical"] },
      ]}
    />
  );
}
