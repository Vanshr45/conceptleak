"use client";

import { useState } from "react";
import {
  Moon,
  Zap,
  Shield,
  TrendingDown,
  Mail,
  Bell,
  Clock,
  Trash2,
  Save,
  ChevronRight,
} from "lucide-react";

export default function SettingsPage() {
  const [proactiveDetection, setProactiveDetection] = useState(true);
  const [autoBaseline, setAutoBaseline] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"fast" | "deep">("fast");
  const [responseStyle, setResponseStyle] = useState<
    "surgical" | "comprehensive" | "monospace" | "bullet"
  >("comprehensive");

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "#ebebf0" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "#7b7b8d" }}>
          Configure your ConceptLeak environment and data protocols.
        </p>
      </div>

      {/* APPEARANCE */}
      <section>
        <p className="section-label mb-3">Appearance</p>
        <div
          className="rounded-xl"
          style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Moon size={18} style={{ color: "#f97316" }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#ebebf0" }}>
                  Dark Mode
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#7b7b8d" }}>
                  Toggle between high-contrast dark and light interface.
                </p>
              </div>
            </div>
            {/* Locked ON toggle */}
            <div
              className="w-11 h-6 rounded-full relative cursor-not-allowed shrink-0"
              style={{ background: "#f97316" }}
            >
              <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </section>

      {/* AI PREFERENCES */}
      <section>
        <p className="section-label mb-3">AI Preferences</p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Model selector */}
          <div className="px-5 py-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="section-label mb-3">Active Inference Model</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedModel("fast")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  background:
                    selectedModel === "fast" ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.03)",
                  border:
                    selectedModel === "fast"
                      ? "1px solid rgba(249,115,22,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Zap size={16} style={{ color: "#f97316" }} className="shrink-0" />
                <span
                  className="text-sm font-semibold"
                  style={{ color: selectedModel === "fast" ? "#f97316" : "#ebebf0" }}
                >
                  Ultra-Fast 70B
                </span>
                {selectedModel === "fast" && (
                  <div
                    className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "#f97316" }}
                  >
                    <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                )}
              </button>

              <button
                onClick={() => setSelectedModel("deep")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  background:
                    selectedModel === "deep" ? "rgba(249,115,22,0.08)" : "rgba(255,255,255,0.03)",
                  border:
                    selectedModel === "deep"
                      ? "1px solid rgba(249,115,22,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.08)" }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: "#7b7b8d" }} />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: selectedModel === "deep" ? "#f97316" : "#7b7b8d" }}
                >
                  DeepReason 400B
                </span>
              </button>
            </div>
          </div>

          {/* Response style */}
          <div className="px-5 py-4">
            <p className="section-label mb-3">Response Style</p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { value: "surgical", label: "SURGICAL" },
                  { value: "comprehensive", label: "COMPREHENSIVE" },
                  { value: "monospace", label: "MONOSPACE-ONLY" },
                  { value: "bullet", label: "BULLET POINT" },
                ] as const
              ).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setResponseStyle(value)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-[0.06em] transition-all"
                  style={{
                    background: responseStyle === value ? "#f97316" : "rgba(255,255,255,0.04)",
                    color: responseStyle === value ? "white" : "#7b7b8d",
                    border:
                      responseStyle === value
                        ? "1px solid #f97316"
                        : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ANALYSIS SETTINGS */}
      <section>
        <p className="section-label mb-3">Analysis Settings</p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {[
            {
              icon: Shield,
              label: "Proactive Leakage Detection",
              desc: "AI scans datasets for PII and sensitive internal strings.",
              value: proactiveDetection,
              onToggle: () => setProactiveDetection((v) => !v),
            },
            {
              icon: TrendingDown,
              label: "Auto-Baseline Accuracy",
              desc: "Automatically calculate drift against previous week's snapshots.",
              value: autoBaseline,
              onToggle: () => setAutoBaseline((v) => !v),
            },
          ].map(({ icon: Icon, label, desc, value, onToggle }, i) => (
            <div
              key={label}
              className="flex items-center justify-between px-5 py-4"
              style={
                i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.04)" } : {}
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={18} style={{ color: "#7b7b8d" }} className="shrink-0" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#ebebf0" }}>
                    {label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#7b7b8d" }}>
                    {desc}
                  </p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="w-11 h-6 rounded-full relative transition-all shrink-0"
                style={{ background: value ? "#f97316" : "rgba(255,255,255,0.1)" }}
              >
                <div
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-150"
                  style={{ left: value ? "calc(100% - 1.25rem)" : "0.25rem" }}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* NOTIFICATIONS */}
      <section>
        <p className="section-label mb-3">Notifications</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Mail, label: "Email Digests" },
            { icon: Bell, label: "In-App Alerts" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-colors hover:bg-white/[0.02]"
              style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} style={{ color: "#7b7b8d" }} />
                <span className="text-sm font-semibold" style={{ color: "#ebebf0" }}>
                  {label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "#4a4a5a" }} />
            </div>
          ))}
        </div>
      </section>

      {/* DATA & PRIVACY */}
      <section>
        <p className="section-label mb-3">Data &amp; Privacy</p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "#111118", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* Retention */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
          >
            <div className="flex items-center gap-3">
              <Clock size={18} style={{ color: "#7b7b8d" }} className="shrink-0" />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#ebebf0" }}>
                  Data Retention Policy
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#7b7b8d" }}>
                  Logs and analysis results are permanently purged after 30 days.
                </p>
              </div>
            </div>
            <span
              className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider shrink-0"
              style={{
                background: "rgba(255,255,255,0.06)",
                color: "#7b7b8d",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              30 DAYS
            </span>
          </div>

          {/* Flush */}
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <Trash2 size={18} style={{ color: "#ef4444" }} className="shrink-0" />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#f97316" }}>
                  Flush All Workspace Data
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#7b7b8d" }}>
                  Irreversible action. Removes all trained datasets and audit logs.
                </p>
              </div>
            </div>
            <button
              className="px-3 py-1.5 rounded text-[11px] font-bold tracking-wider transition-colors shrink-0"
              style={{
                background: "rgba(239,68,68,0.1)",
                color: "#ef4444",
                border: "1px solid rgba(239,68,68,0.3)",
              }}
            >
              PURGE NOW
            </button>
          </div>
        </div>
      </section>

      {/* Save Button */}
      <button
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
        style={{ background: "#f97316", color: "white" }}
      >
        <Save className="w-4 h-4" />
        SAVE ALL SETTINGS
      </button>

      {/* Footer */}
      <p
        className="text-center text-[11px] tracking-[0.06em] font-semibold"
        style={{ color: "#4a4a5a" }}
      >
        LAST SYNCED: TODAY AT {timeStr} UTC
      </p>
    </div>
  );
}
