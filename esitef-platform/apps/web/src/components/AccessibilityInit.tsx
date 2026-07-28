"use client";

import { useEffect } from "react";
import { A11Y_COOKIE, applyA11yToDocument, parseA11yCookie } from "@/lib/accessibility";

type Props = {
  cookieValue?: string | null;
  previewDark?: boolean;
};

function readCookie() {
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${A11Y_COOKIE}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(A11Y_COOKIE.length + 1));
}

export function AccessibilityInit({ cookieValue, previewDark }: Props) {
  useEffect(() => {
    applyA11yToDocument(parseA11yCookie(cookieValue ?? readCookie()));
  }, [cookieValue, previewDark]);

  return null;
}
