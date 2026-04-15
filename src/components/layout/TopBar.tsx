"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, User, Bell, Menu, X, LayoutDashboard, Database, MessageSquare, BarChart3 } from "lucide-react";

// ... existing code ...

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/datasets": "Datasets",
  "/dashboard/chat": "AI Chat",
  "/dashboard/insights": "Insights",
  "/dashboard/profile": "Profile",
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
      <header className="flex items-center justify-between h-14 px-4 md:px-6 border-b border-slate-800/60 bg-slate-900/60 backdrop-blur-md shrink-0">
        {/* Mobile menu toggle + title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <h2 className="text-base font-semibold text-white">{title}</h2>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-orange-500 rounded-full" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-64 md:w-72 bg-slate-800/95 backdrop-blur-md rounded-xl border border-slate-700 shadow-xl overflow-hidden z-50">
                <div className="p-3 border-b border-slate-700/50 bg-slate-800/50">
                  <h3 className="text-sm font-semibold text-white">Recent Activity</h3>
                </div>
                <div className="p-2 flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                  <div className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <p className="text-xs font-medium text-slate-200">New Login Detected</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Just now from ConceptLeak</p>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <p className="text-xs font-medium text-slate-200">Analysis completed</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">2 hours ago</p>
                  </div>
                  <div className="p-2 rounded-lg hover:bg-slate-700/50 transition-colors cursor-pointer">
                    <p className="text-xs font-medium text-slate-200">Profile Settings Updated</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">1 day ago</p>
                  </div>
                </div>
                <div className="p-2 border-t border-slate-700/50 bg-slate-800/50">
                  <button
                    onClick={() => setNotificationsOpen(false)}
                    className="w-full text-center text-xs text-orange-400 hover:text-orange-300 py-1 transition-colors"
                  >
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-700/50">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 pr-1 hover:opacity-80 transition-opacity"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-200 leading-none">{user.name}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-none">{user.email}</p>
              </div>
              <div className="w-8 h-8 bg-orange-500/20 border border-orange-500/30 rounded-full flex items-center justify-center text-orange-400 text-xs font-bold shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              disabled={signingOut}
              className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-150"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-md">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <span className="font-bold text-white text-lg">
                Concept<span className="text-orange-400">Leak</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
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
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <User className="w-5 h-5" />
                Profile
              </Link>
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
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
