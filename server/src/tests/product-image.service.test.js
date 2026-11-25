import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../utils/cloudinary-image.js", () => ({
  cleanupReplacedImage: vi.fn(),
  cleanupUploadedImages: vi.fn(),
  deleteCloudinaryImage: vi.fn(),
  uploadImageBuffer: vi.fn(),
  validateImageFile: vi.fn(),
}));

vi.mock("../repositories/admin-product.repository.js", () => ({
  findAdminProductById: vi.fn(),
}));

vi.mock("../repositories/product.repository.js", () => ({
  deleteProduct: vi.fn(),
}));

vi.mock("../repositories/productImage.repository.js", () => ({
  createProductImages: vi.fn(),
  deleteImageAndPromote: vi.fn(),
  findImageById: vi.fn(),
  getProductImages: vi.fn(),
  replaceImageAsset: vi.fn(),
  setPrimaryImage: vi.fn(),
}));

import * as cloudinaryImage from "../utils/cloudinary-image.js";
import * as adminProductRepository from "../repositories/admin-product.repository.js";
import * as productImageRepository from "../repositories/productImage.repository.js";
import {
  replaceProductImageService,
  uploadProductImagesService,
} from "../services/productImage.service.js";

describe("product image service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminProductRepository.findAdminProductById.mockResolvedValue({
      product_id: 14,
    });
    productImageRepository.getProductImages.mockResolvedValue([]);
    productImageRepository.createProductImages.mockImplementation(
      async (images) => images
    );
    cloudinaryImage.uploadImageBuffer.mockResolvedValue({
      secure_url: "https://res.cloudinary.com/demo/image/upload/new.jpg",
      public_id: "shopsphere/products/new",
    });
  });

  it("rejects uploads exceeding the product image cap before uploading", async () => {
    productImageRepository.getProductImages.mockResolvedValue(
      Array.from({ length: 10 }, (_, index) => ({
        image_id: index + 1,
        display_order: index,
      }))
    );

    await expect(
      uploadProductImagesService(14, [
        { mimetype: "image/png", buffer: Buffer.from("file") },
      ])
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(cloudinaryImage.uploadImageBuffer).not.toHaveBeenCalled();
    expect(productImageRepository.createProductImages).not.toHaveBeenCalled();
  });

  it("cleans up newly uploaded assets when database insertion fails", async () => {
    productImageRepository.getProductImages.mockResolvedValue([
      { image_id: 5, display_order: 0, is_primary: 1 },
    ]);
    productImageRepository.createProductImages.mockRejectedValue(
      new Error("database unavailable")
    );

    await expect(
      uploadProductImagesService(14, [
        { mimetype: "image/png", buffer: Buffer.from("file") },
      ])
    ).rejects.toThrow("database unavailable");

    expect(cloudinaryImage.cleanupUploadedImages).toHaveBeenCalledWith(
      [
        {
          product_id: 14,
          image_url: "https://res.cloudinary.com/demo/image/upload/new.jpg",
          public_id: "shopsphere/products/new",
        },
      ],
      "product:14"
    );
  });

  it("leaves an existing image untouched when replacement upload fails", async () => {
    productImageRepository.findImageById.mockResolvedValue({
      image_id: 22,
      public_id: "shopsphere/products/old",
    });
    cloudinaryImage.uploadImageBuffer.mockRejectedValue(
      new Error("Cloudinary unavailable")
    );

    await expect(
      replaceProductImageService(22, {
        mimetype: "image/png",
        buffer: Buffer.from("file"),
      })
    ).rejects.toThrow("Cloudinary unavailable");

    expect(productImageRepository.replaceImageAsset).not.toHaveBeenCalled();
    expect(cloudinaryImage.cleanupReplacedImage).not.toHaveBeenCalled();
  });
});
