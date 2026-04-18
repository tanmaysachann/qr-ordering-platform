"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Plus, Minus, Check } from "lucide-react";
import { useCartStore } from "@/frontend/stores/cart";
import { paiseToCurrencyShort } from "@/shared/utils/currency";
import { toTitleCase } from "@/shared/utils/format";
import type { MenuItemPublic } from "@/shared/types";
import { cn } from "@/shared/utils/cn";

interface MenuItemCardProps {
  item: MenuItemPublic;
}

export const MenuItemCard = memo(function MenuItemCard({ item }: MenuItemCardProps) {
  const quantity = useCartStore((s) => s.items.find((i) => i.menuItemId === item.id)?.quantity ?? 0);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const [bursts, setBursts] = useState<number[]>([]);
  const prevQty = useRef(quantity);
  const [popImage, setPopImage] = useState(false);

  // Trigger ripple + check burst whenever quantity increases
  useEffect(() => {
    if (quantity > prevQty.current) {
      const id = Date.now();
      setBursts((b) => [...b, id]);
      setPopImage(true);
      window.setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 800);
      window.setTimeout(() => setPopImage(false), 450);
    }
    prevQty.current = quantity;
  }, [quantity]);

  const handleAdd = useCallback(() => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      pricePaise: item.pricePaise,
      isVeg: item.isVeg,
      imageUrl: item.imageUrl,
    });
  }, [addItem, item.id, item.name, item.pricePaise, item.isVeg, item.imageUrl]);

  const inCart = quantity > 0;

  return (
    <div
      className={cn(
        "group relative flex gap-3 p-3 rounded-2xl border transition-[border-color,box-shadow,transform] duration-150",
        "bg-surface hover:shadow-lg active:scale-[0.995]",
        inCart
          ? "border-primary/60 shadow-md shadow-primary/10 ring-1 ring-primary/30"
          : "border-border/70 hover:border-primary/30 hover:shadow-primary/5"
      )}
    >
      {/* Item Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            {/* Veg/Non-veg badge */}
            <span
              className={cn(
                "w-[18px] h-[18px] rounded border-[1.5px] flex items-center justify-center flex-shrink-0 transition-transform",
                item.isVeg ? "border-green-600" : "border-red-500",
                inCart && "animate-wiggle"
              )}
            >
              <span
                className={cn(
                  "w-[9px] h-[9px] rounded-full",
                  item.isVeg ? "bg-green-600" : "bg-red-500"
                )}
              />
            </span>
            <h3 className="font-semibold text-foreground text-[15px] leading-tight truncate">
              {toTitleCase(item.name)}
            </h3>
            {inCart && (
              <span className="inline-flex items-center gap-0.5 bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-scale-in">
                <Check size={10} strokeWidth={3} />
                {quantity}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-xs text-muted leading-relaxed line-clamp-2 mt-0.5 mb-2 pr-1">
              {item.description}
            </p>
          )}
        </div>
        <p
          className={cn(
            "font-bold text-base transition-colors",
            inCart ? "text-primary" : "text-foreground"
          )}
        >
          {paiseToCurrencyShort(item.pricePaise)}
        </p>
      </div>

      {/* Image + Add Button */}
      <div className="relative flex flex-col items-center flex-shrink-0">
        <div
          className={cn(
            "w-[108px] h-24 rounded-xl overflow-hidden shadow-sm transition-transform duration-200",
            popImage && "animate-pop"
          )}
        >
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className={cn(
              "w-full h-full flex items-center justify-center",
              item.isVeg
                ? "bg-gradient-to-br from-amber-50 to-orange-100"
                : "bg-gradient-to-br from-rose-50 to-pink-100"
            )}>
              <span className="text-3xl">
                {item.isVeg ? "\u{1F96C}" : "\u{1F357}"}
              </span>
            </div>
          )}
          {/* Subtle shine on hover for added items */}
          {inCart && <span className="shine-overlay" />}

          {/* Add feedback: expanding amber ring + check burst */}
          <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl">
            {bursts.map((id) => (
              <span
                key={`ring-${id}`}
                className="absolute inset-0 rounded-xl border-2 border-primary/60 animate-add-ripple"
              />
            ))}
          </span>
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {bursts.map((id) => (
              <span
                key={`check-${id}`}
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 animate-check-burst"
              >
                <Check size={16} strokeWidth={3.5} />
              </span>
            ))}
          </span>
        </div>

        {/* Quantity Controls — overlapping image bottom */}
        <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2">
          {quantity === 0 ? (
            <button
              onClick={handleAdd}
              className={cn(
                "relative overflow-hidden px-6 py-1.5 text-sm font-bold rounded-lg",
                "bg-white text-primary border border-primary/30",
                "shadow-sm hover:shadow-md active:scale-90",
                "transition-[box-shadow,transform,background-color,color] duration-100",
                "uppercase tracking-wide",
                "hover:bg-primary hover:text-white hover:border-primary"
              )}
            >
              <span className="relative z-10">Add</span>
            </button>
          ) : (
            <div className="flex items-center bg-gradient-to-r from-amber-600 to-orange-700 rounded-lg shadow-md shadow-primary/30 overflow-hidden animate-scale-in">
              <button
                onClick={() =>
                  quantity === 1 ? removeItem(item.id) : updateQuantity(item.id, quantity - 1)
                }
                className="px-3 py-1.5 text-white hover:bg-black/10 active:scale-90 transition-[background-color,transform] duration-75"
                aria-label="Decrease quantity"
              >
                <Minus size={14} strokeWidth={3} />
              </button>
              <span
                key={quantity}
                className="px-1 py-1.5 text-white font-bold text-sm min-w-[24px] text-center animate-pop"
              >
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, quantity + 1)}
                className="px-3 py-1.5 text-white hover:bg-black/10 active:scale-90 transition-[background-color,transform] duration-75"
                aria-label="Increase quantity"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
