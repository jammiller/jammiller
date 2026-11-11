import "./globals.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "DataPulse Command Center",
  description: "Business intelligence dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-200 antialiased">
        <Sidebar />
        <main className="min-h-screen px-4 pb-10 pt-16 md:ml-64 md:px-8 md:pt-8">{children}</main>
      </body>
    </html>
  );
}
