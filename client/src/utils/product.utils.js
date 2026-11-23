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

export const getResponsiveImageProps = (
  image,
  {
    sizes = "100vw",
    widths = [320, 640, 960, 1280],
    fallbackWidth = 960,
  } = {}
) => {
  const src = getImageUrl(image);
  if (!src) return {};

  try {
    const url = new URL(src, window.location.origin);
    const isProductUpload =
      url.hostname === "res.cloudinary.com" &&
      url.pathname.includes("/image/upload/") &&
      url.pathname.includes("/ecommerce/products/");
    const uploadMarker = "/image/upload/";
    const uploadIndex = url.pathname.indexOf(uploadMarker);
    const pathAfterUpload = uploadIndex < 0
      ? ""
      : url.pathname.slice(uploadIndex + uploadMarker.length);
    const firstSegment = pathAfterUpload.split("/")[0];
    const alreadyTransformed = /,|^(?:c_|e_|f_|g_|h_|q_|r_|w_|x_|y_|z_)/.test(firstSegment);

    if (!isProductUpload || alreadyTransformed) {
      return { src, sizes };
    }

    const withWidth = (width) => {
      const path = `${url.pathname.slice(0, uploadIndex + uploadMarker.length)}f_auto,q_auto,w_${width}/${pathAfterUpload}`;
      return `${url.origin}${path}${url.search}`;
    };
    const responsiveWidths = [...new Set(widths)]
      .filter((width) => Number.isSafeInteger(width) && width > 0)
      .sort((left, right) => left - right);

    return {
      src: withWidth(fallbackWidth),
      srcSet: responsiveWidths
        .map((width) => `${withWidth(width)} ${width}w`)
        .join(", "),
      sizes,
    };
  } catch {
    return { src, sizes };
  }
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
    product?.price ??
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