"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ClipboardList,
  UtensilsCrossed,
  LayoutDashboard,
  BarChart3,
  LogOut,
  Menu as MenuIcon,
  X,
  Users,
  Sun,
  Moon,
  Sparkles,
  ExternalLink,
  QrCode,
} from "lucide-react";
import { CafeQRModal } from "@/frontend/components/admin/cafe-qr-modal";

function BrandLogo({ size = 24 }: { size?: number }) {
  const inner = Math.round(size * 0.57);
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-lg bg-primary flex items-center justify-center flex-shrink-0"
    >
      <svg width={inner} height={inner} viewBox="0 0 20 20" fill="none" aria-hidden>
        <path d="M3.5 7V3.5H7"     stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.5 7V3.5H13"   stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.5 13V16.5H7"   stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16.5 13V16.5H13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="10" r="1.6" fill="white"/>
      </svg>
    </div>
  );
}
import { cn } from "@/shared/utils/cn";
import { useState, useEffect } from "react";
import { useTheme } from "@/frontend/hooks/use-theme";
import type { UserRole } from "@/generated/prisma";

interface DashboardShellProps {
  user: { name: string; role: UserRole; email: string; cafeId: string | null };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const isAdmin = user.role === "SUPER_ADMIN";

  const [qrOpen, setQrOpen] = useState(false);
  const [cafeInfo, setCafeInfo] = useState<{ name: string; slug: string } | null>(null);

  useEffect(() => {
    if (!isAdmin && user.cafeId) {
      fetch("/api/dashboard/cafe")
        .then((r) => r.json())
        .then((d) => { if (d.success) setCafeInfo(d.data); });
    }
  }, [isAdmin, user.cafeId]);

  const navigation = isAdmin
    ? [
        { name: "All Cafes", href: "/admin", icon: LayoutDashboard },
        { name: "All Orders", href: "/admin/orders", icon: ClipboardList },
        { name: "Menu", href: "/admin/menu", icon: UtensilsCrossed },
        { name: "Deep Insights", href: "/admin/insights", icon: Sparkles },
      ]
    : [
        { name: "Orders", href: "/dashboard", icon: ClipboardList },
        { name: "Menu", href: "/dashboard/menu", icon: UtensilsCrossed },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Deep Insights", href: "/dashboard/insights", icon: Sparkles },
        { name: "Staff", href: "/dashboard/staff", icon: Users },
      ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-surface border-b border-border sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <BrandLogo size={22} />
              <span className="font-bold text-sm">Scan<span className="text-primary">&amp;</span>Pay</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-1.5 text-muted hover:text-foreground hover:bg-surface-hover rounded-lg transition-colors"
              title={dark ? "Switch to light mode" : "Switch to dark mode"}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="text-right">
              <p className="text-xs font-medium">{user.name}</p>
              <p className="text-[10px] text-muted">{user.role.replace("_", " ")}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform flex flex-col lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Logo */}
          <div className="hidden lg:flex items-center justify-between px-5 py-5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <BrandLogo size={28} />
              <span className="font-bold text-lg">
                Scan<span className="text-primary">&amp;</span>Pay
              </span>
            </div>
            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-surface-hover transition-colors"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-[11px] text-muted truncate">{user.email}</p>
              </div>
            </div>
            <span className="inline-block mt-3 text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-medium tracking-wide">
              {user.role.replace("_", " ")}
            </span>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-4 space-y-0.5 flex-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-100",
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/25"
                      : "text-muted hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  <item.icon size={17} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Owner-only quick actions */}
          {!isAdmin && cafeInfo && (
            <div className="px-3 pb-2 space-y-2">
              <a
                href={`/${cafeInfo.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-surface-hover transition-colors w-full rounded-xl border border-border"
              >
                <ExternalLink size={16} />
                Customer View
              </a>
              <button
                onClick={() => setQrOpen(true)}
                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors w-full rounded-xl border border-primary/20"
              >
                <QrCode size={16} />
                My QR Code
              </button>
            </div>
          )}

          {/* Logout */}
          <div className="p-3 border-t border-border">
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted hover:text-danger hover:bg-red-500/10 transition-colors w-full rounded-xl"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:min-w-0">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>

      {/* QR Modal — rendered at root so it isn't constrained by sidebar transform */}
      {cafeInfo && (
        <CafeQRModal
          isOpen={qrOpen}
          onClose={() => setQrOpen(false)}
          cafeName={cafeInfo.name}
          cafeSlug={cafeInfo.slug}
        />
      )}
    </div>
  );
}
