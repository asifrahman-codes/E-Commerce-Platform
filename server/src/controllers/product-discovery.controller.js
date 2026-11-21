
import asyncHandler from "../utils/asyncHandler.js";
import * as productDiscoveryService
  from "../services/product-discovery.service.js";
import * as productComparisonService
  from "../services/product-comparison.service.js";

export const searchProducts = asyncHandler(async (req, res) => {
  const data = await productDiscoveryService.searchProducts(req.query);

  return res.status(200).json({
    success: true,
    message: "Products retrieved successfully.",
    data,
  });
});

export const compareProducts = asyncHandler(async (req, res) => {
  const products = await productComparisonService.compareProducts(req.query.ids);

  return res.status(200).json({
    success: true,
    message: "Products retrieved for comparison.",
    data: { products },
  });
});
