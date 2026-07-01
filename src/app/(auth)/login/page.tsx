import { Suspense } from "react";
import { LoginForm } from "@/components/shared/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-emerald-50/80 to-background px-4 py-12">
      <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-xl bg-muted" />}>
        <LoginForm />
      </Suspense>
      <p className="mt-8 max-w-sm text-center text-xs text-muted-foreground">
        Cooper Estate Vineyards · Red Mountain, Washington
      </p>
    </main>
  );
}
