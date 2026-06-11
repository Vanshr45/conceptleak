"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ChevronRight, Loader2, Play } from "lucide-react";
import type { SimulationResult } from "@/lib/simulator";
import type { Dataset } from "@/types";

type Status = "idle" | "running" | "complete" | "error";

const TARGET_PATTERN = /^(target|label|y|outcome|class|output|result|churn|fraud|default|survived|diagnosis|attrition|response|converted|purchased|clicked|subscribed|cancelled|death|event|readmitted|admitted|hired|promoted|approved|rejected|flagged|anomaly|defect|failure|success)$/i;
const PROGRESS_STEPS = [
  "Preparing dataset...",
  "Training baseline model...",
  "Measuring leakage impact...",
  "Computing clean dataset...",
] as const;

function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

function getRiskLabel(gap: number): string {
  if (gap > 20) return "CRITICAL LEAK";
  if (gap > 10) return "HIGH RISK";
  if (gap > 5) return "MEDIUM RISK";
  return "LOW RISK";
}

function getActionStyle(action: "REMOVE" | "REVIEW" | "KEEP"): React.CSSProperties {
  if (action === "REMOVE") {
    return { background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#ef4444" };
  }
  if (action === "REVIEW") {
    return { background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", color: "#eab308" };
  }
  return { background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#22c55e" };
}

export default function SimulateClient() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [status, setStatus] = useState<Status>(() => {
    if (typeof window === "undefined") return "idle";
    try {
      const saved = sessionStorage.getItem("sim_result");
      return saved ? "complete" : "idle";
    } catch {
      return "idle";
    }
  });
  const [result, setResult] = useState<SimulationResult | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const saved = sessionStorage.getItem("sim_result");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [error, setError] = useState("");
  const [visibleSteps, setVisibleSteps] = useState(0);
  const previousDatasetId = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/datasets")
      .then((r) => r.json())
      .then((d: { datasets?: Dataset[] }) => {
        if (cancelled) return;
        const nextDatasets = d.datasets || [];
        setDatasets(nextDatasets);
        if (nextDatasets.length > 0) {
          setSelectedDatasetId((current) => current || nextDatasets[0].id);
        }
      })
      .catch(() => { if (!cancelled) setDatasets([]); });
    return () => { cancelled = true; };
  }, []);

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === selectedDatasetId) ?? null,
    [datasets, selectedDatasetId]
  );

  const availableColumns = selectedDataset?.columns ?? [];

  useEffect(() => {
    if (!selectedDataset) {
      setSelectedTarget("");
      previousDatasetId.current = null;
      return;
    }
    const autoTarget =
      selectedDataset.columns?.find((col) => TARGET_PATTERN.test(col)) ??
      selectedDataset.columns?.[selectedDataset.columns.length - 1] ?? "";
    const datasetChanged =
      previousDatasetId.current !== null && previousDatasetId.current !== selectedDataset.id;
    setSelectedTarget(autoTarget);
    setError("");
    if (datasetChanged) {
      sessionStorage.removeItem("sim_result");
      setResult(null);
      setStatus("idle");
    }
    previousDatasetId.current = selectedDataset.id;
  }, [selectedDataset]);

  useEffect(() => {
    if (status !== "running") { setVisibleSteps(0); return; }
    setVisibleSteps(1);
    const timers = PROGRESS_STEPS.slice(1).map((_, index) =>
      window.setTimeout(() => {
        setVisibleSteps((current) => Math.max(current, index + 2));
      }, (index + 1) * 1500)
    );
    return () => { timers.forEach((timer) => window.clearTimeout(timer)); };
  }, [status]);

  async function runSimulation() {
    if (!selectedDatasetId || !selectedTarget) return;
    setStatus("running");
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId: selectedDatasetId, targetColumn: selectedTarget }),
      });
      const data: { error?: string; result?: SimulationResult } = await res.json();
      if (!res.ok || !data.result) {
        setError(data.error || "Simulation failed");
        setStatus("error");
        return;
      }
      setResult(data.result);
      try { sessionStorage.setItem("sim_result", JSON.stringify(data.result)); } catch {}
      setStatus("complete");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  function resetSimulation() {
    sessionStorage.removeItem("sim_result");
    setResult(null);
    setStatus("idle");
    setError("");
  }

  const analyzedColumns = Math.max(
    0,
    availableColumns.filter((column) => column !== selectedTarget).length
  );

  const sortedImpacts = useMemo(
    () => [...(result?.columnImpacts ?? [])].sort((l, r) => r.impactScore - l.impactScore),
    [result]
  );

  const improvement = Math.round(
    ((result?.baselineTestAccuracy ?? 0) - (result?.cleanTestAccuracy ?? 0)) * 10
  ) / 10;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "var(--text-muted)" }}
        >
          Model Readiness
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl" style={{ color: "var(--text)" }}>
          Training Risk Simulator
        </h1>
        <p className="max-w-3xl text-sm sm:text-base" style={{ color: "var(--text-secondary)" }}>
          See exactly how much accuracy you lose in production{" "}
          <span className="font-semibold" style={{ color: "var(--accent)" }}>
            before you train
          </span>
        </p>
      </div>

      {/* Dataset + Target selectors */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section
          className="rounded-xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-muted)" }}>
            Select Dataset
          </p>
          <div className="space-y-4">
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border-strong)",
                color: "var(--text)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            >
              <option value="">Choose a dataset</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}
                  {typeof dataset.riskScore === "number" ? ` · Risk ${dataset.riskScore}` : ""}
                </option>
              ))}
            </select>

            {selectedDataset ? (
              <div
                className="rounded-xl p-4"
                style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                      {selectedDataset.name}
                    </p>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                      {(selectedDataset.rowCount ?? 0).toLocaleString()} rows ·{" "}
                      {(selectedDataset.columnCount ?? selectedDataset.columns?.length ?? 0).toString()} columns
                    </p>
                  </div>
                  {typeof selectedDataset.riskScore === "number" && (
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold shrink-0"
                      style={{
                        background: "var(--accent-muted)",
                        border: "1px solid var(--accent-muted-border)",
                        color: "var(--accent)",
                      }}
                    >
                      Risk {selectedDataset.riskScore}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div
                className="rounded-xl border-2 border-dashed p-4 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
              >
                Pick one of your uploaded datasets to begin.
              </div>
            )}
          </div>
        </section>

        <section
          className="rounded-xl p-5"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--text-muted)" }}>
            Target Column
          </p>
          <div className="space-y-4">
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              disabled={!selectedDataset}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border-strong)",
                color: "var(--text)",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; }}
            >
              <option value="">
                {selectedDataset ? "Choose target column" : "Select a dataset first"}
              </option>
              {availableColumns.map((column) => (
                <option key={column} value={column}>{column}</option>
              ))}
            </select>

            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              The column your model will predict
            </p>

            {selectedTarget && (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "var(--accent-muted)",
                  border: "1px solid var(--accent-muted-border)",
                  color: "var(--accent)",
                }}
              >
                Auto-selected target:{" "}
                <span className="font-mono font-semibold">{selectedTarget}</span>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Running state */}
      {status === "running" ? (
        <section
          className="rounded-xl p-8 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <Loader2 className="mx-auto h-10 w-10 animate-spin" style={{ color: "var(--accent)" }} />
          <h2 className="mt-4 text-xl font-semibold" style={{ color: "var(--text)" }}>
            Running simulation...
          </h2>
          <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
            {PROGRESS_STEPS.slice(0, visibleSteps).map((step) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full shrink-0"
                  style={{ background: "var(--accent-muted)", color: "var(--accent)" }}
                >
                  <Check className="h-4 w-4" />
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm" style={{ color: "var(--text-secondary)" }}>
            This takes 5–15 seconds
          </p>
        </section>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={runSimulation}
            disabled={!selectedDatasetId || !selectedTarget}
            className="flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-base font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: "var(--accent)" }}
          >
            <Play className="h-5 w-5 fill-current" />
            Run Simulation — Analyze {analyzedColumns} columns
          </button>
          {status === "complete" && (
            <button
              onClick={resetSimulation}
              className="rounded-lg px-3 py-1.5 text-xs transition-colors whitespace-nowrap"
              style={{ border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              Run New
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <section
          className="rounded-xl p-5 animate-fade-in"
          style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <div className="flex items-start gap-4">
            <div className="rounded-full p-3" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: "#ef4444" }}>
                Simulation Error
              </p>
              <p className="text-sm" style={{ color: "var(--text)" }}>{error}</p>
              <button
                onClick={() => { setStatus("idle"); setError(""); }}
                className="rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-80"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#ef4444",
                }}
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Results */}
      {status === "complete" && result && (
        <div className="space-y-6 animate-fade-in">
          {/* Before / After */}
          <section className="grid gap-4 xl:grid-cols-[1fr_auto_1fr]">
            {/* Before */}
            <div
              className="rounded-xl p-5"
              style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.18)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                Before Cleaning
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                With leaking + noisy columns
              </p>
              <div className="space-y-4">
                {[
                  { label: "Training Accuracy", value: result.cleanTrainAccuracy },
                  { label: "Test Accuracy", value: result.cleanTestAccuracy },
                  { label: "Gap", value: result.cleanGap },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </p>
                    <p
                      className="text-3xl font-bold"
                      style={{ color: result.cleanGap > 10 ? "#ef4444" : "var(--text)" }}
                    >
                      {formatPercent(value)}
                    </p>
                  </div>
                ))}
                <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>
                  {getRiskLabel(result.cleanGap)}
                </p>
              </div>
            </div>

            {/* Improvement arrow */}
            <div
              className="flex flex-col items-center justify-center gap-3 rounded-xl p-6"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="text-4xl" style={{ color: "var(--text-muted)" }}>→</div>
              <div className="text-center">
                <p
                  className="font-bold text-lg"
                  style={{ color: improvement >= 0 ? "#22c55e" : "#ef4444" }}
                >
                  {improvement >= 0 ? "+" : ""}{improvement}%
                </p>
                <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>
                  accuracy gained
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>
                  after cleaning
                </p>
              </div>
            </div>

            {/* After */}
            <div
              className="rounded-xl p-5"
              style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.18)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                After Cleaning
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Bad columns removed
              </p>
              <div className="space-y-4">
                {[
                  { label: "Training Accuracy", value: result.baselineTrainAccuracy },
                  { label: "Test Accuracy", value: result.baselineTestAccuracy },
                  { label: "Gap", value: result.baselineGap },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "var(--text-muted)" }}>
                      {label}
                    </p>
                    <p className="text-3xl font-bold" style={{ color: "#22c55e" }}>
                      {formatPercent(value)}
                    </p>
                  </div>
                ))}
                <p className="text-sm font-semibold" style={{ color: "#22c55e" }}>
                  {result.baselineGap < 5 ? "SAFE TO TRAIN" : "IMPROVED"}
                </p>
              </div>
            </div>
          </section>

          {/* Column impact table */}
          <section
            className="rounded-xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <h2 className="text-xl font-semibold mb-1" style={{ color: "var(--text)" }}>
              Column Impact Ranking
            </h2>
            <p className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              {sortedImpacts.length} columns analyzed
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}
                  >
                    {["Column", "Leakage Type", "Accuracy Gain", "Before Gap", "After Gap", "Action"].map((h) => (
                      <th key={h} className="px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedImpacts.length > 0 ? (
                    sortedImpacts.map((impact) => (
                      <tr
                        key={impact.column}
                        style={{ borderBottom: "1px solid var(--border)" }}
                      >
                        <td className="px-4 py-4 font-mono" style={{ color: "var(--accent)" }}>
                          {impact.column}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-medium"
                            style={{
                              background: "var(--surface-elevated)",
                              border: "1px solid var(--border)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {impact.leakageType}
                          </span>
                        </td>
                        <td
                          className="px-4 py-4 font-semibold"
                          style={{ color: impact.impactScore < 0 ? "#22c55e" : "var(--text-secondary)" }}
                        >
                          {impact.impactScore < 0 ? "+" : ""}
                          {formatPercent(impact.impactScore * -1)}
                        </td>
                        <td className="px-4 py-4" style={{ color: "var(--text-secondary)" }}>
                          {formatPercent(impact.gapBefore)}
                        </td>
                        <td className="px-4 py-4" style={{ color: "var(--text-secondary)" }}>
                          {formatPercent(impact.gapAfter)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className="rounded-full px-3 py-1 text-xs font-semibold"
                            style={getActionStyle(impact.recommendation)}
                          >
                            {impact.recommendation}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center" style={{ color: "var(--text-secondary)" }}>
                        No flagged columns were returned by the simulation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Summary */}
          <section
            className="rounded-xl p-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="text-sm mb-5" style={{ color: "var(--text-secondary)" }}>
              {improvement > 0 ? (
                <p>
                  After cleaning your dataset, accuracy improved from{" "}
                  <strong style={{ color: "#ef4444" }}>{result.cleanTestAccuracy}%</strong> to{" "}
                  <strong style={{ color: "#22c55e" }}>{result.baselineTestAccuracy}%</strong>.
                </p>
              ) : (
                <p>No significant improvement detected. Your dataset appears clean — safe to train.</p>
              )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() => router.push(`/dashboard/chat?dataset=${selectedDatasetId}`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                style={{ background: "var(--accent)" }}
              >
                Discuss findings with AI
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => router.push(`/dashboard/insights?dataset=${selectedDatasetId}`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-80"
                style={{
                  background: "var(--surface-elevated)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                View Leakage Report
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
