"use client";

import type { ReactNode } from "react";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">{children}</div>
  );
}
