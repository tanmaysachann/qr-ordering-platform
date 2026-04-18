"use client";

import { useCartStore } from "@/frontend/stores/cart";
import { paiseToCurrencyShort } from "@/shared/utils/currency";
import { Minus, Plus, Trash2, X, ShoppingBag, ArrowRight } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
}

export function CartSheet({ isOpen, onClose, onCheckout }: CartSheetProps) {
  const { items, updateQuantity, removeItem, getTotalPaise, clearCart } = useCartStore();
  const total = getTotalPaise();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 transition-opacity" onClick={onClose} />
      )}

      {/* Sheet */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 bg-surface rounded-t-[28px] shadow-2xl transition-transform duration-200 ease-out max-h-[85vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <ShoppingBag size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">Your Cart</h2>
              <p className="text-xs text-muted">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-danger font-medium px-2 py-1 rounded-lg hover:bg-red-50 transition-colors duration-75"
              >
                Clear
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center hover:bg-border transition-colors duration-75">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="h-px bg-border mx-5" />

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted">
              <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center mb-4">
                <ShoppingBag size={32} className="text-muted/30" />
              </div>
              <p className="font-semibold text-foreground mb-1">Your cart is empty</p>
              <p className="text-sm">Add items from the menu to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.menuItemId} className="flex items-center gap-3 p-3 bg-background rounded-xl">
                  {/* Veg/Non-veg + Name */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
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
                      <p className="text-sm font-semibold truncate">{item.name}</p>
                    </div>
                    <p className="text-xs text-muted pl-5">
                      {paiseToCurrencyShort(item.pricePaise)} each
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center bg-surface border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() =>
                        item.quantity === 1
                          ? removeItem(item.menuItemId)
                          : updateQuantity(item.menuItemId, item.quantity - 1)
                      }
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-hover transition-colors duration-75"
                    >
                      {item.quantity === 1 ? <Trash2 size={13} className="text-danger" /> : <Minus size={13} />}
                    </button>
                    <span className="w-8 h-8 flex items-center justify-center text-sm font-bold border-x border-border">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-surface-hover transition-colors duration-75"
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <p className="text-sm font-bold w-16 text-right">
                    {paiseToCurrencyShort(item.pricePaise * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border px-5 py-4 bg-surface">
            {/* Total row */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted font-medium text-sm">Total Amount</span>
              <span className="text-2xl font-extrabold text-foreground">
                {paiseToCurrencyShort(total)}
              </span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white py-3.5 rounded-2xl font-bold text-base shadow-lg shadow-amber-800/25 active:scale-[0.98] transition-transform duration-75 flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
