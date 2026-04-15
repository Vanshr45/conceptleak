"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  MessageSquare,
  BarChart3,
  User,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/datasets", label: "Datasets", icon: Database },
  { href: "/dashboard/chat", label: "AI Chat", icon: MessageSquare },
  { href: "/dashboard/insights", label: "Insights", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="hidden md:flex flex-col w-64 shrink-0 bg-slate-900/80 border-r border-slate-800/60 h-full"
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-800/60">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
              <circle cx="12" cy="12" r="4" stroke="#f97316" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="9" stroke="#f97316" strokeWidth="1" strokeDasharray="2 2" />
              <circle cx="12" cy="12" r="1.5" fill="#f97316" />
            </svg>
          </div>
          <div>
            <span className="font-bold text-white text-sm">
              Concept<span className="text-orange-400">Leak</span>
            </span>
            <p className="text-slate-500 text-[10px] leading-none mt-0.5">v2.0 — ML Auditor</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-slate-600 text-[10px] font-semibold uppercase tracking-widest px-3 mb-3">
          Navigation
        </p>
        <ul className="space-y-1" role="list">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-orange-500/15 text-orange-300 border border-orange-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  )}
                >
                  <Icon
                    className={cn("w-4.5 h-4.5 shrink-0", active ? "text-orange-400" : "text-slate-500")}
                    size={18}
                  />
                  {label}
                  {active && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom badge */}
      <div className="px-4 pb-4">
        <div className="glass rounded-xl p-3 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-orange-500/10 rounded-lg flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-300">AI-Powered</p>
            <p className="text-[10px] text-slate-500 truncate">Gemini 2.0 Flash</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
