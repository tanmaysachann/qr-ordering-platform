import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/backend/lib/db";
import { comparePassword, hashPassword, isLegacyHash } from "@/backend/lib/utils/password";
import { rateLimit } from "@/backend/lib/rate-limit";
import type { UserRole } from "@/generated/prisma";

declare module "next-auth" {
  interface User {
    role: UserRole;
    cafeId: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      cafeId: string | null;
    };
  }
}

if (!process.env.AUTH_SECRET) {
  // Fail closed in production rather than silently using a derived secret
  if (process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET environment variable is required in production");
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        try {
          const rawEmail = credentials?.email;
          const rawPassword = credentials?.password;
          if (typeof rawEmail !== "string" || typeof rawPassword !== "string") return null;
          if (rawEmail.length > 254 || rawPassword.length > 256) return null;

          const email = rawEmail.trim().toLowerCase();
          if (!email || !rawPassword) return null;

          // ── Rate limit: per-IP and per-account ──
          // request is a standard Request when present
          const ip =
            (request?.headers && (
              request.headers.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
              request.headers.get?.("x-real-ip") ||
              request.headers.get?.("cf-connecting-ip")
            )) || "unknown";

          const ipLimit = rateLimit(`login:ip:${ip}`, { max: 20, windowMs: 15 * 60 * 1000 });
          const acctLimit = rateLimit(`login:acct:${email}`, { max: 8, windowMs: 15 * 60 * 1000 });
          if (!ipLimit.success || !acctLimit.success) {
            // Throwing causes NextAuth to surface a generic error – do not leak which limit fired
            return null;
          }

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user || !user.isActive) {
            // Constant-time-ish: still run a hash compare against a dummy to
            // mitigate user-enumeration via response timing.
            await comparePassword(rawPassword, "scrypt$00$00").catch(() => false);
            return null;
          }

          const isValid = await comparePassword(rawPassword, user.passwordHash);
          if (!isValid) return null;

          // Auto-upgrade legacy SHA-256 hashes to scrypt on successful login
          if (isLegacyHash(user.passwordHash)) {
            try {
              const newHash = await hashPassword(rawPassword);
              await prisma.user.update({
                where: { id: user.id },
                data: { passwordHash: newHash },
              });
            } catch {
              // Non-fatal: auth still succeeds with legacy hash
            }
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            cafeId: user.cafeId,
          };
        } catch (error) {
          // Avoid logging credentials or PII
          if (process.env.NODE_ENV !== "production") {
            console.error("[Auth] Authorize error:", (error as Error)?.message);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.cafeId = user.cafeId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.sub!;
      session.user.role = token.role as UserRole;
      session.user.cafeId = token.cafeId as string | null;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    updateAge: 24 * 60 * 60, // refresh cookie every 24h
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-authjs.session-token"
          : "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  trustHost: true,
});
