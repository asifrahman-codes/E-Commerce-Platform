/**
 * Comprehensive, idempotent ShopSphere demo data seed.
 * Uses the live database schema and only inserts marker-named DEMO records.
 */
import "../../config/env.js";
import crypto from "node:crypto";
import { pool } from "../index.js";
import { hashPassword } from "../../utils/security/bcrypt.helper.js";
import {
  demoSubcategoryForProductNumber,
  getDemoImageUrl,
} from "./data/demo-image-catalog.js";

const DEMO_PASSWORD = "DemoCustomer!2026";
const DEMO_ADMIN_PASSWORD = "DemoAdmin!2026";
const DEMO_MARKER = "[DEMO]";
const tableColumnsCache = new Map();

function dateDaysAgo(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function demoQuestionTemplates(subcategoryName, productNumber) {
  const templates = {
    Phones: [
      "Does this model support 5G and dual SIM cards?",
      "Is a charger or USB cable included in the box?",
      "How does the camera perform in low-light conditions?"
    ],
    Audio: [
      "Does this support active noise cancellation?",
      "Can it connect to two devices at the same time?",
      "Is it comfortable for long listening sessions?"
    ],
    Laptops: [
      "Can the memory be upgraded after purchase?",
      "Is the display suitable for photo or video editing?",
      "How long does the battery typically last?"
    ],
    Accessories: [
      "What is included with this accessory?",
      "Does it fit standard everyday-use sizes?",
      "Is the material suitable for frequent travel?"
    ],
    Men: [
      "Is the sizing accurate compared with standard measurements?",
      "Is this suitable for machine washing?",
      "Will the fabric remain comfortable throughout the day?"
    ],
    Women: [
      "How accurate is the size chart for this item?",
      "Can this be worn for both casual and formal occasions?",
      "What fabric and care instructions does it use?"
    ],
    Kitchen: [
      "Is this compatible with standard household power or cookware?",
      "Are the removable parts dishwasher safe?",
      "What capacity does this model provide?"
    ],
    Furniture: [
      "What are the assembled dimensions?",
      "Does this require tools or professional assembly?",
      "What is the maximum supported weight?"
    ],
    Skincare: [
      "Is this suitable for sensitive skin?",
      "How often should this be used?",
      "Can it be used with sunscreen or makeup?"
    ],
    Makeup: [
      "Is this suitable for sensitive skin?",
      "What skin tones or finishes does this work best with?",
      "How long does the finish typically last?"
    ],
    Fitness: [
      "Does this require batteries or charging?",
      "Is it suitable for beginners?",
      "Can it be used indoors and outdoors?"
    ],
    Outdoor: [
      "Is this suitable for wet or windy conditions?",
      "What is the maximum recommended load?",
      "How should it be cleaned and stored?"
    ],
    Games: [
      "How many players can participate?",
      "What is the recommended age range?",
      "How long does a typical game take?"
    ],
    Learning: [
      "Which age group is this learning kit intended for?",
      "Are instructions or answer guides included?",
      "Does it require additional materials?"
    ],
    Fiction: [
      "Is this part of a series?",
      "What genre and reading level is it intended for?",
      "Is this edition hardcover or paperback?"
    ],
    "Car Care": [
      "Does this work on paint-safe surfaces?",
      "Are microfiber cloths or tools included?",
      "Is it suitable for both interior and exterior use?"
    ]
  };
  return (templates[subcategoryName] ?? templates.Accessories).map((text, index) =>
    `[DEMO] ${text}`
  );
}

const q = (value) => `\`${String(value).replaceAll("`", "``")}\``;

function has(columns, table, column) {
  return columns.get(table)?.has(column) ?? false;
}

async function insertIgnore(connection, table, columns, values) {
  const names = Object.keys(values).filter((name) => columns.includes(name));
  if (!names.length) return { affectedRows: 0 };
  const sql = `INSERT IGNORE INTO ${q(table)} (${names.map(q).join(", ")}) VALUES (${names.map(() => "?").join(", ")})`;
  return connection.execute(sql, names.map((name) => values[name]));
}

async function selectId(connection, table, idColumn, where, params) {
  const [[row]] = await connection.execute(
    `SELECT ${q(idColumn)} AS id FROM ${q(table)} WHERE ${where} LIMIT 1`,
    params
  );
  return row?.id ?? null;
}

async function getDemoBaseline(connection, table, column, marker) {
  if (!tableColumnsCache.has(table) || !tableColumnsCache.get(table).has(column)) return 0;
  const [[row]] = await connection.execute(
    `SELECT COUNT(*) AS count FROM ${q(table)} WHERE ${q(column)} LIKE ?`,
    [`%${marker}%`]
  );
  return Number(row.count);
}

async function main() {
  const connection = await pool.getConnection();
  const counts = {};
  const baseline = {};
  for (const key of ["users","categories","subcategories","brands","products","variants","images","carts","wishlists",
                     "coupons","orders","order_items","payments","addresses","inventory_transactions","notifications","reviews","questions","answers"]) counts[key] = 0;
  try {
    const [schemaRows] = await connection.execute(
      "SELECT TABLE_NAME, COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE()"
    );
    for (const row of schemaRows) {
      if (!tableColumnsCache.has(row.TABLE_NAME)) tableColumnsCache.set(row.TABLE_NAME, new Set());
      tableColumnsCache.get(row.TABLE_NAME).add(row.COLUMN_NAME);
    }
    await connection.beginTransaction();

    for (const [name, description] of [
      ["Admin", "System Administrator"],
      ["Customer", "Registered Customer"],
    ]) {
      await connection.execute("INSERT IGNORE INTO roles (name, description) VALUES (?, ?)", [name, description]);
    }
    const [[customerRole]] = await connection.execute("SELECT role_id FROM roles WHERE name = 'Customer' LIMIT 1");
    const [[adminRole]] = await connection.execute("SELECT role_id FROM roles WHERE name = 'Admin' LIMIT 1");

    // Administrator and 20 example.com customers.
    const adminEmail = "demo.admin@shopsphere.example";
    const [existingAdmin] = await connection.execute("SELECT user_id FROM users WHERE email = ? LIMIT 1", [adminEmail]);
    let adminId;
    if (existingAdmin.length) {
      adminId = existingAdmin[0].user_id;
    } else {
      const hash = await hashPassword(DEMO_ADMIN_PASSWORD);
      const [r] = await connection.execute(
        `INSERT INTO users (role_id, first_name, last_name, email, password, email_verified, status)
         VALUES (?, 'Demo', 'Administrator', ?, ?, 1, 'ACTIVE')`,
        [adminRole.role_id, adminEmail, hash]
      );
      adminId = r.insertId;
      counts.users++;
    }

    baseline.users = await getDemoBaseline(connection, "users", "email", "demo.");
    const customerIds = [];
    const customerHash = await hashPassword(DEMO_PASSWORD);
    for (let i = 1; i <= 20; i++) {
      const email = `demo.customer${String(i).padStart(2, "0")}@example.com`;
      const [existing] = await connection.execute("SELECT user_id FROM users WHERE email = ? LIMIT 1", [email]);
      if (existing.length) {
        customerIds.push(existing[0].user_id);
        continue;
      }
      const [r] = await connection.execute(
        `INSERT INTO users (role_id, first_name, last_name, email, password, phone, email_verified, status)
         VALUES (?, ?, ?, ?, ?, ?, 1, 'ACTIVE')`,
        [customerRole.role_id, "Demo", `Customer${String(i).padStart(2, "0")}`, email, customerHash,
         `+1-555-${String(1000 + i)}`]
      );
      customerIds.push(r.insertId);
      counts.users++;
    }

    // Addresses
    counts.addresses = 0;
    for (let i = 0; i < customerIds.length; i++) {
      const [[addressExists]] = await connection.execute(
        "SELECT COUNT(*) AS c FROM addresses WHERE user_id=? AND street=?", [customerIds[i], `[DEMO] ${i + 10} Example Avenue`]
      );
      if (Number(addressExists.c) > 0) continue;
      const [r] = await insertIgnore(connection, "addresses",
        [...tableColumnsCache.get("addresses")],
        { user_id: customerIds[i], country: "United States", city: "Demo City",
          postal_code: `100${String(i).padStart(2, "0")}`, street: `[DEMO] ${i + 10} Example Avenue`,
          is_default: 1 });
      counts.addresses += r.affectedRows;
    }

    // 8 main categories and 16 subcategories. parent_id is used only if live schema supports it.
    const mainNames = ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Toys", "Books", "Automotive"];
    const subNames = ["Phones", "Audio", "Laptops", "Accessories", "Men", "Women", "Kitchen", "Furniture",
      "Skincare", "Makeup", "Fitness", "Outdoor", "Games", "Learning", "Fiction", "Car Care"];
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
    const categoryIds = [];
    for (let i = 0; i < mainNames.length; i++) {
      const name = mainNames[i];
      const canonicalSlug = mainNames[i].toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const slug = `demo-${canonicalSlug}`;
      let id = await selectId(connection, "categories", "category_id", "slug = ?", [slug]);
      if (!id) id = await selectId(connection, "categories", "category_id", "slug = ?", [canonicalSlug]);
      if (id) {
        if (await selectId(connection, "categories", "category_id", "category_id=? AND slug LIKE 'demo-%'", [id])) {
          await connection.execute(
            "UPDATE categories SET name=? WHERE category_id=? AND slug LIKE 'demo-%'",
            [name, id]
          );
        }
        categoryIds.push(id);
      } else {
        const values = { name, slug, description: "[DEMO] Main product category", status: "ACTIVE" };
        const [r] = await insertIgnore(connection, "categories", [...tableColumnsCache.get("categories")], values);
        categoryIds.push(await selectId(connection, "categories", "category_id", "slug = ?", [slug]) || r.insertId);
        if (r.affectedRows) counts.categories++;
      }
    }
    const subCategoryIds = [];
    for (let i = 0; i < subNames.length; i++) {
      const name = subNames[i];
      const canonicalSlug = subNames[i].toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const slug = `demo-${canonicalSlug}`;
      let id = await selectId(connection, "categories", "category_id", "slug = ?", [slug]);
      if (!id) id = await selectId(connection, "categories", "category_id", "slug = ?", [canonicalSlug]);
      if (!id) {
        const values = { name, slug, description: "[DEMO] Subcategory", status: "ACTIVE" };
        if (has(tableColumnsCache, "categories", "parent_category_id")) values.parent_category_id = categoryIds[Math.floor(i / 2)];
        else if (has(tableColumnsCache, "categories", "parent_id")) values.parent_id = categoryIds[Math.floor(i / 2)];
        const [r] = await insertIgnore(connection, "categories", [...tableColumnsCache.get("categories")], values);
        id = await selectId(connection, "categories", "category_id", "slug = ?", [slug]) || r.insertId;
        if (r.affectedRows) counts.subcategories++;
      } else {
        const cleanName = name.replace(/^\[DEMO\]\s*/i, "").trim();
        if (await selectId(connection, "categories", "category_id", "category_id=? AND slug LIKE 'demo-%'", [id])) {
          await connection.execute(
            "UPDATE categories SET name=? WHERE category_id=? AND slug LIKE 'demo-%'",
            [cleanName, id]
          );
        }
      }
      subCategoryIds.push(id);
    }

    // 24 demo brands
    const brandNames = ["Nova","Aster","Vertex","Luma","Kinetic","Ember","Orion","Crest","Nimbus","Atlas","Pioneer","Solace",
      "Stride","Muse","UrbanOak","Pureform","Summit","Arc","Haven","Prism","Terra","Vivid","Breeze","Evergreen"];
    const brandIds = [];
    for (const brandName of brandNames) {
      const slug = `demo-${brandName.toLowerCase()}`;
      let id = await selectId(connection, "brands", "brand_id", "slug = ?", [slug]);
      if (!id) {
        const [r] = await insertIgnore(connection, "brands", [...tableColumnsCache.get("brands")],
          { name: brandName, slug, logo: null, status: "ACTIVE" });
        id = await selectId(connection, "brands", "brand_id", "slug = ?", [slug]) || r.insertId;
        if (r.affectedRows) counts.brands++;
      } else {
        await connection.execute(
          "UPDATE brands SET name=? WHERE brand_id=? AND slug=?",
          [brandName, id, slug]
        );
      }
      brandIds.push(id);
    }

    // 100 demo products with two variants each.
    const productIds = [];
    const variantIds = [];
    const variantByProduct = new Map();
    for (let i = 1; i <= 100; i++) {
      const sub = subCategoryIds[(i - 1) % subCategoryIds.length];
      const brand = brandIds[(i - 1) % brandIds.length];
      const slug = `demo-product-${String(i).padStart(3, "0")}`;
      let productId = await selectId(connection, "products", "product_id", "slug = ?", [slug]);
      const subcategoryName = subNames[(i - 1) % subNames.length];
      const brandName = brandNames[(i - 1) % brandNames.length];
      const productNameOptions = subcategoryProductNames[subcategoryName];
      const cleanProductName = `${brandName} ${productNameOptions[(i - 1) % productNameOptions.length]} ${String(i).padStart(3, "0")}`;
      if (!productId) {
        const price = (29.99 + i * 7.37).toFixed(2);
        const [r] = await insertIgnore(connection, "products", [...tableColumnsCache.get("products")],
          { category_id: sub, brand_id: brand, name: cleanProductName,
            slug, description: `[DEMO] The ${brandName} ${subcategoryName} Essential ${String(i).padStart(3, "0")} is a clearly marked synthetic catalog item featuring practical everyday design, durable materials, and a choice of available variants for the ShopSphere demonstration store.`,
            base_price: price, status: "ACTIVE", created_at: dateDaysAgo((i % 120) + 1) });
        productId = await selectId(connection, "products", "product_id", "slug = ?", [slug]) || r.insertId;
        if (r.affectedRows) counts.products++;
      } else {
        await connection.execute(
          "UPDATE products SET name=? WHERE product_id=? AND slug LIKE 'demo-product-%'",
          [cleanProductName, productId]
        );
      }
      productIds.push(productId);
      const variants = [];
      for (let v = 1; v <= 2; v++) {
        const sku = `DEMO-SKU-${String(i).padStart(3, "0")}-${v}`;
        let variantId = await selectId(connection, "product_variants", "variant_id", "sku = ?", [sku]);
        if (!variantId) {
          const [r] = await insertIgnore(connection, "product_variants", [...tableColumnsCache.get("product_variants")],
            { product_id: productId, sku, size: v === 1 ? "Standard" : "Large",
              color: v === 1 ? "Black" : "White", price_adjustment: v === 1 ? 0 : 10,
              stock: 25 + i % 30, status: "ACTIVE" });
          variantId = await selectId(connection, "product_variants", "variant_id", "sku = ?", [sku]) || r.insertId;
          if (r.affectedRows) counts.variants++;
        }
        variants.push(variantId);
        variantIds.push(variantId);
      }
      variantByProduct.set(productId, variants);

      // public HTTPS image URL
      if (has(tableColumnsCache, "product_images", "product_id")) {
        const subcategoryName = subNames[(i - 1) % subNames.length];
        const imageUrl = getDemoImageUrl(subcategoryName, i);
        const publicId = `external:unsplash:${slug}:1`;
        await connection.execute(
          `UPDATE product_images
           SET image_url=?, public_id=?, is_primary=1
           WHERE product_id=? AND (
             public_id LIKE 'demo-unsplash-product-%'
             OR public_id LIKE 'demo-product-%'
             OR public_id LIKE 'external:unsplash:%'
           )`,
          [imageUrl, publicId, productId]
        );
        const [[imageExists]] = await connection.execute(
          "SELECT COUNT(*) AS c FROM product_images WHERE product_id=? AND public_id=?",
          [productId, publicId]
        );
        if (Number(imageExists.c) === 0) {
          const [imageResult] = await insertIgnore(connection, "product_images", [...tableColumnsCache.get("product_images")],
            { product_id: productId, image_url: imageUrl,
              public_id: publicId, is_primary: 1 });
          counts.images += imageResult.affectedRows;
        }
      }
    }

    // Coupons
    const couponIds = [];
    for (let i = 1; i <= 8; i++) {
      const code = `DEMO${String(i).padStart(2, "0")}SAVE`;
      let id = await selectId(connection, "coupons", "coupon_id", "code = ?", [code]);
      if (!id) {
        const [r] = await insertIgnore(connection, "coupons", [...tableColumnsCache.get("coupons")],
          { code, discount_type: i % 2 ? "PERCENTAGE" : "FIXED",
            discount_value: i % 2 ? 10 + i : 5 + i, minimum_purchase: 25,
            max_discount: i % 2 ? 40 : null, usage_limit: 1000, used_count: 0,
            expires_at: "2027-12-31 23:59:59", status: "ACTIVE" });
        id = await selectId(connection, "coupons", "coupon_id", "code = ?", [code]) || r.insertId;
        if (r.affectedRows) counts.coupons++;
      }
      couponIds.push(id);
    }

    // Carts and wishlists
    for (let i = 0; i < customerIds.length; i++) {
      const userId = customerIds[i];
      let cartId = await selectId(connection, "carts", "cart_id", "user_id = ?", [userId]);
      if (!cartId) {
        const [r] = await insertIgnore(connection, "carts", [...tableColumnsCache.get("carts")], { user_id: userId });
        cartId = r.insertId || await selectId(connection, "carts", "cart_id", "user_id = ?", [userId]);
        if (r.affectedRows) counts.carts++;
      }
      if (cartId) {
        const variantId = variantIds[(i * 3) % variantIds.length];
        const [cartItemResult] = await insertIgnore(connection, "cart_items", [...tableColumnsCache.get("cart_items")],
          { cart_id: cartId, variant_id: variantId, quantity: 1 + i % 3 });
      }
      const productId = productIds[(i * 7) % productIds.length];
      const [wishlistResult] = await insertIgnore(connection, "wishlists", [...tableColumnsCache.get("wishlists")],
        { user_id: userId, product_id: productId });
      counts.wishlists += wishlistResult.affectedRows;
    }

    // 40 orders, items, status history, and COD/PENDING payment records.
    const addressByUser = new Map();
    for (const userId of customerIds) {
      addressByUser.set(userId, await selectId(connection, "addresses", "address_id", "user_id = ? AND is_default = 1", [userId]));
    }
    const statusSequence = ["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED"];
    for (let i = 1; i <= 40; i++) {
      const userId = customerIds[(i - 1) % customerIds.length];
      const addressId = addressByUser.get(userId);
      const orderNumber = `DEMO-${String(i).padStart(4, "0")}`;
      let orderId = await selectId(connection, "orders", "order_id", "order_number = ?", [orderNumber]);
      if (!orderId) {
        const itemCount = 1 + i % 3;
        let subtotal = 0;
        const items = [];
        for (let j = 0; j < itemCount; j++) {
          const variantId = variantIds[(i * 5 + j * 11) % variantIds.length];
          const [[variant]] = await connection.execute(
            `SELECT v.variant_id, v.sku, v.price_adjustment, p.name, p.base_price
             FROM product_variants v JOIN products p ON p.product_id=v.product_id WHERE v.variant_id=?`,
            [variantId]
          );
          const unit = Number(variant.base_price) + Number(variant.price_adjustment);
          const quantity = 1 + j;
          subtotal += unit * quantity;
          items.push({ variantId, sku: variant.sku, name: variant.name, unit, quantity });
        }
        const discount = i % 5 === 0 ? 10 : 0;
        const shipping = subtotal >= 100 ? 0 : 12;
        const tax = Number((subtotal * 0.08).toFixed(2));
        const total = Number((subtotal - discount + shipping + tax).toFixed(2));
        const status = i % 7 === 0 ? "CANCELLED" : statusSequence[i % statusSequence.length];
        const paymentStatus = status === "DELIVERED" ? "PAID" : status === "CANCELLED" ? "REFUNDED" : "PENDING";
        const [r] = await insertIgnore(connection, "orders", [...tableColumnsCache.get("orders")],
          { user_id: userId, address_id: addressId, coupon_id: i % 5 === 0 ? couponIds[i % couponIds.length] : null,
            order_number: orderNumber, subtotal: subtotal.toFixed(2), discount: discount.toFixed(2),
            shipping: shipping.toFixed(2), tax: tax.toFixed(2), total: total.toFixed(2),
            status, payment_status: paymentStatus, created_at: dateDaysAgo(i % 90) });
        orderId = await selectId(connection, "orders", "order_id", "order_number = ?", [orderNumber]) || r.insertId;
        if (r.affectedRows) counts.orders++;
        for (const item of items) {
          const [itemResult] = await insertIgnore(connection, "order_items", [...tableColumnsCache.get("order_items")],
            { order_id: orderId, variant_id: item.variantId, product_name: item.name, sku: item.sku,
              unit_price: item.unit.toFixed(2), quantity: item.quantity,
              total_price: (item.unit * item.quantity).toFixed(2) });
          counts.order_items += itemResult.affectedRows;
          await connection.execute(
            "UPDATE product_variants SET stock = GREATEST(stock - ?, 0) WHERE variant_id = ?",
            [item.quantity, item.variantId]
          );
          await insertIgnore(connection, "inventory_transactions", [...tableColumnsCache.get("inventory_transactions")],
            { variant_id: item.variantId, quantity_change: -item.quantity, transaction_type: "SALE",
              reference_id: orderId, notes: `[DEMO] Sale for ${orderNumber}` });
        }
      }
      if (orderId) {
        const [order] = await connection.execute("SELECT status, payment_status, total FROM orders WHERE order_id=?", [orderId]);
        const status = order[0]?.status || "PENDING";
        const historyStatuses = status === "DELIVERED" ? statusSequence
          : status === "CANCELLED" ? ["PENDING","CONFIRMED","CANCELLED"] : ["PENDING", status];
        for (const s of historyStatuses) {
          const [[historyExists]] = await connection.execute(
            "SELECT COUNT(*) AS c FROM order_status_history WHERE order_id=? AND status=? AND notes=?", [orderId, s, `[DEMO] ${s} status event`]
          );
          if (Number(historyExists.c) > 0) continue;
          await insertIgnore(connection, "order_status_history", [...tableColumnsCache.get("order_status_history")],
            { order_id: orderId, status: s, changed_by: adminId, notes: `[DEMO] ${s} status event` });
        }
        const txId = `DEMO-COD-${orderNumber}`;
        const [paymentResult] = await insertIgnore(connection, "payments", [...tableColumnsCache.get("payments")],
          { order_id: orderId, transaction_id: txId, payment_gateway: "COD",
            payment_method: "Cash on delivery - demo", amount: order[0]?.total,
            currency: "USD", status: status === "DELIVERED" ? "SUCCEEDED" : status === "CANCELLED" ? "CANCELLED" : "PENDING",
            paid_at: status === "DELIVERED" ? "2026-11-01 10:00:00" : null });
        counts.payments += paymentResult.affectedRows;
        if (i % 5 === 0 && has(tableColumnsCache, "coupon_usages", "coupon_id")) {
          const [[couponUsageExists]] = await connection.execute(
            "SELECT COUNT(*) AS c FROM coupon_usages WHERE coupon_id=? AND user_id=? AND order_id=?",
            [couponIds[i % couponIds.length], userId, orderId]
          );
          if (Number(couponUsageExists.c) === 0) {
            await insertIgnore(connection, "coupon_usages", [...tableColumnsCache.get("coupon_usages")],
              { coupon_id: couponIds[i % couponIds.length], user_id: userId,
                order_id: orderId, discount_amount: "10.00" });
          }
        }
      }
    }

    // Realistic demo shipment, tracking, support, and activity records.
    if (has(tableColumnsCache, "shipping_methods", "shipping_method_id")) {
      const shippingMethods = [
        ["standard-demo", "Demo Standard Delivery", "Tracked standard delivery for demo data", 3, 5, 250, 5000],
        ["express-demo", "Demo Express Delivery", "Faster tracked delivery for demo data", 1, 2, 500, 8000],
        ["pickup-demo", "Demo Store Pickup", "Store pickup option for demo data", 0, 1, 0, null],
      ];
      for (const [code, name, description, minDays, maxDays, fee, threshold] of shippingMethods) {
        await insertIgnore(connection, "shipping_methods", [...tableColumnsCache.get("shipping_methods")],
          { code, name, description, min_delivery_days: minDays, max_delivery_days: maxDays,
            fee, free_shipping_threshold: threshold, is_active: 1 });
      }
    }

    if (has(tableColumnsCache, "shipments", "shipment_id") &&
        has(tableColumnsCache, "shipment_tracking_events", "tracking_event_id")) {
      const [eligibleOrders] = await connection.execute(`
        SELECT o.order_id,o.order_number,o.status,o.created_at
        FROM orders o
        WHERE o.order_number LIKE 'DEMO-%'
          AND o.status IN ('CONFIRMED','PROCESSING','SHIPPED','DELIVERED')
        ORDER BY o.order_id
      `);
      const standardMethodId = await selectId(connection, "shipping_methods", "shipping_method_id",
        "code=?", ["standard-demo"]);
      for (let orderIndex = 0; orderIndex < eligibleOrders.length; orderIndex++) {
        const order = eligibleOrders[orderIndex];
        const existingShipmentId = await selectId(connection, "shipments", "shipment_id",
          "order_id=?", [order.order_id]);
        let shipmentId = existingShipmentId;
        if (!shipmentId) {
          const shipmentStatus = order.status === "DELIVERED" ? "DELIVERED"
            : order.status === "SHIPPED" ? "IN_TRANSIT"
              : order.status === "PROCESSING" ? "READY" : "PENDING";
          const trackingNumber = `DEMO-TCS-${String(order.order_id).padStart(6, "0")}`;
          const [shipmentResult] = await insertIgnore(connection, "shipments", [...tableColumnsCache.get("shipments")],
            { order_id: order.order_id, shipping_method_id: standardMethodId,
              carrier: "TCS Demo", tracking_number: trackingNumber,
              tracking_url: null, status: shipmentStatus,
              shipped_at: order.status === "DELIVERED" || order.status === "SHIPPED" ? dateDaysAgo(8) : null,
              estimated_delivery_date: dateDaysAgo(-3).slice(0, 10),
              delivered_at: order.status === "DELIVERED" ? dateDaysAgo(1) : null });
          shipmentId = shipmentResult.insertId || await selectId(connection, "shipments", "shipment_id",
            "order_id=?", [order.order_id]);
        }
        if (shipmentId) {
          const trackingEvents = [
            ["PENDING", "Demo Warehouse", "[DEMO] Order confirmed and package prepared"],
            ["READY", "Demo Warehouse", "[DEMO] Package ready for dispatch"],
            ["SHIPPED", "Demo Dispatch Hub", "[DEMO] Package handed to carrier"],
            ["IN_TRANSIT", "Lahore Sorting Facility", "[DEMO] Package in transit"],
          ];
          if (order.status === "DELIVERED") {
            trackingEvents.push(
              ["OUT_FOR_DELIVERY", "Local Delivery Centre", "[DEMO] Out for delivery"],
              ["DELIVERED", "Customer Address", "[DEMO] Successfully delivered"]
            );
          }
          for (let eventIndex = 0; eventIndex < trackingEvents.length; eventIndex++) {
            const [eventStatus, location, description] = trackingEvents[eventIndex];
            const [[trackingExists]] = await connection.execute(
              "SELECT COUNT(*) AS c FROM shipment_tracking_events WHERE shipment_id=? AND status=? AND description=?",
              [shipmentId, eventStatus, description]
            );
            if (Number(trackingExists.c) === 0) {
              await insertIgnore(connection, "shipment_tracking_events",
                [...tableColumnsCache.get("shipment_tracking_events")],
                { shipment_id: shipmentId, status: eventStatus, location, description,
                  event_time: dateDaysAgo(Math.max(0, 10 - eventIndex)) });
            }
          }
        }
      }
    }

    if (has(tableColumnsCache, "online_payment_attempts", "attempt_id")) {
      const [demoOrders] = await connection.execute(
        "SELECT order_id,user_id,total FROM orders WHERE order_number LIKE 'DEMO-%' ORDER BY order_id"
      );
      for (let orderIndex = 0; orderIndex < demoOrders.length; orderIndex += 5) {
        const order = demoOrders[orderIndex];
        await insertIgnore(connection, "online_payment_attempts",
          [...tableColumnsCache.get("online_payment_attempts")],
          { order_id: order.order_id, user_id: order.user_id,
            provider: "MOCK", idempotency_key: `DEMO-MOCK-${order.order_id}`,
            gateway_reference: `DEMO-GW-${order.order_id}`, checkout_url: null,
            amount: order.total, currency: "USD",
            status: orderIndex % 10 === 0 ? "FAILED" : "PENDING",
            failure_reason: orderIndex % 10 === 0 ? "[DEMO] Mock payment declined" : null,
            gateway_metadata: JSON.stringify({ demo: true }) });
      }
    }

    if (has(tableColumnsCache, "support_tickets", "ticket_id")) {
      const supportSubjects = [
        ["ORDER", "Demo order delivery question"],
        ["PAYMENT", "Demo payment confirmation question"],
        ["SHIPPING", "Demo tracking timeline question"],
        ["RETURNS", "Demo return eligibility question"],
        ["PRODUCT", "Demo product compatibility question"],
      ];
      for (let ticketIndex = 0; ticketIndex < 25; ticketIndex++) {
        const customerId = customerIds[ticketIndex % customerIds.length];
        const [category, subject] = supportSubjects[ticketIndex % supportSubjects.length];
        const [[ticketExists]] = await connection.execute(
          "SELECT COUNT(*) AS c FROM support_tickets WHERE customer_id=? AND subject=?",
          [customerId, `[DEMO] ${subject}`]
        );
        if (Number(ticketExists.c) > 0) continue;
        const [ticketResult] = await insertIgnore(connection, "support_tickets",
          [...tableColumnsCache.get("support_tickets")],
          { customer_id: customerId, assigned_admin_id: adminId, subject: `[DEMO] ${subject}`,
            category, priority: ticketIndex % 4 === 0 ? "HIGH" : "NORMAL",
            status: ticketIndex % 3 === 0 ? "RESOLVED" : "OPEN",
            created_at: dateDaysAgo(ticketIndex % 30) });
        const ticketId = ticketResult.insertId;
        if (ticketId && has(tableColumnsCache, "support_ticket_messages", "message_id")) {
          await insertIgnore(connection, "support_ticket_messages",
            [...tableColumnsCache.get("support_ticket_messages")],
            { ticket_id: ticketId, sender_id: customerId, sender_role: "CUSTOMER",
              message_text: "[DEMO] I am checking the status of this demo support request.",
              created_at: dateDaysAgo(ticketIndex % 30) });
          await insertIgnore(connection, "support_ticket_messages",
            [...tableColumnsCache.get("support_ticket_messages")],
            { ticket_id: ticketId, sender_id: adminId, sender_role: "ADMIN",
              message_text: "[DEMO] Thank you. This synthetic support response confirms the demo workflow.",
              created_at: dateDaysAgo(Math.max(0, ticketIndex % 30 - 1)) });
        }
      }
    }

    if (has(tableColumnsCache, "loyalty_transactions", "transaction_id")) {
      for (let transactionIndex = 0; transactionIndex < customerIds.length; transactionIndex++) {
        const userId = customerIds[transactionIndex];
        const eventKey = `demo.loyalty.adjustment.${userId}`;
        await insertIgnore(connection, "loyalty_transactions",
          [...tableColumnsCache.get("loyalty_transactions")],
          { user_id: userId, order_id: null, transaction_type: "ADJUSTMENT",
            points_change: 500, currency_amount: 0, event_key: eventKey,
            notes: "[DEMO] Initial loyalty points" });
      }
    }

    // 200 clearly DEMO reviews: at most one per product/customer, respecting live unique constraint.
    counts.reviews = 0;
    for (let i = 0; i < 200; i++) {
      const productId = productIds[Math.floor(i / 2) % productIds.length];
      const userId = customerIds[i % customerIds.length];
      const [[exists]] = await connection.execute(
        "SELECT COUNT(*) AS c FROM reviews WHERE product_id=? AND user_id=?", [productId, userId]
      );
      if (Number(exists.c) === 0) {
        const ratings = [5, 4, 5, 3, 4, 2, 1, 4];
        const titles = [
          "Excellent everyday purchase",
          "Good value and quality",
          "Mostly happy with it",
          "Okay, with room to improve",
          "Not quite what I expected",
          "Had a few issues",
          "Did not meet expectations",
          "Would recommend"
        ];
        const comments = [
          "This synthetic demo item arrived as described in the storefront. The quality feels suitable for everyday use.",
          "A solid choice for the price, with an easy ordering experience and accurate product information.",
          "The overall experience was positive. Delivery and packaging were both represented clearly.",
          "The product works as shown, although setup took a little longer than expected.",
          "The size and finish may vary between variants, so checking the details before purchasing is important.",
          "Some aspects did not match expectations, particularly the finish, but it remains usable.",
          "The demo experience highlights a concern that should be resolved before a real purchase.",
          "A dependable option from this category, with useful features and a clean presentation."
        ];
        const rating = ratings[i % ratings.length];
        const [r] = await insertIgnore(connection, "reviews", [...tableColumnsCache.get("reviews")],
          { product_id: productId, user_id: userId, order_id: null,
            rating, title: `${DEMO_MARKER} ${titles[i % titles.length]}`,
            comment: `${DEMO_MARKER} ${comments[i % comments.length]}`, status: "APPROVED",
            created_at: dateDaysAgo(i % 180) });
        counts.reviews += r.affectedRows;
      }
    }

    // At least three approved, clearly marked demo questions and answers per product.
    counts.questions = 0;
    counts.answers = 0;
    for (let productIndex = 0; productIndex < productIds.length; productIndex++) {
      const productId = productIds[productIndex];
      const subcategoryName = subNames[productIndex % subNames.length];
      const questions = demoQuestionTemplates(subcategoryName, productIndex + 1);
      for (let questionIndex = 0; questionIndex < questions.length; questionIndex++) {
        const text = questions[questionIndex];
        const userId = customerIds[(productIndex * 3 + questionIndex) % customerIds.length];
        const hash = crypto.createHash("sha256").update(text).digest("hex");
        let questionId = null;
        if (has(tableColumnsCache, "product_questions", "question_hash")) {
          questionId = await selectId(connection, "product_questions", "question_id",
            "product_id=? AND user_id=? AND question_hash=?", [productId, userId, hash]);
        }
        if (!questionId) {
          const [r] = await insertIgnore(connection, "product_questions", [...tableColumnsCache.get("product_questions")],
            { product_id: productId, user_id: userId, question_text: text, question_hash: hash,
              status: "APPROVED", moderated_by: adminId, moderation_reason: "[DEMO] Auto-approved",
              created_at: dateDaysAgo((productIndex + questionIndex) % 60) });
          counts.questions += r.affectedRows;
          questionId = r.insertId || await selectId(connection, "product_questions", "question_id",
            "product_id=? AND user_id=? AND question_hash=?", [productId, userId, hash]);
        }
        if (questionId && has(tableColumnsCache, "product_answers", "question_id")) {
          const answerText = `[DEMO] ${[
            "The listed specifications and standard model details apply to this item. Please check the selected variant before ordering.",
            "This is supported for the standard configuration shown on the product page; variant-specific details may vary.",
            "Based on the demo product information, this should work for typical everyday use. Seller support can confirm special requirements."
          ][questionIndex % 3]}`;
          const [[answerExists]] = await connection.execute(
            "SELECT COUNT(*) AS c FROM product_answers WHERE question_id=?",
            [questionId]
          );
          if (Number(answerExists.c) === 0) {
            const [answerResult] = await insertIgnore(connection, "product_answers", [...tableColumnsCache.get("product_answers")],
              { question_id: questionId, answered_by: adminId,
                answer_text: answerText,
                status: "APPROVED", moderated_by: adminId, moderation_reason: "[DEMO] Auto-approved",
                created_at: dateDaysAgo((productIndex + questionIndex + 1) % 60) });
            counts.answers += answerResult.affectedRows;
          }
        }
      }
    }

    // 100 demo notifications.
    counts.notifications = 0;
    for (let i = 1; i <= 100; i++) {
      const [r] = await insertIgnore(connection, "notifications", [...tableColumnsCache.get("notifications")],
        { user_id: customerIds[(i - 1) % customerIds.length],
          event_key: `demo.notification.${String(i).padStart(3, "0")}`, type: "DEMO",
          title: "[DEMO] ShopSphere demo notification",
          message: `[DEMO] Synthetic notification ${i} for demonstration.`,
          data: JSON.stringify({ demo: true, sequence: i }), is_read: i % 3 === 0 });
      counts.notifications += r.affectedRows;
    }
    const [demoOrderNotifications] = await connection.execute(
      "SELECT order_id,order_number,user_id,status FROM orders WHERE order_number LIKE 'DEMO-%' ORDER BY order_id"
    );
    for (const order of demoOrderNotifications) {
      const statusTitle = order.status === "DELIVERED" ? "Your demo order was delivered"
        : order.status === "SHIPPED" ? "Your demo package was shipped"
          : order.status === "CANCELLED" ? "Your demo order was cancelled"
            : "Your demo order status was updated";
      const eventKey = `demo.order.${order.order_number}.${order.status.toLowerCase()}`;
      await insertIgnore(connection, "notifications", [...tableColumnsCache.get("notifications")],
        { user_id: order.user_id, event_key: eventKey, type: "ORDER_STATUS",
          title: `[DEMO] ${statusTitle}`, message: `[DEMO] Order ${order.order_number} is currently ${order.status}.`,
          data: JSON.stringify({ demo: true, order_id: order.order_id, order_number: order.order_number }),
          is_read: order.status === "DELIVERED" });
    }

    // Inventory transactions for all variants.
    counts.inventory_transactions = 0;
    for (let variantIndex = 0; variantIndex < variantIds.length; variantIndex++) {
      const variantId = variantIds[variantIndex];
      const productNumber = Math.floor(variantIndex / 2) + 1;
      const [[exists]] = await connection.execute(
        "SELECT COUNT(*) AS c FROM inventory_transactions WHERE variant_id=? AND notes=?",
        [variantId, "[DEMO] Initial demo inventory purchase"]
      );
      if (Number(exists.c) > 0) continue;
      const [r] = await insertIgnore(connection, "inventory_transactions", [...tableColumnsCache.get("inventory_transactions")],
        { variant_id: variantId, quantity_change: 25 + productNumber % 30, transaction_type: "PURCHASE",
          reference_id: null, notes: "[DEMO] Initial demo inventory purchase" });
      counts.inventory_transactions += r.affectedRows;
    }

    // Optional live tables: bundles, campaigns, newsletter, loyalty, flash sales.
    if (has(tableColumnsCache, "loyalty_accounts", "user_id")) {
      for (const userId of customerIds) {
        await insertIgnore(connection, "loyalty_accounts", [...tableColumnsCache.get("loyalty_accounts")],
          { user_id: userId, balance: 500, lifetime_earned: 500 });
      }
    }
    if (has(tableColumnsCache, "flash_sales", "flash_sale_id")) {
      const [[flashExists]] = await connection.execute("SELECT COUNT(*) AS c FROM flash_sales WHERE title=?", ["[DEMO] Weekend Demo Sale"]);
      if (Number(flashExists.c) === 0) {
        await insertIgnore(connection, "flash_sales", [...tableColumnsCache.get("flash_sales")],
          { title: "[DEMO] Weekend Demo Sale", description: "[DEMO] Synthetic flash sale",
            starts_at: "2026-11-20 00:00:00", ends_at: "2027-11-20 00:00:00",
            discount_type: "PERCENTAGE", discount_value: 15, status: "ACTIVE", created_by: adminId });
      }
    }
    if (has(tableColumnsCache, "product_bundles", "bundle_id")) {
      const [[bundleExists]] = await connection.execute("SELECT COUNT(*) AS c FROM product_bundles WHERE name=?", ["[DEMO] Starter Bundle"]);
      if (Number(bundleExists.c) === 0) {
        await insertIgnore(connection, "product_bundles", [...tableColumnsCache.get("product_bundles")],
          { name: "[DEMO] Starter Bundle", description: "[DEMO] Synthetic product bundle",
            discount_type: "PERCENTAGE", discount_value: 10, status: "ACTIVE" });
      }
    }
    if (has(tableColumnsCache, "promotional_campaigns", "campaign_id")) {
      const [[campaignExists]] = await connection.execute("SELECT COUNT(*) AS c FROM promotional_campaigns WHERE name=?", ["[DEMO] Welcome Campaign"]);
      if (Number(campaignExists.c) === 0) {
        await insertIgnore(connection, "promotional_campaigns", [...tableColumnsCache.get("promotional_campaigns")],
          { name: "[DEMO] Welcome Campaign", description: "[DEMO] Synthetic promotion",
            channel: "STORE", discount_type: "PERCENTAGE", discount_value: 10,
            coupon_code: couponIds.length ? "DEMO01SAVE" : null, status: "ACTIVE" });
      }
    }
    if (has(tableColumnsCache, "newsletter_subscribers", "subscriber_id")) {
      for (let i = 1; i <= 20; i++) {
        await insertIgnore(connection, "newsletter_subscribers", [...tableColumnsCache.get("newsletter_subscribers")],
          { email: `demo.customer${String(i).padStart(2, "0")}@example.com`,
            status: "SUBSCRIBED", source: "[DEMO] seed" });
      }
    }

    await connection.commit();
    console.log(JSON.stringify({ firstRunInserted: counts, baselineExisting: baseline, login: {
      admin: { email: adminEmail, password: DEMO_ADMIN_PASSWORD },
      customer: { email: "demo.customer01@example.com", password: DEMO_PASSWORD }
    }}, null, 2));
  } catch (error) {
    await connection.rollback();
    console.error(`demo-seed failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    connection.release();
    await pool.end();
  }
}

main();

