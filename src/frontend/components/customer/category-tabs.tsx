"use client";

import { cn } from "@/shared/utils/cn";

interface CategoryTabsProps {
  categories: { id: string; name: string }[];
  activeCategory: string;
  onSelect: (id: string) => void;
}

export function CategoryTabs({ categories, activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="sticky top-0 z-20 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="flex gap-2 px-4 py-2.5 overflow-x-auto menu-scroll">
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap",
                "transition-[background-color,color,box-shadow,transform] duration-150",
                "active:scale-95",
                isActive
                  ? "bg-gradient-to-r from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-700/25"
                  : "bg-surface text-muted hover:text-foreground hover:bg-surface-hover border border-border/60"
              )}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
