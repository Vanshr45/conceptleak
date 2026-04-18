import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your ConceptLeak account to start analyzing datasets for concept leakage.",
};

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "#0a0a0f" }}
    >
      {/* Ambient background glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{ background: "rgba(249,115,22,0.06)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ background: "rgba(249,115,22,0.04)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: "#f97316",
              boxShadow: "0 0 30px rgba(249,115,22,0.3)",
            }}
          >
            <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none">
              <path
                d="M16 4L28 10V22L16 28L4 22V10L16 4Z"
                stroke="white"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="16" cy="16" r="4" fill="white" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ color: "#ebebf0" }}>
            Concept<span className="gradient-text">Leak</span>
          </h1>
          <p className="text-sm" style={{ color: "#7b7b8d" }}>
            ML Dataset Leakage Intelligence Platform
          </p>
        </div>

        <Suspense
          fallback={
            <div
              className="rounded-2xl p-8 h-64 shimmer"
              style={{ border: "1px solid rgba(255,255,255,0.06)" }}
            />
          }
        >
          <LoginForm />
        </Suspense>

        {/* Demo credentials */}
        <div
          className="mt-6 p-4 rounded-xl text-center"
          style={{
            background: "#111118",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p
            className="text-[11px] mb-1 font-semibold tracking-[0.08em] uppercase"
            style={{ color: "#4a4a5a" }}
          >
            Demo Access
          </p>
          <p className="text-sm" style={{ color: "#7b7b8d" }}>
            <span style={{ color: "#ebebf0" }}>demo@conceptleak.ai</span>
            <span className="mx-2" style={{ color: "#4a4a5a" }}>/</span>
            <span style={{ color: "#ebebf0" }}>demo123</span>
          </p>
        </div>
      </div>
    </main>
  );
}
