"use client";

import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/frontend/stores/cart";
import { paiseToCurrencyShort } from "@/shared/utils/currency";
import { cn } from "@/shared/utils/cn";

interface FloatingCartButtonProps {
  onClick: () => void;
}

export function FloatingCartButton({ onClick }: FloatingCartButtonProps) {
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPaise = useCartStore((s) => s.getTotalPaise());

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 animate-slide-up">
      <button
        onClick={onClick}
        className={cn(
          "relative w-full flex items-center justify-between overflow-hidden",
          "bg-gradient-to-r from-amber-600 via-orange-700 to-amber-600 bg-[length:200%_100%]",
          "hover:bg-[position:100%_0] transition-[background-position] duration-500",
          "text-white py-3.5 px-5 rounded-2xl",
          "shadow-xl shadow-amber-800/30",
          "active:scale-[0.98] transition-transform duration-75"
        )}
      >
        {/* Shine overlay */}
        <span className="shine-overlay" />

        <div className="relative flex items-center gap-3">
          <div className="relative">
            <ShoppingBag size={20} />
            <span
              key={totalItems}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-400 text-white rounded-full text-[11px] font-bold flex items-center justify-center animate-pop shadow-sm shadow-rose-400/40 ring-2 ring-amber-700"
            >
              {totalItems}
            </span>
          </div>
          <div className="text-left">
            <span className="font-bold text-sm block leading-tight">
              {totalItems} {totalItems === 1 ? "item" : "items"} added
            </span>
            <span className="text-[10px] text-white/75 block leading-tight">
              Tap to view cart
            </span>
          </div>
        </div>
        <div className="relative flex items-center gap-2">
          <span key={totalPaise} className="font-bold text-lg animate-pop">
            {paiseToCurrencyShort(totalPaise)}
          </span>
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center group-active:translate-x-0.5 transition-transform">
            <ArrowRight size={14} />
          </div>
        </div>
      </button>
    </div>
  );
}
