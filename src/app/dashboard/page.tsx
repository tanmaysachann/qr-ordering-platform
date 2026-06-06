"use client";

import { useState, useEffect, useCallback } from "react";
import { OrderCard } from "@/frontend/components/dashboard/order-card";
import { useSSE } from "@/frontend/hooks/use-sse";
import { EmptyState } from "@/frontend/components/ui/empty-state";
import { ClipboardList, RefreshCw, Bell } from "lucide-react";
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

export default function DashboardOrdersPage() {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const statuses = filter === "ALL"
        ? "PAID,PREPARING,READY,COMPLETED"
        : filter;

      // Only show today's orders
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const params = new URLSearchParams({
        status: statuses,
        limit: "200",
        dateFrom: todayStart.toISOString(),
      });

      const res = await fetch(`/api/dashboard/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders.map(mapOrder));
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchOrders();
  }, [fetchOrders]);


  // SSE for live updates
  useSSE({
    url: "/api/dashboard/orders/stream",
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
      if (status === "CANCELLED") {
        // Remove cancelled orders from the active view immediately
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status } : o))
        );
      }
    }
  };

  const filteredOrders =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl sm:text-2xl font-bold">Today&apos;s Orders</h1>
          {newOrderAlert && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium animate-pulse">
              <Bell size={14} />
              New Order!
            </div>
          )}
        </div>
        <Button variant="secondary" size="sm" onClick={fetchOrders} className="self-start sm:self-auto">
          <RefreshCw size={16} className="mr-1.5" />
          Refresh
        </Button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto menu-scroll pb-1">
        {statusFilters.map((sf) => (
          <button
            key={sf.value}
            onClick={() => setFilter(sf.value)}
            className={cn(
              "flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-100",
              filter === sf.value
                ? "bg-primary text-white shadow-sm"
                : "bg-surface text-muted border border-border hover:border-primary/30"
            )}
          >
            {sf.label}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
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
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={48} />}
          title="No orders yet"
          description="Orders will appear here in real-time as customers place them"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function mapOrder(o: Record<string, unknown>): DashboardOrder {
  const cafe = o.cafe as Record<string, unknown> | undefined;
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
    cafeName: (o.cafeName ?? cafe?.name) as string | undefined,
    cafeSlug: (o.cafeSlug ?? cafe?.slug) as string | undefined,
    items: (o.items as Record<string, unknown>[]).map((i) => ({
      id: i.id as string,
      itemName: i.itemName as string,
      itemPricePaise: i.itemPricePaise as number,
      quantity: i.quantity as number,
      subtotalPaise: i.subtotalPaise as number,
    })),
  };
}
