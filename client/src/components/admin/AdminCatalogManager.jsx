import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Edit3, Plus, Search, Trash2 } from "lucide-react";

import {
  AdminCard,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminPageHeader as PageHeader,
  AdminPagination,
  AdminSkeleton,
  AdminStatusBadge,
} from "./AdminPrimitives";
import { useAdminToast } from "./AdminToastContext";
import adminCatalogService from "../../services/admin-catalog.service";
import useDialogFocus from "../../hooks/useDialogFocus";

const PAGE_SIZE = 10;

const config = {
  categories: {
    title: "Categories",
    singular: "Category",
    description: "Organize the catalog with clear, customer-facing category names.",
    idKey: "category_id",
    fields: ["name", "description", "status"],
    columns: ["Category", "Description", "Status"],
    load: adminCatalogService.getCategories,
    create: adminCatalogService.createCategory,
    update: adminCatalogService.updateCategory,
    remove: adminCatalogService.deleteCategory,
    initial: { name: "", description: "", status: "ACTIVE" },
  },
  brands: {
    title: "Brands",
    singular: "Brand",
    description: "Manage the brands currently available to your catalog.",
    idKey: "brand_id",
    fields: ["name", "logo", "status"],
    columns: ["Brand", "Logo URL", "Status"],
    load: adminCatalogService.getBrands,
    create: adminCatalogService.createBrand,
    update: adminCatalogService.updateBrand,
    remove: adminCatalogService.deleteBrand,
    initial: { name: "", logo: "", status: "ACTIVE" },
  },
};

export default function AdminCatalogManager({ resource }) {
  const settings = config[resource];
  const notify = useAdminToast();
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("name_asc");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(settings.initial);
  const [editing, setEditing] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const dialogRef = useRef(null);
  const [deleting, setDeleting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dialogError, setDialogError] = useState("");

  useDialogFocus(dialogRef, dialogOpen, () => {
    if (saving) return;
    setEditing(null);
    setDialogOpen(false);
    setForm(settings.initial);
    setDialogError("");
  });

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await settings.load();
      setRecords(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError.message || loadError.response?.data?.message || `Unable to load ${settings.title.toLowerCase()}.`);
    } finally {
      setLoading(false);
    }
  }, [settings]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return records.filter((record) => {
      const matchesQuery = !term || settings.fields.some((field) =>
        String(record[field] ?? "").toLowerCase().includes(term)
      );
      return matchesQuery && (!status || record.status === status);
    }).sort((left, right) => {
      const direction = sort === "name_desc" ? -1 : 1;
      return String(left.name || "").localeCompare(String(right.name || "")) * direction;
    });
  }, [records, query, settings.fields, sort, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRecords = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const startCreate = () => {
    setEditing(null);
    setForm(settings.initial);
    setDialogError("");
    setDialogOpen(true);
  };

  const startEdit = (record) => {
    setEditing(record);
    setForm(Object.fromEntries(settings.fields.map((field) => [field, record[field] ?? ""])));
    setDialogError("");
    setDialogOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value])
    );
    setSaving(true);
    setDialogError("");
    try {
      if (editing) {
        await settings.update(editing[settings.idKey], payload);
        notify(`${settings.singular} updated.`);
      } else {
        await settings.create(payload);
        notify(`${settings.singular} created.`);
      }
      setEditing(null);
      setDialogOpen(false);
      setForm(settings.initial);
      await loadRecords();
    } catch (saveError) {
      setDialogError(saveError.message || saveError.response?.data?.message || `Unable to save ${settings.title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setSaving(true);
    setDialogError("");
    try {
      await settings.remove(deleting[settings.idKey]);
      notify(`${settings.singular} deleted.`);
      setDeleting(null);
      await loadRecords();
    } catch (removeError) {
      setDialogError(removeError.message || removeError.response?.data?.message || `Unable to delete ${settings.title.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog management"
        title={settings.title}
        description={settings.description}
        actions={
          <button type="button" onClick={startCreate} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#315d47] px-4 text-sm font-semibold text-white transition hover:bg-[#244b39]">
            <Plus size={16} /> Add {settings.singular}
          </button>
        }
      />

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</p>}

      <AdminCard
        title={`All ${settings.title.toLowerCase()}`}
        description={`${filtered.length.toLocaleString()} matching records`}
        action={
          <div className="flex flex-wrap gap-2">
            <label className="relative">
              <span className="sr-only">Search {settings.title.toLowerCase()}</span>
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={`Search ${settings.title.toLowerCase()}…`} className="h-11 w-48 rounded-lg border border-slate-200 pl-9 pr-3 text-base outline-none focus:border-[#759c84] focus:ring-4 focus:ring-[#315d47]/10 sm:text-xs" />
            </label>
            <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-600 outline-none focus:border-[#759c84] sm:text-xs">
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <select aria-label="Sort catalog items" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-600 sm:text-xs">
              <option value="name_asc">Name A–Z</option>
              <option value="name_desc">Name Z–A</option>
            </select>
          </div>
        }
      >
        {loading ? (
          <AdminSkeleton rows={5} columns={settings.columns.length + 1} />
        ) : pageRecords.length === 0 ? (
          <AdminEmptyState
            title={`No ${settings.title.toLowerCase()} found`}
            description={query || status ? "Try changing the search or status filter." : `Create the first ${settings.singular.toLowerCase()} to start organizing your catalog.`}
            action={!query && !status ? <button type="button" onClick={startCreate} className="rounded-lg bg-[#315d47] px-4 py-2 text-sm font-semibold text-white hover:bg-[#244b39]">Add {settings.singular}</button> : null}
          />
        ) : (
          <>
            <div className="overflow-x-auto overscroll-x-contain touch-pan-x">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  <tr>{settings.columns.map((column) => <th key={column} className="px-5 py-3.5">{column}</th>)}<th className="px-5 py-3.5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageRecords.map((record) => (
                    <tr key={record[settings.idKey]} className="transition hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {resource === "brands" && (
                            record.logo
                              ? <img src={record.logo} alt="" className="h-9 w-9 rounded-lg border border-slate-100 object-contain p-1" />
                              : <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{record.name?.slice(0, 1)?.toUpperCase()}</span>
                          )}
                          <span className="font-semibold text-slate-800">{record.name}</span>
                        </div>
                      </td>
                      {resource === "categories" ? (
                        <td className="max-w-sm truncate px-5 py-4 text-slate-500">{record.description || "—"}</td>
                      ) : (
                        <td className="max-w-sm truncate px-5 py-4 text-slate-500">{record.logo || "—"}</td>
                      )}
                      <td className="px-5 py-4">
                        <AdminStatusBadge tone={record.status === "ACTIVE" ? "green" : "neutral"}>{record.status || "UNKNOWN"}</AdminStatusBadge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={() => startEdit(record)} aria-label={`Edit ${record.name}`} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#315d47]">
                            <Edit3 size={16} />
                          </button>
                          <button type="button" onClick={() => { setDeleting(record); setDialogError(""); }} aria-label={`Delete ${record.name}`} className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600">
                            <Trash2 size={16} />
                          </button>
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
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4">
          <form ref={dialogRef} tabIndex={-1} onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="catalog-dialog-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="catalog-dialog-title" className="text-lg font-bold text-slate-900">{editing ? "Edit" : "Add"} {settings.singular}</h2>
            {dialogError && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{dialogError}</p>}
            <div className="mt-5 space-y-4">
              {settings.fields.filter((field) => field !== "status" || editing).map((field) => (
                field === "status" ? (
                  <label key={field} className="block text-sm font-medium text-slate-700">Status
                    <select value={form.status} onChange={(event) => setForm((value) => ({ ...value, status: event.target.value }))} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-[#759c84]">
                      <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
                    </select>
                  </label>
                ) : (
                  <label key={field} className="block text-sm font-medium capitalize text-slate-700">{field === "logo" ? "Logo URL" : field}
                    {field === "description" ? (
                      <textarea value={form[field]} onChange={(event) => setForm((value) => ({ ...value, [field]: event.target.value }))} rows={3} maxLength={500} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#759c84] focus:ring-4 focus:ring-[#315d47]/10" />
                    ) : (
                      <input type={field === "logo" ? "url" : "text"} required={field === "name"} value={form[field]} onChange={(event) => setForm((value) => ({ ...value, [field]: event.target.value }))} maxLength={field === "name" ? 100 : 500} className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#759c84] focus:ring-4 focus:ring-[#315d47]/10" />
                    )}
                  </label>
                )
              ))}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => { setEditing(null); setDialogOpen(false); setForm(settings.initial); setDialogError(""); }} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-[#315d47] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#244b39] disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      <AdminConfirmDialog
        open={Boolean(deleting)}
        title={`Delete ${settings.singular.toLowerCase()}?`}
        description={`This will remove “${deleting?.name || ""}” from the catalog. Existing product relationships may prevent deletion.`}
        error={dialogError}
        confirmLabel="Delete"
        danger
        loading={saving}
        onCancel={() => { setDeleting(null); setDialogError(""); }}
        onConfirm={remove}
      />
    </div>
  );
}
