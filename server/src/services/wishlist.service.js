
import * as wishlistRepository from "../repositories/wishlist.repository.js";

function createError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function parsePositiveId(value, fieldName) {
  const id = Number(value);

  if (!Number.isSafeInteger(id) || id <= 0) {
    throw createError(400, `Invalid ${fieldName}.`);
  }

  return id;
}

export async function addToWishlist(userId, productId) {
  const customerId = parsePositiveId(userId, "user ID");
  const product = parsePositiveId(productId, "product ID");

  const existingProduct =
    await wishlistRepository.findProductById(product);

  if (!existingProduct) {
    throw createError(404, "Product not found.");
  }

  const existingItem =
    await wishlistRepository.findWishlistItem(
      customerId,
      product
    );

  if (existingItem) {
    throw createError(
      409,
      "This product is already in your wishlist."
    );
  }

  try {
    return await wishlistRepository.addWishlistItem(
      customerId,
      product
    );
  } catch (error) {
    // Handles concurrent requests that attempt to add
    // the same product at nearly the same time.
    if (error.code === "ER_DUP_ENTRY") {
      throw createError(
        409,
        "This product is already in your wishlist."
      );
    }

    // Handles a product being deleted between the existence
    // check and the INSERT.
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      throw createError(404, "Product not found.");
    }

    throw error;
  }
}

export async function getMyWishlist(userId) {
  const customerId = parsePositiveId(userId, "user ID");

  const items =
    await wishlistRepository.getWishlistByUserId(customerId);

  return {
    total_items: items.length,
    items,
  };
}

export async function removeFromWishlist(userId, productId) {
  const customerId = parsePositiveId(userId, "user ID");
  const product = parsePositiveId(productId, "product ID");

  const removed =
    await wishlistRepository.removeWishlistItem(
      customerId,
      product
    );

  if (!removed) {
    throw createError(
      404,
      "This product is not in your wishlist."
    );
  }

  return {
    message: "Product removed from wishlist successfully.",
  };
}

export async function clearMyWishlist(userId) {
  const customerId = parsePositiveId(userId, "user ID");

  const deletedCount =
    await wishlistRepository.clearWishlist(customerId);

  return {
    message: "Wishlist cleared successfully.",
    deleted_count: deletedCount,
  };
}
