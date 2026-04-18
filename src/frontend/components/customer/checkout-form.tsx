"use client";

import { useState } from "react";
import { useCartStore } from "@/frontend/stores/cart";
import { paiseToCurrencyShort } from "@/shared/utils/currency";
import { Input } from "@/frontend/components/ui/input";
import { ShieldCheck, ArrowLeft, Receipt, User, Lock, ArrowRight } from "lucide-react";
import { v4 as uuid } from "uuid";
import { cn } from "@/shared/utils/cn";
import {
  normalizePhone,
  validateEmail,
  validateName,
  validatePhone,
} from "@/shared/utils/validation";

type FieldErrors = {
  name?: string;
  phone?: string;
  email?: string;
};

interface CheckoutFormProps {
  cafeSlug: string;
  cafeName: string;
  onBack: () => void;
}

export function CheckoutForm({ cafeSlug, cafeName, onBack }: CheckoutFormProps) {
  const { items, getTotalPaise } = useCartStore();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean; email?: boolean }>({});

  const total = getTotalPaise();

  const runValidators = (): FieldErrors => {
    const errors: FieldErrors = {};
    const nameCheck = validateName(customerName);
    if (!nameCheck.valid) errors.name = nameCheck.error;
    const phoneCheck = validatePhone(customerPhone);
    if (!phoneCheck.valid) errors.phone = phoneCheck.error;
    const emailCheck = validateEmail(customerEmail);
    if (!emailCheck.valid) errors.email = emailCheck.error;
    return errors;
  };

  const handleBlur = (field: "name" | "phone" | "email") => {
    setTouched((t) => ({ ...t, [field]: true }));
    const errors = runValidators();
    setFieldErrors((prev) => ({ ...prev, [field]: errors[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const errors = runValidators();
    setFieldErrors(errors);
    setTouched({ name: true, phone: true, email: true });
    if (Object.keys(errors).length > 0) {
      setError("Please fix the highlighted fields before continuing.");
      return;
    }

    setLoading(true);

    try {
      let idempotencyKey = sessionStorage.getItem("checkout_idempotency_key");
      if (!idempotencyKey) {
        idempotencyKey = uuid();
        sessionStorage.setItem("checkout_idempotency_key", idempotencyKey);
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cafeSlug,
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
          })),
          customerName: customerName.trim(),
          customerPhone: normalizePhone(customerPhone),
          customerEmail: customerEmail.trim().toLowerCase(),
          notes: notes || undefined,
          idempotencyKey,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Failed to create order");
        if (response.status === 422 || response.status === 409) {
          sessionStorage.removeItem("checkout_idempotency_key");
        }
        return;
      }

      sessionStorage.removeItem("checkout_idempotency_key");
      sessionStorage.setItem("pending_order_id", data.data.orderId);

      if (data.data.paymentRedirectUrl) {
        window.location.href = data.data.paymentRedirectUrl;
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-hover transition-colors duration-75">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-tight">Checkout</h1>
            <p className="text-xs text-muted">{cafeName}</p>
          </div>
          <Lock size={16} className="text-muted" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4 pb-32">
        {/* Order Summary */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface-hover/50 border-b border-border">
            <Receipt size={15} className="text-primary" />
            <h2 className="font-semibold text-sm">Order Summary</h2>
          </div>
          <div className="p-4 space-y-2.5">
            {items.map((item) => (
              <div key={item.menuItemId} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className={cn(
                      "w-[14px] h-[14px] rounded border-[1.5px] flex items-center justify-center flex-shrink-0",
                      item.isVeg ? "border-green-600" : "border-red-500"
                    )}
                  >
                    <span
                      className={cn(
                        "w-[7px] h-[7px] rounded-full",
                        item.isVeg ? "bg-green-600" : "bg-red-500"
                      )}
                    />
                  </span>
                  <span className="text-muted truncate">{item.name}</span>
                  <span className="text-muted flex-shrink-0">x{item.quantity}</span>
                </div>
                <span className="font-semibold ml-3">
                  {paiseToCurrencyShort(item.pricePaise * item.quantity)}
                </span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-dashed border-border flex justify-between items-center">
              <span className="font-bold">Total</span>
              <span className="font-extrabold text-primary text-xl">
                {paiseToCurrencyShort(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Customer Details */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up" style={{ animationDelay: '60ms' }}>
          <div className="flex items-center justify-between px-4 py-3 bg-surface-hover/50 border-b border-border">
            <div className="flex items-center gap-2">
              <User size={15} className="text-primary" />
              <h2 className="font-semibold text-sm">Your Details</h2>
            </div>
            <span className="text-[11px] text-muted">
              <span className="text-danger">*</span> Required
            </span>
          </div>
          <div className="p-4 space-y-3">
            <Input
              id="name"
              label={<>Name <span className="text-danger">*</span></>}
              placeholder="Your name for the order"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={() => handleBlur("name")}
              error={touched.name ? fieldErrors.name : undefined}
              autoComplete="name"
              required
            />
            <Input
              id="phone"
              label={<>Mobile Number <span className="text-danger">*</span></>}
              placeholder="10-digit mobile number"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              onBlur={() => handleBlur("phone")}
              error={touched.phone ? fieldErrors.phone : undefined}
              autoComplete="tel"
              required
            />
            <Input
              id="email"
              label={<>Email <span className="text-danger">*</span></>}
              placeholder="you@example.com"
              type="email"
              inputMode="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              error={touched.email ? fieldErrors.email : undefined}
              autoComplete="email"
              required
            />
            <p className="text-[11px] text-muted -mt-1">
              We&apos;ll send your order confirmation here.
            </p>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-1.5">
                Special Instructions
              </label>
              <textarea
                id="notes"
                className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary resize-none text-sm"
                rows={2}
                placeholder="Any special requests..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-danger text-sm p-3.5 rounded-xl border border-red-200 flex items-start gap-2 animate-fade-in-up">
            <span className="flex-shrink-0 mt-0.5">!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Secure Payment Note */}
        <div className="flex items-center gap-2 text-xs text-muted justify-center pt-2 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
          <ShieldCheck size={14} className="text-primary" />
          <span>Secure payment via PhonePe</span>
        </div>
      </form>

      {/* Fixed Bottom Pay Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-md border-t border-border p-4">
        <button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-700 disabled:from-slate-400 disabled:to-slate-400 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-amber-800/25 active:scale-[0.98] transition-transform duration-75 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Processing...
            </>
          ) : (
            <>
              Pay {paiseToCurrencyShort(total)}
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
