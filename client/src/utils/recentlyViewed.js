const STORAGE_KEY = "shopsphere.recentlyViewedProducts";
const MAX_RECENT_PRODUCTS = 8;

export function getRecentlyViewedProducts() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(stored) ? stored : [];
  } catch (error) {
    console.error("Recently viewed products could not be loaded:", error);
    return [];
  }
}

export function rememberRecentlyViewedProduct(product) {
  const productId = product?.product_id ?? product?.id;
  if (!productId) return;

  try {
    const products = getRecentlyViewedProducts().filter(
      (item) => String(item.product_id ?? item.id) !== String(productId)
    );

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { ...product, product_id: productId },
        ...products,
      ].slice(0, MAX_RECENT_PRODUCTS))
    );
  } catch (error) {
    console.error("Recently viewed product could not be saved:", error);
  }
}
