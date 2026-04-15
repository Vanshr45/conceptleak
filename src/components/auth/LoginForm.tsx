"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, LogIn, Loader2, AlertCircle, UserPlus } from "lucide-react";

const GOOGLE_ERRORS: Record<string, string> = {
  google_denied: "Google sign-in was cancelled.",
  google_not_configured: "Google Sign-In is not set up on this server.",
  google_token_failed: "Failed to verify Google credentials. Please try again.",
  google_no_email: "Google did not provide an email address.",
  google_failed: "Google sign-in failed. Please try again.",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewAccount, setIsNewAccount] = useState(false);

  // Show errors that come back from Google OAuth redirect
  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (oauthError && GOOGLE_ERRORS[oauthError]) {
      setError(GOOGLE_ERRORS[oauthError]);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsNewAccount(false);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        return;
      }

      // If this looks like a brand-new registration, show a brief message
      // (the server auto-registers on first login)
      setIsNewAccount(true);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 600);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignIn() {
    setGoogleLoading(true);
    // Full-page redirect to our Google OAuth initiation route
    window.location.href = "/api/auth/google";
  }

  return (
    <div className="glass rounded-2xl p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Welcome back</h2>
        <p className="text-slate-400 text-sm mt-1">
          Sign in or create a new account
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl mb-5 text-red-400 text-sm animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* New account confirmation */}
      {isNewAccount && !error && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl mb-5 text-emerald-400 text-sm animate-fade-in">
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>Account created! Redirecting to dashboard…</span>
        </div>
      )}

      {/* Google Sign-In */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/5 hover:bg-white/10 border border-slate-600/50 hover:border-slate-500 rounded-xl text-white font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-5"
      >
        {googleLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 shrink-0" width={18} height={18}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        )}
        {googleLoading ? "Redirecting to Google…" : "Continue with Google"}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-slate-700/60" />
        <span className="text-slate-600 text-xs font-medium">or continue with email</span>
        <div className="flex-1 h-px bg-slate-700/60" />
      </div>

      {/* Email / password form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200 text-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              autoComplete="current-password"
              className="w-full px-4 py-3 pr-12 bg-slate-800/60 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-200 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-slate-600 text-xs mt-1.5">
            New to ConceptLeak? Just enter any email + password to create an account.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 glow-orange-sm text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Sign In / Create Account
            </>
          )}
        </button>
      </form>
    </div>
  );
}
