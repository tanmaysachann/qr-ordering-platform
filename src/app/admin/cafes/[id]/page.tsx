"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { Badge } from "@/frontend/components/ui/badge";
import { Modal } from "@/frontend/components/ui/modal";
import { paiseToCurrencyShort } from "@/shared/utils/currency";
import { cn } from "@/shared/utils/cn";
import { Input } from "@/frontend/components/ui/input";
import {
  ArrowLeft,
  DollarSign,
  ShoppingBag,
  Trash2,
  MapPin,
  Phone,
  Clock,
  ExternalLink,
  TrendingUp,
  CalendarDays,
  KeyRound,
  User,
  QrCode,
  Users,
  Plus,
  UserMinus,
} from "lucide-react";
import { CafeQRModal } from "@/frontend/components/admin/cafe-qr-modal";
import type { OrderStatus } from "@/generated/prisma";

interface CafeOwner {
  id: string;
  name: string;
  email: string;
}

interface StaffMember {
  id: string;
  name: string;
  age: number;
  mobileNumber: string;
}

interface CafeDetail {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  imageUrl: string | null;
  isActive: boolean;
  openingTime: string | null;
  closingTime: string | null;
  _count: { orders: number; menuItems: number; users: number };
  users: CafeOwner[];
}

interface CafeAnalytics {
  orders: number;
  revenue: number;
  range: string;
  from: string;
  to: string;
  recentOrders: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    totalPaise: number;
    customerName: string | null;
    createdAt: string;
  }[];
}

type TimeRange = "today" | "week" | "month" | "year" | "all";

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

const statusColors: Record<string, string> = {
  PAID: "text-blue-600 bg-blue-50",
  PREPARING: "text-amber-600 bg-amber-50",
  READY: "text-purple-600 bg-purple-50",
  COMPLETED: "text-green-600 bg-green-50",
  CANCELLED: "text-red-600 bg-red-50",
  FAILED: "text-red-600 bg-red-50",
};

export default function AdminCafeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [cafe, setCafe] = useState<CafeDetail | null>(null);
  const [analytics, setAnalytics] = useState<CafeAnalytics | null>(null);
  const [range, setRange] = useState<TimeRange>("all");
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);

  // Staff state
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffAge, setStaffAge] = useState("");
  const [staffMobile, setStaffMobile] = useState("");
  const [staffSaving, setStaffSaving] = useState(false);
  const [staffError, setStaffError] = useState("");
  const [removeTarget, setRemoveTarget] = useState<StaffMember | null>(null);
  const [removing, setRemoving] = useState(false);

  const fetchCafe = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/cafes/${id}`);
      const data = await res.json();
      if (data.success) setCafe(data.data);
    } catch {
      console.error("Failed to fetch cafe");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/cafes/${id}/staff`);
      const data = await res.json();
      if (data.success) setStaff(data.data);
    } catch {
      console.error("Failed to fetch staff");
    }
  }, [id]);

  const handleAddStaff = async () => {
    setStaffError("");
    if (!staffName.trim()) { setStaffError("Name is required"); return; }
    if (!staffAge || isNaN(Number(staffAge))) { setStaffError("Valid age is required"); return; }
    if (!staffMobile.trim()) { setStaffError("Mobile number is required"); return; }
    setStaffSaving(true);
    try {
      const res = await fetch(`/api/admin/cafes/${id}/staff`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: staffName, age: Number(staffAge), mobileNumber: staffMobile }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowAddStaffModal(false);
        setStaffName(""); setStaffAge(""); setStaffMobile(""); setStaffError("");
        fetchStaff();
      } else {
        setStaffError(data.error || "Failed to add staff");
      }
    } catch {
      setStaffError("Network error");
    } finally {
      setStaffSaving(false);
    }
  };

  const handleRemoveStaff = async () => {
    if (!removeTarget) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/admin/cafes/${id}/staff/${removeTarget.id}`, { method: "DELETE" });
      if (res.ok) { setRemoveTarget(null); fetchStaff(); }
    } catch {
      console.error("Failed to remove staff");
    } finally {
      setRemoving(false);
    }
  };

  const fetchAnalytics = useCallback(async (r: TimeRange) => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/admin/cafes/${id}/analytics?range=${r}`);
      const data = await res.json();
      if (data.success) setAnalytics(data.data);
    } catch {
      console.error("Failed to fetch analytics");
    } finally {
      setAnalyticsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCafe();
    fetchAnalytics(range);
    fetchStaff();
  }, [fetchCafe, fetchAnalytics, fetchStaff, range]);

  const handleRangeChange = (newRange: TimeRange) => {
    setRange(newRange);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/cafes/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/admin");
      }
    } catch {
      console.error("Failed to delete cafe");
    } finally {
      setDeleting(false);
    }
  };

  const owner = cafe?.users?.[0] || null;

  const handleResetPassword = async () => {
    if (!owner || !newPassword) return;
    if (newPassword.length < 6) { setResetMessage("Password must be at least 6 characters"); return; }
    setResetLoading(true);
    setResetMessage("");
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: owner.id, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setResetMessage("Password reset successfully!");
        setNewPassword("");
        setTimeout(() => { setShowResetModal(false); setResetMessage(""); }, 1500);
      } else {
        setResetMessage(data.error || "Failed to reset password");
      }
    } catch {
      setResetMessage("Network error");
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-surface-hover rounded w-48 animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl border border-border p-5 animate-pulse h-24" />
          ))}
        </div>
        <div className="bg-surface rounded-2xl border border-border animate-pulse h-64" />
      </div>
    );
  }

  if (!cafe) {
    return (
      <div className="text-center py-16">
        <p className="text-lg font-semibold mb-2">Cafe not found</p>
        <Button variant="secondary" onClick={() => router.push("/admin")}>
          <ArrowLeft size={16} className="mr-1.5" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button
            onClick={() => router.push("/admin")}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{cafe.name}</h1>
            <Badge variant={cafe.isActive ? "success" : "danger"}>
              {cafe.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted">
            {cafe.address && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {cafe.address}
              </span>
            )}
            {cafe.phone && (
              <span className="flex items-center gap-1">
                <Phone size={14} /> {cafe.phone}
              </span>
            )}
            {cafe.openingTime && cafe.closingTime && (
              <span className="flex items-center gap-1">
                <Clock size={14} /> {cafe.openingTime} - {cafe.closingTime}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href={`/${cafe.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink size={14} />
            Customer View
          </a>
          <Button size="sm" onClick={() => setShowQRModal(true)}>
            <QrCode size={14} className="mr-1" />
            QR Code
          </Button>
          <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            <Trash2 size={14} className="mr-1" />
            Delete
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-bold">{cafe._count.orders}</p>
            <p className="text-xs text-muted">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-bold">{cafe._count.menuItems}</p>
            <p className="text-xs text-muted">Menu Items</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center">
            <p className="text-2xl font-bold">{cafe._count.users}</p>
            <p className="text-xs text-muted">Staff</p>
          </CardContent>
        </Card>
      </div>

      {/* Owner Info */}
      {owner && (
        <div className="bg-surface rounded-2xl border border-border p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User size={18} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">{owner.name}</p>
              <p className="text-xs text-muted">{owner.email}</p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setShowResetModal(true); setResetMessage(""); setNewPassword(""); }}
          >
            <KeyRound size={14} className="mr-1" />
            Reset Password
          </Button>
        </div>
      )}

      {/* Time Range Tabs */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" />
          Revenue & Orders
        </h2>
        <div className="flex items-center gap-1 bg-surface rounded-xl border border-border p-1">
          {timeRanges.map((tr) => (
            <button
              key={tr.value}
              onClick={() => handleRangeChange(tr.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-100",
                range === tr.value
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground"
              )}
            >
              {tr.label}
            </button>
          ))}
        </div>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-green-50 text-green-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-muted">
                {timeRanges.find((t) => t.value === range)?.label} Revenue
              </p>
              <p className="text-xl font-bold">
                {analyticsLoading ? "..." : paiseToCurrencyShort(analytics?.revenue || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-xs text-muted">
                {timeRanges.find((t) => t.value === range)?.label} Orders
              </p>
              <p className="text-xl font-bold">
                {analyticsLoading ? "..." : (analytics?.orders || 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <div className="flex items-center gap-2 mb-3">
        <CalendarDays size={16} className="text-muted" />
        <h3 className="font-semibold text-sm">Recent Orders</h3>
      </div>

      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-background border-b border-border text-xs font-medium text-muted">
          <span>Order #</span>
          <span>Customer</span>
          <span>Status</span>
          <span className="text-right">Amount</span>
          <span className="text-right">Date</span>
        </div>

        {analyticsLoading ? (
          <div className="px-5 py-8 text-center text-muted text-sm">Loading...</div>
        ) : !analytics?.recentOrders.length ? (
          <div className="px-5 py-8 text-center text-muted text-sm">
            No orders in this time period
          </div>
        ) : (
          analytics.recentOrders.map((order, i) => (
            <div
              key={order.id}
              className={cn(
                "grid grid-cols-5 gap-4 px-5 py-3 text-sm items-center",
                i < analytics.recentOrders.length - 1 && "border-b border-border"
              )}
            >
              <span className="font-medium">{order.orderNumber}</span>
              <span className="text-muted truncate">
                {order.customerName || "Guest"}
              </span>
              <span>
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
                    statusColors[order.status] || "text-gray-600 bg-gray-50"
                  )}
                >
                  {order.status}
                </span>
              </span>
              <span className="text-right font-medium">
                {paiseToCurrencyShort(order.totalPaise)}
              </span>
              <span className="text-right text-muted text-xs">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Staff Section */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Users size={18} className="text-primary" />
            Staff ({staff.length})
          </h2>
          <Button size="sm" onClick={() => { setShowAddStaffModal(true); setStaffError(""); }}>
            <Plus size={14} className="mr-1" />
            Add Staff
          </Button>
        </div>

        {staff.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-border p-8 text-center text-muted text-sm">
            No staff added yet
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-background border-b border-border text-xs font-medium text-muted">
              <span>Name</span>
              <span>Age</span>
              <span>Mobile</span>
              <span></span>
            </div>
            {staff.map((member, i) => (
              <div
                key={member.id}
                className={cn(
                  "grid grid-cols-4 gap-4 px-5 py-3 text-sm items-center",
                  i < staff.length - 1 && "border-b border-border"
                )}
              >
                <span className="font-medium">{member.name}</span>
                <span className="text-muted">{member.age}</span>
                <span className="text-muted">{member.mobileNumber}</span>
                <span className="flex justify-end">
                  <button
                    onClick={() => setRemoveTarget(member)}
                    className="p-1.5 rounded-lg text-muted hover:text-danger hover:bg-red-50 transition-colors"
                    title="Remove staff"
                  >
                    <UserMinus size={14} />
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal isOpen={showAddStaffModal} onClose={() => setShowAddStaffModal(false)} title="Add Staff Member">
        <div className="space-y-4">
          <Input id="staff-name" label="Name" value={staffName} onChange={(e) => setStaffName(e.target.value)} placeholder="Full name" required />
          <Input id="staff-age" label="Age" type="number" value={staffAge} onChange={(e) => setStaffAge(e.target.value)} placeholder="e.g. 25" required />
          <Input id="staff-mobile" label="Mobile Number" value={staffMobile} onChange={(e) => setStaffMobile(e.target.value)} placeholder="e.g. +91 98765 43210" required />
          {staffError && (
            <div className="bg-red-50 text-danger text-sm p-3 rounded-xl border border-red-200">{staffError}</div>
          )}
          <Button onClick={handleAddStaff} className="w-full" loading={staffSaving}>
            <Plus size={14} className="mr-1" /> Add Staff
          </Button>
        </div>
      </Modal>

      {/* Remove Staff Confirmation */}
      <Modal isOpen={!!removeTarget} onClose={() => setRemoveTarget(null)} title="Remove Staff">
        {removeTarget && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Remove <strong className="text-foreground">{removeTarget.name}</strong> from this cafe?
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setRemoveTarget(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1" loading={removing} onClick={handleRemoveStaff}>
                <UserMinus size={14} className="mr-1" /> Remove
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR Code Modal */}
      <CafeQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        cafeName={cafe.name}
        cafeSlug={cafe.slug}
      />

      {/* Reset Password Modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset Owner Password"
      >
        {owner && (
          <div className="space-y-4">
            <p className="text-sm text-muted">
              Reset password for <strong className="text-foreground">{owner.name}</strong> ({owner.email})
            </p>
            <Input
              id="new-password"
              label="New Password"
              type="password"
              placeholder="Min 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {resetMessage && (
              <div className={cn(
                "text-sm p-3 rounded-xl border",
                resetMessage.includes("successfully")
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-danger border-red-200"
              )}>
                {resetMessage}
              </div>
            )}
            <Button onClick={handleResetPassword} className="w-full" loading={resetLoading}>
              <KeyRound size={14} className="mr-1" />
              Reset Password
            </Button>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Cafe"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Are you sure you want to delete <strong className="text-foreground">{cafe.name}</strong>?
          </p>
          {cafe._count.orders > 0 ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              This cafe has <strong>{cafe._count.orders} orders</strong>. It will be
              deactivated (soft-deleted) to preserve order history. It won&apos;t appear
              to customers but data is retained.
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-800">
              This cafe has no orders. It will be <strong>permanently deleted</strong> along
              with all menu items, categories, and staff accounts.
            </div>
          )}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              loading={deleting}
              onClick={handleDelete}
            >
              <Trash2 size={14} className="mr-1" />
              {cafe._count.orders > 0 ? "Deactivate" : "Delete Forever"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
