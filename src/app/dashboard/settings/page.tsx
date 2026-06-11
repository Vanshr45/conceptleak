"use client";

import { useState, useEffect } from "react";
import {
  Moon,
  Sun,
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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("conceptleak-theme");
    setIsDarkMode(saved === "dark" || document.documentElement.classList.contains("dark"));
  }, []);

  function toggleDarkMode() {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("conceptleak-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("conceptleak-theme", "light");
    }
  }

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
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Settings
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Configure your ConceptLeak environment and data protocols.
        </p>
      </div>

      {/* APPEARANCE */}
      <section>
        <p className="section-label mb-3">Appearance</p>
        <div
          className="rounded-xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              {isDarkMode ? (
                <Moon size={18} style={{ color: "var(--accent)" }} />
              ) : (
                <Sun size={18} style={{ color: "var(--accent)" }} />
              )}
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Dark Mode
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Toggle between high-contrast dark and light interface.
                </p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="w-11 h-6 rounded-full relative transition-colors shrink-0"
              style={{ background: isDarkMode ? "var(--accent)" : "var(--border-strong)" }}
            >
              <div
                className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-150"
                style={{ left: isDarkMode ? "calc(100% - 1.25rem)" : "0.25rem" }}
              />
            </button>
          </div>
        </div>
      </section>

      {/* AI PREFERENCES */}
      <section>
        <p className="section-label mb-3">AI Preferences</p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Model selector */}
          <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <p className="section-label mb-3">Active Inference Model</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedModel("fast")}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  background: selectedModel === "fast" ? "var(--accent-muted)" : "var(--surface-elevated)",
                  border: selectedModel === "fast"
                    ? "1px solid var(--accent-muted-border)"
                    : "1px solid var(--border)",
                }}
              >
                <Zap size={16} style={{ color: "var(--accent)" }} className="shrink-0" />
                <span
                  className="text-sm font-semibold"
                  style={{ color: selectedModel === "fast" ? "var(--accent)" : "var(--text)" }}
                >
                  Ultra-Fast 70B
                </span>
                {selectedModel === "fast" && (
                  <div
                    className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent)" }}
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
                  background: selectedModel === "deep" ? "var(--accent-muted)" : "var(--surface-elevated)",
                  border: selectedModel === "deep"
                    ? "1px solid var(--accent-muted-border)"
                    : "1px solid var(--border)",
                }}
              >
                <div
                  className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: "var(--surface-elevated)", border: "1px solid var(--border)" }}
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--text-muted)" }} />
                </div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: selectedModel === "deep" ? "var(--accent)" : "var(--text-secondary)" }}
                >
                  DeepReason 400B
                </span>
                {selectedModel === "deep" && (
                  <div
                    className="ml-auto w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: "var(--accent)" }}
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
                    background: responseStyle === value ? "var(--accent)" : "var(--surface-elevated)",
                    color: responseStyle === value ? "white" : "var(--text-secondary)",
                    border: responseStyle === value
                      ? "1px solid var(--accent)"
                      : "1px solid var(--border)",
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
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
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
              style={i > 0 ? { borderTop: "1px solid var(--border)" } : {}}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} style={{ color: "var(--text-secondary)" }} className="shrink-0" />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                    {label}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                    {desc}
                  </p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="w-11 h-6 rounded-full relative transition-colors shrink-0"
                style={{ background: value ? "var(--accent)" : "var(--border-strong)" }}
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
              className="flex items-center justify-between px-4 py-3.5 rounded-xl cursor-pointer transition-opacity hover:opacity-75"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} style={{ color: "var(--text-secondary)" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  {label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
            </div>
          ))}
        </div>
      </section>

      {/* DATA & PRIVACY */}
      <section>
        <p className="section-label mb-3">Data &amp; Privacy</p>
        <div
          className="rounded-xl overflow-hidden"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          {/* Retention */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex items-center gap-3">
              <Clock size={18} style={{ color: "var(--text-secondary)" }} className="shrink-0" />
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                  Data Retention Policy
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Logs and analysis results are permanently purged after 30 days.
                </p>
              </div>
            </div>
            <span
              className="px-2.5 py-1 rounded text-[10px] font-bold tracking-wider shrink-0"
              style={{
                background: "var(--surface-elevated)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
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
                <p className="text-sm font-semibold" style={{ color: "#ef4444" }}>
                  Flush All Workspace Data
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>
                  Irreversible action. Removes all trained datasets and audit logs.
                </p>
              </div>
            </div>
            <button
              className="px-3 py-1.5 rounded text-[11px] font-bold tracking-wider transition-opacity hover:opacity-80 shrink-0"
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
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 text-white"
        style={{ background: "var(--accent)" }}
      >
        <Save className="w-4 h-4" />
        Save All Settings
      </button>

      {/* Footer */}
      <p
        className="text-center text-[11px] tracking-[0.06em] font-semibold"
        style={{ color: "var(--text-muted)" }}
      >
        LAST SYNCED: TODAY AT {timeStr} UTC
      </p>
    </div>
  );
}
