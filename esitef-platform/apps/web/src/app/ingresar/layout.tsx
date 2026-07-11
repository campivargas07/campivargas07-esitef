import "@/styles/auth.css";
import { LoginScreenEffect } from "@/components/LoginScreenEffect";
import { Suspense } from "react";

export default function IngresarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LoginScreenEffect />
      <Suspense>{children}</Suspense>
    </>
  );
}
