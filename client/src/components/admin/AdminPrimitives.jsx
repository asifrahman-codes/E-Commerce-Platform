import { useRef } from "react";
import { AlertCircle, Check, ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react";
import useDialogFocus from "../../hooks/useDialogFocus";

export function AdminPageHeader({ eyebrow, title, description, actions }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#527d65]">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
          {title}
        </h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function AdminCard({ title, description, action, children, className = "" }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.03)] ${className}`}>
      {(title || description || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            {title && <h2 className="text-sm font-semibold text-slate-900">{title}</h2>}
            {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function AdminSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="animate-pulse space-y-3 p-5" aria-label="Loading">
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }, (_, index) => (
          <div key={`header-${index}`} className="h-4 rounded bg-slate-100" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="grid gap-3 border-t border-slate-100 pt-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }, (_, column) => (
            <div key={column} className="h-8 rounded-lg bg-slate-100" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function AdminEmptyState({ title, description, action }) {
  return (
    <div className="px-6 py-14 text-center">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <AlertCircle size={21} />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-slate-800">{title}</h3>
      {description && <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function AdminPagination({ page, totalPages, total, onPageChange }) {
  const pages = Math.max(1, Number(totalPages) || 1);
  const currentPage = Math.min(Math.max(1, Number(page) || 1), pages);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
      <p className="text-xs text-slate-500">
        {total != null ? `${Number(total).toLocaleString()} records` : `Page ${currentPage} of ${pages}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex h-11 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={15} /> Previous
        </button>
        <span className="min-w-16 text-center text-xs font-medium text-slate-600">
          {currentPage} / {pages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pages}
          className="inline-flex h-11 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

export function AdminConfirmDialog({ open, title, description, error, confirmLabel = "Confirm", danger = false, loading = false, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  useDialogFocus(dialogRef, open, () => {
    if (!loading) onCancel();
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !loading) onCancel();
    }}>
      <section ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title" className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="admin-confirm-title" className="text-lg font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <button type="button" onClick={onCancel} disabled={loading} aria-label="Close dialog" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 disabled:opacity-40">
            <X size={18} />
          </button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} disabled={loading} className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-[#315d47] hover:bg-[#244b39]"}`}>
            {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Check size={16} />}
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export function AdminStatusBadge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    green: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
    red: "bg-rose-50 text-rose-700 ring-1 ring-rose-100",
    blue: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${tones[tone] || tones.neutral}`}>{children}</span>;
}
