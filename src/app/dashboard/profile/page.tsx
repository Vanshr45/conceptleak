import type { Metadata } from "next";
import Image from "next/image";
import { getSession } from "@/lib/auth";
import { getAllDatasets, getInsights } from "@/lib/store";
import { getUserById } from "@/lib/users";
import { User, Mail, Shield, Database, Calendar, Zap } from "lucide-react";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const session = await getSession();
  const userId = session!.sub;
  const storedUser = await getUserById(userId);

  const datasets = await getAllDatasets(userId);
  const allInsights = (await Promise.all(datasets.map((d) => getInsights(userId, d.id)))).flat();
  const criticalCount = allInsights.filter((i) => i.riskLevel === "CRITICAL").length;

  const authType = storedUser?.authType ?? session?.authType ?? "email";
  const picture = storedUser?.picture ?? session?.picture;
  const memberSince = storedUser?.createdAt
    ? new Date(storedUser.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Profile card */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-5 mb-6">
          {/* Avatar */}
          <div className="w-16 h-16 shrink-0 relative">
            {picture ? (
              <Image
                src={picture}
                alt={session!.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-orange-500/30"
              />
            ) : (
              <div className="w-16 h-16 bg-orange-500/20 border-2 border-orange-500/30 rounded-2xl flex items-center justify-center text-orange-400 text-2xl font-bold">
                {session!.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-white">{session!.name}</h2>
            <p className="text-slate-400 text-sm">{session!.email}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2 py-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                Active
              </span>
              {authType === "google" ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-blue-300 bg-blue-500/10 border border-blue-500/20 rounded-full px-2 py-0.5">
                  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-700/40 border border-slate-600/30 rounded-full px-2 py-0.5">
                  <Mail className="w-3 h-3" />
                  Email / Password
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: Mail, label: "Email", value: session!.email, color: "text-blue-400" },
            { icon: User, label: "Display Name", value: session!.name, color: "text-purple-400" },
            {
              icon: Shield,
              label: "Auth Method",
              value: authType === "google" ? "Google Sign-In" : "Email / Password",
              color: "text-emerald-400",
            },
            { icon: Calendar, label: "Member Since", value: memberSince, color: "text-amber-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
              <p className="text-sm text-white font-medium truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Activity summary */}
      <div className="glass rounded-2xl p-6">
        <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-orange-400" />
          Activity Summary
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Datasets", value: datasets.length, color: "text-blue-400" },
            { label: "Issues Found", value: allInsights.length, color: "text-orange-400" },
            { label: "Critical", value: criticalCount, color: "text-red-400" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-slate-800/40 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent datasets */}
      {datasets.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-400" />
            Recent Datasets
          </h3>
          <div className="space-y-2">
            {datasets.slice(0, 5).map((ds) => (
              <div key={ds.id} className="flex items-center gap-3 py-2 border-b border-slate-700/30 last:border-0">
                <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <p className="text-sm text-slate-300 flex-1 truncate">{ds.name}</p>
                <p className="text-xs text-slate-500">{ds.size}</p>
                <span className="text-xs font-medium text-orange-400">{ds.riskScore}/100</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
