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

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
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

  // suppress unused-import warnings for utils kept for logic consistency
  void getRiskColor; void getRiskBg; void getRiskBarColor;
  void MessageSquare; void AlertTriangle; void TrendingUp; void Clock; void highCount;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: "#ebebf0" }}>
          Welcome back, <span className="gradient-text">{session?.name?.split(" ")[0]}</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7b7b8d" }}>
          Your data integrity overview
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "TOTAL DATASETS",
            value: datasets.length,
            icon: Database,
            iconColor: "#f97316",
            iconBg: "rgba(249,115,22,0.1)",
          },
          {
            label: "CRITICAL ISSUES",
            value: criticalCount,
            icon: ShieldAlert,
            iconColor: "#ef4444",
            iconBg: "rgba(239,68,68,0.1)",
          },
          {
            label: "AVG RISK SCORE",
            value: avgRisk > 0 ? `${avgRisk}%` : "—",
            icon: BarChart3,
            iconColor: avgRisk >= 70 ? "#ef4444" : avgRisk >= 40 ? "#f97316" : "#22c55e",
            iconBg:
              avgRisk >= 70
                ? "rgba(239,68,68,0.1)"
                : avgRisk >= 40
                ? "rgba(249,115,22,0.1)"
                : "rgba(34,197,94,0.1)",
          },
          {
            label: "COLUMNS SCANNED",
            value: totalColumns,
            icon: Database,
            iconColor: "#f97316",
            iconBg: "rgba(249,115,22,0.1)",
          },
        ].map(({ label, value, icon: Icon, iconColor, iconBg }) => (
          <div
            key={label}
            className="rounded-xl p-5"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
              style={{ background: iconBg }}
            >
              <Icon size={18} style={{ color: iconColor }} />
            </div>
            <p className="text-2xl font-bold mb-1" style={{ color: "#ebebf0" }}>
              {value}
            </p>
            <p className="text-[11px] font-semibold tracking-[0.08em] uppercase" style={{ color: "#7b7b8d" }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "#ebebf0" }}>
            Recent Activity
          </h2>
          <Link
            href="/dashboard/datasets"
            className="text-xs font-semibold flex items-center gap-1 transition-opacity hover:opacity-70"
            style={{ color: "#f97316" }}
          >
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {recentDatasets.length === 0 ? (
          <div className="p-10 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <Database className="w-7 h-7" style={{ color: "#4a4a5a" }} />
            </div>
            <p className="font-medium mb-2" style={{ color: "#7b7b8d" }}>
              No datasets yet
            </p>
            <p className="text-sm mb-5" style={{ color: "#4a4a5a" }}>
              Upload your first CSV or XLSX file to begin analysis
            </p>
            <Link
              href="/dashboard/datasets"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: "rgba(249,115,22,0.1)",
                border: "1px solid rgba(249,115,22,0.3)",
                color: "#f97316",
              }}
            >
              <Upload className="w-4 h-4" /> Upload Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Header row */}
            <div
              className="hidden sm:grid px-5 py-2.5 text-[11px] font-semibold tracking-[0.08em]"
              style={{
                gridTemplateColumns: "1fr 80px 130px 90px 100px 70px",
                color: "#4a4a5a",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <span>DATASET NAME</span>
              <span>ROWS</span>
              <span>RISK SCORE</span>
              <span>LEVEL</span>
              <span>UPLOADED</span>
              <span>ACTIONS</span>
            </div>

            {recentDatasets.map((ds) => {
              const riskColor = RISK_COLORS[ds.riskLevel || "LOW"] || "#22c55e";
              return (
                <div
                  key={ds.id}
                  className="px-5 py-3.5 flex sm:grid items-center gap-3 transition-colors hover:bg-white/[0.02]"
                  style={{
                    gridTemplateColumns: "1fr 80px 130px 90px 100px 70px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {/* Name */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-none">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: "rgba(249,115,22,0.1)" }}
                    >
                      <Database className="w-3.5 h-3.5" style={{ color: "#f97316" }} />
                    </div>
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: "#ebebf0", fontFamily: "ui-monospace, monospace" }}
                    >
                      {ds.name}
                    </span>
                  </div>
                  {/* Rows */}
                  <span className="text-sm hidden sm:block" style={{ color: "#7b7b8d" }}>
                    {ds.rowCount?.toLocaleString() || "—"}
                  </span>
                  {/* Risk Score bar */}
                  <div className="hidden sm:flex items-center gap-2">
                    <div
                      className="flex-1 h-1.5 rounded-full overflow-hidden"
                      style={{ background: "rgba(255,255,255,0.06)" }}
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
                        background: `${riskColor}18`,
                        color: riskColor,
                        border: `1px solid ${riskColor}30`,
                      }}
                    >
                      {ds.riskLevel || "LOW"}
                    </span>
                  </div>
                  {/* Date */}
                  <span className="text-xs hidden sm:block" style={{ color: "#7b7b8d" }}>
                    {new Date(ds.uploadedAt).toLocaleDateString()}
                  </span>
                  {/* Actions */}
                  <Link
                    href={`/dashboard/insights?dataset=${ds.id}`}
                    className="text-[11px] font-semibold transition-opacity hover:opacity-70 shrink-0"
                    style={{ color: "#f97316" }}
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
          style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(249,115,22,0.1)" }}
            >
              <Shield size={18} style={{ color: "#f97316" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#ebebf0" }}>
                Security Scan in Progress
              </p>
              <p className="text-[11px] font-semibold tracking-[0.06em]" style={{ color: "#f97316" }}>
                ● ACTIVE
              </p>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "#7b7b8d" }}>
            ConceptLeak continuously monitors your datasets for PII exposure, target leakage, and temporal data
            contamination in real-time.
          </p>
        </div>

        {/* Automated Shield */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(249,115,22,0.1)" }}
            >
              <ShieldAlert size={18} style={{ color: "#f97316" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#ebebf0" }}>
              Automated Shield
            </p>
          </div>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "#7b7b8d" }}>
            Our AI-powered leakage detector automatically flags concept drift, proxy variables, and ID-linked features
            before they corrupt your model.
          </p>
          <Link
            href="/dashboard/datasets"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
            style={{ background: "#f97316", color: "white" }}
          >
            <Upload className="w-3.5 h-3.5" />
            Run Analysis
          </Link>
        </div>
      </div>
    </div>
  );
}
