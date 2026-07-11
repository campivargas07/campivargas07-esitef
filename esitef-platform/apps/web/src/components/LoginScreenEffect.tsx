"use client";

import { useEffect } from "react";

export function LoginScreenEffect() {
  useEffect(() => {
    document.body.classList.add("login-screen");
    return () => {
      document.body.classList.remove("login-screen");
    };
  }, []);
  return null;
}
