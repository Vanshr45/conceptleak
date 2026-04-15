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

export default function DatasetsClient() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [selected, setSelected] = useState<SelectedDataset | null>(null);

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
        setUploadSuccess(`"${data.dataset.name}" uploaded successfully!`);
        setDatasets((prev) => [data.dataset, ...prev]);
        setTimeout(() => setUploadSuccess(""), 4000);
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
    // Fetch full details
    const res = await fetch(`/api/datasets/${ds.id}`);
    const data = await res.json();
    setSelected({ ...(data.dataset || ds), isOpen: true });
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Datasets</h1>
          <p className="text-slate-400 text-sm mt-1">Upload and manage your ML datasets for leakage analysis</p>
        </div>
        <button
          onClick={fetchDatasets}
          disabled={loading}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
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
        className={`relative glass rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          dragOver ? "border-orange-500/60 bg-orange-500/5" : "border-slate-700/60 hover:border-slate-600"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
            <p className="text-slate-300 font-medium">Processing file...</p>
            <p className="text-slate-500 text-sm">Parsing columns and calculating risk score</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-7 h-7 text-orange-400" />
            </div>
            <p className="text-white font-semibold mb-1">Drop your file here, or browse</p>
            <p className="text-slate-500 text-sm mb-5">Supports <span className="text-slate-300">.csv</span> and <span className="text-slate-300">.xlsx</span> · Max <span className="text-slate-300">10 MB</span></p>
            <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl text-sm transition-all glow-orange-sm">
              <FileSpreadsheet className="w-4 h-4" />
              Browse Files
              <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} className="sr-only" />
            </label>
          </>
        )}
      </div>

      {/* Status messages */}
      {uploadError && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {uploadError}
          <button onClick={() => setUploadError("")} className="ml-auto"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}
      {uploadSuccess && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm animate-fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {uploadSuccess}
        </div>
      )}

      {/* Dataset list */}
      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Database className="w-4 h-4" />
          Your Datasets ({datasets.length})
        </h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-xl p-4 h-20 shimmer" />
            ))}
          </div>
        ) : datasets.length === 0 ? (
          <div className="glass rounded-xl p-10 text-center">
            <Database className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No datasets uploaded yet</p>
            <p className="text-slate-600 text-sm mt-1">Upload a CSV or XLSX file to get started</p>
          </div>
        ) : (
          <ul className="space-y-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 500px)", minHeight: "200px" }}>
            {datasets.map((ds) => (
              <li key={ds.id}>
                <button
                  onClick={() => openDataset(ds)}
                  className="w-full glass rounded-xl p-4 flex items-center gap-4 hover:bg-slate-700/30 transition-all duration-150 group text-left"
                >
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{ds.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {ds.rowCount?.toLocaleString() ?? "—"} rows ·{" "}
                      {ds.columnCount ?? "—"} cols · {ds.size} ·{" "}
                      {new Date(ds.uploadedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${getRiskBarColor(ds.riskLevel || "LOW")}`}
                          style={{ width: `${ds.riskScore || 0}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium tabular-nums ${getRiskColor(ds.riskLevel || "LOW")}`}>
                        {ds.riskScore ?? 0}/100
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ds.status === "processing" ? (
                      <span className="flex items-center gap-1.5 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                        <Loader2 className="w-3 h-3 animate-spin" /> Processing
                      </span>
                    ) : ds.status === "error" ? (
                      <span className="flex items-center gap-1.5 text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-2 py-1 rounded-lg">
                        <AlertTriangle className="w-3 h-3" /> Error
                      </span>
                    ) : (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-lg border ${getRiskBg(ds.riskLevel || "LOW")} ${getRiskColor(ds.riskLevel || "LOW")}`}>
                        {ds.riskLevel}
                      </span>
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dataset Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="glass-heavy rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                  <Database className="w-4.5 h-4.5 text-blue-400" size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{selected.name}</h3>
                  <p className="text-xs text-slate-500">
                    {selected.rowCount?.toLocaleString()} rows · {selected.columnCount} columns · {selected.size}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 p-5 space-y-5">
              {/* Risk score */}
              <div className={`flex items-center gap-4 p-4 rounded-xl border ${getRiskBg(selected.riskLevel || "LOW")}`}>
                <AlertTriangle className={`w-5 h-5 shrink-0 ${getRiskColor(selected.riskLevel || "LOW")}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Risk Score: <span className={getRiskColor(selected.riskLevel || "LOW")}>{selected.riskScore}/100 — {selected.riskLevel}</span></p>
                  <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getRiskBarColor(selected.riskLevel || "LOW")}`} style={{ width: `${selected.riskScore || 0}%` }} />
                  </div>
                </div>
              </div>

              {/* Columns */}
              {selected.columns && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Columns ({selected.columns.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selected.columns.map((col) => (
                      <span key={col} className="px-2.5 py-1 bg-slate-800/60 border border-slate-700/50 rounded-lg text-xs text-slate-300 font-mono">
                        {col}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview table */}
              {selected.previewRows && selected.previewRows.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Data Preview (first {selected.previewRows.length} rows)
                  </p>
                  <DataTable columns={selected.columns || []} rows={selected.previewRows} />
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex items-center gap-3 p-5 border-t border-slate-700/50">
              <button
                onClick={() => { setSelected(null); router.push(`/dashboard/chat?dataset=${selected.id}`); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl text-sm transition-all glow-orange-sm"
              >
                <MessageSquare className="w-4 h-4" /> Analyze with AI
              </button>
              <button
                onClick={() => { setSelected(null); router.push(`/dashboard/insights?dataset=${selected.id}`); }}
                className="flex items-center gap-2 px-4 py-2.5 glass hover:bg-slate-700/50 text-slate-300 font-medium rounded-xl text-sm transition-all"
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
