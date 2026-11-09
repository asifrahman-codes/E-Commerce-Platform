export const unwrapResponse = (response) => {
  let data = response?.data ?? response;

  // Handle common API response wrappers.
  if (data?.data !== undefined) {
    data = data.data;
  }

  return data;
};

export const normalizeProductList = (response) => {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.results)) return data.results;

  return [];
};

export const normalizeProduct = (response) => {
  const data = unwrapResponse(response);

  if (data?.product) return data.product;
  if (data?.item) return data.item;

  return data;
};

export const normalizeImages = (response) => {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.images)) return data.images;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

export const getProductId = (product) =>
  product?.product_id ?? product?.id ?? product?.productId;

export const getProductName = (product) =>
  product?.name ??
  product?.product_name ??
  product?.title ??
  "Untitled Product";

export const getProductPrice = (product) => {
  const price =
    product?.min_price ??
    product?.sale_price ??
    product?.price ??
    product?.base_price;

  return Number(price ?? 0);
};

export const getProductStock = (product) => {
  return Number(
    product?.total_stock ??
    product?.stock_quantity ??
    product?.quantity ??
    product?.stock ??
    0
  );
};

export const getImageUrl = (image) => {
  if (typeof image === "string") return image;

  return (
    image?.image_url ??
    image?.url ??
    image?.image_path ??
    image?.path ??
    ""
  );
};

export const getProductImages = (product) => {
  const images = Array.isArray(product?.images)
    ? product.images
    : [];

  const normalized = images
    .map(getImageUrl)
    .filter(Boolean);

  if (normalized.length) return normalized;

  const primaryImage =
    product?.primary_image ??
    product?.image_url ??
    product?.image ??
    product?.thumbnail;

  const url = getImageUrl(primaryImage);

  return url ? [url] : [];
};

export const formatPrice = (price) => {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));
};