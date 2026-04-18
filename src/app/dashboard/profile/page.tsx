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

  const initials = session!.name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // suppress unused warnings for preserved imports
  void Calendar; void criticalCount;

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in pb-8">

      {/* Header Card — avatar + name + plan */}
      <div
        className="rounded-xl p-6"
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-5">
          {/* Avatar */}
          <div className="shrink-0">
            {picture ? (
              <Image
                src={picture}
                alt={session!.name}
                width={72}
                height={72}
                className="rounded-full object-cover"
                style={{ border: "2px solid rgba(249,115,22,0.4)" }}
              />
            ) : (
              <div
                className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-bold"
                style={{
                  background: "rgba(249,115,22,0.15)",
                  border: "2px solid rgba(249,115,22,0.4)",
                  color: "#f97316",
                }}
              >
                {initials}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold" style={{ color: "#ebebf0" }}>
                {session!.name}
              </h2>
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider"
                style={{
                  background: "rgba(249,115,22,0.1)",
                  border: "1px solid rgba(249,115,22,0.3)",
                  color: "#f97316",
                }}
              >
                FREE PLAN
              </span>
            </div>
            <p className="text-sm mt-1" style={{ color: "#7b7b8d" }}>
              {session!.email}
            </p>
            <p className="text-xs mt-1" style={{ color: "#4a4a5a" }}>
              Member since {memberSince}
            </p>
          </div>

          {/* Edit Profile (decorative) */}
          <button
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#7b7b8d",
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
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <User className="w-3.5 h-3.5" style={{ color: "#7b7b8d" }} />
              <p className="section-label">Full Name</p>
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: "#ebebf0" }}>
              {session!.name}
            </p>
          </div>
          {/* Email Address */}
          <div
            className="rounded-xl p-4"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-3.5 h-3.5" style={{ color: "#7b7b8d" }} />
              <p className="section-label">Email Address</p>
            </div>
            <p className="text-sm font-semibold truncate" style={{ color: "#ebebf0" }}>
              {session!.email}
            </p>
          </div>
        </div>
        {/* Authentication Method */}
        <div
          className="rounded-xl p-4"
          style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" style={{ color: "#7b7b8d" }} />
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
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#7b7b8d",
                }}
              >
                <Mail className="w-3 h-3" />
                Email / Password
              </span>
            )}
          </div>
          <p className="text-xs mt-2" style={{ color: "#4a4a5a" }}>
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
              style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Icon className="w-4 h-4 mx-auto mb-2" style={{ color: "#4a4a5a" }} />
              <p className="text-2xl font-bold" style={{ color: "#f97316" }}>
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
            <h3 className="text-sm font-bold mb-1" style={{ color: "#f97316" }}>
              Danger Zone
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: "#7b7b8d" }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
          </div>
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-colors"
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
      <p className="text-center text-[10px] tracking-[0.08em] font-semibold" style={{ color: "#4a4a5a" }}>
        CONCEPTLEAK ML DATASET AUDITOR — PROFILE V2.4.0
      </p>
    </div>
  );
}
