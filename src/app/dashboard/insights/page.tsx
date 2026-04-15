import type { Metadata } from "next";
import { Suspense } from "react";
import InsightsClient from "@/components/insights/InsightsClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = { title: "Insights" };

export default function InsightsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 text-orange-400 animate-spin" /></div>}>
      <InsightsClient />
    </Suspense>
  );
}
