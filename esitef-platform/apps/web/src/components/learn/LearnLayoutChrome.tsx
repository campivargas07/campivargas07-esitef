"use client";

import { useEffect } from "react";

export function LearnLayoutChrome({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("learn-route");
    return () => document.body.classList.remove("learn-route");
  }, []);

  return <>{children}</>;
}
