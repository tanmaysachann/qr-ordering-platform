"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { OrderCard } from "@/frontend/components/dashboard/order-card";
import { useSSE } from "@/frontend/hooks/use-sse";
import { EmptyState } from "@/frontend/components/ui/empty-state";
import { ClipboardList, RefreshCw, Bell, Store } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { cn } from "@/shared/utils/cn";
import type { DashboardOrder } from "@/shared/types";
import type { OrderStatus } from "@/generated/prisma";

const statusFilters: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All Active", value: "ALL" },
  { label: "Preparing", value: "PREPARING" },
  { label: "Ready", value: "READY" },
  { label: "Completed", value: "COMPLETED" },
];

const BRANCH_ALL = "ALL";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");
  const [branchFilter, setBranchFilter] = useState<string>(BRANCH_ALL);
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const statuses = statusFilter === "ALL"
        ? "PAID,PREPARING,READY,COMPLETED"
        : statusFilter;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const params = new URLSearchParams({
        status: statuses,
        limit: "500",
        dateFrom: todayStart.toISOString(),
      });

      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders.map(mapOrder));
      }
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);

  useSSE({
    url: "/api/admin/orders/stream",
    events: ["new_order", "order_updated"],
    onMessage: (event, data) => {
      const payload = data as { order: DashboardOrder };
      if (event === "new_order") {
        setOrders((prev) => [payload.order, ...prev]);
        setNewOrderAlert(true);
        try {
          const audio = new Audio("/notification.mp3");
          audio.play().catch(() => {});
        } catch {}
        setTimeout(() => setNewOrderAlert(false), 3000);
      } else if (event === "order_updated") {
        setOrders((prev) =>
          prev.map((o) => (o.id === payload.order.id ? payload.order : o))
        );
      }
    },
  });

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    const res = await fetch(`/api/dashboard/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      );
    }
  };

  // Branches present in the current orders list
  const branches = useMemo(() => {
    const map = new Map<string, string>();
    orders.forEach((o) => {
      if (o.cafeId && o.cafeName) map.set(o.cafeId, o.cafeName);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [orders]);

  const visibleOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "ALL" && o.status !== statusFilter) return false;
      if (branchFilter !== BRANCH_ALL && o.cafeId !== branchFilter) return false;
      return true;
    });
  }, [orders, statusFilter, branchFilter]);

  // Group by branch for segregated view
  const groupedOrders = useMemo(() => {
    const groups = new Map<string, { cafeId: string; cafeName: string; orders: DashboardOrder[] }>();
    visibleOrders.forEach((o) => {
      const key = o.cafeId || "unknown";
      const name = o.cafeName || "Unknown Branch";
      if (!groups.has(key)) groups.set(key, { cafeId: key, cafeName: name, orders: [] });
      groups.get(key)!.orders.push(o);
    });
    return Array.from(groups.values()).sort((a, b) => a.cafeName.localeCompare(b.cafeName));
  }, [visibleOrders]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">All Branch Orders</h1>
          {newOrderAlert && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              <Bell size={14} />
              New Order!
            </div>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={fetchOrders}>
          <RefreshCw size={16} className="mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Branch Filter Tabs */}
      <div className="flex gap-2 mb-3 overflow-x-auto menu-scroll pb-1">
        <button
          onClick={() => setBranchFilter(BRANCH_ALL)}
          className={cn(
            "flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-100",
            branchFilter === BRANCH_ALL
              ? "bg-primary text-white shadow-sm"
              : "bg-surface text-muted border border-border hover:border-primary/30"
          )}
        >
          <Store size={14} />
          All Branches
          <span className="ml-1 text-[11px] opacity-80">({orders.length})</span>
        </button>
        {branches.map((b) => {
          const count = orders.filter((o) => o.cafeId === b.id).length;
          return (
            <button
              key={b.id}
              onClick={() => setBranchFilter(b.id)}
              className={cn(
                "flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-100",
                branchFilter === b.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-surface text-muted border border-border hover:border-primary/30"
              )}
            >
              {b.name}
              <span className="ml-1 text-[11px] opacity-80">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto menu-scroll pb-1">
        {statusFilters.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setStatusFilter(sf.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-100",
              statusFilter === sf.value
                ? "bg-primary text-white shadow-sm"
                : "bg-surface text-muted border border-border hover:border-primary/30"
            )}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border p-4 animate-pulse">
              <div className="h-4 bg-surface-hover rounded w-1/3 mb-3" />
              <div className="h-3 bg-surface-hover rounded w-2/3 mb-2" />
              <div className="h-3 bg-surface-hover rounded w-1/2 mb-4" />
              <div className="h-16 bg-surface-hover rounded mb-3" />
              <div className="h-8 bg-surface-hover rounded" />
            </div>
          ))}
        </div>
      ) : visibleOrders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={48} />}
          title="No orders yet"
          description="Orders from all branches will appear here in real-time."
        />
      ) : branchFilter === BRANCH_ALL ? (
        <div className="space-y-8">
          {groupedOrders.map((group) => (
            <div key={group.cafeId}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Store size={16} />
                </div>
                <h2 className="text-lg font-semibold">{group.cafeName}</h2>
                <span className="text-xs text-muted bg-surface rounded-full px-2.5 py-0.5 font-medium border border-border">
                  {group.orders.length} order{group.orders.length === 1 ? "" : "s"}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent ml-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {group.orders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={handleStatusUpdate}
                    showBranch
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {visibleOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
              showBranch
            />
          ))}
        </div>
      )}
    </div>
  );
}

function mapOrder(o: Record<string, unknown>): DashboardOrder {
  const cafe = o.cafe as { id: string; name: string; slug: string } | undefined;
  return {
    id: o.id as string,
    orderNumber: o.orderNumber as string,
    status: o.status as OrderStatus,
    totalPaise: o.totalPaise as number,
    customerName: o.customerName as string | null,
    customerPhone: o.customerPhone as string | null,
    notes: o.notes as string | null,
    createdAt: o.createdAt as string,
    updatedAt: o.updatedAt as string,
    cafeId: cafe?.id ?? (o.cafeId as string | undefined),
    cafeName: cafe?.name,
    cafeSlug: cafe?.slug,
    items: (o.items as Record<string, unknown>[]).map((i) => ({
      id: i.id as string,
      itemName: i.itemName as string,
      itemPricePaise: i.itemPricePaise as number,
      quantity: i.quantity as number,
      subtotalPaise: i.subtotalPaise as number,
    })),
  };
}
