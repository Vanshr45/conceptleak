"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User, Bell, Menu, X, LayoutDashboard, Database, MessageSquare, BarChart3, Upload } from "lucide-react";

// ... existing code ...

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/datasets": "Datasets",
  "/dashboard/chat": "AI Chat",
  "/dashboard/insights": "Insights",
  "/dashboard/profile": "Profile",
  "/dashboard/settings": "Settings",
};

const MOBILE_NAV = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/datasets", label: "Datasets", icon: Database },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/insights", label: "Insights", icon: BarChart3 },
];

interface TopBarProps {
  user: { name: string; email: string };
}

export default function TopBar({ user }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const title = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard";

  async function handleLogout() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header
        className="flex items-center justify-between h-14 px-4 md:px-6 shrink-0"
        style={{ background: "#0d0d14", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Left: mobile menu + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: "#7b7b8d" }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Breadcrumb — desktop only */}
          <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em]">
            <span style={{ color: "#4a4a5a" }}>WORKSPACE</span>
            <span style={{ color: "#4a4a5a" }}>›</span>
            <span style={{ color: "#f97316" }}>{title.toUpperCase()}</span>
          </div>

          {/* Mobile title */}
          <h2 className="md:hidden text-base font-semibold" style={{ color: "#ebebf0" }}>{title}</h2>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3" ref={dropdownRef}>
          {/* Upload Dataset button — hidden on small screens */}
          <Link
            href="/dashboard/datasets"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold transition-all hover:opacity-90"
            style={{ background: "#f97316" }}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Dataset
          </Link>

          {/* Hidden bell — state preserved, UI hidden */}
          <div className="hidden" aria-hidden="true">
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} aria-label="Notifications">
              <Bell className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all hover:opacity-80"
              style={{
                background: "rgba(249,115,22,0.2)",
                border: "1px solid rgba(249,115,22,0.35)",
                color: "#f97316",
              }}
              aria-label="Account menu"
            >
              {user.name.charAt(0).toUpperCase()}
            </button>

            {notificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl shadow-xl overflow-hidden z-50"
                style={{ background: "#1a1a24", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="p-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <p className="text-xs font-semibold" style={{ color: "#ebebf0" }}>{user.name}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: "#7b7b8d" }}>{user.email}</p>
                </div>
                <div className="p-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setNotificationsOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors hover:bg-white/5"
                    style={{ color: "#7b7b8d" }}
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={signingOut}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors text-left hover:bg-white/5 disabled:opacity-50"
                    style={{ color: "#ef4444" }}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {signingOut ? "Signing out…" : "Sign Out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 backdrop-blur-md"
          style={{ background: "rgba(10,10,15,0.97)" }}
        >
          <div className="flex flex-col h-full">
            <div
              className="flex items-center justify-between p-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="font-bold text-lg" style={{ color: "#ebebf0" }}>
                Concept<span style={{ color: "#f97316" }}>Leak</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: "#7b7b8d" }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {MOBILE_NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/5"
                  style={{ color: "#7b7b8d" }}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors hover:bg-white/5"
                style={{ color: "#7b7b8d" }}
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
            </nav>
            <div className="p-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl transition-colors hover:bg-red-500/10"
                style={{ color: "#ef4444" }}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
