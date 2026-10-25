"use client";
import ResourcePage from "@/components/ResourcePage";

export default function CampaignsPage() {
  return (
    <ResourcePage
      title="Campaigns"
      table="cc_campaigns"
      fields={[
        { key: "campaign_name", label: "Campaign", required: true },
        { key: "channel", label: "Channel", type: "select", options: ["Email", "Social", "Website", "Other"], required: true },
        { key: "source", label: "Source" },
        { key: "content_title", label: "Content" },
        { key: "date", label: "Date", type: "date", required: true },
        { key: "sent_count", label: "Sent", type: "number", step: "1" },
        { key: "open_count", label: "Opens", type: "number", step: "1" },
        { key: "click_count", label: "Clicks", type: "number", step: "1" },
        { key: "conversions", label: "Conversions", type: "number", step: "1" },
      ]}
    />
  );
}
