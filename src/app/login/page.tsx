import type { Metadata } from "next";
import { Suspense } from "react";
import { Shield } from "lucide-react";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your ConceptLeak account to start analyzing datasets for concept leakage.",
};

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "var(--surface)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ background: "var(--accent)" }}
          >
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--text)" }}>
            Concept<span style={{ color: "var(--accent)" }}>Leak</span>
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            ML Dataset Leakage Intelligence Platform
          </p>
        </div>

        <Suspense
          fallback={
            <div
              className="rounded-2xl p-8 h-64 shimmer"
              style={{ border: "1px solid var(--border)" }}
            />
          }
        >
          <LoginForm />
        </Suspense>

        {/* Demo credentials */}
        <div
          className="mt-5 p-4 rounded-xl text-center"
          style={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
          }}
        >
          <p
            className="text-[11px] mb-1 font-semibold tracking-[0.08em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Demo Access
          </p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            <span style={{ color: "var(--text)" }}>demo@conceptleak.ai</span>
            <span className="mx-2" style={{ color: "var(--text-muted)" }}>/</span>
            <span style={{ color: "var(--text)" }}>demo123</span>
          </p>
        </div>
      </div>
    </main>
  );
}
