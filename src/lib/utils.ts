import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "CRITICAL": return "text-red-400";
    case "HIGH": return "text-orange-400";
    case "MEDIUM": return "text-amber-400";
    case "LOW": return "text-emerald-400";
    default: return "text-slate-400";
  }
}

export function getRiskBg(level: RiskLevel): string {
  switch (level) {
    case "CRITICAL": return "bg-red-500/10 border-red-500/30";
    case "HIGH": return "bg-orange-500/10 border-orange-500/30";
    case "MEDIUM": return "bg-amber-500/10 border-amber-500/30";
    case "LOW": return "bg-emerald-500/10 border-emerald-500/30";
    default: return "bg-slate-500/10 border-slate-500/30";
  }
}

export function getRiskBarColor(level: RiskLevel): string {
  switch (level) {
    case "CRITICAL": return "bg-red-500";
    case "HIGH": return "bg-orange-500";
    case "MEDIUM": return "bg-amber-500";
    case "LOW": return "bg-emerald-500";
    default: return "bg-slate-500";
  }
}

export function scoreToRisk(score: number): RiskLevel {
  if (score >= 80) return "CRITICAL";
  if (score >= 60) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}
