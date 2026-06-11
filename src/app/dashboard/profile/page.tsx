import type { Metadata } from "next";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { getAllDatasets, getInsights } from "@/lib/store";
import { getUserById } from "@/lib/users";
import { User, Mail, Shield, Database, Calendar, Zap, MessageSquare, Trash2 } from "lucide-react";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getSession();
  const userId = session!.sub;
  const storedUser = await getUserById(userId);

  const datasets = await getAllDatasets(userId);
  const allInsights = (await Promise.all(datasets.map((d) => getInsights(userId, d.id)))).flat();
  const criticalCount = allInsights.filter((i) => i.riskLevel === "CRITICAL").length;

  const authType = storedUser?.authType ?? session?.authType ?? "email";
  const picture = storedUser?.picture ?? session?.picture;
  const memberSince = storedUser?.createdAt
    ? new Date(storedUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  const rawName = session!.name || "User";
  const initials = rawName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  // suppress unused warnings for preserved imports
  void Calendar; void criticalCount;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-8">

      {/* Header Card — avatar + name + plan */}
      <div
        className="rounded-xl p-6"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            {picture ? (
              <Image
                src={picture}
                alt={rawName}
                width={72}
                height={72}
                className="rounded-full object-cover"
                style={{ border: "2px solid var(--accent-muted-border)" }}
              />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  background: "var(--accent-muted)",
                  border: "2px solid var(--accent-muted-border)",
                  color: "var(--accent)",
                }}
              >
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold" style={{ color: "var(--text)" }}>
                {rawName}
              </h2>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
                style={{
                  background: "var(--accent-muted)",
                  border: "1px solid var(--accent-muted-border)",
                  color: "var(--accent)",
                }}
              >
                FREE PLAN
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {session!.email}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Member since {memberSince}
            </p>
          </div>

          {/* Edit Profile (decorative) */}
          <button
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity hover:opacity-75 shrink-0"
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* ACCOUNT DETAILS */}
      <section>
        <p className="section-label mb-3">Account Details</p>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* Full Name */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
              <p className="section-label">Full Name</p>
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
              {rawName}
            </p>
          </div>
          {/* Email Address */}
          <div
            className="rounded-xl p-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
              <p className="section-label">Email Address</p>
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
              {session!.email}
            </p>
          </div>
        </div>
        {/* Authentication Method */}
        <div
          className="rounded-xl p-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" style={{ color: "var(--text-secondary)" }} />
              <p className="section-label">Authentication Method</p>
            </div>
            {authType === "google" ? (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{
                  background: "rgba(34,197,94,0.1)",
                  border: "1px solid rgba(34,197,94,0.3)",
                  color: "#22c55e",
                }}
              >
                <Shield className="w-3 h-3" />
                Google Verified
              </span>
            ) : (
              <span
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <Mail className="w-3 h-3" />
                Email / Password
              </span>
            )}
          </div>
          <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
            {authType === "google"
              ? "Your account is secured with Google OAuth 2.0"
              : "Sign in with email and password"}
          </p>
        </div>
      </section>

      {/* YOUR ACTIVITY */}
      <section>
        <p className="section-label mb-3">Your Activity</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "DATASETS", value: datasets.length, icon: Database },
            { label: "ISSUES", value: allInsights.length, icon: Zap },
            { label: "CHATS", value: 0, icon: MessageSquare },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-xl p-4 text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <Icon className="w-4 h-4 mx-auto mb-2" style={{ color: "var(--text-muted)" }} />
              <p className="text-2xl font-bold" style={{ color: "var(--accent)" }}>
                {value}
              </p>
              <p className="section-label mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <div
        className="rounded-xl p-5"
        style={{
          background: "rgba(239,68,68,0.04)",
          border: "1px solid rgba(239,68,68,0.2)",
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold mb-1" style={{ color: "#ef4444" }}>
              Danger Zone
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-opacity hover:opacity-80"
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[10px] tracking-[0.08em] font-semibold" style={{ color: "var(--text-muted)" }}>
        CONCEPTLEAK ML DATASET AUDITOR — PROFILE V2.4.0
      </p>
    </div>
  );
}
