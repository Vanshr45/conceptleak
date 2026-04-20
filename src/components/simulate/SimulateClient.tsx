"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  Play,
} from "lucide-react";
import type { SimulationResult } from "@/lib/simulator";
import type { Dataset } from "@/types";

type Status = "idle" | "running" | "complete" | "error";

const TARGET_PATTERN = /target|label|y|outcome|class/i;
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

function getImpactTextClass(impactScore: number): string {
  if (impactScore > 10) return "text-red-400";
  if (impactScore > 3) return "text-orange-400";
  if (impactScore < 1) return "text-green-400";
  return "text-slate-200";
}

function getActionClass(action: "REMOVE" | "REVIEW" | "KEEP"): string {
  if (action === "REMOVE") {
    return "border border-red-500/30 bg-red-500/10 text-red-400";
  }
  if (action === "REVIEW") {
    return "border border-yellow-500/30 bg-yellow-500/10 text-yellow-300";
  }
  return "border border-green-500/30 bg-green-500/10 text-green-400";
}

export default function SimulateClient() {
  const router = useRouter();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [selectedTarget, setSelectedTarget] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState("");
  const [visibleSteps, setVisibleSteps] = useState(0);

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
      .catch(() => {
        if (!cancelled) {
          setDatasets([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === selectedDatasetId) ?? null,
    [datasets, selectedDatasetId]
  );

  const availableColumns = selectedDataset?.columns ?? [];

  useEffect(() => {
    if (!selectedDataset) {
      setSelectedTarget("");
      return;
    }

    const matchedTarget =
      selectedDataset.columns?.find((column) => TARGET_PATTERN.test(column)) ??
      "";

    setSelectedTarget(matchedTarget);
    setResult(null);
    setError("");
    setStatus("idle");
  }, [selectedDataset]);

  useEffect(() => {
    if (status !== "running") {
      setVisibleSteps(0);
      return;
    }

    setVisibleSteps(1);
    const timers = PROGRESS_STEPS.slice(1).map((_, index) =>
      window.setTimeout(() => {
        setVisibleSteps((current) => Math.max(current, index + 2));
      }, (index + 1) * 1500)
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
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
        body: JSON.stringify({
          datasetId: selectedDatasetId,
          targetColumn: selectedTarget,
        }),
      });
      const data: { error?: string; result?: SimulationResult } =
        await res.json();

      if (!res.ok || !data.result) {
        setError(data.error || "Simulation failed");
        setStatus("error");
        return;
      }

      setResult(data.result);
      setStatus("complete");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  const analyzedColumns = Math.max(
    0,
    availableColumns.filter((column) => column !== selectedTarget).length
  );

  const sortedImpacts = useMemo(
    () =>
      [...(result?.columnImpacts ?? [])].sort(
        (left, right) => right.impactScore - left.impactScore
      ),
    [result]
  );

  const removedCount = sortedImpacts.filter(
    (impact) => impact.recommendation === "REMOVE"
  ).length;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Model Readiness
        </p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Train Risk Simulator
        </h1>
        <p className="max-w-3xl text-sm text-slate-400 sm:text-base">
          See exactly how much accuracy you lose in production{" "}
          <span className="font-semibold text-orange-400">before you train</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-700/50 bg-[#141420] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Select Dataset
          </p>
          <div className="mt-4 space-y-4">
            <select
              value={selectedDatasetId}
              onChange={(event) => setSelectedDatasetId(event.target.value)}
              className="w-full rounded-xl border border-slate-700/50 bg-[#0f1118] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400"
            >
              <option value="">Choose a dataset</option>
              {datasets.map((dataset) => (
                <option key={dataset.id} value={dataset.id}>
                  {dataset.name}{" "}
                  {typeof dataset.riskScore === "number"
                    ? `· Risk ${dataset.riskScore}`
                    : ""}
                </option>
              ))}
            </select>

            {selectedDataset ? (
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/40 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {selectedDataset.name}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {(selectedDataset.rowCount ?? 0).toLocaleString()} rows
                      {" · "}
                      {(selectedDataset.columnCount ??
                        selectedDataset.columns?.length ??
                        0)
                        .toString()}{" "}
                      columns
                    </p>
                  </div>
                  {typeof selectedDataset.riskScore === "number" ? (
                    <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                      Risk {selectedDataset.riskScore}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-700/50 bg-slate-900/20 p-4 text-sm text-slate-400">
                Pick one of your uploaded datasets to begin.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-700/50 bg-[#141420] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Target Column
          </p>
          <div className="mt-4 space-y-4">
            <select
              value={selectedTarget}
              onChange={(event) => setSelectedTarget(event.target.value)}
              disabled={!selectedDataset}
              className="w-full rounded-xl border border-slate-700/50 bg-[#0f1118] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {selectedDataset ? "Choose target column" : "Select a dataset first"}
              </option>
              {availableColumns.map((column) => (
                <option key={column} value={column}>
                  {column}
                </option>
              ))}
            </select>
            <p className="text-sm text-slate-400">
              The column your model will predict
            </p>
            {selectedTarget ? (
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-3 text-sm text-orange-300">
                Auto-selected target:{" "}
                <span className="font-mono text-orange-400">{selectedTarget}</span>
              </div>
            ) : null}
          </div>
        </section>
      </div>

      {status === "running" ? (
        <section className="rounded-xl border border-slate-700/50 bg-[#141420] p-8 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-orange-400" />
          <h2 className="mt-4 text-xl font-semibold text-white">
            Running simulation...
          </h2>
          <div className="mx-auto mt-6 max-w-md space-y-3 text-left">
            {PROGRESS_STEPS.slice(0, visibleSteps).map((step) => (
              <div
                key={step}
                className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-900/40 px-4 py-3 text-sm text-slate-200"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/15 text-orange-400">
                  <Check className="h-4 w-4" />
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm text-slate-400">This takes 5-15 seconds</p>
        </section>
      ) : (
        <button
          onClick={runSimulation}
          disabled={!selectedDatasetId || !selectedTarget}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-orange-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="h-5 w-5 fill-current" />
          <span>Run Simulation - Analyze {analyzedColumns} columns</span>
        </button>
      )}

      {status === "error" ? (
        <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-500/15 p-3 text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-red-300">
                Simulation Error
              </p>
              <p className="text-sm text-red-100">{error}</p>
              <button
                onClick={() => {
                  setStatus("idle");
                  setError("");
                }}
                className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 transition hover:bg-red-500/20"
              >
                Try Again
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {status === "complete" && result ? (
        <div className="space-y-6 animate-fade-in">
          <section className="grid gap-4 xl:grid-cols-[1fr_auto_1fr]">
            <div
              className={`rounded-xl border p-5 ${
                result.baselineGap > 20
                  ? "border-red-500/30 bg-red-500/10"
                  : "border-slate-700/50 bg-[#141420]"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Baseline
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Training Accuracy
                  </p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    {formatPercent(result.baselineTrainAccuracy)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Test Accuracy
                  </p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    {formatPercent(result.baselineTestAccuracy)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Gap
                  </p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    {formatPercent(result.baselineGap)}
                  </p>
                  <p
                    className={`mt-2 text-sm font-semibold ${
                      result.baselineGap > 20
                        ? "text-red-400"
                        : result.baselineGap > 10
                          ? "text-orange-400"
                          : result.baselineGap > 5
                            ? "text-yellow-300"
                            : "text-green-400"
                    }`}
                  >
                    {getRiskLabel(result.baselineGap)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center rounded-xl border border-slate-700/50 bg-[#141420] px-6 py-5 text-center text-sm font-semibold text-slate-300">
              <span>After removing flagged columns</span>
              <ArrowRight className="ml-3 h-5 w-5 text-orange-400" />
            </div>

            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Clean
              </p>
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Training Accuracy
                  </p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    {formatPercent(result.cleanTrainAccuracy)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Test Accuracy
                  </p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    {formatPercent(result.cleanTestAccuracy)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Gap
                  </p>
                  <p className="mt-1 text-3xl font-bold text-white">
                    {formatPercent(result.cleanGap)}
                  </p>
                  {result.cleanGap < 5 ? (
                    <p className="mt-2 text-sm font-semibold text-green-400">
                      SAFE TO TRAIN
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-700/50 bg-[#141420] p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">
                  Column Impact Ranking
                </h2>
                <p className="text-sm text-slate-400">
                  {sortedImpacts.length} columns analyzed
                </p>
              </div>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Column</th>
                    <th className="px-4 py-3">Leakage Type</th>
                    <th className="px-4 py-3">Impact</th>
                    <th className="px-4 py-3">Before Gap</th>
                    <th className="px-4 py-3">After Gap</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedImpacts.length > 0 ? (
                    sortedImpacts.map((impact) => (
                      <tr
                        key={impact.column}
                        className="border-b border-slate-800/80 last:border-b-0"
                      >
                        <td className="px-4 py-4 font-mono text-orange-400">
                          {impact.column}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full border border-slate-700/60 bg-slate-900/60 px-3 py-1 text-xs font-medium text-slate-300">
                            {impact.leakageType}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-4 font-semibold ${getImpactTextClass(
                            impact.impactScore
                          )}`}
                        >
                          {formatPercent(impact.impactScore)}
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {formatPercent(impact.gapBefore)}
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {formatPercent(impact.gapAfter)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getActionClass(
                              impact.recommendation
                            )}`}
                          >
                            {impact.recommendation}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-slate-400"
                      >
                        No flagged columns were returned by the simulation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-xl border border-slate-700/50 bg-[#141420] p-5">
            <p className="text-sm text-slate-300">
              Simulation complete. Removing {removedCount} columns reduces your
              production accuracy gap from {formatPercent(result.baselineGap)} to{" "}
              {formatPercent(result.cleanGap)}. Your model goes from{" "}
              {formatPercent(result.baselineTestAccuracy)} test accuracy to{" "}
              {formatPercent(result.cleanTestAccuracy)}.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                onClick={() =>
                  router.push(`/dashboard/chat?dataset=${selectedDatasetId}`)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-400"
              >
                <span>Discuss findings with AI</span>
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() =>
                  router.push(`/dashboard/insights?dataset=${selectedDatasetId}`)
                }
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/50 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-orange-400/40 hover:text-white"
              >
                <span>View Leakage Report</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
