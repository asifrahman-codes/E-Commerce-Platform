import { useCallback, useEffect, useState } from "react";
import { Gift, Plus, Save } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import {
  createFlashSale,
  getAdminFlashSales,
  updateFlashSale,
} from "../../services/flash-sale.service";
import {
  getAdminLoyaltySettings,
  updateAdminLoyaltySettings,
} from "../../services/loyalty.service";
import { formatPrice } from "../../utils/product.utils";
import { getErrorMessage } from "../../utils/error.utils";

const emptyCampaign = {
  title: "",
  description: "",
  starts_at: "",
  ends_at: "",
  discount_type: "PERCENTAGE",
  discount_value: "",
  status: "ACTIVE",
  target_type: "PRODUCT",
  target_ids: "",
  per_customer_limit: "",
};

function storedDateToIso(value) {
  if (value instanceof Date) return value.toISOString();
  const text = String(value);
  return new Date(text.includes("T") ? text : `${text.replace(" ", "T")}Z`).toISOString();
}

export default function AdminRewardsSales() {
  const [settings, setSettings] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState(emptyCampaign);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [loyalty, sales] = await Promise.all([
        getAdminLoyaltySettings(),
        getAdminFlashSales(),
      ]);
      setSettings({
        ...loyalty,
        expiry_days: loyalty.expiry_days == null ? "" : String(loyalty.expiry_days),
      });
      setCampaigns(sales);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveSettings = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const result = await updateAdminLoyaltySettings({
        points_per_currency: Number(settings.points_per_currency),
        currency_per_point: Number(settings.currency_per_point),
        minimum_redemption_points: Number(settings.minimum_redemption_points),
        expiry_days: settings.expiry_days === "" ? null : Number(settings.expiry_days),
        status: settings.status,
      });
      setSettings({
        ...result,
        expiry_days: result.expiry_days == null ? "" : String(result.expiry_days),
      });
      setMessage("Reward settings saved.");
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const submitCampaign = async (event) => {
    event.preventDefault();
    const idValues = form.target_ids.split(",").map((id) => id.trim());
    const ids = idValues.map(Number);
    if (
      !ids.length ||
      idValues.some((value, index) => !value || !Number.isSafeInteger(ids[index]) || ids[index] <= 0)
    ) {
      setError("Enter one or more valid product or variant IDs.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await createFlashSale({
        title: form.title,
        description: form.description || null,
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        status: form.status,
        targets: ids.map((id) => ({
          [form.target_type === "PRODUCT" ? "product_id" : "variant_id"]: id,
          per_customer_limit: form.per_customer_limit ? Number(form.per_customer_limit) : null,
        })),
      });
      setForm(emptyCampaign);
      setMessage("Flash sale campaign created.");
      await load();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const toggleCampaign = async (campaign) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await updateFlashSale(campaign.flash_sale_id, {
        title: campaign.title,
        description: campaign.description,
        starts_at: storedDateToIso(campaign.starts_at),
        ends_at: storedDateToIso(campaign.ends_at),
        discount_type: campaign.discount_type,
        discount_value: Number(campaign.discount_value),
        status: campaign.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
      });
      await load();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  if (loading && !settings) return <div className="flex min-h-64 items-center justify-center"><LoadingSpinner /></div>;

  return (
    <div className="space-y-8">
      <header className="flex items-start gap-3">
        <div className="rounded-xl bg-indigo-100 p-3 text-indigo-700"><Gift size={22} /></div>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Rewards & flash sales</h1>
          <p className="mt-1 text-sm text-zinc-500">Configure point value, expiry, and scheduled product campaigns.</p>
        </div>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

      {settings && (
        <form onSubmit={saveSettings} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-zinc-900">Loyalty settings</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Points earned per PKR 1" type="number" step="0.0001" value={settings.points_per_currency} onChange={(value) => setSettings({ ...settings, points_per_currency: value })} />
            <Field label="PKR value per point" type="number" step="0.0001" value={settings.currency_per_point} onChange={(value) => setSettings({ ...settings, currency_per_point: value })} />
            <Field label="Minimum redemption points" type="number" min="1" value={settings.minimum_redemption_points} onChange={(value) => setSettings({ ...settings, minimum_redemption_points: value })} />
            <Field label="Expiry days (blank means no expiry)" type="number" min="1" value={settings.expiry_days} onChange={(value) => setSettings({ ...settings, expiry_days: value })} />
            <label className="text-sm font-medium text-zinc-700">
              Rewards status
              <select value={settings.status} onChange={(event) => setSettings({ ...settings, status: event.target.value })} className="mt-1 min-h-11 block w-full rounded-lg border border-zinc-300 px-3 py-2">
                <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
              </select>
            </label>
          </div>
          <button type="submit" disabled={saving} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Save size={16} /> Save reward settings</button>
        </form>
      )}

      <form onSubmit={submitCampaign} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-900">Schedule a flash sale</h2>
        <p className="mt-1 text-sm text-zinc-500">Use existing product IDs or variant IDs. The server validates current prices, schedule, stock, and overlapping targets.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Campaign title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} />
          <Field label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
          <Field label="Starts at (local time)" type="datetime-local" value={form.starts_at} onChange={(value) => setForm({ ...form, starts_at: value })} />
          <Field label="Ends at (local time)" type="datetime-local" value={form.ends_at} onChange={(value) => setForm({ ...form, ends_at: value })} />
          <label className="text-sm font-medium text-zinc-700">Discount type
            <select value={form.discount_type} onChange={(event) => setForm({ ...form, discount_type: event.target.value })} className="mt-1 min-h-11 block w-full rounded-lg border border-zinc-300 px-3 py-2">
              <option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed amount per unit</option>
            </select>
          </label>
          <Field label={form.discount_type === "PERCENTAGE" ? "Discount percent" : "Discount amount (PKR)"} type="number" min="0.01" step="0.01" value={form.discount_value} onChange={(value) => setForm({ ...form, discount_value: value })} />
          <label className="text-sm font-medium text-zinc-700">Target type
            <select value={form.target_type} onChange={(event) => setForm({ ...form, target_type: event.target.value })} className="mt-1 min-h-11 block w-full rounded-lg border border-zinc-300 px-3 py-2">
              <option value="PRODUCT">Products</option><option value="VARIANT">Variants</option>
            </select>
          </label>
          <Field label={`${form.target_type === "PRODUCT" ? "Product" : "Variant"} IDs (comma-separated)`} value={form.target_ids} onChange={(value) => setForm({ ...form, target_ids: value })} />
          <Field label="Per-customer quantity limit (optional)" type="number" min="1" value={form.per_customer_limit} onChange={(value) => setForm({ ...form, per_customer_limit: value })} />
        </div>
        <button type="submit" disabled={saving} className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Plus size={16} /> Create campaign</button>
      </form>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-900">Campaigns</h2>
        {campaigns.length === 0 ? <p className="rounded-xl border border-dashed p-6 text-sm text-zinc-500">No campaigns have been created.</p> : campaigns.map((campaign) => (
          <article key={campaign.flash_sale_id} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-zinc-900">{campaign.title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{campaign.effective_status} · {campaign.discount_type === "PERCENTAGE" ? `${campaign.discount_value}%` : formatPrice(campaign.discount_value)} · {new Date(storedDateToIso(campaign.starts_at)).toLocaleString()} to {new Date(storedDateToIso(campaign.ends_at)).toLocaleString()}</p>
              </div>
              <button type="button" disabled={saving} onClick={() => toggleCampaign(campaign)} className="min-h-11 rounded-lg border px-3 py-2 text-sm font-medium disabled:opacity-50">
                {campaign.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {campaign.targets.map((target) => (
                <div key={target.target_id} className="rounded-xl bg-zinc-50 p-3">
                  <p className="text-sm font-medium text-zinc-800">{target.product_name} · {target.target_type === "PRODUCT" ? "all active variants" : `variant ${target.variant_id}`}</p>
                  {target.per_customer_limit && <p className="mt-1 text-xs text-zinc-500">Limit: {target.per_customer_limit} per customer</p>}
                  <div className="mt-2 flex flex-wrap gap-2">
                    {target.price_preview.map((price) => (
                      <span key={price.variant_id} className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs">
                        {price.sku}: <del className="text-zinc-400">{formatPrice(price.original_price)}</del>{" "}
                        <strong className="text-rose-700">{formatPrice(price.sale_price)}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", ...props }) {
  return (
    <label className="text-sm font-medium text-zinc-700">
      {label}
      <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} {...props} className="mt-1 min-h-11 block w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:border-indigo-500" />
    </label>
  );
}
