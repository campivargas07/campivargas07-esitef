"use client";

import { useEffect } from "react";

export function ContactoScreenEffect() {
  useEffect(() => {
    document.body.classList.add("contacto-screen");
    return () => {
      document.body.classList.remove("contacto-screen");
    };
  }, []);
  return null;
}
