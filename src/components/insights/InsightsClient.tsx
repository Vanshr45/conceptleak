"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, LabelList,
} from "recharts";
import { AlertTriangle, Shield, TrendingUp, Database, RefreshCw } from "lucide-react";
import type { Insight, Dataset } from "@/types";
import { getRiskColor, getRiskBg, getRiskBarColor } from "@/lib/utils";

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH:     "#f97316",
  MEDIUM:   "#f59e0b",
  LOW:      "#10b981",
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

// Custom tooltip shared across charts
function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number; payload: { risk?: string } }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const risk = payload[0]?.payload?.risk;
  const color = risk ? RISK_COLORS[risk] : "#f97316";
  return (
    <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold mb-1" style={{ color }}>{label}</p>
      <p className="text-white text-sm font-bold">{payload[0].value}<span className="text-slate-400 font-normal">/100</span></p>
      {risk && <p className="text-xs mt-1" style={{ color }}>{risk}</p>}
    </div>
  );
}


export default function InsightsClient() {
  const searchParams = useSearchParams();
  const datasetIdParam = searchParams.get("dataset");

  const [insights, setInsights] = useState<Insight[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDatasetId, setActiveDatasetId] = useState<string>(datasetIdParam || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/datasets")
      .then((r) => r.json())
      .then((d) => {
        setDatasets(d.datasets || []);
        if (!datasetIdParam && d.datasets?.length > 0) {
          setActiveDatasetId(d.datasets[0].id);
        }
      });
  }, []);

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

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Risk Insights</h1>
          <p className="text-slate-400 text-sm mt-1">Concept leakage analysis and risk breakdown</p>
        </div>
        <select
          value={activeDatasetId}
          onChange={(e) => setActiveDatasetId(e.target.value)}
          className="glass rounded-xl px-3 py-2 text-sm text-slate-300 border border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-orange-500/50 bg-transparent"
        >
          <option value="">All Datasets</option>
          {datasets.map((d) => (
            <option key={d.id} value={d.id} className="bg-slate-800">{d.name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-6 h-6 text-orange-400 animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Summary stats ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Issues", value: insights.length,
                icon: AlertTriangle, color: "text-orange-400",
                bg: "bg-orange-500/10 border-orange-500/20", glow: false,
              },
              {
                label: "Overall Risk", value: overallRisk,
                icon: Shield, color: getRiskColor(overallRisk as never),
                bg: getRiskBg(overallRisk as never), glow: true,
              },
              {
                label: "Avg Score", value: `${avgScore}/100`,
                icon: TrendingUp,
                color: avgScore >= 70 ? "text-red-400" : avgScore >= 40 ? "text-amber-400" : "text-emerald-400",
                bg: "bg-slate-700/50 border-slate-600/30", glow: false,
              },
              {
                label: "Dataset", value: activeDataset?.name?.split(".")[0] || "All",
                icon: Database, color: "text-blue-400",
                bg: "bg-blue-500/10 border-blue-500/20", glow: false,
              },
            ].map(({ label, value, icon: Icon, color, bg, glow }) => (
              <div
                key={label}
                className={`glass rounded-2xl p-4 border transition-all duration-300 ${bg} ${glow ? RISK_GLOW[overallRisk] : ""}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${color}`} />
                  <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">{label}</p>
                </div>
                <p className={`text-xl font-bold ${color} truncate`}>{value}</p>
              </div>
            ))}
          </div>

          {insights.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <Shield className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">No leakage issues found</p>
              <p className="text-slate-400 text-sm">Upload a dataset to begin analysis</p>
            </div>
          ) : (
            <>
              {/* ── Charts row ─────────────────────────────────────────── */}
              <div className="grid md:grid-cols-2 gap-6">

                {/* Bar chart */}
                <div className="glass rounded-2xl p-5">
                  <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    Risk Score by Feature
                  </h2>
                  <p className="text-slate-500 text-xs mb-4">Higher score = more severe leakage risk</p>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData} margin={{ top: 24, right: 12, left: -20, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#94a3b8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#64748b", fontSize: 11 }}
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}`}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={52}>
                        <LabelList
                          dataKey="score"
                          position="top"
                          style={{ fill: "#cbd5e1", fontSize: 11, fontWeight: 600 }}
                        />
                        {barData.map((entry, idx) => (
                          <Cell key={idx} fill={RISK_COLORS[entry.risk] || "#64748b"} fillOpacity={0.9} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="flex flex-wrap gap-3 mt-3 justify-center">
                    {Object.entries(RISK_COLORS).map(([level, color]) => (
                      <span key={level} className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
                        {level}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Donut chart with center text */}
                <div className="glass rounded-2xl p-5 flex flex-col">
                  <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-400" />
                    Risk Level Distribution
                  </h2>
                  <p className="text-slate-500 text-xs mb-2">Breakdown of issues by severity</p>
                  {riskCounts.length > 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center">
                      <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                          <Pie
                            data={riskCounts}
                            cx="50%"
                            cy="50%"
                            innerRadius={68}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {riskCounts.map((entry, i) => (
                              <Cell key={i} fill={entry.color} fillOpacity={0.9} />
                            ))}
                          </Pie>
                          {/* Center text — rendered as a customized label via foreignObject workaround */}
                          <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle">
                            <tspan
                              x="50%" dy="0"
                              fontSize="22" fontWeight="700"
                              fill={RISK_COLORS[overallRisk] || "#f97316"}
                            >
                              {avgScore}
                            </tspan>
                            <tspan
                              x="50%" dy="18"
                              fontSize="11" fontWeight="600"
                              fill={RISK_COLORS[overallRisk] || "#f97316"}
                              opacity="0.85"
                            >
                              {overallRisk}
                            </tspan>
                          </text>
                          <Tooltip
                            contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "0.75rem", color: "#f1f5f9" }}
                            formatter={(value, name) => [
                              <span key="v" style={{ color: RISK_COLORS[String(name)] || "#f1f5f9", fontWeight: 700 }}>{String(value)} issue{Number(value) !== 1 ? "s" : ""}</span>,
                              <span key="n" style={{ color: RISK_COLORS[String(name)] || "#94a3b8" }}>{String(name)}</span>,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      {/* Pill legend */}
                      <div className="flex flex-wrap gap-2 mt-1 justify-center">
                        {riskCounts.map((r) => (
                          <span
                            key={r.name}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                            style={{ background: `${r.color}18`, border: `1px solid ${r.color}40`, color: r.color }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                            {r.name} · {r.value}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-500 text-sm">No data</div>
                  )}
                </div>
              </div>

              {/* ── Risk Heatmap ────────────────────────────────────────── */}
              <div className="glass rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Risk Heatmap
                </h2>
                <p className="text-slate-500 text-xs mb-4">At-a-glance view of all detected leakage issues</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {sorted.map((ins) => (
                    <div
                      key={ins.id}
                      className={`rounded-xl p-3 border transition-all hover:scale-[1.02] cursor-default ${getRiskBg(ins.riskLevel)}`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <p className={`text-xs font-bold leading-tight truncate ${getRiskColor(ins.riskLevel)}`}>
                          {ins.feature}
                        </p>
                        <span
                          className="text-[9px] font-black shrink-0 px-1.5 py-0.5 rounded-md"
                          style={{
                            background: `${RISK_COLORS[ins.riskLevel]}20`,
                            color: RISK_COLORS[ins.riskLevel],
                            border: `1px solid ${RISK_COLORS[ins.riskLevel]}40`,
                          }}
                        >
                          {ins.riskLevel}
                        </span>
                      </div>
                      {/* Mini score bar */}
                      <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full ${getRiskBarColor(ins.riskLevel)}`}
                          style={{ width: `${ins.score}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] text-slate-500 truncate">{ins.leakageType || "Unknown"}</p>
                        <p className={`text-xs font-bold tabular-nums ${getRiskColor(ins.riskLevel)}`}>{ins.score}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Issues list ─────────────────────────────────────────── */}
              <div>
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Detected Issues ({insights.length})
                </h2>
                <div className="space-y-3">
                  {sorted.map((ins) => (
                    <div
                      key={ins.id}
                      className={`glass rounded-xl overflow-hidden border ${getRiskBg(ins.riskLevel)} flex`}
                    >
                      {/* Colored left stripe */}
                      <div
                        className="w-1 shrink-0 rounded-l-xl"
                        style={{ background: RISK_COLORS[ins.riskLevel] }}
                      />

                      <div className="flex-1 p-4">
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm font-bold ${getRiskColor(ins.riskLevel)}`}>
                              {ins.feature}
                            </span>
                            {ins.leakageType && (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                                style={{
                                  background: `${RISK_COLORS[ins.riskLevel]}15`,
                                  color: RISK_COLORS[ins.riskLevel],
                                  border: `1px solid ${RISK_COLORS[ins.riskLevel]}35`,
                                }}
                              >
                                {ins.leakageType}
                              </span>
                            )}
                          </div>
                          <div
                            className="flex items-center gap-1.5 shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg border"
                            style={{
                              background: `${RISK_COLORS[ins.riskLevel]}15`,
                              color: RISK_COLORS[ins.riskLevel],
                              borderColor: `${RISK_COLORS[ins.riskLevel]}35`,
                            }}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {ins.riskLevel}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-400 text-sm leading-relaxed mb-3">{ins.description}</p>

                        {/* Progress bar + meta */}
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getRiskBarColor(ins.riskLevel)} ${RISK_BAR_GLOW[ins.riskLevel]}`}
                              style={{ width: `${ins.score}%` }}
                            />
                          </div>
                          <span
                            className="text-xs font-bold tabular-nums shrink-0"
                            style={{ color: RISK_COLORS[ins.riskLevel] }}
                          >
                            {ins.score}/100
                          </span>
                          {ins.affectedRecords !== undefined && ins.affectedRecords > 0 && (
                            <span className="text-xs text-slate-500 shrink-0 hidden sm:inline">
                              {ins.affectedRecords.toLocaleString()} records
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
