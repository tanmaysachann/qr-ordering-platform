"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/frontend/components/ui/theme-toggle";

function ScanPayMark() {
  return (
    <div className="flex items-center gap-2.5 justify-center">
      <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M3.5 7V3.5H7"     stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 7V3.5H13"   stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.5 13V16.5H7"   stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16.5 13V16.5H13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="10" r="1.6" fill="white"/>
        </svg>
      </div>
      <span className="font-bold text-xl tracking-tight text-foreground">
        Scan<span className="text-primary">&amp;</span>Pay
      </span>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("[Login] signIn result:", result);

      if (result?.error) {
        setError(
          result.error === "db_unavailable"
            ? "Database unavailable. Please try again in a moment."
            : "Invalid email or password"
        );
      } else {
        const session = await getSession();
        const dest = session?.user?.role === "SUPER_ADMIN" ? "/admin" : "/dashboard";
        router.push(dest);
        router.refresh();
      }
    } catch (err) {
      console.error("[Login] signIn error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 500,
          height: 500,
          top: "30%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "radial-gradient(circle, rgba(14,165,233,0.10) 0%, transparent 70%)",
          borderRadius: "50%",
        }}
      />
      {/* Noise overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <ScanPayMark />
          <p className="text-muted text-sm mt-3 uppercase tracking-wider font-medium">
            Staff &amp; Admin Login
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-panel-landing rounded-2xl p-7 space-y-5">
          <Input
            id="email"
            label="Email"
            type="email"
            placeholder="you@cafe.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <div className="bg-danger/10 text-danger text-sm p-3.5 rounded-xl border border-danger/30 flex items-start gap-2">
              <span className="font-bold flex-shrink-0">!</span>
              <span>{error}</span>
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading} onClick={handleSubmit}>
            <LogIn size={16} className="mr-2" />
            Sign In
          </Button>

          <p className="text-xs text-center text-muted pt-1">
            Forgot your password? Contact your administrator.
          </p>
        </div>

        {/* Theme toggle + back link */}
        <div className="flex items-center justify-between mt-5">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors group">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="group-hover:-translate-x-0.5 transition-transform">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Home
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
