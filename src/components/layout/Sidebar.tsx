"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  MessageSquare,
  BarChart3,
  FlaskConical,
  User,
  Settings,
  HelpCircle,
  Shield,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "DASHBOARD", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/datasets", label: "DATASETS", icon: Database },
  { href: "/dashboard/insights", label: "INSIGHTS", icon: BarChart3 },
  { href: "/dashboard/simulate", label: "SIMULATOR", icon: FlaskConical },
  { href: "/dashboard/chat", label: "AI CHAT", icon: MessageSquare },
  { href: "/dashboard/profile", label: "PROFILE", icon: User },
  { href: "/dashboard/settings", label: "SETTINGS", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="hidden md:flex flex-col shrink-0 h-full"
      style={{ width: "220px", background: "#0d0d14", borderRight: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#f97316" }}
          >
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm" style={{ color: "#ebebf0" }}>
              Concept<span style={{ color: "#f97316" }}>Leak</span>
            </span>
            <p
              className="text-[10px] leading-none mt-0.5 font-semibold tracking-widest uppercase"
              style={{ color: "#4a4a5a" }}
            >
              ML Dataset Auditor
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-0.5" role="list">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-[11px] font-semibold tracking-[0.08em] transition-all duration-150 relative"
                  )}
                  style={
                    active
                      ? { background: "rgba(249,115,22,0.08)", color: "#f97316" }
                      : { color: "#7b7b8d" }
                  }
                >
                  {active && (
                    <span
                      className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
                      style={{ background: "#f97316" }}
                    />
                  )}
                  <Icon
                    size={15}
                    className="shrink-0"
                    style={{ color: active ? "#f97316" : "#4a4a5a" }}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Help + Support */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {[
          { label: "HELP", href: "#" },
          { label: "SUPPORT", href: "#" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-semibold tracking-[0.08em] transition-all duration-150"
            style={{ color: "#4a4a5a" }}
          >
            <HelpCircle size={13} style={{ color: "#4a4a5a" }} />
            {label}
          </Link>
        ))}
      </div>

      {/* Powered by Groq */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2">
          <Zap size={10} style={{ color: "#4a4a5a" }} />
          <p
            className="text-[10px] font-semibold tracking-widest uppercase"
            style={{ color: "#4a4a5a" }}
          >
            Powered by Groq
          </p>
        </div>
      </div>
    </nav>
  );
}
