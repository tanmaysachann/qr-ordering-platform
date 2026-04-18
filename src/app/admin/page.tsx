"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Modal } from "@/frontend/components/ui/modal";
import { Badge } from "@/frontend/components/ui/badge";
import { EmptyState } from "@/frontend/components/ui/empty-state";
import { paiseToCurrencyShort } from "@/shared/utils/currency";
import {
  Store,
  Plus,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Activity,
  Trash2,
  ChevronRight,
  QrCode,
  Users,
  Phone,
} from "lucide-react";
import { CafeQRModal } from "@/frontend/components/admin/cafe-qr-modal";

interface StaffMember {
  id: string;
  cafeId: string;
  name: string;
  age: number;
  mobileNumber: string;
}

interface CafeWithStats {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  _count: { orders: number; menuItems: number; users: number };
}

export default function AdminCafesPage() {
  const router = useRouter();
  const [cafes, setCafes] = useState<CafeWithStats[]>([]);
  const [analytics, setAnalytics] = useState<{
    totalRevenue: number;
    totalOrders: number;
    activeCafes: number;
    todayRevenue: number;
    todayOrders: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formName, setFormName] = useState("");
  const [formAddress, setFormAddress] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // Derive slug from an email like "owner@branch-name.com" → "branch-name"
  const derivedSlug = (() => {
    const match = ownerEmail.trim().toLowerCase().match(/^owner@([a-z0-9][a-z0-9-]*)\./);
    return match ? match[1] : "";
  })();

  // Staff state
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);
  const [staffCafeFilter, setStaffCafeFilter] = useState<string>("ALL");
  const [staffLoading, setStaffLoading] = useState(true);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<CafeWithStats | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // QR state (accepts any cafe-shaped object with name+slug)
  const [qrTarget, setQrTarget] = useState<{ name: string; slug: string } | null>(null);

  const fetchData = async () => {
    try {
      const [cafesRes, analyticsRes] = await Promise.all([
        fetch("/api/admin/cafes"),
        fetch("/api/admin/analytics"),
      ]);
      const cafesData = await cafesRes.json();
      const analyticsData = await analyticsRes.json();

      if (cafesData.success) {
        setCafes(cafesData.data);
        fetchAllStaff(cafesData.data);
      }
      if (analyticsData.success) setAnalytics(analyticsData.data);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStaff = async (cafeList: CafeWithStats[]) => {
    try {
      const results = await Promise.all(
        cafeList.map((c) =>
          fetch(`/api/admin/cafes/${c.id}/staff`)
            .then((r) => r.json())
            .then((d) => (d.success ? (d.data as StaffMember[]).map((s) => ({ ...s, cafeId: c.id })) : []))
            .catch(() => [] as StaffMember[])
        )
      );
      setAllStaff(results.flat());
    } finally {
      setStaffLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCafe = async () => {
    setFormError("");
    if (!formName) { setFormError("Cafe name is required"); return; }
    if (!formAddress.trim()) { setFormError("Address is required"); return; }
    if (!formPhone.trim()) { setFormError("Phone is required"); return; }
    if (!ownerName || !ownerEmail || !ownerPassword) { setFormError("Owner credentials are required"); return; }
    if (ownerPassword.length < 6) { setFormError("Password must be at least 6 characters"); return; }
    if (!derivedSlug) {
      setFormError("Owner email must be in the format: owner@branch-name.com");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/cafes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          address: formAddress.trim(),
          phone: formPhone.trim(),
          ownerName,
          ownerEmail: ownerEmail.trim().toLowerCase(),
          ownerPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowModal(false);
        setFormName("");
        setFormAddress("");
        setFormPhone("");
        setOwnerName("");
        setOwnerEmail("");
        setOwnerPassword("");
        setFormError("");
        fetchData();
        // Auto-open QR for the newly created cafe
        if (data.data?.name && data.data?.slug) {
          setQrTarget({ name: data.data.name, slug: data.data.slug });
        }
      } else {
        setFormError(data.error || "Failed to create cafe");
      }
    } catch (err) {
      console.error("Failed to create cafe:", err);
      setFormError("Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCafe = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cafes/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteTarget(null);
        fetchData();
      }
    } catch (err) {
      console.error("Failed to delete cafe:", err);
    } finally {
      setDeleting(false);
    }
  };

  const statCards = analytics
    ? [
        {
          label: "Total Revenue",
          value: paiseToCurrencyShort(analytics.totalRevenue),
          icon: <DollarSign size={20} />,
          color: "text-green-600 bg-green-50",
        },
        {
          label: "Today's Revenue",
          value: paiseToCurrencyShort(analytics.todayRevenue),
          icon: <TrendingUp size={20} />,
          color: "text-primary bg-primary/10",
        },
        {
          label: "Total Orders",
          value: String(analytics.totalOrders),
          icon: <ShoppingBag size={20} />,
          color: "text-blue-600 bg-blue-50",
        },
        {
          label: "Today's Orders",
          value: String(analytics.todayOrders),
          icon: <Activity size={20} />,
          color: "text-purple-600 bg-purple-50",
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border p-5 animate-pulse h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border p-5 animate-pulse h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={18} className="mr-1.5" />
          Add Cafe
        </Button>
      </div>

      {/* Stat Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs text-muted">{stat.label}</p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Cafes */}
      <h2 className="text-lg font-semibold mb-4">
        All Cafes ({cafes.length})
      </h2>

      {cafes.length === 0 ? (
        <EmptyState
          icon={<Store size={48} />}
          title="No cafes yet"
          description="Create your first cafe to get started"
          action={
            <Button onClick={() => setShowModal(true)}>
              <Plus size={18} className="mr-1.5" />
              Add Cafe
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {cafes.map((cafe) => (
            <div
              key={cafe.id}
              onClick={() => router.push(`/admin/cafes/${cafe.id}`)}
              className="bg-surface rounded-2xl border border-border p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-[box-shadow,border-color] duration-100 cursor-pointer group"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{cafe.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={cafe.isActive ? "success" : "danger"}>
                      {cafe.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <ChevronRight size={16} className="text-muted group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted mb-1">/{cafe.slug}</p>
                {cafe.address && (
                  <p className="text-xs text-muted mb-3">{cafe.address}</p>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-xs text-muted">
                    <span><strong className="text-foreground">{cafe._count.orders}</strong> orders</span>
                    <span><strong className="text-foreground">{cafe._count.menuItems}</strong> items</span>
                    <span><strong className="text-foreground">{cafe._count.users}</strong> staff</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setQrTarget(cafe);
                      }}
                      className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Show QR code"
                    >
                      <QrCode size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(cafe);
                      }}
                      className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                      title={cafe._count.orders > 0 ? "Deactivate cafe" : "Delete cafe"}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </CardContent>
            </div>
          ))}
        </div>
      )}

      {/* Create Cafe Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setFormError(""); }} title="Add New Cafe">
        <div className="space-y-4">
          <p className="text-xs text-muted font-medium uppercase tracking-wide">Cafe Details</p>
          <Input
            id="cafe-name"
            label="Cafe Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g. Downtown Brew"
            required
          />
          <Input
            id="cafe-address"
            label="Address"
            value={formAddress}
            onChange={(e) => setFormAddress(e.target.value)}
            placeholder="e.g. 123 Main Street"
            required
          />
          <Input
            id="cafe-phone"
            label="Phone"
            value={formPhone}
            onChange={(e) => setFormPhone(e.target.value)}
            placeholder="e.g. +91 98765 43210"
            required
          />

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted font-medium uppercase tracking-wide mb-3">Owner Credentials</p>
            <div className="space-y-3">
              <Input
                id="owner-name"
                label="Owner Name"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Full name"
                required
              />
              <Input
                id="owner-email"
                label="Owner Email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="owner@branch-name.com"
                type="email"
                required
              />
              <div className="-mt-2 text-xs text-muted">
                Format: <code className="font-mono bg-surface-hover px-1.5 py-0.5 rounded">owner@branch-name.com</code>
                {derivedSlug ? (
                  <>
                    {" "}· URL: <code className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">/{derivedSlug}</code>
                  </>
                ) : null}
              </div>
              <Input
                id="owner-password"
                label="Owner Password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="Min 6 characters"
                type="password"
                required
              />
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 text-danger text-sm p-3 rounded-xl border border-red-200">
              {formError}
            </div>
          )}

          <Button onClick={handleCreateCafe} className="w-full" loading={saving}>
            Create Cafe & Owner
          </Button>
        </div>
      </Modal>

      {/* All Staff Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users size={18} className="text-primary" />
            All Staff
          </h2>
        </div>

        {/* Cafe filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            onClick={() => setStaffCafeFilter("ALL")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${staffCafeFilter === "ALL" ? "bg-primary text-white border-primary" : "bg-surface text-muted border-border hover:border-primary/30"}`}
          >
            All Branches
          </button>
          {cafes.map((c) => (
            <button
              key={c.id}
              onClick={() => setStaffCafeFilter(c.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${staffCafeFilter === c.id ? "bg-primary text-white border-primary" : "bg-surface text-muted border-border hover:border-primary/30"}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {staffLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-surface rounded-2xl border border-border p-4 animate-pulse h-20" />
            ))}
          </div>
        ) : (() => {
          const filtered = staffCafeFilter === "ALL" ? allStaff : allStaff.filter((s) => s.cafeId === staffCafeFilter);
          return filtered.length === 0 ? (
            <div className="bg-surface rounded-2xl border border-border p-8 text-center text-muted text-sm">
              No staff members found
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-background border-b border-border text-xs font-medium text-muted">
                <span>Name</span>
                <span>Branch</span>
                <span>Age</span>
                <span className="flex items-center gap-1"><Phone size={10} /> Mobile</span>
              </div>
              {filtered.map((member, i) => {
                const cafe = cafes.find((c) => c.id === member.cafeId);
                return (
                  <div key={member.id} className={`grid grid-cols-4 gap-4 px-5 py-3 text-sm items-center ${i < filtered.length - 1 ? "border-b border-border" : ""}`}>
                    <span className="font-medium">{member.name}</span>
                    <span className="text-muted truncate">{cafe?.name ?? "—"}</span>
                    <span className="text-muted">{member.age}</span>
                    <span className="text-muted">{member.mobileNumber}</span>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* QR Code Modal */}
      <CafeQRModal
        isOpen={!!qrTarget}
        onClose={() => setQrTarget(null)}
        cafeName={qrTarget?.name || ""}
        cafeSlug={qrTarget?.slug || ""}
      />

      {/* Deactivate / Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}
        title={(deleteTarget?._count.orders ?? 0) > 0 ? "Deactivate Cafe" : "Permanently Delete Cafe"}
      >
        {deleteTarget && (
          <div className="space-y-4">
            {deleteTarget._count.orders > 0 ? (
              <>
                <p className="text-sm text-muted">
                  You are about to deactivate <strong className="text-foreground">{deleteTarget.name}</strong>.
                  The cafe will be hidden from customers but all order history will be preserved.
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
                  <strong>{deleteTarget._count.orders} orders</strong> will be retained. This action can be reversed by reactivating the cafe.
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
                  <Button variant="danger" className="flex-1" loading={deleting} onClick={handleDeleteCafe}>
                    Deactivate Cafe
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">
                  You are about to <strong className="text-foreground">permanently delete</strong> {deleteTarget.name}. This will remove all menus, categories, staff and data. <strong className="text-danger">This cannot be undone.</strong>
                </p>
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
                  To confirm, type the cafe name exactly: <strong>{deleteTarget.name}</strong>
                </div>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={`Type "${deleteTarget.name}" to confirm`}
                  className="w-full px-3 py-2 text-sm border border-border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-danger/30 focus:border-danger"
                />
                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => { setDeleteTarget(null); setDeleteConfirmText(""); }}>Cancel</Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    loading={deleting}
                    onClick={handleDeleteCafe}
                    disabled={deleteConfirmText !== deleteTarget.name}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Permanently Delete
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
