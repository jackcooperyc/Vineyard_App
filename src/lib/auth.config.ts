import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/generated/prisma/client";
import { parseUserRole } from "@/lib/rbac";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = nextUrl.pathname.startsWith("/login");
      const isApiAuth = nextUrl.pathname.startsWith("/api/auth");
      const isCronApi = nextUrl.pathname.startsWith("/api/cron");

      if (isApiAuth || isCronApi) return true;
      if (isAuthPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/dashboard", nextUrl));
        }
        return true;
      }
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        const role = (user as { role?: UserRole }).role;
        token.role = role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = parseUserRole(token.role as string | undefined) ?? undefined;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
