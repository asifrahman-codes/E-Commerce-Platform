
import * as productDiscoveryService
  from "../services/product-discovery.service.js";

export async function searchProducts(req, res, next) {
  try {
    const data = await productDiscoveryService.searchProducts(
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Products retrieved successfully.",
      data,
    });
  } catch (error) {
    next(error);
  }
}
