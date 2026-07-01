import { auth } from "@/lib/auth";
import { getVineyardName } from "@/domains/blocks/queries";
import { SidebarNav, BottomNav } from "@/components/shared/app-nav";
import { SignOutButton } from "@/components/shared/sign-out-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, vineyardName] = await Promise.all([auth(), getVineyardName()]);

  return (
    <div className="flex min-h-screen flex-1">
      <SidebarNav />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex min-h-14 items-center justify-between gap-4 px-4 md:px-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground md:hidden">
                Cooper Estate
              </p>
              <h1 className="text-sm font-semibold md:text-base">
                {vineyardName}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              {session?.user?.name && (
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  {session.user.name}
                </span>
              )}
              <SignOutButton />
            </div>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 pb-24 md:px-6 md:pb-6">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
