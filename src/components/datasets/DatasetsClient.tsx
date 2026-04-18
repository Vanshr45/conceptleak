"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, Database, AlertTriangle, CheckCircle2, Loader2,
  FileSpreadsheet, X, ChevronRight, BarChart3, MessageSquare,
  RefreshCw, AlertCircle
} from "lucide-react";
import type { Dataset } from "@/types";
import { getRiskColor, getRiskBg, getRiskBarColor } from "@/lib/utils";
import DataTable from "./DataTable";

type SelectedDataset = Dataset & { isOpen?: boolean };

type UploadReport = {
  datasetName: string;
  riskScore: number;
  riskLevel: string;
  rowCount: number;
  columnCount: number;
  insights: Array<{
    feature: string;
    riskLevel: string;
    leakageType: string;
    description: string;
    score: number;
  }>;
};

const RISK_COLORS: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
};

export default function DatasetsClient() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadReport, setUploadReport] = useState<UploadReport | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState<SelectedDataset | null>(null);

  // suppress unused but preserved imports
  void getRiskColor; void getRiskBg; void getRiskBarColor;

  async function fetchDatasets() {
    setLoading(true);
    try {
      const res = await fetch("/api/datasets");
      const data = await res.json();
      if (data.datasets) setDatasets(data.datasets);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchDatasets(); }, []);

  async function uploadFile(file: File) {
    setUploadError("");
    setUploadSuccess("");

    const ext = file.name.toLowerCase();
    if (!ext.endsWith(".csv") && !ext.endsWith(".xlsx")) {
      setUploadError("Only .csv and .xlsx files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be under 10 MB.");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed.");
      } else {
        setDatasets((prev) => [data.dataset, ...prev]);

        // Fetch insights for the report
        try {
          const insightsRes = await fetch(`/api/datasets/${data.dataset.id}`);
          const insightsData = await insightsRes.json();
          setUploadReport({
            datasetName: data.dataset.name,
            riskScore: data.dataset.riskScore,
            riskLevel: data.dataset.riskLevel,
            rowCount: data.dataset.rowCount,
            columnCount: data.dataset.columnCount,
            insights: insightsData.insights || [],
          });
        } catch {
          setUploadSuccess(`"${data.dataset.name}" uploaded successfully!`);
          setTimeout(() => setUploadSuccess(""), 4000);
        }
      }
    } catch {
      setUploadError("Network error. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }, []);

  async function openDataset(ds: Dataset) {
    const res = await fetch(`/api/datasets/${ds.id}`);
    const data = await res.json();
    setSelected({ ...(data.dataset || ds), isOpen: true });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#ebebf0" }}>Datasets</h1>
          <p className="text-sm mt-1" style={{ color: "#7b7b8d" }}>
            Upload and manage your ML datasets for leakage analysis
          </p>
        </div>
        <button
          onClick={fetchDatasets}
          disabled={loading}
          className="p-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "#4a4a5a" }}
          title="Refresh"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className="relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200"
        style={{
          background: dragOver ? "rgba(249,115,22,0.04)" : "#111118",
          borderColor: dragOver ? "rgba(249,115,22,0.5)" : "rgba(255,255,255,0.08)",
        }}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#f97316" }} />
            <p className="font-medium" style={{ color: "#ebebf0" }}>Processing file...</p>
            <p className="text-sm" style={{ color: "#7b7b8d" }}>
              Parsing columns and calculating risk score
            </p>
          </div>
        ) : (
          <>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.2)" }}
            >
              <Upload className="w-7 h-7" style={{ color: "#f97316" }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: "#ebebf0" }}>
              Drop your file here, or browse
            </p>
            <p className="text-sm mb-5" style={{ color: "#7b7b8d" }}>
              Supports <span style={{ color: "#ebebf0" }}>.csv</span> and{" "}
              <span style={{ color: "#ebebf0" }}>.xlsx</span> · Max{" "}
              <span style={{ color: "#ebebf0" }}>10 MB</span>
            </p>
            <label
              className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 text-white font-semibold rounded-xl text-sm transition-opacity hover:opacity-90 glow-orange-sm"
              style={{ background: "#f97316" }}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Browse Files
              <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="sr-only" />
            </label>
          </>
        )}
      </div>

      {/* Status messages */}
      {uploadError && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm animate-fade-in"
          style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.25)",
            color: "#ef4444",
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {uploadError}
          <button onClick={() => setUploadError("")} className="ml-auto">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {uploadSuccess && (
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm animate-fade-in"
          style={{
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
            color: "#22c55e",
          }}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {uploadSuccess}
        </div>
      )}

      {uploadReport && (
        <div
          className="rounded-2xl overflow-hidden animate-fade-in"
          style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Report header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
              >
                <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#ebebf0" }}>
                  Analysis Complete — {uploadReport.datasetName}
                </p>
                <p className="text-xs" style={{ color: "#7b7b8d" }}>
                  {uploadReport.rowCount?.toLocaleString()} rows · {uploadReport.columnCount} columns
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-lg"
                style={{
                  background: `${RISK_COLORS[uploadReport.riskLevel] || "#22c55e"}15`,
                  color: RISK_COLORS[uploadReport.riskLevel] || "#22c55e",
                  border: `1px solid ${RISK_COLORS[uploadReport.riskLevel] || "#22c55e"}30`,
                }}
              >
                {uploadReport.riskScore}/100 {uploadReport.riskLevel}
              </span>
              <button
                onClick={() => setUploadReport(null)}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "#4a4a5a" }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Findings */}
          <div className="px-5 py-4 space-y-3">
            {uploadReport.insights.length === 0 ? (
              <p className="text-sm flex items-center gap-2" style={{ color: "#22c55e" }}>
                <CheckCircle2 className="w-4 h-4" />
                No leakage issues detected. Dataset looks clean.
              </p>
            ) : (
              <>
                <p className="text-xs font-medium" style={{ color: "#7b7b8d" }}>
                  Found {uploadReport.insights.filter((i) => i.riskLevel !== "LOW").length} issue(s) to fix before training:
                </p>
                {uploadReport.insights
                  .filter((i) => i.riskLevel !== "LOW" && i.feature !== "General Assessment")
                  .slice(0, 5)
                  .map((ins, idx) => {
                    const c = RISK_COLORS[ins.riskLevel] || "#eab308";
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl text-sm"
                        style={{
                          background: `${c}06`,
                          border: `1px solid ${c}20`,
                        }}
                      >
                        <span className="text-base shrink-0">
                          {ins.riskLevel === "CRITICAL" ? "🔴" : ins.riskLevel === "HIGH" ? "🟠" : "🟡"}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium" style={{ color: "#ebebf0" }}>
                            <code
                              className="px-1 rounded text-xs"
                              style={{ background: "rgba(249,115,22,0.1)", color: "#f97316" }}
                            >
                              {ins.feature}
                            </code>
                            <span className="text-xs ml-2" style={{ color: "#7b7b8d" }}>
                              — {ins.leakageType}
                            </span>
                          </p>
                          <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: "#7b7b8d" }}>
                            {ins.description}
                          </p>
                        </div>
                        <span className="text-xs font-bold shrink-0" style={{ color: c }}>
                          {ins.score}/100
                        </span>
                      </div>
                    );
                  })}
                {uploadReport.insights.filter((i) => i.riskLevel !== "LOW").length > 5 && (
                  <p className="text-xs pl-1" style={{ color: "#4a4a5a" }}>
                    +{uploadReport.insights.filter((i) => i.riskLevel !== "LOW").length - 5} more issues — view full report
                  </p>
                )}
              </>
            )}
          </div>

          {/* Footer CTA */}
          <div
            className="flex items-center gap-3 px-5 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)" }}
          >
            <button
              onClick={() => {
                const ds = datasets[0];
                if (ds) { setUploadReport(null); router.push(`/dashboard/chat?dataset=${ds.id}`); }
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-opacity hover:opacity-90"
              style={{ background: "#f97316", color: "white" }}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Discuss with AI
            </button>
            <button
              onClick={() => {
                const ds = datasets[0];
                if (ds) { setUploadReport(null); router.push(`/dashboard/insights?dataset=${ds.id}`); }
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-white/5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                color: "#7b7b8d",
              }}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              View Full Report
            </button>
            <button
              onClick={() => setUploadReport(null)}
              className="ml-auto text-xs transition-colors hover:opacity-70"
              style={{ color: "#4a4a5a" }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Dataset list */}
      <div>
        <h2 className="section-label mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Your Datasets ({datasets.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl p-4 h-20 shimmer" />
            ))}
          </div>
        ) : datasets.length === 0 ? (
          <div
            className="rounded-xl p-10 text-center"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <Database className="w-10 h-10 mx-auto mb-3" style={{ color: "#4a4a5a" }} />
            <p className="font-medium" style={{ color: "#7b7b8d" }}>No datasets uploaded yet</p>
            <p className="text-sm mt-1" style={{ color: "#4a4a5a" }}>
              Upload a CSV or XLSX file to get started
            </p>
          </div>
        ) : (
          <ul
            className="space-y-2 overflow-y-auto"
            style={{ maxHeight: "calc(100vh - 500px)", minHeight: "200px" }}
          >
            {datasets.map((ds) => {
              const riskColor = RISK_COLORS[ds.riskLevel || "LOW"] || "#22c55e";
              return (
                <li key={ds.id}>
                  <button
                    onClick={() => openDataset(ds)}
                    className="w-full rounded-xl p-4 flex items-center gap-4 transition-all duration-150 group text-left hover:bg-white/[0.02]"
                    style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.15)" }}
                    >
                      <Database className="w-5 h-5" style={{ color: "#f97316" }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#ebebf0", fontFamily: "ui-monospace, monospace" }}>
                        {ds.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#7b7b8d" }}>
                        {ds.rowCount?.toLocaleString() ?? "—"} rows ·{" "}
                        {ds.columnCount ?? "—"} cols · {ds.size} ·{" "}
                        {new Date(ds.uploadedAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className="flex-1 h-1 rounded-full overflow-hidden"
                          style={{ background: "rgba(255,255,255,0.06)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${ds.riskScore || 0}%`, background: riskColor }}
                          />
                        </div>
                        <span
                          className="text-xs font-medium tabular-nums"
                          style={{ color: riskColor }}
                        >
                          {ds.riskScore ?? 0}/100
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {ds.status === "processing" ? (
                        <span
                          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
                          style={{
                            background: "rgba(234,179,8,0.1)",
                            border: "1px solid rgba(234,179,8,0.2)",
                            color: "#eab308",
                          }}
                        >
                          <Loader2 className="w-3 h-3 animate-spin" /> Processing
                        </span>
                      ) : ds.status === "error" ? (
                        <span
                          className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.2)",
                            color: "#ef4444",
                          }}
                        >
                          <AlertTriangle className="w-3 h-3" /> Error
                        </span>
                      ) : (
                        <span
                          className="text-xs font-semibold px-2 py-1 rounded-lg"
                          style={{
                            background: `${riskColor}15`,
                            color: riskColor,
                            border: `1px solid ${riskColor}25`,
                          }}
                        >
                          {ds.riskLevel}
                        </span>
                      )}
                      <ChevronRight
                        className="w-4 h-4 transition-colors"
                        style={{ color: "#4a4a5a" }}
                      />
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Dataset Detail Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in rounded-2xl"
            style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.08)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between p-5"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "rgba(249,115,22,0.1)", border: "1px solid rgba(249,115,22,0.15)" }}
                >
                  <Database className="w-4.5 h-4.5" size={18} style={{ color: "#f97316" }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold" style={{ color: "#ebebf0" }}>
                    {selected.name}
                  </h3>
                  <p className="text-xs" style={{ color: "#7b7b8d" }}>
                    {selected.rowCount?.toLocaleString()} rows · {selected.columnCount} columns · {selected.size}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: "#4a4a5a" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Risk score */}
              {(() => {
                const rc = RISK_COLORS[selected.riskLevel || "LOW"] || "#22c55e";
                return (
                  <div
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: `${rc}08`, border: `1px solid ${rc}20` }}
                  >
                    <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: rc }} />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: "#ebebf0" }}>
                        Risk Score:{" "}
                        <span style={{ color: rc }}>
                          {selected.riskScore}/100 — {selected.riskLevel}
                        </span>
                      </p>
                      <div
                        className="mt-2 h-1.5 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${selected.riskScore || 0}%`, background: rc }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Columns */}
              {selected.columns && (
                <div>
                  <p className="section-label mb-2">Columns ({selected.columns.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.columns.map((col) => (
                      <span
                        key={col}
                        className="px-2.5 py-1 rounded-lg text-xs"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                          color: "#7b7b8d",
                          fontFamily: "ui-monospace, monospace",
                        }}
                      >
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview table */}
              {selected.previewRows && selected.previewRows.length > 0 && (
                <div>
                  <p className="section-label mb-2">
                    Data Preview (first {selected.previewRows.length} rows)
                  </p>
                  <DataTable columns={selected.columns || []} rows={selected.previewRows} />
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div
              className="flex items-center gap-3 p-5"
              style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
            >
              <button
                onClick={() => { setSelected(null); router.push(`/dashboard/chat?dataset=${selected.id}`); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 glow-orange-sm"
                style={{ background: "#f97316", color: "white" }}
              >
                <MessageSquare className="w-4 h-4" /> Analyze with AI
              </button>
              <button
                onClick={() => { setSelected(null); router.push(`/dashboard/insights?dataset=${selected.id}`); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/5"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "#7b7b8d",
                }}
              >
                <BarChart3 className="w-4 h-4" /> View Insights
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
