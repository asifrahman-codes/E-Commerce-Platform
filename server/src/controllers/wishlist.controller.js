
import * as wishlistService from "../services/wishlist.service.js";

export async function addToWishlist(req, res, next) {
  try {
    const data = await wishlistService.addToWishlist(
      req.user.user_id,
      req.body.product_id
    );

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyWishlist(req, res, next) {
  try {
    const data = await wishlistService.getMyWishlist(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function removeFromWishlist(req, res, next) {
  try {
    const data = await wishlistService.removeFromWishlist(
      req.user.user_id,
      req.params.productId
    );

    return res.status(200).json({
      success: true,
      message: data.message,
      data,
    });
  } catch (error) {
    next(error);
  }
}

export async function clearMyWishlist(req, res, next) {
  try {
    const data = await wishlistService.clearMyWishlist(
      req.user.user_id
    );

    return res.status(200).json({
      success: true,
      message: data.message,
      data,
    });
  } catch (error) {
    next(error);
  }
}
