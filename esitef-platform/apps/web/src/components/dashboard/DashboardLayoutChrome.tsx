"use client";

import { useEffect } from "react";

export function DashboardLayoutChrome({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("dashboard-route");
    return () => document.body.classList.remove("dashboard-route");
  }, []);

  return <>{children}</>;
}
