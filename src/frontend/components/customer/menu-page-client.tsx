"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useCartStore } from "@/frontend/stores/cart";
import { useSSE } from "@/frontend/hooks/use-sse";
import { CategoryTabs } from "./category-tabs";
import { MenuItemCard } from "./menu-item-card";
import { FloatingCartButton } from "./floating-cart-button";
import { CartSheet } from "./cart-sheet";
import { CheckoutForm } from "./checkout-form";
import { Search, MapPin, Clock, X } from "lucide-react";
import { toTitleCase } from "@/shared/utils/format";
import type { CafePublic, MenuCategoryWithItems } from "@/shared/types";

interface MenuPageClientProps {
  cafe: CafePublic;
  categories: MenuCategoryWithItems[];
}

export function MenuPageClient({ cafe, categories: initialCategories }: MenuPageClientProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { setCafeSlug } = useCartStore();

  // Rehydrate cart from localStorage after mount (skipHydration in store keeps
  // SSR and first client render identical, avoiding hydration mismatches).
  useEffect(() => {
    useCartStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    setCafeSlug(cafe.slug);
  }, [cafe.slug, setCafeSlug]);

  // Re-fetch menu from API when SSE fires a menu_updated event
  const refetchMenu = useCallback(async () => {
    try {
      const res = await fetch(`/api/cafes/${cafe.slug}/menu`);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch {
      // Silently fail - user still has stale data
    }
  }, [cafe.slug]);

  // Listen for real-time menu changes from admin/owner
  useSSE({
    url: `/api/cafes/${cafe.slug}/menu/stream`,
    events: ["menu_updated"],
    onMessage: () => {
      refetchMenu();
    },
  });

  const handleCategorySelect = (id: string) => {
    setActiveCategory(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isSearching = searchQuery.trim().length > 0;

  const visibleCategories = useMemo(
    () => categories.filter((cat) => cat.items.length > 0),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    if (isSearching) return [];
    if (activeCategory === "all") return visibleCategories;
    return visibleCategories.filter((c) => c.id === activeCategory);
  }, [visibleCategories, isSearching, activeCategory]);

  const searchResults = useMemo(() => {
    if (!isSearching) return [];
    const query = searchQuery.trim().toLowerCase();
    return visibleCategories.flatMap((cat) =>
      cat.items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      )
    );
  }, [visibleCategories, searchQuery, isSearching]);

  if (showCheckout) {
    return (
      <CheckoutForm
        cafeSlug={cafe.slug}
        cafeName={cafe.name}
        onBack={() => setShowCheckout(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-[#1a120d] text-stone-100">
        {cafe.imageUrl ? (
          <>
            <img
              src={cafe.imageUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/55 to-[#1a120d]" />
          </>
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at top right, rgba(251,191,36,0.14), transparent 55%), radial-gradient(ellipse at bottom left, rgba(180,83,9,0.22), transparent 60%)",
            }}
          />
        )}

        {/* subtle film grain */}
        <div
          className="absolute inset-0 opacity-[0.07] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative px-5 pt-14 pb-8">
          <div className="inline-flex items-center gap-2 mb-6 animate-fade-in-up">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            <span className="text-[10px] tracking-[0.22em] font-medium uppercase text-amber-300/90">
              Now serving
            </span>
          </div>

          <h1
            className="font-serif text-[2.75rem] leading-[1.02] tracking-tight text-stone-50 mb-4 animate-fade-in-up"
            style={{ animationDelay: "50ms" }}
          >
            {cafe.name}
          </h1>

          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-stone-300/85 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            {cafe.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} className="text-amber-400/80" />
                <span>{cafe.address}</span>
              </span>
            )}
            {cafe.openingTime && cafe.closingTime && (
              <span className="inline-flex items-center gap-1.5">
                <Clock size={12} className="text-amber-400/80" />
                <span>
                  {cafe.openingTime} – {cafe.closingTime}
                </span>
              </span>
            )}
          </div>

          {/* Search */}
          <div
            className="relative mt-7 animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500"
            />
            <input
              type="text"
              placeholder="Search the menu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-stone-50 text-stone-900 placeholder:text-stone-500 pl-11 pr-10 py-3 text-sm border border-stone-900/5 focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-stone-200 text-stone-600 hover:bg-stone-300"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
      </div>

      {/* Category Tabs */}
      {!isSearching && (
        <CategoryTabs
          categories={[
            { id: "all", name: "All" },
            ...visibleCategories.map((c) => ({ id: c.id, name: toTitleCase(c.name) })),
          ]}
          activeCategory={activeCategory}
          onSelect={handleCategorySelect}
        />
      )}

      {/* Search results - flat list, no category headers */}
      {isSearching ? (
        <div className="px-4 mt-4">
          {searchResults.length > 0 ? (
            <>
              <p className="text-xs text-muted mb-3">
                {searchResults.length} {searchResults.length === 1 ? "result" : "results"} for
                <span className="text-foreground font-medium"> &ldquo;{searchQuery}&rdquo;</span>
              </p>
              <div className="space-y-2.5 stagger-children">
                {searchResults.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface flex items-center justify-center">
                <Search size={24} className="text-muted/40" />
              </div>
              <p className="text-base font-semibold text-foreground mb-1">No dishes found</p>
              <p className="text-sm text-muted">Try a different search</p>
            </div>
          )}
        </div>
      ) : (
        <div className="px-4 mt-2 space-y-7">
          {filteredCategories.map((category, catIdx) => (
            <div
              key={category.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${catIdx * 60}ms` }}
            >
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-lg font-bold text-foreground">
                  {toTitleCase(category.name)}
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-border to-transparent" />
                <span className="text-xs text-muted bg-surface-hover rounded-full px-2.5 py-0.5 font-medium">
                  {category.items.length}
                </span>
              </div>
              <div className="space-y-2.5 stagger-children">
                {category.items.map((item) => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Floating Cart Button */}
      <FloatingCartButton onClick={() => setShowCart(true)} />

      {/* Cart Sheet */}
      <CartSheet
        isOpen={showCart}
        onClose={() => setShowCart(false)}
        onCheckout={() => {
          setShowCart(false);
          setShowCheckout(true);
        }}
      />
    </div>
  );
}
