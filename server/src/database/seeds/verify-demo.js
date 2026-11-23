import "../../config/env.js";
import { pool } from "../index.js";

async function scalar(connection, sql, params = []) {
  const [[row]] = await connection.execute(sql, params);
  return Number(Object.values(row)[0]);
}

async function checkImageUrl(url) {
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    return { valid: false, reason: "INVALID_URL" };
  }
  if (typeof fetch !== "function") {
    return { valid: null, reason: "FETCH_UNAVAILABLE" };
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { Accept: "image/*" },
    });
    if (response.status === 405 || response.status === 501) {
      const getResponse = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { Accept: "image/*", Range: "bytes=0-1024" },
      });
      const contentType = getResponse.headers.get("content-type") || "";
      return {
        valid: getResponse.ok && contentType.toLowerCase().startsWith("image/"),
        status: getResponse.status,
        contentType,
      };
    }
    const contentType = response.headers.get("content-type") || "";
    return {
      valid: response.ok && contentType.toLowerCase().startsWith("image/"),
      status: response.status,
      contentType,
    };
  } catch (error) {
    return { valid: false, reason: error.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR" };
  } finally {
    clearTimeout(timeout);
  }
}

async function mapWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  async function run() {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => run()));
  return results;
}

async function main() {
  const connection = await pool.getConnection();
  try {
    const report = {};
    const count = async (table, where = "", params = []) =>
      scalar(connection, `SELECT COUNT(*) AS c FROM ${"`"+table+"`"}${where ? " WHERE "+where : ""}`, params);

    report.demoUsers = await scalar(connection,
      "SELECT COUNT(*) AS c FROM users WHERE email='demo.admin@shopsphere.example' OR email LIKE 'demo.customer%@example.com'");
    report.categories = await count("categories", "slug LIKE 'demo-%'");
    report.brands = await count("brands", "slug LIKE 'demo-%'");
    report.products = await count("products", "slug LIKE 'demo-product-%'");
    report.variants = await count("product_variants", "sku LIKE 'DEMO-SKU-%'");
    report.images = await count("product_images",
      "public_id LIKE 'external:unsplash:%' OR public_id LIKE 'demo-unsplash-product-%'");
    report.addresses = await count("addresses", "street LIKE '[DEMO]%'");
    report.carts = await scalar(connection,
      "SELECT COUNT(*) AS c FROM carts c JOIN users u ON u.user_id=c.user_id WHERE u.email LIKE 'demo.customer%@example.com' OR u.email='demo.admin@shopsphere.example'");
    report.wishlists = await scalar(connection,
      "SELECT COUNT(*) AS c FROM wishlists w JOIN users u ON u.user_id=w.user_id WHERE u.email LIKE 'demo.customer%@example.com'");
    report.coupons = await count("coupons", "code LIKE 'DEMO%SAVE'");
    report.orders = await count("orders", "order_number LIKE 'DEMO-%'");
    report.orderItems = await scalar(connection,
      "SELECT COUNT(*) AS c FROM order_items oi JOIN orders o ON o.order_id=oi.order_id WHERE o.order_number LIKE 'DEMO-%'");
    report.statusHistory = await count("order_status_history", "notes LIKE '[DEMO]%'");
    report.payments = await count("payments", "transaction_id LIKE 'DEMO-COD-DEMO-%'");
    report.reviews = await count("reviews", "title LIKE '[DEMO]%'");
    report.questions = await count("product_questions", "question_text LIKE '[DEMO]%'");
    report.answers = await count("product_answers", "answer_text LIKE '[DEMO]%'");
    report.notifications = await count("notifications", "event_key LIKE 'demo.%'");
    report.inventoryTransactions = await count("inventory_transactions", "notes LIKE '[DEMO]%'");

    report.invalidReviewDuplicates = await scalar(connection,
      "SELECT COUNT(*) AS c FROM (SELECT product_id,user_id,COUNT(*) n FROM reviews WHERE title LIKE '[DEMO]%' GROUP BY product_id,user_id HAVING n>1) x");
    report.invalidImageUrls = await scalar(connection,
      "SELECT COUNT(*) AS c FROM product_images WHERE (public_id LIKE 'external:unsplash:%' OR public_id LIKE 'demo-unsplash-product-%') AND (image_url IS NULL OR image_url NOT LIKE 'https://%')");
    report.invalidReviewRatings = await scalar(connection,
      "SELECT COUNT(*) AS c FROM reviews WHERE title LIKE '[DEMO]%' AND rating NOT BETWEEN 1 AND 5");
    report.invalidOrderTotals = await scalar(connection,
      "SELECT COUNT(*) AS c FROM orders WHERE order_number LIKE 'DEMO-%' AND ABS(total-(subtotal-discount+shipping+tax))>0.01");
    report.negativeVariantStock = await scalar(connection,
      "SELECT COUNT(*) AS c FROM product_variants WHERE sku LIKE 'DEMO-SKU-%' AND stock < 0");
    report.notificationMissingDemoMarker = await scalar(connection,
      "SELECT COUNT(*) AS c FROM notifications WHERE event_key LIKE 'demo.%' AND title NOT LIKE '[DEMO]%'");
    report.orphanDemoReviews = await scalar(connection,
      "SELECT COUNT(*) AS c FROM reviews r LEFT JOIN products p ON p.product_id=r.product_id LEFT JOIN users u ON u.user_id=r.user_id WHERE r.title LIKE '[DEMO]%' AND (p.product_id IS NULL OR u.user_id IS NULL)");
    report.demoProductsWithFewerThanThreeQuestions = await scalar(connection, `
      SELECT COUNT(*) AS c
      FROM products p
      WHERE p.slug LIKE 'demo-product-%'
        AND (
          SELECT COUNT(*)
          FROM product_questions q
          WHERE q.product_id=p.product_id
            AND q.question_text LIKE '[DEMO]%'
        ) < 3
    `);
    report.demoQuestionsWithoutAnswers = await scalar(connection, `
      SELECT COUNT(*) AS c
      FROM product_questions q
      LEFT JOIN product_answers a ON a.question_id=q.question_id
      WHERE q.question_text LIKE '[DEMO]%'
        AND a.answer_id IS NULL
    `);
    report.orphanDemoQuestions = await scalar(connection, `
      SELECT COUNT(*) AS c
      FROM product_questions q
      LEFT JOIN products p ON p.product_id=q.product_id
      LEFT JOIN users u ON u.user_id=q.user_id
      WHERE q.question_text LIKE '[DEMO]%'
        AND (p.product_id IS NULL OR u.user_id IS NULL)
    `);

    if (await scalar(connection,
      "SELECT COUNT(*) AS c FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='shipments'")) {
      report.demoShipments = await scalar(connection,
        "SELECT COUNT(*) AS c FROM shipments s JOIN orders o ON o.order_id=s.order_id WHERE o.order_number LIKE 'DEMO-%'");
      report.demoTrackingEvents = await scalar(connection,
        "SELECT COUNT(*) AS c FROM shipment_tracking_events te JOIN shipments s ON s.shipment_id=te.shipment_id JOIN orders o ON o.order_id=s.order_id WHERE o.order_number LIKE 'DEMO-%'");
    }
    if (await scalar(connection,
      "SELECT COUNT(*) AS c FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='support_tickets'")) {
      report.demoSupportTickets = await scalar(connection,
        "SELECT COUNT(*) AS c FROM support_tickets WHERE subject LIKE '[DEMO]%'");
      report.demoSupportMessages = await scalar(connection,
        "SELECT COUNT(*) AS c FROM support_ticket_messages m JOIN support_tickets t ON t.ticket_id=m.ticket_id WHERE t.subject LIKE '[DEMO]%'");
    }

    const [[demoProductRows]] = await connection.execute(
      "SELECT COUNT(*) AS c FROM products WHERE slug LIKE 'demo-product-%' AND status='ACTIVE'"
    );
    report.totalDemoProducts = Number(demoProductRows.c);

    const [imageRows] = await connection.execute(`
      SELECT p.product_id,
             COALESCE(pi.image_url, '') AS image_url,
             COALESCE(pi.is_primary, 0) AS is_primary
      FROM products p
      LEFT JOIN product_images pi
        ON pi.product_id=p.product_id
       AND pi.is_primary=1
      WHERE p.slug LIKE 'demo-product-%'
        AND p.status='ACTIVE'
      ORDER BY p.product_id
    `);
    const productsWithImages = imageRows.filter((row) => row.image_url).length;
    report.productsWithImages = productsWithImages;
    report.productsWithoutImages = report.totalDemoProducts - productsWithImages;
    report.missingPrimaryImages = imageRows.filter((row) =>
      Number(row.is_primary) !== 1 || !row.image_url
    ).length;

    const urlRows = [...new Set(imageRows.map((row) => row.image_url).filter(Boolean))];
    const duplicateRows = await scalar(connection, `
      SELECT COUNT(*) AS c
      FROM (
        SELECT image_url
        FROM product_images
        WHERE public_id LIKE 'external:unsplash:%'
          OR public_id LIKE 'demo-unsplash-product-%'
        GROUP BY image_url
        HAVING COUNT(*) > 1
      ) duplicated
    `);
    report.duplicateImageUrls = duplicateRows;

    const httpResults = await mapWithConcurrency(urlRows, 8, async (url) => ({
      url,
      ...(await checkImageUrl(url)),
    }));
    const validUrls = new Set(
      httpResults.filter((result) => result.valid === true).map((result) => result.url)
    );
    report.validImageUrls = imageRows.filter((row) =>
      validUrls.has(row.image_url)
    ).length;
    report.brokenImageUrls = imageRows.filter((row) =>
      row.image_url && !validUrls.has(row.image_url)
    ).length;
    report.httpImageFailures = httpResults
      .filter((result) => result.valid !== true)
      .map((result) => ({
        url: result.url,
        status: result.status,
        reason: result.reason,
        contentType: result.contentType,
      }));

    console.log(JSON.stringify(report, null, 2));
  } finally {
    connection.release();
    await pool.end();
  }
}

main();
