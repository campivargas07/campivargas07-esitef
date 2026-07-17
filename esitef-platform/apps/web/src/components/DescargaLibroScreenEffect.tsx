"use client";

import { useEffect } from "react";

export function DescargaLibroScreenEffect() {
  useEffect(() => {
    document.body.classList.add("descarga-libro-screen");
    return () => {
      document.body.classList.remove("descarga-libro-screen");
    };
  }, []);
  return null;
}
