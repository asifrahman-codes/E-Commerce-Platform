import "../../config/env.js";
import { pool } from "../index.js";
import {
  demoSubcategoryForProductNumber,
  getDemoImageUrl,
} from "./data/demo-image-catalog.js";

const subcategoryNames = [
  "Phones", "Audio", "Laptops", "Accessories",
  "Men", "Women", "Kitchen", "Furniture",
  "Skincare", "Makeup", "Fitness", "Outdoor",
  "Games", "Learning", "Fiction", "Car Care"
];

const subcategoryProductNames = {
  Phones: ["Smartphone", "Mobile Phone", "Camera Phone"],
  Audio: ["Wireless Headphones", "Bluetooth Speaker", "Over-Ear Headset"],
  Laptops: ["Notebook Laptop", "Ultrabook", "Performance Laptop"],
  Accessories: ["Everyday Accessory", "Travel Organizer", "Compact Tech Case"],
  Men: ["Men's Shirt", "Men's Jacket", "Men's Everyday Wear"],
  Women: ["Women's Dress", "Women's Top", "Women's Everyday Wear"],
  Kitchen: ["Kitchen Appliance", "Cookware Set", "Countertop Essential"],
  Furniture: ["Accent Table", "Storage Shelf", "Home Furniture Piece"],
  Skincare: ["Daily Moisturizer", "Hydrating Serum", "Skincare Essentials Set"],
  Makeup: ["Lip Color", "Makeup Palette", "Cosmetics Set"],
  Fitness: ["Fitness Tracker", "Training Gear", "Exercise Accessory"],
  Outdoor: ["Outdoor Backpack", "Trail Gear", "Camping Essential"],
  Games: ["Board Game", "Family Game", "Strategy Game"],
  Learning: ["Learning Kit", "Educational Book Set", "Study Guide"],
  Fiction: ["Fiction Novel", "Modern Fiction", "Story Collection"],
  "Car Care": ["Car Care Kit", "Auto Cleaning Set", "Vehicle Care Essential"]
};

async function main() {
  const connection = await pool.getConnection();
  const report = {
    productsCleaned: 0,
    categoriesCleaned: 0,
    brandsCleaned: 0,
    missingImagesBefore: 0,
    imagesAdded: 0,
    brokenImagesRepaired: 0,
    remainingMissingImages: 0
  };

  try {
    await connection.beginTransaction();

    const [categories] = await connection.execute(
      "SELECT category_id, name FROM categories WHERE slug LIKE 'demo-%'"
    );
    for (const category of categories) {
      const cleanName = String(category.name).replace(/^\[DEMO\]\s*/i, "").trim();
      if (cleanName !== category.name) {
        await connection.execute(
          "UPDATE categories SET name=? WHERE category_id=? AND slug LIKE 'demo-%'",
          [cleanName, category.category_id]
        );
        report.categoriesCleaned++;
      }
    }

    const [brands] = await connection.execute(
      "SELECT brand_id, name FROM brands WHERE slug LIKE 'demo-%'"
    );
    for (const brand of brands) {
      const cleanName = String(brand.name).replace(/^\[DEMO\]\s*/i, "").trim();
      if (cleanName !== brand.name) {
        await connection.execute(
          "UPDATE brands SET name=? WHERE brand_id=? AND slug LIKE 'demo-%'",
          [cleanName, brand.brand_id]
        );
        report.brandsCleaned++;
      }
    }

    const [products] = await connection.execute(`
      SELECT p.product_id, p.slug, p.name, p.category_id,
             c.name AS category_name, b.name AS brand_name
      FROM products p
      JOIN categories c ON c.category_id=p.category_id
      JOIN brands b ON b.brand_id=p.brand_id
      WHERE p.slug LIKE 'demo-product-%'
      ORDER BY p.product_id
    `);

    for (let index = 0; index < products.length; index++) {
      const product = products[index];
      const slugNumber = Number(String(product.slug).match(/(\d+)$/)?.[1] || index + 1);
      const subcategoryName = demoSubcategoryForProductNumber(slugNumber);
      const names = subcategoryProductNames[subcategoryName];
      const cleanName = `${product.brand_name} ${names[(slugNumber - 1) % names.length]} ${String(slugNumber).padStart(3, "0")}`;
      if (product.name !== cleanName) {
        await connection.execute(
          "UPDATE products SET name=? WHERE product_id=? AND slug LIKE 'demo-product-%'",
          [cleanName, product.product_id]
        );
        report.productsCleaned++;
      }

      const [[imageCount]] = await connection.execute(
        "SELECT COUNT(*) AS c FROM product_images WHERE product_id=?",
        [product.product_id]
      );
      if (Number(imageCount.c) === 0) report.missingImagesBefore++;

      const [[primaryCount]] = await connection.execute(
        "SELECT COUNT(*) AS c FROM product_images WHERE product_id=? AND is_primary=1",
        [product.product_id]
      );

      const [existingImages] = await connection.execute(
        "SELECT image_id, public_id, image_url, is_primary FROM product_images WHERE product_id=? ORDER BY is_primary DESC,image_id",
        [product.product_id]
      );

      const unsuitable = existingImages.filter((image) =>
        String(image.public_id || "").startsWith("demo-unsplash-product-") ||
        String(image.public_id || "").startsWith("demo-product-") ||
        (String(image.public_id || "").startsWith("external:unsplash:") &&
          (
            !/^https:\/\/images\.unsplash\.com\//i.test(String(image.image_url || "")) ||
            !String(image.image_url || "").includes("shopsphere_demo=")
          ))
      );
      const unsuitableIds = unsuitable.map((image) => image.image_id);
      if (unsuitableIds.length) {
        const imageUrl = getDemoImageUrl(subcategoryName, slugNumber);
        for (const image of unsuitable) {
          await connection.execute(
            "UPDATE product_images SET image_url=?, public_id=?, is_primary=? WHERE image_id=?",
            [imageUrl, `external:unsplash:${product.slug}:1`, image.is_primary, image.image_id]
          );
          report.brokenImagesRepaired++;
        }
      }

      if (Number(imageCount.c) === 0) {
        const imageUrl = getDemoImageUrl(subcategoryName, slugNumber);
        await connection.execute(
          "INSERT INTO product_images (product_id,image_url,public_id,is_primary) VALUES (?,?,?,1)",
          [product.product_id, imageUrl, `external:unsplash:${product.slug}:1`]
        );
        report.imagesAdded++;
      } else if (Number(primaryCount.c) === 0) {
        await connection.execute(
          "UPDATE product_images SET is_primary=0 WHERE product_id=?",
          [product.product_id]
        );
        await connection.execute(
          "UPDATE product_images SET is_primary=1 WHERE image_id=?",
          [existingImages[0].image_id]
        );
      }
    }

    const [[remaining]] = await connection.execute(`
      SELECT COUNT(*) AS c
      FROM products p
      WHERE p.slug LIKE 'demo-product-%'
        AND p.status='ACTIVE'
        AND NOT EXISTS (
          SELECT 1 FROM product_images pi
          WHERE pi.product_id=p.product_id
        )
    `);
    report.remainingMissingImages = Number(remaining.c);

    await connection.commit();
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    await connection.rollback();
    console.error(`update-demo-catalog failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

main();
