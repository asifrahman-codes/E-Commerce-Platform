export const unwrapResponse = (response) => {
  const body = response?.data ?? response;
  return body?.data ?? body;
};

export const normalizeProductList = (response) => {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.items)) return data.items;

  return [];
};

export const normalizeProduct = (response) => {
  const data = unwrapResponse(response);

  return data?.product ?? data?.item ?? data;
};

export const normalizeImages = (response) => {
  const body = response?.data ?? response;
  const data = body?.data ?? body;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.images)) return data.images;

  return [];
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

export const getPrimaryImage = (images = []) => {
  return (
    images.find((image) => Number(image.is_primary) === 1) ??
    images[0] ??
    null
  );
};

export const getProductId = (product) =>
  product?.product_id ?? product?.id;

export const getProductName = (product) =>
  product?.name ?? "Untitled Product";

export const getProductPrice = (product) =>
  Number(
    product?.display_price ??
    product?.base_price ??
    0
  );

export const getProductStock = (product) =>
  Number(product?.total_stock ?? 0);

export const getProductRating = (product) =>
  Number(product?.average_rating ?? 0);

export const getProductReviewCount = (product) =>
  Number(product?.review_count ?? 0);


export const formatPrice = (price) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));