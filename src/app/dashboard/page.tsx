import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAllDatasets, getInsights } from "@/lib/store";
import { getRiskColor, getRiskBg, getRiskBarColor } from "@/lib/utils";
import {
  Database, MessageSquare, BarChart3, AlertTriangle,
  TrendingUp, Upload, ArrowRight, ShieldAlert, Clock,
  Shield,
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

// Semantic risk colors — unchanged in both modes
const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH:     "#f59e0b",
  MEDIUM:   "#eab308",
  LOW:      "#22c55e",
};

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.sub;
  const datasets = await getAllDatasets(userId);

  const allInsights = (await Promise.all(datasets.map((d) => getInsights(userId, d.id)))).flat();
  const criticalCount = allInsights.filter((i) => i.riskLevel === "CRITICAL").length;
  const highCount = allInsights.filter((i) => i.riskLevel === "HIGH").length;
  const avgRisk = datasets.length
    ? Math.round(datasets.reduce((s, d) => s + (d.riskScore || 0), 0) / datasets.length)
    : 0;
  const totalColumns = datasets.reduce((sum, d) => sum + (d.columnCount || 0), 0);

  const recentDatasets = datasets.slice(0, 5);

  void getRiskColor; void getRiskBg; void getRiskBarColor;
  void MessageSquare; void AlertTriangle; void TrendingUp; void Clock; void highCount;

  const avgRiskColor =
    avgRisk >= 70 ? "#ef4444" : avgRisk >= 40 ? "#f59e0b" : "#22c55e";
  const avgRiskMuted =
    avgRisk >= 70 ? "rgba(239,68,68,0.08)" : avgRisk >= 40 ? "rgba(245,158,11,0.08)" : "rgba(34,197,94,0.08)";

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "var(--text)" }}>
          Welcome back,{" "}
          <span className="gradient-text">{session?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Your data integrity overview
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Datasets",
            value: datasets.length,
            icon: Database,
            iconColor: "var(--accent)",
            iconBg: "var(--accent-muted)",
          },
          {
            label: "Critical Issues",
            value: criticalCount,
            icon: ShieldAlert,
            iconColor: "#ef4444",
            iconBg: "rgba(239,68,68,0.08)",
          },
          {
            label: "Avg Risk Score",
            value: avgRisk > 0 ? `${avgRisk}%` : "—",
            icon: BarChart3,
            iconColor: avgRiskColor,
            iconBg: avgRiskMuted,
          },
          {
            label: "Columns Scanned",
            value: totalColumns,
            icon: Database,
            iconColor: "var(--accent)",
            iconBg: "var(--accent-muted)",
          },
        ].map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <div
            key={label}
            className="rounded-xl p-5"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
              style={{ background: iconBg }}
            >
              <Icon size={18} style={{ color: iconColor }} />
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
              {value}
            </p>
            <p
              className="text-[11px] font-semibold tracking-[0.06em] uppercase"
              style={{ color: "var(--text-secondary)" }}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            Recent Activity
          </h2>
          <Link
            href="/dashboard/datasets"
            className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: "var(--accent)" }}
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentDatasets.length === 0 ? (
          <div className="p-10 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "var(--surface-elevated)" }}
            >
              <Database className="w-7 h-7" style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              No datasets yet
            </p>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
              Upload your first CSV or XLSX file to begin analysis
            </p>
            <Link
              href="/dashboard/datasets"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              <Upload className="w-4 h-4" /> Upload Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Header row */}
            <div
              className="hidden sm:grid px-5 py-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase"
              style={{
                gridTemplateColumns: "1fr 80px 130px 90px 100px 70px",
                color: "var(--text-muted)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <span>Dataset Name</span>
              <span>Rows</span>
              <span>Risk Score</span>
              <span>Level</span>
              <span>Uploaded</span>
              <span>Actions</span>
            </div>

            {recentDatasets.map((ds) => {
              const riskColor = RISK_COLORS[ds.riskLevel || "LOW"] || "#22c55e";
              return (
                <div
                  key={ds.id}
                  className="px-5 py-3.5 flex sm:grid items-center gap-3 transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 80px 130px 90px 100px 70px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  {/* Name */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-none">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "var(--accent-muted)" }}
                    >
                      <Database className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                    </div>
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text)", fontFamily: "ui-monospace, monospace" }}
                    >
                      {ds.name}
                    </span>
                  </div>
                  {/* Rows */}
                  <span className="text-sm hidden sm:block" style={{ color: "var(--text-secondary)" }}>
                    {ds.rowCount?.toLocaleString() || "—"}
                  </span>
                  {/* Risk Score bar */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--surface-elevated)" }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${ds.riskScore || 0}%`, background: riskColor }}
                      />
                    </div>
                    <span
                      className="text-xs font-semibold tabular-nums shrink-0"
                      style={{ color: riskColor }}
                    >
                      {ds.riskScore || 0}%
                    </span>
                  </div>
                  {/* Level badge */}
                  <div className="hidden sm:block">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        background: `${riskColor}15`,
                        color: riskColor,
                        border: `1px solid ${riskColor}30`,
                      }}
                    >
                      {ds.riskLevel || "LOW"}
                    </span>
                  </div>
                  {/* Date */}
                  <span className="text-xs hidden sm:block" style={{ color: "var(--text-secondary)" }}>
                    {new Date(ds.uploadedAt).toLocaleDateString()}
                  </span>
                  {/* Actions */}
                  <Link
                    href={`/dashboard/insights?dataset=${ds.id}`}
                    className="text-[11px] font-semibold transition-opacity hover:opacity-70 shrink-0"
                    style={{ color: "var(--accent)" }}
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Promo Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Security Scan */}
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-muted)" }}
            >
              <Shield size={18} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                Security Scan in Progress
              </p>
              <p
                className="text-[11px] font-semibold tracking-[0.06em]"
                style={{ color: "var(--accent)" }}
              >
                ● Active
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            ConceptLeak continuously monitors your datasets for PII exposure, target leakage, and temporal
            data contamination in real-time.
          </p>
        </div>

        {/* Automated Shield */}
        <div
          className="rounded-xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-muted)" }}
            >
              <ShieldAlert size={18} style={{ color: "var(--accent)" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Automated Shield
            </p>
          </div>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            Our AI-powered leakage detector automatically flags concept drift, proxy variables, and
            ID-linked features before they corrupt your model.
          </p>
          <Link
            href="/dashboard/datasets"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            <Upload className="w-3.5 h-3.5" />
            Run Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
