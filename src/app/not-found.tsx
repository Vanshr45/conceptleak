import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--surface)" }}
    >
      <div className="relative z-10 text-center max-w-lg">
        {/* Big 404 */}
        <div className="mb-8">
          <span className="text-[8rem] font-black leading-none gradient-text select-none">
            404
          </span>
        </div>

        <div
          className="rounded-2xl p-8 mb-8"
          style={{ background: "var(--bg)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--accent-muted)", border: "1px solid var(--accent-muted-border)" }}
          >
            <Search className="w-8 h-8" style={{ color: "var(--accent)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-3" style={{ color: "var(--text)" }}>
            Page Not Found
          </h1>
          <p className="leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Concept leakage detected in your URL — let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-6 py-3 font-medium rounded-xl transition-opacity hover:opacity-75"
            style={{
              background: "var(--surface-elevated)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
          >
            Back to Login
          </Link>
        </div>

        <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
          ConceptLeak — ML Data Leakage Detector
        </p>
      </div>
    </main>
  );
}
