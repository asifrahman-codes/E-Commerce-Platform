import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, CircleAlert, X } from "lucide-react";

const AdminToastContext = createContext(null);

export function AdminToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const sequence = useRef(0);

  const dismiss = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = "success") => {
    const id = `${Date.now()}-${++sequence.current}`;
    setToasts((items) => [...items.slice(-3), { id, message, type }]);
    timers.current.set(id, window.setTimeout(() => dismiss(id), 4500));
  }, [dismiss]);

  useEffect(() => () => {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current.clear();
  }, []);

  return (
    <AdminToastContext.Provider value={notify}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((toast) => {
          const Icon = toast.type === "error" ? CircleAlert : CheckCircle2;
          return (
            <div key={toast.id} className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-xl ${toast.type === "error" ? "border-rose-200" : "border-emerald-200"}`}>
              <Icon size={18} className={toast.type === "error" ? "mt-0.5 shrink-0 text-rose-600" : "mt-0.5 shrink-0 text-emerald-600"} />
              <p className="flex-1 text-sm font-medium leading-5 text-slate-700">{toast.message}</p>
              <button type="button" aria-label="Dismiss notification" onClick={() => dismiss(toast.id)} className="text-slate-400 hover:text-slate-700">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </AdminToastContext.Provider>
  );
}

export function useAdminToast() {
  const context = useContext(AdminToastContext);
  if (!context) throw new Error("useAdminToast must be used within AdminToastProvider.");
  return context;
}
