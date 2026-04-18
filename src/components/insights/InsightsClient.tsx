"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, LabelList,
} from "recharts";
import { AlertTriangle, Shield, TrendingUp, Database, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import type { Insight, Dataset } from "@/types";
import { getRiskColor, getRiskBg, getRiskBarColor } from "@/lib/utils";

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH:     "#f97316",
  MEDIUM:   "#eab308",
  LOW:      "#22c55e",
};

const RISK_GLOW: Record<string, string> = {
  CRITICAL: "shadow-[0_0_16px_2px_rgba(239,68,68,0.35)]",
  HIGH:     "shadow-[0_0_16px_2px_rgba(249,115,22,0.35)]",
  MEDIUM:   "shadow-[0_0_16px_2px_rgba(245,158,11,0.35)]",
  LOW:      "shadow-[0_0_16px_2px_rgba(16,185,129,0.35)]",
};

const RISK_BAR_GLOW: Record<string, string> = {
  CRITICAL: "shadow-[0_0_8px_1px_rgba(239,68,68,0.6)]",
  HIGH:     "shadow-[0_0_8px_1px_rgba(249,115,22,0.6)]",
  MEDIUM:   "shadow-[0_0_8px_1px_rgba(245,158,11,0.6)]",
  LOW:      "shadow-[0_0_8px_1px_rgba(16,185,129,0.6)]",
};

const COLUMN_STATUS: Record<string, { label: string; color: string }> = {
  CRITICAL: { label: "CRITICAL", color: "#ef4444" },
  HIGH:     { label: "LEAKING",  color: "#f97316" },
  MEDIUM:   { label: "SKEWED",   color: "#eab308" },
  LOW:      { label: "HEALTHY",  color: "#22c55e" },
};

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; payload: { risk?: string } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const risk = payload[0]?.payload?.risk;
  const color = risk ? RISK_COLORS[risk] : "#f97316";
  return (
    <div
      className="rounded-xl px-4 py-3 shadow-xl"
      style={{ background: "#0a0a0f", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <p className="text-xs font-semibold mb-1" style={{ color }}>{label}</p>
      <p className="text-sm font-bold" style={{ color: "#ebebf0" }}>
        {payload[0].value}
        <span className="font-normal" style={{ color: "#7b7b8d" }}>/100</span>
      </p>
      {risk && <p className="text-xs mt-1" style={{ color }}>{risk}</p>}
    </div>
  );
}

// HOW_TO_FIX code snippets per leakage type
function getFixCode(leakageType: string, feature: string): string {
  if (leakageType?.toLowerCase().includes("id") || leakageType?.toLowerCase().includes("direct")) {
    return `# Remove direct ID columns before training\ndf = df.drop(columns=['${feature}'])\nprint("Removed direct identifier:", '${feature}')`;
  }
  if (leakageType?.toLowerCase().includes("temporal") || leakageType?.toLowerCase().includes("time")) {
    return `# Apply temporal split to prevent future leakage\nfrom sklearn.model_selection import TimeSeriesSplit\ntscv = TimeSeriesSplit(n_splits=5)\n# Use tscv.split(df) for cross-validation`;
  }
  if (leakageType?.toLowerCase().includes("pii") || leakageType?.toLowerCase().includes("proxy")) {
    return `# Anonymize or drop PII proxy column\ndf['${feature}'] = df['${feature}'].apply(hash)  # pseudonymize\n# Or: df = df.drop(columns=['${feature}'])`;
  }
  return `# Investigate and remove leaking feature\ncorr = df['${feature}'].corr(df['target'])\nprint(f"Correlation: {corr:.3f}")\nif abs(corr) > 0.95:\n    df = df.drop(columns=['${feature}'])`;
}

export default function InsightsClient() {
  const searchParams = useSearchParams();
  const datasetIdParam = searchParams.get("dataset");

  const [insights, setInsights] = useState<Insight[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string>(datasetIdParam || "");
  const [loading, setLoading] = useState(true);

  // Visual-only state
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "WARNED">("ALL");

  useEffect(() => {
    fetch("/api/datasets")
      .then((r) => r.json())
      .then((d) => {
        setDatasets(d.datasets || []);
        if (!datasetIdParam && d.datasets?.length > 0) {
          setActiveDatasetId(d.datasets[0].id);
        }
      });
  }, [datasetIdParam]);

  useEffect(() => {
    setLoading(true);
    const url = activeDatasetId
      ? `/api/insights?datasetId=${activeDatasetId}`
      : "/api/insights";
    fetch(url)
      .then((r) => r.json())
      .then((d) => setInsights(d.insights || []))
      .finally(() => setLoading(false));
  }, [activeDatasetId]);

  const activeDataset = datasets.find((d) => d.id === activeDatasetId);

  const barData = insights.map((ins) => ({
    name: ins.feature.length > 12 ? ins.feature.slice(0, 11) + "…" : ins.feature,
    fullName: ins.feature,
    score: ins.score,
    risk: ins.riskLevel,
  }));

  const riskCounts = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((r) => ({
    name: r,
    value: insights.filter((i) => i.riskLevel === r).length,
    color: RISK_COLORS[r],
  })).filter((r) => r.value > 0);

  const avgScore = insights.length
    ? Math.round(insights.reduce((s, i) => s + i.score, 0) / insights.length)
    : 0;

  const overallRisk =
    insights.some((i) => i.riskLevel === "CRITICAL") ? "CRITICAL" :
    insights.some((i) => i.riskLevel === "HIGH") ? "HIGH" :
    insights.some((i) => i.riskLevel === "MEDIUM") ? "MEDIUM" : "LOW";

  const sorted = [...insights].sort((a, b) => b.score - a.score);

  const filteredInsights = filter === "ALL"
    ? sorted
    : filter === "CRITICAL"
    ? sorted.filter((i) => i.riskLevel === "CRITICAL")
    : sorted.filter((i) => ["CRITICAL", "HIGH", "MEDIUM"].includes(i.riskLevel));

  // suppress unused but preserved imports
  void getRiskColor; void getRiskBg; void getRiskBarColor;
  void RISK_GLOW; void RISK_BAR_GLOW;

  // Distribution bar segments
  const total = insights.length || 1;
  const distSegments = [
    { key: "CRITICAL", color: "#ef4444", pct: Math.round((insights.filter(i => i.riskLevel === "CRITICAL").length / total) * 100) },
    { key: "HIGH",     color: "#f97316", pct: Math.round((insights.filter(i => i.riskLevel === "HIGH").length / total) * 100) },
    { key: "MEDIUM",   color: "#eab308", pct: Math.round((insights.filter(i => i.riskLevel === "MEDIUM").length / total) * 100) },
    { key: "LOW",      color: "#22c55e", pct: Math.round((insights.filter(i => i.riskLevel === "LOW").length / total) * 100) },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl font-bold" style={{ color: "#ebebf0" }}>
              {activeDataset ? activeDataset.name.replace(/\.[^.]+$/, "") : "Risk Insights"}
            </h1>
            <select
              value={activeDatasetId}
              onChange={(e) => setActiveDatasetId(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg focus:outline-none"
              style={{
                background: "#1a1a24",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#7b7b8d",
              }}
            >
              <option value="">All Datasets</option>
              {datasets.map((d) => (
                <option key={d.id} value={d.id} style={{ background: "#1a1a24" }}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          {activeDataset && (
            <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "#7b7b8d" }}>
              <span>{activeDataset.rowCount?.toLocaleString()} rows</span>
              <span>·</span>
              <span>{activeDataset.columnCount} columns</span>
              <span>·</span>
              <span>Scanned {new Date(activeDataset.uploadedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Risk Score Box */}
        {insights.length > 0 && (
          <div
            className="shrink-0 px-6 py-4 rounded-xl text-center"
            style={{
              background: RISK_COLORS[overallRisk] + "18",
              border: `1px solid ${RISK_COLORS[overallRisk]}35`,
            }}
          >
            <p
              className="text-[10px] font-bold tracking-[0.1em] mb-1"
              style={{ color: RISK_COLORS[overallRisk] }}
            >
              RISK SCORE
            </p>
            <p
              className="text-4xl font-black leading-none"
              style={{ color: RISK_COLORS[overallRisk] }}
            >
              {avgScore}
            </p>
            <p
              className="text-[11px] font-semibold mt-1"
              style={{ color: RISK_COLORS[overallRisk] }}
            >
              {overallRisk === "CRITICAL"
                ? "Critical Leakage Detected"
                : overallRisk === "HIGH"
                ? "High Risk Detected"
                : overallRisk === "MEDIUM"
                ? "Medium Risk"
                : "Low Risk"}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 animate-spin" style={{ color: "#f97316" }} />
        </div>
      ) : (
        <>
          {insights.length === 0 ? (
            <div
              className="rounded-2xl p-12 text-center"
              style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Shield className="w-12 h-12 mx-auto mb-3" style={{ color: "#22c55e" }} />
              <p className="font-semibold mb-1" style={{ color: "#ebebf0" }}>
                No leakage issues found
              </p>
              <p className="text-sm" style={{ color: "#7b7b8d" }}>
                Upload a dataset to begin analysis
              </p>
            </div>
          ) : (
            <>
              {/* Distribution Bar */}
              <div
                className="rounded-xl p-5"
                style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <p className="section-label mb-3">Distribution of Risk Factors</p>
                <div className="flex h-3 rounded-full overflow-hidden mb-3 gap-px">
                  {distSegments.filter(s => s.pct > 0).map((seg) => (
                    <div
                      key={seg.key}
                      style={{ width: `${seg.pct}%`, background: seg.color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  {distSegments.map((seg) => (
                    <span key={seg.key} className="flex items-center gap-1.5 text-xs" style={{ color: "#7b7b8d" }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: seg.color }} />
                      {seg.key} · {insights.filter(i => i.riskLevel === seg.key).length}
                    </span>
                  ))}
                </div>
              </div>

              {/* Charts Row (preserved) */}
              <div className="grid md:grid-cols-2 gap-5">
                <div
                  className="rounded-xl p-5"
                  style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <h2 className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: "#ebebf0" }}>
                    <TrendingUp className="w-4 h-4" style={{ color: "#f97316" }} />
                    Risk Score by Feature
                  </h2>
                  <p className="text-xs mb-4" style={{ color: "#7b7b8d" }}>
                    Higher score = more severe leakage risk
                  </p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={barData} margin={{ top: 20, right: 12, left: -20, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="name" tick={{ fill: "#7b7b8d", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#4a4a5a", fontSize: 11 }} domain={[0, 100]} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                      <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={48}>
                        <LabelList dataKey="score" position="top" style={{ fill: "#7b7b8d", fontSize: 10, fontWeight: 600 }} />
                        {barData.map((entry, idx) => (
                          <Cell key={idx} fill={RISK_COLORS[entry.risk] || "#4a4a5a"} fillOpacity={0.9} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div
                  className="rounded-xl p-5 flex flex-col"
                  style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <h2 className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: "#ebebf0" }}>
                    <Shield className="w-4 h-4" style={{ color: "#7b7b8d" }} />
                    Risk Level Distribution
                  </h2>
                  <p className="text-xs mb-2" style={{ color: "#7b7b8d" }}>Breakdown of issues by severity</p>
                  {riskCounts.length > 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={riskCounts}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {riskCounts.map((entry, i) => (
                              <Cell key={i} fill={entry.color} fillOpacity={0.9} />
                            ))}
                          </Pie>
                          <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle">
                            <tspan x="50%" dy="0" fontSize="20" fontWeight="700" fill={RISK_COLORS[overallRisk] || "#f97316"}>
                              {avgScore}
                            </tspan>
                            <tspan x="50%" dy="16" fontSize="10" fontWeight="600" fill={RISK_COLORS[overallRisk] || "#f97316"} opacity="0.85">
                              {overallRisk}
                            </tspan>
                          </text>
                          <Tooltip
                            contentStyle={{
                              background: "#0a0a0f",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "0.75rem",
                              color: "#ebebf0",
                            }}
                            formatter={(value, name) => [
                              <span key="v" style={{ color: RISK_COLORS[String(name)] || "#ebebf0", fontWeight: 700 }}>
                                {String(value)} issue{Number(value) !== 1 ? "s" : ""}
                              </span>,
                              <span key="n" style={{ color: RISK_COLORS[String(name)] || "#7b7b8d" }}>{String(name)}</span>,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {riskCounts.map((r) => (
                          <span
                            key={r.name}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{
                              background: `${r.color}15`,
                              border: `1px solid ${r.color}35`,
                              color: r.color,
                            }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.color }} />
                            {r.name} · {r.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "#4a4a5a" }}>
                      No data
                    </div>
                  )}
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-2">
                {(["ALL", "CRITICAL", "WARNED"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-[0.06em] transition-all"
                    style={{
                      background: filter === f ? "#f97316" : "rgba(255,255,255,0.04)",
                      color: filter === f ? "white" : "#7b7b8d",
                      border: filter === f ? "1px solid #f97316" : "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>

              {/* Leakage Issues List */}
              <div>
                <h2 className="section-label mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Leakage Issues ({filteredInsights.length})
                </h2>
                <div className="space-y-3">
                  {filteredInsights.map((ins) => {
                    const riskColor = RISK_COLORS[ins.riskLevel] || "#f97316";
                    const isExpanded = expandedCard === ins.id;
                    return (
                      <div
                        key={ins.id}
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: "#111118",
                          border: `1px solid rgba(255,255,255,0.06)`,
                          borderLeft: `3px solid ${riskColor}`,
                        }}
                      >
                        <div className="p-4">
                          {/* Top row */}
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className="text-sm font-bold"
                                style={{ color: riskColor, fontFamily: "ui-monospace, monospace" }}
                              >
                                {ins.feature}
                              </span>
                              {ins.leakageType && (
                                <span
                                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                  style={{
                                    background: `${riskColor}15`,
                                    color: riskColor,
                                    border: `1px solid ${riskColor}30`,
                                  }}
                                >
                                  {ins.leakageType}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-semibold tracking-[0.06em]" style={{ color: "#4a4a5a" }}>
                                  IMPORTANCE
                                </p>
                                <p className="text-sm font-bold tabular-nums" style={{ color: riskColor }}>
                                  {ins.score}%
                                </p>
                              </div>
                              <button
                                onClick={() => setExpandedCard(isExpanded ? null : ins.id)}
                                className="p-1 rounded-lg transition-colors"
                                style={{ color: "#4a4a5a" }}
                              >
                                {isExpanded
                                  ? <ChevronUp className="w-4 h-4" />
                                  : <ChevronDown className="w-4 h-4" />
                                }
                              </button>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-sm leading-relaxed mb-3" style={{ color: "#7b7b8d" }}>
                            {ins.description}
                          </p>

                          {/* Progress bar */}
                          <div className="flex items-center gap-3">
                            <div
                              className="flex-1 h-1.5 rounded-full overflow-hidden"
                              style={{ background: "rgba(255,255,255,0.06)" }}
                            >
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${ins.score}%`, background: riskColor }}
                              />
                            </div>
                            <span className="text-xs font-bold tabular-nums shrink-0" style={{ color: riskColor }}>
                              {ins.score}/100
                            </span>
                          </div>
                        </div>

                        {/* Expanded: HOW TO FIX */}
                        {isExpanded && (
                          <div
                            className="px-4 pb-4 pt-0"
                            style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                          >
                            <p className="section-label mt-3 mb-2">How to Fix</p>
                            <pre
                              className="rounded-lg p-3 text-xs overflow-x-auto"
                              style={{
                                background: "#0a0a0f",
                                border: "1px solid rgba(255,255,255,0.08)",
                                color: "#7b7b8d",
                                fontFamily: "ui-monospace, monospace",
                              }}
                            >
                              {getFixCode(ins.leakageType || "", ins.feature)}
                            </pre>
                            <button
                              className="mt-2 text-xs font-semibold transition-opacity hover:opacity-70"
                              style={{ color: "#f97316" }}
                              onClick={() => {}}
                            >
                              Ask AI about this →
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Column Health Manifest */}
              <div>
                <h2 className="section-label mb-3 flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Column Health Manifest
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sorted.map((ins) => {
                    const status = COLUMN_STATUS[ins.riskLevel] || { label: "UNKNOWN", color: "#4a4a5a" };
                    return (
                      <div
                        key={ins.id}
                        className="column-health-chip flex items-center justify-between gap-2"
                      >
                        <p
                          className="text-xs font-semibold truncate"
                          style={{ color: "#ebebf0", fontFamily: "ui-monospace, monospace" }}
                        >
                          {ins.feature}
                        </p>
                        <span
                          className="text-[9px] font-bold shrink-0 px-1.5 py-0.5 rounded"
                          style={{
                            background: `${status.color}15`,
                            color: status.color,
                            border: `1px solid ${status.color}30`,
                          }}
                        >
                          {status.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
