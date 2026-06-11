"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut, User, Menu, X, LayoutDashboard, Database,
  MessageSquare, BarChart3, Upload, Sun, Moon,
} from "lucide-react";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard":          "Dashboard",
  "/dashboard/datasets": "Datasets",
  "/dashboard/chat":     "AI Chat",
  "/dashboard/insights": "Insights",
  "/dashboard/simulate": "Simulator",
  "/dashboard/profile":  "Profile",
  "/dashboard/settings": "Settings",
};

const MOBILE_NAV = [
  { href: "/dashboard",          label: "Home",     icon: LayoutDashboard },
  { href: "/dashboard/datasets", label: "Datasets", icon: Database },
  { href: "/dashboard/chat",     label: "Chat",     icon: MessageSquare },
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read saved theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("conceptleak-theme");
      const isDark = saved === "dark" || document.documentElement.classList.contains("dark");
      setDarkMode(isDark);
    } catch {
      // ignore
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const title = Object.entries(PAGE_TITLES)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(path))?.[1] || "Dashboard";

  function toggleTheme() {
    const next = !darkMode;
    setDarkMode(next);
    try {
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("conceptleak-theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("conceptleak-theme", "light");
      }
    } catch {
      // ignore
    }
  }

  async function handleLogout() {
    setSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initials = user.name.charAt(0).toUpperCase();

  return (
    <>
      <header
        className="flex items-center justify-between h-14 px-4 md:px-6 shrink-0"
        style={{
          background: "var(--bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Left: mobile menu button + breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Breadcrumb — desktop */}
          <div className="hidden md:flex items-center gap-1.5 text-[12px] font-medium">
            <span style={{ color: "var(--text-muted)" }}>Workspace</span>
            <span style={{ color: "var(--text-muted)" }}>›</span>
            <span style={{ color: "var(--text)" }}>{title}</span>
          </div>

          {/* Mobile title */}
          <h2 className="md:hidden text-base font-semibold" style={{ color: "var(--text)" }}>
            {title}
          </h2>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2" ref={dropdownRef}>
          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />
            }
          </button>

          {/* Upload Dataset button */}
          <Link
            href="/dashboard/datasets"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Dataset
          </Link>

          {/* Avatar / dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-opacity hover:opacity-80"
              style={{
                background: "var(--accent-muted)",
                border: "1px solid var(--accent-muted-border)",
                color: "var(--accent)",
              }}
              aria-label="Account menu"
            >
              {initials}
            </button>

            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-52 rounded-xl shadow-lg overflow-hidden z-50"
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                }}
              >
                <div className="p-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                    {user.name}
                  </p>
                  <p className="text-[11px] mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {user.email}
                  </p>
                </div>
                <div className="p-1">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--surface)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "";
                    }}
                  >
                    <User className="w-3.5 h-3.5" />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    disabled={signingOut}
                    className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs transition-colors text-left disabled:opacity-50"
                    style={{ color: "#ef4444" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "";
                    }}
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
          className="md:hidden fixed inset-0 z-50 backdrop-blur-sm"
          style={{ background: "var(--bg)" }}
        >
          <div className="flex flex-col h-full">
            <div
              className="flex items-center justify-between p-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span className="font-bold text-lg" style={{ color: "var(--text)" }}>
                Concept<span style={{ color: "var(--accent)" }}>Leak</span>
              </span>
              <button onClick={() => setMobileMenuOpen(false)} style={{ color: "var(--text-secondary)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {MOBILE_NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
            </nav>
            <div className="p-4" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 rounded-xl transition-colors"
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
