import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, Package } from "lucide-react";
import { getSharedWishlist } from "../../services/platform.service";
import { formatPrice, getImageUrl } from "../../utils/product.utils";

export default function SharedWishlist() {
  const { token } = useParams();
  const [share, setShare] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSharedWishlist(token).then((result) => setShare(result?.data ?? result)).catch((loadError) => setError(loadError.message || "Shared wishlist not found."));
  }, [token]);

  if (error) return <div className="premium-page mx-auto max-w-3xl px-4 py-20 text-center"><Heart className="mx-auto text-zinc-400" /><h1 className="mt-4 text-2xl font-bold">{error}</h1></div>;
  if (!share) return <div className="premium-page mx-auto max-w-3xl px-4 py-20 text-center">Loading shared wishlist…</div>;

  return (
    <div className="premium-page container-custom py-10">
      <h1 className="text-3xl font-semibold text-ink">{share.title || "Shared wishlist"}</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {share.items.map((item) => (
          <article key={item.product_id} className="rounded-2xl border border-line bg-white p-4">
            <Link to={`/products/${item.product_id}`} className="flex aspect-square items-center justify-center bg-zinc-50">
              {getImageUrl(item.primary_image_url) ? <img src={getImageUrl(item.primary_image_url)} alt={item.name} className="h-full w-full object-contain" /> : <Package className="text-zinc-300" />}
            </Link>
            <Link to={`/products/${item.product_id}`} className="mt-3 block font-medium text-ink">{item.name}</Link>
            <p className="mt-1 font-semibold">{formatPrice(item.base_price)}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
