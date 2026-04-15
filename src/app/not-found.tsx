import Link from "next/link";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        {/* Big 404 */}
        <div className="mb-8">
          <span className="text-[8rem] font-black leading-none gradient-text select-none">
            404
          </span>
        </div>

        <div className="glass rounded-2xl p-8 mb-8">
          <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-orange-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
          <p className="text-slate-400 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
            Concept leakage detected in your URL — let&apos;s get you back on track.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-xl transition-all duration-200 glow-orange-sm"
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-6 py-3 glass hover:bg-slate-700/50 text-slate-300 hover:text-white font-medium rounded-xl transition-all duration-200"
          >
            Back to Login
          </Link>
        </div>

        <p className="mt-8 text-slate-600 text-sm">
          ConceptLeak — ML Data Leakage Detector
        </p>
      </div>
    </main>
  );
}
