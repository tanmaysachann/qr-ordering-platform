"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Coffee,
  ClipboardList,
  UtensilsCrossed,
  LayoutDashboard,
  BarChart3,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useState } from "react";
import type { UserRole } from "@/generated/prisma";

interface DashboardShellProps {
  user: { name: string; role: UserRole; email: string; cafeId: string | null };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAdmin = user.role === "SUPER_ADMIN";

  const navigation = [
    { name: "Orders", href: "/dashboard", icon: ClipboardList },
    { name: "Menu", href: "/dashboard/menu", icon: UtensilsCrossed },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ...(isAdmin
      ? [
          { name: "All Cafes", href: "/admin", icon: LayoutDashboard },
          { name: "All Orders", href: "/admin/orders", icon: ClipboardList },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-surface border-b border-border sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-surface-hover rounded-lg"
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div className="flex items-center gap-2">
              <Coffee size={20} className="text-primary" />
              <span className="font-bold text-sm">CafeOrder</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium">{user.name}</p>
            <p className="text-[10px] text-muted">{user.role.replace("_", " ")}</p>
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
          <div className="hidden lg:flex items-center gap-2 px-5 py-5 border-b border-border">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Coffee size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg">
              Cafe<span className="text-primary">Order</span>
            </span>
          </div>

          {/* User Info */}
          <div className="px-5 py-4 border-b border-border">
            <p className="font-semibold text-sm">{user.name}</p>
            <p className="text-xs text-muted">{user.email}</p>
            <span className="inline-block mt-1 text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {user.role.replace("_", " ")}
            </span>
          </div>

          {/* Navigation */}
          <nav className="px-3 py-4 space-y-1 flex-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-100",
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted hover:bg-surface-hover hover:text-foreground"
                  )}
                >
                  <item.icon size={18} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-border">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted hover:text-danger transition-colors w-full rounded-lg hover:bg-surface-hover"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen lg:min-w-0">
          <div className="p-4 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
