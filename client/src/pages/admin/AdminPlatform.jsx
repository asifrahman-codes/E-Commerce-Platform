import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import {
  getAuditLogs,
  getCustomerSegments,
  getInventoryForecast,
  getStoreSettings,
  downloadSalesCsv,
  downloadSalesExcel,
  updateStoreSettings,
} from "../../services/platform.service";

export default function AdminPlatform() {
  const [settings, setSettings] = useState({});
  const [segments, setSegments] = useState({});
  const [forecast, setForecast] = useState([]);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");

  const load = async () => {
    setStatus("");
    try {
      const [settingsResult, segmentsResult, forecastResult, logsResult] = await Promise.all([
        getStoreSettings(),
        getCustomerSegments(),
        getInventoryForecast(),
        getAuditLogs(),
      ]);
      setSettings(settingsResult?.data ?? settingsResult ?? {});
      setSegments(segmentsResult?.data ?? segmentsResult ?? {});
      setForecast(forecastResult?.data ?? forecastResult ?? []);
      setLogs(logsResult?.data ?? logsResult ?? []);
    } catch (error) {
      setStatus(error.message || "Unable to load platform data.");
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event.preventDefault();
    try {
      const result = await updateStoreSettings(settings);
      setSettings(result?.data ?? result ?? settings);
      setStatus("Store settings saved.");
    } catch (error) {
      setStatus(error.message || "Unable to save store settings.");
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Platform</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Store settings & insights</h1></div>
        <button type="button" onClick={load} className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold"><RefreshCw size={16}/> Refresh</button>
      </header>
      {status && <p role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-sm">{status}</p>}

      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">Store settings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {["store_name","support_email","currency","timezone"].map((key) => (
            <label key={key} className="text-sm font-medium text-slate-700 capitalize">{key.replaceAll("_"," ")}
              <input value={settings[key] ?? ""} onChange={(event) => setSettings((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3" />
            </label>
          ))}
        </div>
        <button type="submit" className="mt-4 h-11 rounded-lg bg-[#315d47] px-4 text-sm font-semibold text-white">Save settings</button>
      </form>

      <section className="grid gap-4 sm:grid-cols-4">
        {[["VIP", segments.vip], ["Active", segments.active], ["Prospects", segments.prospects], ["At risk", segments.at_risk]].map(([label, value]) => (
          <article key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{Number(value ?? 0).toLocaleString()}</p></article>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between"><h2 className="font-bold">Reports</h2><div className="flex gap-2"><button type="button" onClick={downloadSalesCsv} className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm"><Download size={15}/> CSV</button><button type="button" onClick={downloadSalesExcel} className="inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm"><Download size={15}/> Excel</button></div></div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">Inventory forecast</h2>
        <div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="py-2">Product</th><th>SKU</th><th>Stock</th><th>Days remaining</th></tr></thead><tbody>{forecast.map((item) => <tr key={item.variant_id} className="border-t"><td className="py-3">{item.product_name}</td><td>{item.sku}</td><td>{item.stock}</td><td>{item.estimated_days_remaining ?? "No recent sales"}</td></tr>)}</tbody></table></div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">Audit log</h2>
        <div className="mt-4 max-h-80 overflow-auto"><table className="w-full text-left text-sm"><thead><tr><th className="py-2">Time</th><th>Actor</th><th>Action</th><th>Entity</th></tr></thead><tbody>{logs.map((log) => <tr key={log.audit_id} className="border-t"><td className="py-3 pr-3">{new Date(log.created_at).toLocaleString()}</td><td className="pr-3">{log.actor_email || "System"}</td><td className="pr-3">{log.action}</td><td>{log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ""}</td></tr>)}</tbody></table></div>
      </section>
    </div>
  );
}
