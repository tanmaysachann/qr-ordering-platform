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
  Menu as MenuIcon,
  X,
  Users,
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

  const navigation = isAdmin
    ? [
        { name: "All Cafes", href: "/admin", icon: LayoutDashboard },
        { name: "All Orders", href: "/admin/orders", icon: ClipboardList },
        { name: "Menu", href: "/admin/menu", icon: UtensilsCrossed },
      ]
    : [
        { name: "Orders", href: "/dashboard", icon: ClipboardList },
        { name: "Menu", href: "/dashboard/menu", icon: UtensilsCrossed },
        { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
        { name: "Staff", href: "/dashboard/staff", icon: Users },
      ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-md flex items-center justify-center">
                <Coffee size={13} className="text-white" />
              </div>
              <span className="font-bold text-sm text-white">Cafe<span className="text-amber-400">Order</span></span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium text-slate-200">{user.name}</p>
            <p className="text-[10px] text-slate-500">{user.role.replace("_", " ")}</p>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform flex flex-col lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:z-auto",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {/* Logo */}
          <div className="hidden lg:flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-900/40">
              <Coffee size={17} className="text-white" />
            </div>
            <span className="font-bold text-lg text-white">
              Cafe<span className="text-amber-400">Order</span>
            </span>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-amber-400">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-100 truncate">{user.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
            <span className="inline-block mt-3 text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium tracking-wide">
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
                      ? "bg-gradient-to-r from-amber-600/90 to-orange-600/90 text-white shadow-md shadow-orange-900/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  )}
                >
                  <item.icon size={17} className={isActive ? "text-white" : "text-slate-500"} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-slate-800">
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full rounded-xl"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
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
