"use client";

import { useEffect } from "react";

const CLUB_BODY_CLASS = "esitef-hub-club-de-actualizacion";

export function HubBodyTheme({ theme }: { theme?: string }) {
  useEffect(() => {
    if (theme !== "club-de-actualizacion") return;
    document.body.classList.add(CLUB_BODY_CLASS);
    return () => document.body.classList.remove(CLUB_BODY_CLASS);
  }, [theme]);

  return null;
}
