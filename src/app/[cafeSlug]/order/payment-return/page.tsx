"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react";

export default function PaymentReturnPage({
  params: paramsPromise,
}: {
  params: Promise<{ cafeSlug: string }>;
}) {
  const [cafeSlug, setCafeSlug] = useState<string>("");
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const reconciled = useRef(false);

  useEffect(() => {
    paramsPromise.then((p) => setCafeSlug(p.cafeSlug));
  }, [paramsPromise]);

  useEffect(() => {
    if (!cafeSlug) return;
    if (reconciled.current) return;
    reconciled.current = true;

    // Get transaction info from URL params (set by PhonePe redirect)
    const txnId = searchParams.get("txn");
    const orderId = searchParams.get("orderId") || sessionStorage.getItem("pending_order_id");

    if (!orderId) {
      setStatus("failed");
      return;
    }

    const reconcileAndCheck = async () => {
      try {
        // Step 1: Trigger server-side reconciliation with PhonePe
        if (txnId) {
          await fetch(`/api/orders/${orderId}/reconcile`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ merchantTransactionId: txnId }),
          });
        }

        // Step 2: Poll the order status until it reaches a terminal state
        await pollOrderStatus(orderId);
      } catch {
        setStatus("failed");
      }
    };

    const pollOrderStatus = async (oid: string, attempts = 0): Promise<void> => {
      if (attempts > 15) {
        // 15 attempts * 2s = 30s max
        setStatus("failed");
        return;
      }

      try {
        const res = await fetch(`/api/orders/${oid}/status`);
        const data = await res.json();

        if (!data.success) {
          setStatus("failed");
          return;
        }

        const orderStatus = data.data.status;

        if (["PAID", "PREPARING", "READY", "COMPLETED"].includes(orderStatus)) {
          setStatus("success");
          sessionStorage.removeItem("pending_order_id");
          // Clear cart
          try { localStorage.removeItem("cart-storage"); } catch {}
          // Redirect to order status tracker
          setTimeout(() => {
            window.location.href = `/${cafeSlug}/order/${oid}/status`;
          }, 1500);
          return;
        }

        if (["FAILED", "CANCELLED"].includes(orderStatus)) {
          setStatus("failed");
          sessionStorage.removeItem("pending_order_id");
          return;
        }

        // Still pending — wait and poll again
        await new Promise((r) => setTimeout(r, 2000));
        return pollOrderStatus(oid, attempts + 1);
      } catch {
        setStatus("failed");
      }
    };

    reconcileAndCheck();
  }, [cafeSlug, searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center animate-fade-in-up max-w-sm">
        {status === "loading" && (
          <>
            <Loader2 size={48} className="mx-auto mb-4 text-primary animate-spin" />
            <h1 className="text-xl font-bold mb-2">Verifying Payment...</h1>
            <p className="text-muted text-sm">Please wait while we confirm your payment with PhonePe</p>
            <p className="text-muted text-xs mt-3">Do not close this page or press back</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-muted text-sm">Redirecting to your order status...</p>
          </>
        )}
        {status === "failed" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <XCircle size={36} className="text-danger" />
            </div>
            <h1 className="text-xl font-bold mb-2">Payment Failed</h1>
            <p className="text-muted text-sm mb-6">
              Your payment could not be verified. If money was deducted, it will be refunded within 5-7 business days.
            </p>
            {cafeSlug && (
              <a
                href={`/${cafeSlug}`}
                className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium text-sm active:scale-[0.98] transition-transform"
              >
                <ArrowLeft size={16} />
                Back to Menu
              </a>
            )}
          </>
        )}
      </div>
    </div>
  );
}
