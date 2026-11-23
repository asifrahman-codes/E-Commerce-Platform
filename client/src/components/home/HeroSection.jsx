import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, Package, ShieldCheck, Truck } from "lucide-react";

import productService from "../../services/product.service";
import { formatPrice, getImageUrl, getProductId, getProductName, getResponsiveImageProps } from "../../utils/product.utils";

const HeroSection = () => {
  const [spotlight, setSpotlight] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    productService.getProducts({ sort: "best_selling", page: 1, limit: 1 })
      .then((result) => {
        if (active) setSpotlight(result.products[0] ?? null);
      })
      .catch((error) => {
        console.error("Homepage spotlight product could not be loaded:", error);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const image = getImageUrl(
    spotlight?.primary_image ??
    spotlight?.primary_image_url ??
    spotlight?.image_url
  );
  const productId = spotlight ? getProductId(spotlight) : null;
  const imageProps = getResponsiveImageProps(image, {
    sizes: "(min-width: 1024px) 40vw, 100vw",
    widths: [640, 960, 1280, 1600],
    fallbackWidth: 1280,
  });

  return (
    <section className="overflow-hidden bg-canvas">
      <div className="container-custom py-6 sm:py-10 lg:py-12">
        <div className="premium-enter relative grid min-h-[500px] overflow-hidden rounded-[2rem] border border-white/70 bg-[#e7eee7] lg:grid-cols-[1.02fr_0.98fr]">
          <div className="relative z-10 flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:px-14">
            <p className="shop-eyebrow flex items-center gap-2">
              <span className="h-px w-7 bg-indigo-600" />
              The ShopSphere edit
            </p>
            <h1 className="mt-5 max-w-xl text-[2.7rem] font-semibold leading-[1.02] tracking-[-0.052em] text-ink sm:text-5xl lg:text-[4.1rem]">
              Find good things.
              <span className="mt-1 block font-normal text-indigo-700">Make them yours.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#59675d] sm:text-lg">
              Discover considered finds for everyday living, all in one place.
              Browse at your pace and find something that feels just right.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="shop-button shop-button-primary">
                Explore the collection
                <ArrowRight size={17} />
              </Link>
              <Link to="/categories" className="shop-button shop-button-secondary">
                Browse categories
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#59675d] sm:text-sm">
              <span className="inline-flex items-center gap-2"><Truck size={16} className="text-indigo-700" /> Delivery options at checkout</span>
              <span className="inline-flex items-center gap-2"><ShieldCheck size={16} className="text-indigo-700" /> Secure checkout</span>
            </div>
          </div>

          <div className="relative flex min-h-[330px] items-center justify-center overflow-hidden bg-[#dfe5dc] p-6 sm:p-10 lg:min-h-full">
            <div className="absolute -right-14 -top-20 h-72 w-72 rounded-full border border-white/60" />
            <div className="absolute -bottom-28 -left-16 h-80 w-80 rounded-full border border-white/60" />
            <div className="absolute right-10 top-10 h-40 w-40 rounded-full bg-[#c4d2c2]/70 blur-2xl" />

            {productId && image ? (
              <Link
                to={`/products/${productId}`}
                className="group relative z-10 flex h-full w-full max-w-[500px] flex-col overflow-hidden rounded-[1.6rem] border border-white/80 bg-white/80 p-3 shadow-[0_24px_70px_rgba(29,48,38,0.12)] backdrop-blur transition hover:-translate-y-1"
              >
                <div className="relative min-h-[250px] flex-1 overflow-hidden rounded-[1.2rem] bg-[#f7f8f5] sm:min-h-[320px]">
                  <img
                    {...imageProps}
                    alt={getProductName(spotlight)}
                    fetchPriority="high"
                    decoding="async"
                    className="h-full w-full object-contain p-8 transition duration-500 group-hover:scale-[1.03] sm:p-12"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-800 shadow-sm">
                    Customer favorite
                  </span>
                  <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-700 text-white shadow-lg transition group-hover:translate-x-0.5">
                    <ArrowDownRight size={18} />
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 px-2 py-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                      {spotlight.brand_name || "ShopSphere collection"}
                    </p>
                    <p className="mt-1 truncate font-medium text-ink">{getProductName(spotlight)}</p>
                  </div>
                  <span className="shrink-0 text-sm font-semibold text-ink">
                    {formatPrice(spotlight.display_price ?? spotlight.base_price)}
                  </span>
                </div>
              </Link>
            ) : (
              <div className="relative z-10 flex min-h-[300px] w-full max-w-[500px] flex-col items-center justify-center rounded-[1.6rem] border border-white/80 bg-white/65 p-8 text-center shadow-[0_24px_70px_rgba(29,48,38,0.08)]">
                {loading ? (
                  <div role="status" aria-label="Loading featured product" className="h-64 w-full animate-pulse rounded-2xl bg-[#e6ebe3]" />
                ) : (
                  <>
                    <Package size={45} strokeWidth={1.2} className="text-[#829786]" />
                    <p className="mt-4 text-sm font-medium text-ink">A growing collection, chosen for you.</p>
                    <Link to="/products" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-indigo-700">
                      Browse products <ArrowRight size={15} />
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
