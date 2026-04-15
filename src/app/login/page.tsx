import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your ConceptLeak account to start analyzing datasets for concept leakage.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4 py-12">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-orange-500/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-blue-500/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-slate-800/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 border border-orange-500/30 rounded-2xl mb-4 glow-orange-sm">
            <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none">
              <circle cx="16" cy="16" r="6" stroke="#f97316" strokeWidth="2" />
              <circle cx="16" cy="16" r="12" stroke="#f97316" strokeWidth="1" strokeDasharray="3 3" />
              <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="16" cy="16" r="2" fill="#f97316" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Concept<span className="gradient-text">Leak</span>
          </h1>
          <p className="text-slate-400 text-sm">ML Data Leakage Intelligence Platform</p>
        </div>

        <Suspense fallback={<div className="glass rounded-2xl p-8 h-64 shimmer" />}>
          <LoginForm />
        </Suspense>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 glass rounded-xl text-center">
          <p className="text-slate-500 text-xs mb-1 font-medium uppercase tracking-wide">Demo Access</p>
          <p className="text-slate-400 text-sm">
            <span className="text-slate-300">demo@conceptleak.ai</span>
            <span className="text-slate-600 mx-2">/</span>
            <span className="text-slate-300">demo123</span>
          </p>
        </div>
      </div>
    </main>
  );
}
