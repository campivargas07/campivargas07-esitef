import { Suspense } from "react";
import LoginPage from "./page";

export default function LoginPageWrapper() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  );
}
