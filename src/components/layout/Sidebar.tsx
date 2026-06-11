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
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard",          label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { href: "/dashboard/datasets", label: "Datasets",   icon: Database },
  { href: "/dashboard/insights", label: "Insights",   icon: BarChart3 },
  { href: "/dashboard/simulate", label: "Simulator",  icon: FlaskConical },
  { href: "/dashboard/chat",     label: "AI Chat",    icon: MessageSquare },
  { href: "/dashboard/profile",  label: "Profile",    icon: User },
  { href: "/dashboard/settings", label: "Settings",   icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="hidden md:flex flex-col shrink-0 h-full"
      style={{
        width: "220px",
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "var(--accent)" }}
          >
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm" style={{ color: "var(--text)" }}>
              Concept<span style={{ color: "var(--accent)" }}>Leak</span>
            </span>
            <p
              className="text-[10px] leading-none mt-0.5 font-medium tracking-widest uppercase"
              style={{ color: "var(--text-muted)" }}
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
                  prefetch={true}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 relative"
                  )}
                  style={
                    active
                      ? {
                          background: "var(--accent-muted)",
                          color: "var(--accent)",
                          borderLeft: "3px solid var(--accent)",
                          paddingLeft: "calc(0.75rem - 3px)",
                        }
                      : {
                          color: "var(--text-secondary)",
                        }
                  }
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "";
                    }
                  }}
                >
                  <Icon
                    size={15}
                    className="shrink-0"
                    style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
                  />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Bottom links */}
      <div className="px-3 py-3" style={{ borderTop: "1px solid var(--border)" }}>
        {[
          { label: "Help",    href: "#" },
          { label: "Support", href: "#" },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
              (e.currentTarget as HTMLElement).style.background = "var(--surface)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
              (e.currentTarget as HTMLElement).style.background = "";
            }}
          >
            <HelpCircle size={14} style={{ color: "var(--text-muted)" }} />
            {label}
          </Link>
        ))}

        <p
          className="px-3 pt-2 text-[10px] font-medium tracking-widest uppercase"
          style={{ color: "var(--text-muted)" }}
        >
          Powered by Groq
        </p>
      </div>
    </nav>
  );
}
