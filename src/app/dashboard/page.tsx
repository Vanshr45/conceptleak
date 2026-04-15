import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getAllDatasets, getInsights } from "@/lib/store";
import { getRiskColor, getRiskBg, getRiskBarColor } from "@/lib/utils";
import {
  Database, MessageSquare, BarChart3, AlertTriangle,
  TrendingUp, Upload, ArrowRight, ShieldAlert, Clock
} from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const session = await getSession();
  const userId = session!.sub;
  const datasets = getAllDatasets(userId);

  const allInsights = datasets.flatMap((d) => getInsights(userId, d.id));
  const criticalCount = allInsights.filter((i) => i.riskLevel === "CRITICAL").length;
  const highCount = allInsights.filter((i) => i.riskLevel === "HIGH").length;
  const avgRisk = datasets.length
    ? Math.round(datasets.reduce((s, d) => s + (d.riskScore || 0), 0) / datasets.length)
    : 0;

  const recentDatasets = datasets.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-slate-500 text-sm mb-1">
            <Clock className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
            {getGreeting()}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome back, <span className="gradient-text">{session?.name}</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Here&apos;s your data integrity overview
          </p>
        </div>
        <Link
          href="/dashboard/datasets"
          className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-all duration-200 glow-orange-sm text-sm shrink-0 self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload Dataset
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Datasets",
            value: datasets.length,
            icon: Database,
            color: "text-blue-400",
            bg: "bg-blue-500/10 border-blue-500/20",
            sub: "Uploaded",
          },
          {
            label: "Avg Risk Score",
            value: `${avgRisk}/100`,
            icon: TrendingUp,
            color: avgRisk >= 70 ? "text-red-400" : avgRisk >= 40 ? "text-amber-400" : "text-emerald-400",
            bg: avgRisk >= 70 ? "bg-red-500/10 border-red-500/20" : avgRisk >= 40 ? "bg-amber-500/10 border-amber-500/20" : "bg-emerald-500/10 border-emerald-500/20",
            sub: "Across all datasets",
          },
          {
            label: "Critical Issues",
            value: criticalCount,
            icon: ShieldAlert,
            color: "text-red-400",
            bg: "bg-red-500/10 border-red-500/20",
            sub: "Needs immediate action",
          },
          {
            label: "Total Issues",
            value: allInsights.length,
            icon: AlertTriangle,
            color: "text-orange-400",
            bg: "bg-orange-500/10 border-orange-500/20",
            sub: `${highCount} high priority`,
          },
        ].map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div key={label} className={`glass rounded-2xl p-5 border ${bg}`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">{label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-slate-500 text-xs mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Datasets */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-400" />
              Recent Datasets
            </h2>
            <Link href="/dashboard/datasets" className="text-orange-400 hover:text-orange-300 text-xs font-medium flex items-center gap-1 transition-colors">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentDatasets.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center">
              <div className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-7 h-7 text-slate-600" />
              </div>
              <p className="text-slate-400 font-medium mb-2">No datasets yet</p>
              <p className="text-slate-600 text-sm mb-5">Upload your first CSV or XLSX file to begin analysis</p>
              <Link href="/dashboard/datasets" className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-400 rounded-xl text-sm font-medium hover:bg-orange-500/20 transition-colors">
                <Upload className="w-4 h-4" /> Upload Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentDatasets.map((ds) => (
                <Link
                  key={ds.id}
                  href={`/dashboard/datasets`}
                  className="glass rounded-xl p-4 flex items-center gap-4 hover:bg-slate-700/30 transition-all duration-150 group block"
                >
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ds.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ds.rowCount?.toLocaleString()} rows · {ds.size} · {new Date(ds.uploadedAt).toLocaleDateString()}
                    </p>
                    {/* Risk bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getRiskBarColor(ds.riskLevel || "LOW")}`}
                          style={{ width: `${ds.riskScore || 0}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${getRiskColor(ds.riskLevel || "LOW")}`}>
                        {ds.riskScore}/100
                      </span>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-lg border text-xs font-semibold ${getRiskBg(ds.riskLevel || "LOW")} ${getRiskColor(ds.riskLevel || "LOW")}`}>
                    {ds.riskLevel}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Info */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-white">Quick Actions</h2>

          {[
            {
              href: "/dashboard/chat",
              icon: MessageSquare,
              title: "AI Chat",
              desc: "Ask about concept leakage",
              color: "text-purple-400",
              bg: "bg-purple-500/10 border-purple-500/20",
            },
            {
              href: "/dashboard/insights",
              icon: BarChart3,
              title: "Risk Insights",
              desc: "View detailed analysis",
              color: "text-emerald-400",
              bg: "bg-emerald-500/10 border-emerald-500/20",
            },
            {
              href: "/dashboard/datasets",
              icon: Upload,
              title: "Upload Data",
              desc: "Add a new dataset",
              color: "text-blue-400",
              bg: "bg-blue-500/10 border-blue-500/20",
            },
          ].map(({ href, icon: Icon, title, desc, color, bg }) => (
            <Link
              key={href}
              href={href}
              className={`glass rounded-xl p-4 flex items-center gap-3 hover:bg-slate-700/30 transition-all duration-150 group border ${bg}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
                <Icon className={`w-4.5 h-4.5 ${color}`} size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{title}</p>
                <p className="text-xs text-slate-500">{desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 ml-auto transition-colors" />
            </Link>
          ))}

          {/* Concept Leakage explainer */}
          <div className="glass rounded-xl p-4 border border-orange-500/20 mt-2">
            <p className="text-xs font-semibold text-orange-400 uppercase tracking-wide mb-2">
              What is Concept Leakage?
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              When target information inadvertently leaks into your training features, your model learns spurious correlations that won&apos;t generalize to production data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
