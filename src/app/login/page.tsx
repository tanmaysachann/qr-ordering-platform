"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Coffee, LogIn } from "lucide-react";

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
            <Coffee size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold">
            Cafe<span className="text-primary">Order</span>
          </h1>
          <p className="text-muted text-sm mt-1">Staff & Admin Login</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-border p-6 space-y-4 shadow-sm">
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
            <div className="bg-red-50 text-danger text-sm p-3 rounded-xl border border-red-200">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            <LogIn size={18} className="mr-2" />
            Sign In
          </Button>

          <p className="text-xs text-center text-muted pt-1">
            Forgot your password? Contact your administrator.
          </p>
        </form>
      </div>
    </div>
  );
}
