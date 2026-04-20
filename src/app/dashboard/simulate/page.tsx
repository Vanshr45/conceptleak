import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import SimulateClient from "@/components/simulate/SimulateClient";

export const metadata: Metadata = { title: "Train Risk Simulator" };

export default function SimulatePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
        </div>
      }
    >
      <SimulateClient />
    </Suspense>
  );
}
