"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import type { OrderSummary } from "@/shared/types";
import type { OrderStatus } from "@/generated/prisma";
import { paiseToCurrencyShort } from "@/shared/utils/currency";
import { CheckCircle2, Clock, ChefHat, Package, XCircle, Receipt } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface OrderStatusTrackerProps {
  orderId: string;
}

const statusSteps: { status: OrderStatus; label: string; sublabel: string; icon: React.ReactNode }[] = [
  { status: "PAID", label: "Order Confirmed", sublabel: "Payment received", icon: <CheckCircle2 size={20} /> },
  { status: "PREPARING", label: "Preparing", sublabel: "Your food is being made", icon: <ChefHat size={20} /> },
  { status: "READY", label: "Ready for Pickup", sublabel: "Head to the counter", icon: <Package size={20} /> },
  { status: "COMPLETED", label: "Picked Up", sublabel: "Enjoy your meal!", icon: <CheckCircle2 size={20} /> },
];

const statusOrder: OrderStatus[] = ["PAID", "PREPARING", "READY", "COMPLETED"];

export function OrderStatusTracker({ orderId }: OrderStatusTrackerProps) {
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const prevStatusRef = useRef<string | null>(null);
  const [readyAlert, setReadyAlert] = useState(false);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const fireReadyNotification = useCallback((orderNumber: string) => {
    // Visual alert on the page
    setReadyAlert(true);

    // Play sound
    try {
      const audio = new Audio("/notification.mp3");
      audio.play().catch(() => {});
    } catch {}

    // Browser notification (works even if tab is in background)
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("Order Ready! 🎉", {
        body: `Your order #${orderNumber} is ready for pickup!`,
        icon: "/favicon.ico",
        tag: `order-ready-${orderId}`,
      });
    }
  }, [orderId]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/status`);
        const data = await res.json();

        if (data.success) {
          const newStatus = data.data.status;
          const prevStatus = prevStatusRef.current;

          // Fire notification when status transitions to READY
          if (newStatus === "READY" && prevStatus !== null && prevStatus !== "READY") {
            fireReadyNotification(data.data.orderNumber);
          }

          prevStatusRef.current = newStatus;
          setOrder(data.data);
          if (["COMPLETED", "CANCELLED", "FAILED"].includes(newStatus)) {
            clearInterval(interval);
          }
        } else {
          setError("Order not found");
        }
      } catch {
        setError("Failed to load order status");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    interval = setInterval(fetchStatus, 5000);

    return () => clearInterval(interval);
  }, [orderId, fireReadyNotification]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-fade-in-up">
          <div className="w-14 h-14 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted font-medium">Loading order status...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <XCircle size={32} className="text-danger" />
          </div>
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-muted">{error || "Could not load order"}</p>
        </div>
      </div>
    );
  }

  const isFailed = order.status === "FAILED" || order.status === "CANCELLED";
  const currentStepIndex = statusOrder.indexOf(order.status as OrderStatus);
  const isPaymentPending = order.status === "PAYMENT_PENDING" || order.status === "CREATED";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className={cn(
          "absolute inset-0",
          isFailed
            ? "bg-gradient-to-br from-red-500 to-rose-700"
            : isPaymentPending
              ? "bg-gradient-to-br from-amber-500 to-orange-600"
              : "bg-gradient-to-br from-amber-700 via-orange-800 to-stone-900"
        )} />
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <div className="relative px-5 pt-10 pb-14 text-center text-white">
          {isFailed ? (
            <div className="animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
                <XCircle size={36} />
              </div>
              <h1 className="text-xl font-bold mb-1">
                {order.status === "CANCELLED" ? "Order Cancelled" : "Payment Failed"}
              </h1>
              <p className="text-sm text-white/80">Please try placing a new order</p>
            </div>
          ) : isPaymentPending ? (
            <div className="animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
                <Clock size={36} className="animate-pulse" />
              </div>
              <h1 className="text-xl font-bold mb-1">Confirming Payment...</h1>
              <p className="text-sm text-white/80">Please wait while we verify your payment</p>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <div className="w-16 h-16 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={36} />
              </div>
              <h1 className="text-2xl font-extrabold mb-1">Order #{order.orderNumber}</h1>
              <div className="inline-flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 text-sm font-medium mt-1">
                {statusSteps[currentStepIndex]?.icon}
                <span>{statusSteps[currentStepIndex]?.label || order.status}</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-5 bg-background rounded-t-[24px]" />
      </div>

      {/* Ready Alert Banner */}
      {readyAlert && order.status === "READY" && (
        <div className="px-5 -mt-3 mb-3 animate-fade-in-up">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <Package size={20} className="text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-800 text-sm">Your order is ready! 🎉</p>
              <p className="text-xs text-green-600">Please head to the counter to pick it up</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Progress */}
      {!isFailed && !isPaymentPending && currentStepIndex >= 0 && (
        <div className="px-5 -mt-3 mb-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-sm">
            <div className="space-y-0">
              {statusSteps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isLast = index === statusSteps.length - 1;

                return (
                  <div key={step.status}>
                    <div className="flex items-center gap-4">
                      {/* Icon circle */}
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200",
                          isCurrent
                            ? "bg-primary text-white shadow-md shadow-primary/25"
                            : isActive
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-muted/40"
                        )}
                      >
                        {step.icon}
                      </div>
                      {/* Text */}
                      <div className="flex-1">
                        <p
                          className={cn(
                            "text-sm font-semibold",
                            isActive ? "text-foreground" : "text-muted/60"
                          )}
                        >
                          {step.label}
                        </p>
                        <p className={cn(
                          "text-xs",
                          isActive ? "text-muted" : "text-muted/40"
                        )}>
                          {step.sublabel}
                        </p>
                      </div>
                      {/* Current indicator */}
                      {isCurrent && (
                        <span className="text-[11px] text-primary font-bold bg-amber-50 px-2.5 py-1 rounded-full animate-progress-pulse">
                          NOW
                        </span>
                      )}
                      {isActive && !isCurrent && (
                        <CheckCircle2 size={16} className="text-primary" />
                      )}
                    </div>
                    {/* Connector line */}
                    {!isLast && (
                      <div className="ml-5 pl-[1px] py-1">
                        <div className={cn(
                          "w-[2px] h-6 rounded-full ml-[1px]",
                          isActive ? "bg-amber-200" : "bg-slate-200"
                        )} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Order Details */}
      <div className="px-5 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface-hover/50 border-b border-border">
            <Receipt size={14} className="text-primary" />
            <h2 className="font-semibold text-sm">Order Details</h2>
          </div>
          <div className="p-4 space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted">
                  <span className="font-medium text-foreground">{item.quantity}x</span>{" "}
                  {item.itemName}
                </span>
                <span className="font-medium">
                  {paiseToCurrencyShort(item.subtotalPaise)}
                </span>
              </div>
            ))}
            {order.notes && (
              <p className="mt-2 pt-2 border-t border-dashed border-border text-xs text-muted italic">
                Note: {order.notes}
              </p>
            )}
            <div className="pt-3 mt-2 border-t border-border flex justify-between items-center">
              <span className="font-bold">Total Paid</span>
              <span className="font-extrabold text-lg text-foreground">
                {paiseToCurrencyShort(order.totalPaise)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="px-5 mt-5 pb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="text-center text-xs text-muted space-y-1">
          <p className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            This page auto-refreshes every 5 seconds
          </p>
          {order.customerName && (
            <p>Order for: <strong className="text-foreground">{order.customerName}</strong></p>
          )}
        </div>
      </div>
    </div>
  );
}
