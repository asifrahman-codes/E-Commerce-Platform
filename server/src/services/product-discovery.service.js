
import * as productDiscoveryRepository from "../repositories/product-discovery.repository.js";

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parseOptionalPositiveInteger(value, fieldName) {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (!/^[1-9]\d*$/.test(String(value))) {
    throw createError(
      400,
      `${fieldName} must be a positive integer.`
    );
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw createError(400, `${fieldName} is too large.`);
  }

  return parsed;
}

function parseOptionalPrice(value, fieldName) {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed < 0 ||
    parsed > 999999999
  ) {
    throw createError(
      400,
      `${fieldName} must be a valid non-negative price.`
    );
  }

  return parsed;
}

function parseBoolean(value, fieldName) {
  if (value === undefined || value === "") {
    return undefined;
  }

  if (value === true || value === "true" || value === "1") {
    return true;
  }

  if (value === false || value === "false" || value === "0") {
    return false;
  }

  throw createError(
    400,
    `${fieldName} must be true or false.`
  );
}

export async function searchProducts(query = {}) {
  const q = query.q === undefined
    ? ""
    : String(query.q).trim();

  if (q.length > 100) {
    throw createError(
      400,
      "Search query cannot exceed 100 characters."
    );
  }

  const page = query.page === undefined
    ? 1
    : Number(query.page);

  const limit = query.limit === undefined
    ? 12
    : Number(query.limit);

  if (!Number.isSafeInteger(page) || page < 1) {
    throw createError(
      400,
      "Page must be a positive integer."
    );
  }

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 50
  ) {
    throw createError(
      400,
      "Limit must be between 1 and 50."
    );
  }

  const minPrice = parseOptionalPrice(
    query.min_price,
    "min_price"
  );

  const maxPrice = parseOptionalPrice(
    query.max_price,
    "max_price"
  );

  if (
    minPrice !== undefined &&
    maxPrice !== undefined &&
    minPrice > maxPrice
  ) {
    throw createError(
      400,
      "min_price cannot exceed max_price."
    );
  }

  const sort = query.sort === undefined
    ? "newest"
    : String(query.sort);

  const allowedSorts = [
    "newest",
    "oldest",
    "name_asc",
    "name_desc",
    "price_asc",
    "price_desc",
    "rating_asc",
    "rating_desc",
  ];

  if (!allowedSorts.includes(sort)) {
    throw createError(
      400,
      `Invalid sort. Allowed values: ${allowedSorts.join(", ")}.`
    );
  }

  const filters = {
    q,
    categoryId: parseOptionalPositiveInteger(
      query.category_id,
      "category_id"
    ),
    brandId: parseOptionalPositiveInteger(
      query.brand_id,
      "brand_id"
    ),
    minPrice,
    maxPrice,
    inStock: parseBoolean(query.in_stock, "in_stock"),
    sort,
    page,
    limit,
    offset: (page - 1) * limit,
  };

  const { products, total } =
    await productDiscoveryRepository.searchProducts(filters);

  return {
    filters: {
      q: q || null,
      category_id: filters.categoryId ?? null,
      brand_id: filters.brandId ?? null,
      min_price: minPrice ?? null,
      max_price: maxPrice ?? null,
      in_stock: filters.inStock ?? null,
      sort,
    },
    pagination: {
      page,
      limit,
      total_items: total,
      total_pages: Math.ceil(total / limit),
      has_next_page: page * limit < total,
      has_previous_page: page > 1,
    },
    products,
  };
}
