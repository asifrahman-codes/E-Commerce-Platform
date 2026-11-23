import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock3, Tag } from "lucide-react";
import { getFlashSales } from "../../services/flash-sale.service";
import { formatPrice, getResponsiveImageProps } from "../../utils/product.utils";
import { getErrorMessage } from "../../utils/error.utils";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SafeImage from "../../components/common/SafeImage";

function utcTimestamp(value) {
  if (value instanceof Date) return value.getTime();
  const text = String(value);
  return new Date(text.includes("T") ? text : `${text.replace(" ", "T")}Z`).getTime();
}

function Countdown({ startsAt, endsAt, now }) {
  const start = utcTimestamp(startsAt);
  const end = utcTimestamp(endsAt);
  const target = start > now ? start : end;
  const seconds = Math.max(0, Math.floor((target - now) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;

  return (
    <p className="mt-1 text-xs text-zinc-500">
      {start > now ? "Starts in" : "Ends in"}{" "}
      {[days ? `${days}d` : null, `${hours}h`, `${minutes}m`, `${remainder}s`].filter(Boolean).join(" ")}
    </p>
  );
}

export default function FlashSales() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;
    getFlashSales()
      .then((result) => {
        if (active) setCampaigns(result);
      })
      .catch((loadError) => {
        if (active) setError(getErrorMessage(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="rounded-3xl bg-gradient-to-r from-rose-700 to-orange-500 p-7 text-white sm:p-10">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-rose-100"><Tag size={17} /> Limited-time offers</p>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">Flash sales</h1>
        <p className="mt-2 max-w-2xl text-sm text-rose-50 sm:text-base">Real-time offers on selected products and variants. Prices are confirmed at checkout.</p>
      </header>

      {loading && <div className="flex min-h-56 items-center justify-center"><LoadingSpinner /></div>}
      {error && <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {!loading && !error && campaigns.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 p-12 text-center">
          <Clock3 className="mx-auto text-zinc-400" size={32} />
          <h2 className="mt-3 font-semibold text-zinc-900">No upcoming sales</h2>
          <p className="mt-1 text-sm text-zinc-500">Check back soon for scheduled offers.</p>
        </div>
      )}

      <div className="mt-8 space-y-10">
        {campaigns.map((campaign) => (
          <section key={campaign.flash_sale_id}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-zinc-900">{campaign.title}</h2>
                {campaign.description && <p className="mt-1 text-sm text-zinc-600">{campaign.description}</p>}
              </div>
              <Countdown startsAt={campaign.starts_at} endsAt={campaign.ends_at} now={now} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {campaign.products.map((product) => (
                <article key={`${campaign.flash_sale_id}-${product.variant_id}`} className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  <Link to={`/products/${product.product_id}?variant_id=${product.variant_id}`} className="block aspect-[4/3] bg-zinc-100">
                    {product.image_url && (
                      <SafeImage
                        {...getResponsiveImageProps(product.image_url, {
                          sizes: "(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
                        })}
                        alt={product.product_name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fallbackSize={44}
                      />
                    )}
                  </Link>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">{campaign.discount_type === "PERCENTAGE" ? `${Number(campaign.discount_value)}% off` : `${formatPrice(campaign.discount_value)} off`}</p>
                    <Link to={`/products/${product.product_id}?variant_id=${product.variant_id}`} className="mt-1 block font-semibold text-zinc-900 hover:text-indigo-600">{product.product_name}</Link>
                    <p className="mt-1 text-xs text-zinc-500">{[product.size, product.color].filter(Boolean).join(" · ") || product.sku}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-lg font-bold text-rose-700">{formatPrice(product.sale_price)}</span>
                      <del className="text-sm text-zinc-400">{formatPrice(product.original_price)}</del>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">{Number(product.stock)} in stock</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
