"use client";

import { useEffect } from "react";
import { A11Y_COOKIE, applyA11yToDocument, parseA11yCookie } from "@/lib/accessibility";

type Props = {
  cookieValue?: string | null;
};

function readCookie() {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${A11Y_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(A11Y_COOKIE.length + 1));
}

export function AccessibilityInit({ cookieValue }: Props) {
  useEffect(() => {
    applyA11yToDocument(parseA11yCookie(cookieValue ?? readCookie()));

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const prefs = parseA11yCookie(readCookie());
      if (prefs.theme === "system") applyA11yToDocument(prefs);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [cookieValue]);

  return null;
}
