"use client";

import { useState, useEffect, useCallback } from "react";
import { EmptyState } from "@/frontend/components/ui/empty-state";
import { ClipboardList, RefreshCw, Store } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/shared/utils/cn";
import { paiseToCurrencyShort } from "@/shared/utils/currency";

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  totalPaise: number;
  customerName: string | null;
  customerPhone: string | null;
  createdAt: string;
  cafe?: { id: string; name: string; slug: string };
}

interface Cafe {
  id: string;
  name: string;
  slug: string;
}

type DatePreset = "today" | "week" | "month" | "all";

const datePresets: { label: string; value: DatePreset }[] = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
];

function getDateRange(preset: DatePreset): { from?: string; to?: string } {
  const now = new Date();
  if (preset === "today") {
    const from = new Date(now);
    from.setHours(0, 0, 0, 0);
    return { from: from.toISOString() };
  }
  if (preset === "week") {
    const from = new Date(now);
    from.setDate(now.getDate() - 6);
    from.setHours(0, 0, 0, 0);
    return { from: from.toISOString() };
  }
  if (preset === "month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: from.toISOString() };
  }
  return {};
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [cafeFilter, setCafeFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchCafes = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cafes");
      const data = await res.json();
      if (data.success) setCafes(data.data);
    } catch {
      console.error("Failed to fetch cafes");
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { from, to } = getDateRange(datePreset);
      const params = new URLSearchParams({ status: "COMPLETED", limit: "500" });
      if (from) params.set("dateFrom", from);
      if (to) params.set("dateTo", to);
      if (cafeFilter !== "ALL") params.set("cafeId", cafeFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
        setTotal(data.data.total ?? data.data.orders.length);
      }
    } catch {
      console.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  }, [datePreset, cafeFilter]);

  useEffect(() => { fetchCafes(); }, [fetchCafes]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.totalPaise, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Completed Orders</h1>
        <Button variant="secondary" size="sm" onClick={fetchOrders}>
          <RefreshCw size={16} className="mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Date presets */}
        <div className="flex items-center gap-1 bg-surface rounded-xl border border-border p-1">
          {datePresets.map((p) => (
            <button
              key={p.value}
              onClick={() => setDatePreset(p.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-100",
                datePreset === p.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Cafe filter */}
        <div className="flex items-center gap-1 bg-surface rounded-xl border border-border p-1 overflow-x-auto">
          <button
            onClick={() => setCafeFilter("ALL")}
            className={cn(
              "flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-100",
              cafeFilter === "ALL"
                ? "bg-primary text-white shadow-sm"
                : "text-muted hover:text-foreground"
            )}
          >
            <Store size={12} />
            All Branches
          </button>
          {cafes.map((c) => (
            <button
              key={c.id}
              onClick={() => setCafeFilter(c.id)}
              className={cn(
                "flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-100",
                cafeFilter === c.id
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      {!loading && orders.length > 0 && (
        <div className="flex items-center gap-6 mb-4 text-sm text-muted">
          <span><strong className="text-foreground">{orders.length}</strong> orders</span>
          <span><strong className="text-foreground">{paiseToCurrencyShort(totalRevenue)}</strong> revenue</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-border animate-pulse">
              <div className="h-4 bg-surface-hover rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={48} />}
          title="No completed orders"
          description="Completed orders will appear here"
        />
      ) : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-background border-b border-border text-xs font-medium text-muted">
            <span>Order #</span>
            <span>Branch</span>
            <span>Customer</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Date & Time</span>
          </div>
          {orders.map((order, i) => (
            <div
              key={order.id}
              className={cn(
                "grid grid-cols-5 gap-4 px-5 py-3.5 text-sm items-center",
                i < orders.length - 1 && "border-b border-border"
              )}
            >
              <span className="font-medium">{order.orderNumber}</span>
              <span className="text-muted truncate">{order.cafe?.name ?? "—"}</span>
              <span className="text-muted truncate">{order.customerName || "Guest"}</span>
              <span className="text-right font-medium">{paiseToCurrencyShort(order.totalPaise)}</span>
              <span className="text-right text-muted text-xs">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: datePreset === "all" ? "numeric" : undefined,
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
