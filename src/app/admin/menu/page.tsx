"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, ChevronRight, Store } from "lucide-react";
import { EmptyState } from "@/frontend/components/ui/empty-state";
import { Badge } from "@/frontend/components/ui/badge";

interface Cafe {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  isActive: boolean;
  _count: { menuItems: number };
}

export default function AdminMenuPage() {
  const router = useRouter();
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/cafes")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCafes(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <p className="text-sm text-muted mt-1">Select a cafe to manage its menu</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : cafes.length === 0 ? (
        <EmptyState
          icon={<Store size={48} />}
          title="No cafes yet"
          description="Create a cafe first from the All Cafes section"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cafes.map((cafe) => (
            <button
              key={cafe.id}
              onClick={() => router.push(`/admin/cafes/${cafe.id}/menu`)}
              className="text-left bg-surface rounded-2xl border border-border p-5 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-100 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <UtensilsCrossed size={18} className="text-primary" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={cafe.isActive ? "success" : "danger"}>
                    {cafe.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors" />
                </div>
              </div>
              <p className="font-semibold">{cafe.name}</p>
              {cafe.address && (
                <p className="text-xs text-muted mt-0.5 truncate">{cafe.address}</p>
              )}
              <p className="text-xs text-muted mt-2">
                <strong className="text-foreground">{cafe._count.menuItems}</strong> menu items
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
