"use client";

import { signOut } from "next-auth/react";

type Props = {
  className?: string;
  onSignedOut?: () => void;
};

export function SignOutButton({ className, onSignedOut }: Props) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onSignedOut?.();
        void signOut({ callbackUrl: "/" });
      }}
    >
      Cerrar sesión
    </button>
  );
}
