"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, DollarSign, Users, Globe, Bot, Menu, X, BarChart3 } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Conversion Funnel", icon: BarChart3 },
  { href: "/leads", label: "Leads", icon: Target },
  { href: "/revenue", label: "Revenue", icon: DollarSign },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/domains", label: "Domains", icon: Globe },
  { href: "/agents", label: "Agents", icon: Bot },
];

export default function Sidebar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed left-3 top-3 z-50 rounded-lg bg-slate-800 p-2 text-slate-200 md:hidden"
        aria-label="Toggle navigation"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-800 bg-slate-950 p-5 transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 mt-10 md:mt-0">
          <div className="text-lg font-bold tracking-widest text-cyan-400">DATAPULSE</div>
          <div className="text-xs tracking-[0.3em] text-slate-500">COMMAND CENTER</div>
        </div>
        <nav className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                path === href
                  ? "bg-cyan-500/10 text-cyan-300"
                  : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-5 left-5 text-xs text-slate-600">
          DataPulse Social · PulseOS · Tremonix · VoltEcho
        </div>
      </aside>
    </>
  );
}
