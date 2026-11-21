import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Edit3, Plus, Search, Truck } from "lucide-react";

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
import adminShippingService from "../../services/admin-shipping.service";
import { formatPrice } from "../../utils/product.utils";
import useDialogFocus from "../../hooks/useDialogFocus";

const PAGE_SIZE = 10;
const blankMethod = {
  code: "",
  name: "",
  description: "",
  min_delivery_days: "1",
  max_delivery_days: "5",
  fee: "0",
  free_shipping_threshold: "",
  is_active: "1",
};

export default function AdminShippingMethods() {
  const notify = useAdminToast();
  const [methods, setMethods] = useState([]);
  const [form, setForm] = useState(blankMethod);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef(null);
  const [pendingToggle, setPendingToggle] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [toggleError, setToggleError] = useState("");

  useDialogFocus(dialogRef, dialogOpen, () => {
    if (!saving) setDialogOpen(false);
  });

  const loadMethods = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminShippingService.getMethods();
      const rows = Array.isArray(result) ? result : result?.methods ?? result?.items ?? [];
      setMethods(Array.isArray(rows) ? rows : []);
    } catch (loadError) {
      setError(loadError.message || loadError.response?.data?.message || "Unable to load shipping methods.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadMethods(); }, [loadMethods]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return methods.filter((method) => {
      const active = Number(method.is_active) === 1;
      return (!term || [method.name, method.code, method.description].some((value) => String(value ?? "").toLowerCase().includes(term)))
        && (!status || (status === "ACTIVE" ? active : !active));
    });
  }, [methods, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visibleMethods = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const create = () => {
    setEditing(null);
    setForm(blankMethod);
    setFormError("");
    setDialogOpen(true);
  };

  const edit = (method) => {
    setEditing(method);
    setForm({
      code: method.code || "",
      name: method.name || "",
      description: method.description || "",
      min_delivery_days: String(method.min_delivery_days ?? 0),
      max_delivery_days: String(method.max_delivery_days ?? 0),
      fee: String(method.fee ?? 0),
      free_shipping_threshold: method.free_shipping_threshold == null ? "" : String(method.free_shipping_threshold),
      is_active: String(Number(method.is_active) === 1 ? 1 : 0),
    });
    setFormError("");
    setDialogOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = {
      code: form.code.trim().toUpperCase(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      min_delivery_days: Number(form.min_delivery_days),
      max_delivery_days: Number(form.max_delivery_days),
      fee: Number(form.fee),
      free_shipping_threshold: form.free_shipping_threshold === "" ? null : Number(form.free_shipping_threshold),
      is_active: Number(form.is_active),
    };
    try {
      if (editing) {
        await adminShippingService.updateMethod(editing.shipping_method_id, payload);
        notify("Shipping method updated.");
      } else {
        await adminShippingService.createMethod(payload);
        notify("Shipping method created.");
      }
      setDialogOpen(false);
      setEditing(null);
      await loadMethods();
    } catch (saveError) {
      setFormError(saveError.message || saveError.response?.data?.message || "Unable to save shipping method.");
    } finally {
      setSaving(false);
    }
  };

  const toggleMethod = async () => {
    if (!pendingToggle) return;
    setSaving(true);
    setToggleError("");
    try {
      await adminShippingService.updateMethod(pendingToggle.shipping_method_id, {
        is_active: Number(pendingToggle.is_active) === 1 ? 0 : 1,
      });
      notify(Number(pendingToggle.is_active) === 1 ? "Shipping method deactivated." : "Shipping method activated.");
      setPendingToggle(null);
      await loadMethods();
    } catch (toggleError) {
      setToggleError(toggleError.message || toggleError.response?.data?.message || "Unable to update shipping method.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Fulfillment"
        title="Shipping methods"
        description="Manage delivery options and the rates used by checkout."
        actions={<button type="button" onClick={create} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#315d47] px-4 text-sm font-semibold text-white hover:bg-[#244b39]"><Plus size={16} /> Add method</button>}
      />

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <AdminCard
        title="Delivery options"
        description={`${filtered.length.toLocaleString()} matching methods`}
        action={
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <span className="sr-only">Search shipping methods</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search methods…" className="h-11 w-48 rounded-lg border border-slate-200 pl-9 pr-3 text-base outline-none focus:border-[#759c84] sm:text-xs" />
            </label>
            <select aria-label="Filter shipping method status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-600 sm:text-xs"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></select>
          </div>
        }
      >
        {loading ? <AdminSkeleton rows={5} columns={6} /> : visibleMethods.length === 0 ? (
          <AdminEmptyState title="No shipping methods found" description={query || status ? "Try changing the search or status filter." : "Create a delivery option to make it available in checkout."} action={!query && !status ? <button type="button" onClick={create} className="rounded-lg bg-[#315d47] px-4 py-2 text-sm font-semibold text-white">Add method</button> : null} />
        ) : (
          <>
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"><tr><th className="px-5 py-3.5">Method</th><th className="px-5 py-3.5">Delivery estimate</th><th className="px-5 py-3.5">Fee</th><th className="px-5 py-3.5">Free shipping from</th><th className="px-5 py-3.5">Status</th><th className="px-5 py-3.5 text-right">Actions</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleMethods.map((method) => {
                    const active = Number(method.is_active) === 1;
                    return (
                      <tr key={method.shipping_method_id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf1ec] text-[#315d47]"><Truck size={17} /></span><div><p className="font-semibold text-slate-800">{method.name}</p><p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">{method.code}</p></div></div></td>
                        <td className="px-5 py-4 text-slate-600">{method.min_delivery_days}–{method.max_delivery_days} days</td>
                        <td className="px-5 py-4 font-medium text-slate-700">{formatPrice(method.fee)}</td>
                        <td className="px-5 py-4 text-slate-600">{method.free_shipping_threshold == null ? "Not configured" : formatPrice(method.free_shipping_threshold)}</td>
                        <td className="px-5 py-4"><AdminStatusBadge tone={active ? "green" : "neutral"}>{active ? "ACTIVE" : "INACTIVE"}</AdminStatusBadge></td>
                        <td className="px-5 py-4"><div className="flex justify-end gap-1"><button type="button" onClick={() => edit(method)} aria-label={`Edit ${method.name}`} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#315d47]"><Edit3 size={16} /></button><button type="button" onClick={() => setPendingToggle(method)} className={`min-h-11 rounded-lg px-2.5 py-2 text-xs font-semibold ${active ? "text-rose-600 hover:bg-rose-50" : "text-emerald-700 hover:bg-emerald-50"}`}>{active ? "Deactivate" : "Activate"}</button></div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <AdminPagination page={page} totalPages={totalPages} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </AdminCard>

      {dialogOpen && (
        <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 p-0 sm:items-center sm:p-4">
          <form ref={dialogRef} tabIndex={-1} onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="shipping-dialog-title" className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto overscroll-contain rounded-t-2xl bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-h-[92vh] sm:rounded-2xl sm:p-6">
            <h2 id="shipping-dialog-title" className="text-lg font-bold text-slate-900">{editing ? "Edit shipping method" : "Create shipping method"}</h2>
            {formError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{formError}</p>}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Name" value={form.name} required maxLength={100} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
              <Field label="Code" value={form.code} required maxLength={50} disabled={Boolean(editing)} onChange={(value) => setForm((current) => ({ ...current, code: value.toUpperCase() }))} />
              <Field label="Minimum delivery days" type="number" min="0" step="1" value={form.min_delivery_days} required onChange={(value) => setForm((current) => ({ ...current, min_delivery_days: value }))} />
              <Field label="Maximum delivery days" type="number" min="0" step="1" value={form.max_delivery_days} required onChange={(value) => setForm((current) => ({ ...current, max_delivery_days: value }))} />
              <Field label="Fee (PKR)" type="number" min="0" step="0.01" value={form.fee} required onChange={(value) => setForm((current) => ({ ...current, fee: value }))} />
              <Field label="Free shipping threshold (optional)" type="number" min="0" step="0.01" value={form.free_shipping_threshold} onChange={(value) => setForm((current) => ({ ...current, free_shipping_threshold: value }))} />
              <label className="block text-sm font-medium text-slate-700">Status<select value={form.is_active} onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"><option value="1">Active</option><option value="0">Inactive</option></select></label>
              <label className="block text-sm font-medium text-slate-700 sm:col-span-2">Description<textarea value={form.description} maxLength={255} rows={2} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none focus:border-[#759c84]" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setDialogOpen(false)} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button type="submit" disabled={saving} className="rounded-xl bg-[#315d47] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Create method"}</button></div>
          </form>
        </div>
      )}

      <AdminConfirmDialog open={Boolean(pendingToggle)} title={`${Number(pendingToggle?.is_active) === 1 ? "Deactivate" : "Activate"} shipping method?`} description={`${pendingToggle?.name || "This method"} will ${Number(pendingToggle?.is_active) === 1 ? "no longer be offered" : "be offered"} during checkout.`} error={toggleError} confirmLabel={Number(pendingToggle?.is_active) === 1 ? "Deactivate" : "Activate"} danger={Number(pendingToggle?.is_active) === 1} loading={saving} onCancel={() => { setPendingToggle(null); setToggleError(""); }} onConfirm={toggleMethod} />
    </div>
  );
}

function Field({ label, type = "text", value, onChange, ...props }) {
  return <label className="block text-sm font-medium text-slate-700">{label}<input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} {...props} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#759c84] focus:ring-4 focus:ring-[#315d47]/10" /></label>;
}
