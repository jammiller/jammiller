"use client";
import ResourcePage from "@/components/ResourcePage";

export default function TrafficPage() {
  return (
    <ResourcePage
      title="Traffic Analytics"
      table="cc_traffic"
      fields={[
        { key: "date", label: "Date", type: "date", required: true },
        { key: "source", label: "Source", required: true },
        { key: "page_title", label: "Page" },
        { key: "page_path", label: "Page Path", required: true },
        { key: "sessions", label: "Sessions", type: "number", step: "1" },
        { key: "leads", label: "Attributed Leads", type: "number", step: "1" },
      ]}
    />
  );
}
