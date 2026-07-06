"use client";

import { Toaster as Sonner } from "sonner";

export function AppToaster() {
  return (
    <Sonner
      position="top-center"
      offset="4.5rem"
      mobileOffset={{ top: "4.5rem" }}
      toastOptions={{
        classNames: {
          toast:
            "group toast border-border bg-background text-foreground shadow-lg",
          title: "font-semibold",
          description: "text-muted-foreground",
          success: "border-emerald-200 dark:border-emerald-900/50",
        },
      }}
    />
  );
}
