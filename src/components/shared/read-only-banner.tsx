import { auth } from "@/lib/auth";
import { parseUserRole } from "@/lib/rbac";

export async function ReadOnlyBanner() {
  const session = await auth();
  const role = parseUserRole(session?.user?.role);
  if (role !== "READ_ONLY") return null;

  return (
    <div
      className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100"
      role="status"
    >
      Read-only access — you can view records but cannot make changes.
    </div>
  );
}
