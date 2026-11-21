import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BadgePercent, Edit3, Plus, Search, TicketPercent } from "lucide-react";

import {
  AdminCard,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminPageHeader,
  AdminPagination,
  AdminSkeleton,
  AdminStatusBadge,
} from "../../components/admin/AdminPrimitives";
import { useAdminToast } from "../../components/admin/AdminToastContext";
import adminCouponService from "../../services/admin-coupon.service";
import { formatPrice } from "../../utils/product.utils";
import useDialogFocus from "../../hooks/useDialogFocus";

const PAGE_SIZE = 10;

const emptyCoupon = {
  code: "",
  description: "",
  discount_type: "PERCENTAGE",
  discount_value: "",
  min_order_amount: "0",
  max_discount_amount: "",
  usage_limit: "",
  per_user_limit: "1",
  starts_at: "",
  expires_at: "",
  status: "ACTIVE",
};

const localInputDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDate = (value) => value ? new Date(value).toLocaleDateString(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
}) : "—";

export default function AdminCoupons() {
  const notify = useAdminToast();
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyCoupon);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef(null);
  const [deactivating, setDeactivating] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [deactivateError, setDeactivateError] = useState("");

  useDialogFocus(dialogRef, dialogOpen, () => {
    if (!saving) setDialogOpen(false);
  });

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminCouponService.getCoupons();
      setCoupons(Array.isArray(result) ? result : []);
    } catch (loadError) {
      setError(loadError.message || loadError.response?.data?.message || "Unable to load coupons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCoupons(); }, [loadCoupons]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const matchesTerm = !term || [coupon.code, coupon.description].some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      );
      return matchesTerm && (!status || coupon.status === status);
    });
  }, [coupons, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleCoupons = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyCoupon);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (coupon) => {
    setEditing(coupon);
    setForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discount_type: coupon.discount_type || "PERCENTAGE",
      discount_value: String(coupon.discount_value ?? ""),
      min_order_amount: String(coupon.min_order_amount ?? 0),
      max_discount_amount: coupon.max_discount_amount == null ? "" : String(coupon.max_discount_amount),
      usage_limit: coupon.usage_limit == null ? "" : String(coupon.usage_limit),
      per_user_limit: String(coupon.per_user_limit ?? 1),
      starts_at: localInputDate(coupon.starts_at),
      expires_at: localInputDate(coupon.expires_at),
      status: coupon.status || "ACTIVE",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const saveCoupon = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = {
      description: form.description.trim() || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount || 0),
      max_discount_amount: form.max_discount_amount === "" ? null : Number(form.max_discount_amount),
      usage_limit: form.usage_limit === "" ? null : Number(form.usage_limit),
      per_user_limit: Number(form.per_user_limit),
      starts_at: new Date(form.starts_at).toISOString(),
      expires_at: new Date(form.expires_at).toISOString(),
      status: form.status,
    };
    try {
      if (editing) {
        await adminCouponService.updateCoupon(editing.coupon_id, payload);
        notify("Coupon updated.");
      } else {
        await adminCouponService.createCoupon({
          ...payload,
          code: form.code.trim().toUpperCase(),
        });
        notify("Coupon created.");
      }
      setDialogOpen(false);
      setEditing(null);
      await loadCoupons();
    } catch (saveError) {
      setFormError(saveError.message || saveError.response?.data?.message || "Unable to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const deactivateCoupon = async () => {
    if (!deactivating) return;
    setSaving(true);
    setDeactivateError("");
    try {
      await adminCouponService.deactivateCoupon(deactivating.coupon_id);
      notify("Coupon deactivated.");
      setDeactivating(null);
      await loadCoupons();
    } catch (deactivateError) {
      setDeactivateError(deactivateError.message || deactivateError.response?.data?.message || "Unable to deactivate coupon.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Promotions"
        title="Coupons"
        description="Create and maintain coupon rules. Discounts are validated and calculated by the server."
        actions={<button type="button" onClick={openCreate} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#315d47] px-4 text-sm font-semibold text-white transition hover:bg-[#244b39]"><Plus size={16} /> Create coupon</button>}
      />

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <AdminCard
        title="Coupon directory"
        description={`${filtered.length.toLocaleString()} matching coupons`}
        action={
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <span className="sr-only">Search coupons</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search code or description" className="h-11 w-52 rounded-lg border border-slate-200 pl-9 pr-3 text-base outline-none focus:border-[#759c84] focus:ring-4 focus:ring-[#315d47]/10 sm:text-xs" />
            </label>
            <select aria-label="Filter coupons by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-600 sm:text-xs">
              <option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
            </select>
          </div>
        }
      >
        {loading ? <AdminSkeleton rows={5} columns={6} /> : visibleCoupons.length === 0 ? (
          <AdminEmptyState title="No coupons found" description={query || status ? "Try changing the search or status filter." : "Create a coupon to make it available during checkout."} action={!query && !status ? <button type="button" onClick={openCreate} className="rounded-lg bg-[#315d47] px-4 py-2 text-sm font-semibold text-white">Create coupon</button> : null} />
        ) : (
          <>
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
              <table className="w-full min-w-[920px] text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <tr><th className="px-5 py-3.5">Code</th><th className="px-5 py-3.5">Discount</th><th className="px-5 py-3.5">Minimum order</th><th className="px-5 py-3.5">Usage</th><th className="px-5 py-3.5">Valid through</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleCoupons.map((coupon) => (
                    <tr key={coupon.coupon_id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 font-semibold text-slate-800"><TicketPercent size={16} className="text-[#527d65]" />{coupon.code}</div>
                        <p className="mt-1 max-w-48 truncate text-xs text-slate-500">{coupon.description || "No description"}</p>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">{coupon.discount_type === "PERCENTAGE" ? `${coupon.discount_value}%` : formatPrice(coupon.discount_value)}</td>
                      <td className="px-5 py-4 text-slate-600">{formatPrice(coupon.min_order_amount || 0)}</td>
                      <td className="px-5 py-4 text-slate-600">{coupon.used_count ?? "—"}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : " / ∞"}</td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(coupon.expires_at)}</td>
                      <td className="px-5 py-4"><AdminStatusBadge tone={coupon.status === "ACTIVE" ? "green" : "neutral"}>{coupon.status}</AdminStatusBadge></td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => openEdit(coupon)} aria-label={`Edit ${coupon.code}`} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#315d47]"><Edit3 size={16} /></button>
                          {coupon.status === "ACTIVE" && <button type="button" onClick={() => setDeactivating(coupon)} className="min-h-11 rounded-lg px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50">Deactivate</button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminPagination page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </AdminCard>

      {dialogOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4">
          <form ref={dialogRef} tabIndex={-1} onSubmit={saveCoupon} role="dialog" aria-modal="true" aria-labelledby="coupon-dialog-title" className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[92vh] sm:rounded-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eaf1ec] text-[#315d47]"><BadgePercent size={19} /></span>
              <div><h2 id="coupon-dialog-title" className="text-lg font-bold text-slate-900">{editing ? "Edit coupon" : "Create coupon"}</h2><p className="mt-1 text-xs text-slate-500">The server enforces eligibility and final discount values.</p></div>
            </div>
            {formError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{formError}</p>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Coupon code" value={form.code} disabled={Boolean(editing)} required onChange={(value) => setForm((current) => ({ ...current, code: value.toUpperCase() }))} />
              <label className="block text-sm font-medium text-slate-700">Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select></label>
              <label className="block text-sm font-medium text-slate-700">Discount type<select value={form.discount_type} onChange={(event) => setForm((current) => ({ ...current, discount_type: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed amount</option></select></label>
              <Field label={form.discount_type === "PERCENTAGE" ? "Discount (%)" : "Discount amount (PKR)"} type="number" min="0.01" max={form.discount_type === "PERCENTAGE" ? 100 : undefined} step="0.01" value={form.discount_value} required onChange={(value) => setForm((current) => ({ ...current, discount_value: value }))} />
              <Field label="Minimum order (PKR)" type="number" min="0" step="0.01" value={form.min_order_amount} onChange={(value) => setForm((current) => ({ ...current, min_order_amount: value }))} />
              <Field label="Maximum discount (optional)" type="number" min="0.01" step="0.01" value={form.max_discount_amount} onChange={(value) => setForm((current) => ({ ...current, max_discount_amount: value }))} />
              <Field label="Total usage limit (optional)" type="number" min="1" step="1" value={form.usage_limit} onChange={(value) => setForm((current) => ({ ...current, usage_limit: value }))} />
              <Field label="Per-customer limit" type="number" min="1" step="1" value={form.per_user_limit} required onChange={(value) => setForm((current) => ({ ...current, per_user_limit: value }))} />
              <Field label="Starts at" type="datetime-local" value={form.starts_at} required onChange={(value) => setForm((current) => ({ ...current, starts_at: value }))} />
              <Field label="Expires at" type="datetime-local" value={form.expires_at} required onChange={(value) => setForm((current) => ({ ...current, expires_at: value }))} />
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Description<textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} maxLength={255} rows={2} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#759c84]" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" disabled={saving} onClick={() => setDialogOpen(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-[#315d47] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Create coupon"}</button>
            </div>
          </form>
        </div>
      )}

      <AdminConfirmDialog open={Boolean(deactivating)} title="Deactivate coupon?" description={`Customers will no longer be able to apply ${deactivating?.code || "this coupon"}.`} error={deactivateError} confirmLabel="Deactivate" danger loading={saving} onCancel={() => { setDeactivating(null); setDeactivateError(""); }} onConfirm={deactivateCoupon} />
    </div>
  );
}

function Field({ label, type = "text", value, onChange, ...props }) {
  return (
    <label className="block text-sm font-medium text-slate-700">{label}
      <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} {...props} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-[#759c84] focus:ring-4 focus:ring-[#315d47]/10" />
    </label>
  );
}
