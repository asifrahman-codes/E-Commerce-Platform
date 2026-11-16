/**
 * Real-database integration tests for addresses, checkout pricing, stock
 * locking, COD, the mock online payment flow, cancellation and the admin seed.
 *
 * Opt-in (needs a MySQL database loaded from the verified schema):
 *   RUN_DB_TESTS=1 DB_HOST=127.0.0.1 DB_USER=app DB_PASSWORD=app DB_NAME=ecommerce_db npm test
 */
import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import request from "supertest";
import { execFileSync } from "node:child_process";

vi.hoisted(() => {
  const d = {
    DB_HOST: "127.0.0.1", DB_PORT: "3306", DB_USER: "app", DB_PASSWORD: "app", DB_NAME: "ecommerce_db",
    JWT_SECRET: "s".repeat(40), JWT_REFRESH_SECRET: "r".repeat(40), JWT_EXPIRES_IN: "15m", JWT_REFRESH_EXPIRES_IN: "7d",
    MOCK_PAYMENT_SECRET: "whsec", CLIENT_URL: "http://localhost:5173",
  };
  for (const [k, v] of Object.entries(d)) process.env[k] ??= v;
  process.env.NODE_ENV = "test";
});

const run = process.env.RUN_DB_TESTS ? describe : describe.skip;
const API = "/api/v1";

run("checkout flow (real MySQL)", () => {
  let app, pool, tag = `t${Date.now()}`;
  let variantId, productId, couponCode, ownsSettings = false;
  const A = { email: `a.${tag}@test.dev`, password: "Passw0rd!Test" };
  const B = { email: `b.${tag}@test.dev`, password: "Passw0rd!Test" };
  const ADMIN = { email: `admin.${tag}@test.dev`, password: "Admin-Secret-12345" };
  let ta, tb;

  const auth = (t) => ({ Authorization: `Bearer ${t}` });
  const api = (m, u, t) => { const r = request(app)[m](`${API}${u}`); return t ? r.set(auth(t)) : r; };
  const stock = async () => Number((await pool.execute("SELECT stock FROM product_variants WHERE variant_id=?", [variantId]))[0][0].stock);
  const setStock = (n) => pool.execute("UPDATE product_variants SET stock=? WHERE variant_id=?", [n, variantId]);
  const fillCart = async (t, qty) => api("post", "/cart/items", t).send({ variant_id: variantId, quantity: qty });
  const newAddress = async (t) => (await api("post", "/addresses", t).send({ country: "Pakistan", city: "Islamabad", street: "12 Test Street", postal_code: "44000" })).body.data;

  beforeAll(async () => {
    ({ pool } = await import("../database/index.js"));
    app = (await import("../app.js")).default;
    await pool.execute("INSERT IGNORE INTO roles (name, description) VALUES ('Admin','x'),('Customer','x')");
    const [[c]] = await pool.execute("SELECT COUNT(*) n FROM shipping_tax_settings WHERE status='ACTIVE'");
    if (!c.n) {
      ownsSettings = true;
      await pool.execute("INSERT INTO shipping_tax_settings (currency, shipping_fee, free_shipping_threshold, tax_rate, tax_enabled, status) VALUES ('PKR',250,5000,10,1,'ACTIVE')");
    }
    const [cat] = await pool.execute("INSERT INTO categories (name, slug) VALUES (?,?)", [`Cat ${tag}`, `cat-${tag}`]);
    const [br] = await pool.execute("INSERT INTO brands (name, slug) VALUES (?,?)", [`Brand ${tag}`, `brand-${tag}`]);
    const [pr] = await pool.execute("INSERT INTO products (name, slug, base_price, brand_id, category_id) VALUES (?,?,1000,?,?)", [`Tee ${tag}`, `tee-${tag}`, br.insertId, cat.insertId]);
    productId = pr.insertId;
    const [va] = await pool.execute("INSERT INTO product_variants (product_id, sku, stock, status, price_adjustment) VALUES (?,?,5,'ACTIVE',0)", [productId, `SKU-${tag}`]);
    variantId = va.insertId;
    couponCode = `SAVE${tag}`.toUpperCase().slice(0, 40);
    await pool.execute("INSERT INTO coupons (code, discount_type, discount_value, starts_at, expires_at, per_user_limit, status) VALUES (?, 'PERCENTAGE', 10, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 30 DAY, 1, 'ACTIVE')", [couponCode]);
    for (const u of [A, B]) {
      const r = await api("post", "/auth/register").send({ firstName: "Test", lastName: "User", email: u.email, password: u.password, confirmPassword: u.password });
      expect([200, 201], JSON.stringify(r.body)).toContain(r.status);
    }
    ta = (await api("post", "/auth/login").send(A)).body.data.accessToken;
    tb = (await api("post", "/auth/login").send(B)).body.data.accessToken;
    expect(ta && tb).toBeTruthy();
  });

  afterAll(async () => {
    const ids = (await pool.execute("SELECT user_id FROM users WHERE email LIKE ?", [`%.${tag}@test.dev`]))[0].map((r) => r.user_id);
    if (ids.length) {
      const q = ids.map(() => "?").join(",");
      const [ords] = await pool.execute(`SELECT order_id FROM orders WHERE user_id IN (${q})`, ids);
      const oq = ords.map(() => "?").join(",");
      if (ords.length) {
        const oi = ords.map((o) => o.order_id);
        for (const t of ["online_payment_attempts", "payments", "coupon_usages", "order_status_history", "order_items"]) await pool.execute(`DELETE FROM ${t} WHERE order_id IN (${oq})`, oi).catch(() => {});
        await pool.execute(`DELETE FROM notifications WHERE user_id IN (${q})`, ids).catch(() => {});
        await pool.execute(`DELETE FROM orders WHERE order_id IN (${oq})`, oi);
      }
      await pool.execute(`DELETE FROM inventory_transactions WHERE variant_id = ?`, [variantId]).catch(() => {});
      for (const t of ["cart_items", "wishlist_items"]) await pool.execute(`DELETE x FROM ${t} x JOIN ${t === "cart_items" ? "carts" : "wishlists"} p ON p.${t === "cart_items" ? "cart_id" : "wishlist_id"}=x.${t === "cart_items" ? "cart_id" : "wishlist_id"} WHERE p.user_id IN (${q})`, ids).catch(() => {});
      for (const t of ["carts", "wishlists", "addresses", "user_refresh_tokens", "notification_outbox"]) await pool.execute(`DELETE FROM ${t} WHERE user_id IN (${q})`, ids).catch(() => {});
      await pool.execute(`DELETE FROM users WHERE user_id IN (${q})`, ids).catch(() => {});
    }
    await pool.execute("DELETE FROM coupon_usages WHERE coupon_id IN (SELECT coupon_id FROM coupons WHERE code=?)", [couponCode]).catch(() => {});
    await pool.execute("DELETE FROM coupons WHERE code=?", [couponCode]);
    await pool.execute("DELETE FROM product_variants WHERE product_id=?", [productId]);
    await pool.execute("DELETE FROM products WHERE product_id=?", [productId]);
    await pool.execute("DELETE FROM brands WHERE slug=?", [`brand-${tag}`]);
    await pool.execute("DELETE FROM categories WHERE slug=?", [`cat-${tag}`]);
    if (ownsSettings) await pool.execute("DELETE FROM shipping_tax_settings WHERE currency='PKR' AND shipping_fee=250 AND tax_rate=10");
    await pool.end();
  });

  describe("addresses", () => {
    let a1, a2;
    it("requires authentication", async () => { expect((await api("get", "/addresses")).status).toBe(401); });
    it("makes the first address the default", async () => {
      a1 = await newAddress(ta);
      expect(a1.address_id).toBeTruthy();
      expect(Number(a1.is_default)).toBe(1);
    });
    it("a second default replaces the first", async () => {
      const r = await api("post", "/addresses", ta).send({ country: "Pakistan", city: "Lahore", street: "9 Mall Road", is_default: true });
      expect(r.status).toBe(201); a2 = r.body.data;
      const list = (await api("get", "/addresses", ta)).body.data;
      expect(list.filter((x) => Number(x.is_default) === 1)).toHaveLength(1);
      expect(list.find((x) => Number(x.is_default) === 1).address_id).toBe(a2.address_id);
    });
    it("rejects invalid input with 400 and ignores unknown/mass-assigned fields", async () => {
      expect((await api("post", "/addresses", ta).send({ city: "X" })).status).toBe(400);
      // Unknown fields are stripped (never assigned): the address still belongs to the caller.
      const mass = await api("post", "/addresses", ta).send({ country: "PK", city: "Lahore", street: "Some street", user_id: 999, is_default: false });
      expect(mass.status).toBe(201);
      expect(Number(mass.body.data.user_id)).not.toBe(999);
      expect((await api("delete", `/addresses/${mass.body.data.address_id}`, ta)).status).toBe(200);
    });
    it("other users get 404 for read, update, default and delete", async () => {
      expect((await api("get", `/addresses/${a1.address_id}`, tb)).status).toBe(404);
      expect((await api("patch", `/addresses/${a1.address_id}`, tb).send({ city: "Hacked" })).status).toBe(404);
      expect((await api("patch", `/addresses/${a1.address_id}/default`, tb)).status).toBe(404);
      expect((await api("delete", `/addresses/${a1.address_id}`, tb)).status).toBe(404);
      expect((await api("get", `/addresses/${a1.address_id}`, ta)).body.data.city).toBe("Islamabad");
    });
    it("updates, and promotes a new default when the default is deleted", async () => {
      const up = await api("patch", `/addresses/${a1.address_id}`, ta).send({ city: "Rawalpindi" });
      expect(up.body.data.city).toBe("Rawalpindi");
      expect((await api("delete", `/addresses/${a2.address_id}`, ta)).status).toBe(200);
      const list = (await api("get", "/addresses", ta)).body.data;
      expect(list).toHaveLength(1);
      expect(Number(list[0].is_default)).toBe(1);
    });
  });

  describe("pricing preview and order placement", () => {
    let addrA, orderId, couponOrderId;
    it("empty cart cannot be previewed or ordered", async () => {
      addrA = (await api("get", "/addresses", ta)).body.data[0];
      expect((await api("post", "/orders/preview", ta).send({})).status).toBe(400);
      expect((await api("post", "/orders", ta).send({ address_id: addrA.address_id })).status).toBe(400);
    });
    it("rejects adding more than the available stock", async () => {
      expect((await fillCart(ta, 6)).status).toBe(400);
    });
    it("previews totals from the server cart only (subtotal 2000, ship 250, tax 200)", async () => {
      expect((await fillCart(ta, 2)).status).toBeLessThan(300);
      const r = await api("post", "/orders/preview", ta).send({ subtotal: 1, total: 1, shipping: 0 });
      expect(r.status, JSON.stringify(r.body)).toBe(200);
      expect(r.body.data).toMatchObject({ subtotal: 2000, discount: 0, shipping: 250, tax: 200, total: 2450 });
    });
    it("applies a valid coupon in the preview and rejects an unknown one", async () => {
      const ok = await api("post", "/orders/preview", ta).send({ coupon_code: couponCode });
      expect(ok.body.data).toMatchObject({ discount: 200, total: 2230 });
      expect((await api("post", "/orders/preview", ta).send({ coupon_code: "NOPE" })).status).toBeGreaterThanOrEqual(400);
    });
    it("cannot order with another user's address", async () => {
      const addrB = await newAddress(tb);
      const r = await api("post", "/orders", ta).send({ address_id: addrB.address_id });
      expect(r.status).toBe(400);
      expect(await stock()).toBe(5);
    });
    it("validates the order body", async () => {
      expect((await api("post", "/orders", ta).send({})).status).toBe(400);
    });
    it("places an order priced by the backend, cuts stock, clears the cart, records coupon use", async () => {
      const r = await api("post", "/orders", ta).send({ address_id: addrA.address_id, coupon_code: couponCode, total: 1, shipping: 0, discount: 9999 });
      expect(r.status, JSON.stringify(r.body)).toBe(201);
      couponOrderId = r.body.data.order_id;
      expect(Number(r.body.data.total)).toBe(2230);
      expect(Number(r.body.data.discount)).toBe(200);
      expect(await stock()).toBe(3);
      expect((await api("get", "/cart", ta)).body.data.items ?? []).toHaveLength(0);
      const [[u]] = await pool.execute("SELECT status FROM coupon_usages WHERE order_id=?", [couponOrderId]);
      expect(u.status).toBe("USED");
    });
    it("the coupon cannot be reused beyond its per-user limit", async () => {
      await fillCart(ta, 1);
      const r = await api("post", "/orders", ta).send({ address_id: addrA.address_id, coupon_code: couponCode });
      expect(r.status).toBeGreaterThanOrEqual(400);
      expect(await stock()).toBe(3);
    });
    it("two simultaneous submissions create exactly one order and one stock deduction", async () => {
      const before = (await pool.execute("SELECT COUNT(*) n FROM orders WHERE user_id=(SELECT user_id FROM users WHERE email=?)", [A.email]))[0][0].n;
      const [r1, r2] = await Promise.all([1, 2].map(() => api("post", "/orders", ta).send({ address_id: addrA.address_id })));
      expect([r1.status, r2.status].sort()).toEqual([201, 400]);
      const after = (await pool.execute("SELECT COUNT(*) n FROM orders WHERE user_id=(SELECT user_id FROM users WHERE email=?)", [A.email]))[0][0].n;
      expect(after - before).toBe(1);
      expect(await stock()).toBe(2);
      orderId = [r1, r2].find((r) => r.status === 201).body.data.order_id;
    });
    it("refuses to oversell when stock drops after items were added to the cart", async () => {
      await setStock(2); await fillCart(ta, 2); await setStock(1);
      const r = await api("post", "/orders", ta).send({ address_id: addrA.address_id });
      expect(r.status).toBe(400);
      expect(await stock()).toBe(1);
      await api("delete", "/cart", ta);
      await setStock(2);
    });
    it("returns the order with address and payment details to its owner only", async () => {
      const own = await api("get", `/orders/${orderId}`, ta);
      expect(own.status).toBe(200);
      expect(own.body.data.address.city).toBeTruthy();
      expect(own.body.data.items.length).toBeGreaterThan(0);
      expect((await api("get", `/orders/${orderId}`, tb)).status).toBe(403);
    });

    describe("payments", () => {
      it("COD: creates one pending payment and is idempotent", async () => {
        const p1 = await api("post", `/payments/orders/${orderId}`, ta).send({ method: "COD" });
        expect(p1.status, JSON.stringify(p1.body)).toBeLessThan(300);
        const p2 = await api("post", `/payments/orders/${orderId}`, ta).send({ method: "COD" });
        expect(p2.body.data.payment_id).toBe(p1.body.data.payment_id);
        expect((await api("post", `/payments/orders/${orderId}`, tb).send({ method: "COD" })).status).toBe(404);
        expect((await api("post", `/payments/orders/${orderId}`, ta).send({ method: "VISA" })).status).toBe(400);
        const o = (await api("get", `/orders/${orderId}`, ta)).body.data;
        expect(o.payment.payment_gateway).toBe("COD");
      });
      it("mock online payment: success marks the order PAID and CONFIRMED", async () => {
        await fillCart(ta, 1);
        const addr = (await api("get", "/addresses", ta)).body.data[0];
        const order = (await api("post", "/orders", ta).send({ address_id: addr.address_id })).body.data;
        const init = await api("post", `/payments/online/orders/${order.order_id}/checkout`, ta).send({});
        expect(init.status, JSON.stringify(init.body)).toBeLessThan(300);
        const attemptId = init.body.data.attemptId;
        expect(init.body.data.checkoutUrl).toBeTruthy();
        expect((await api("post", `/payments/online/mock/attempts/${attemptId}/complete`, tb).send({ status: "SUCCEEDED" })).status).toBe(404);
        const done = await api("post", `/payments/online/mock/attempts/${attemptId}/complete`, ta).send({ status: "SUCCEEDED" });
        expect(done.status, JSON.stringify(done.body)).toBeLessThan(300);
        const o = (await api("get", `/orders/${order.order_id}`, ta)).body.data;
        expect(o.payment_status).toBe("PAID");
        expect(o.status).toBe("CONFIRMED");
        const again = await api("post", `/payments/online/orders/${order.order_id}/checkout`, ta).send({});
        expect(again.status).toBeGreaterThanOrEqual(400);
      });
      it("mock online payment: failure marks the order payment FAILED", async () => {
        await fillCart(ta, 1);
        const addr = (await api("get", "/addresses", ta)).body.data[0];
        const order = (await api("post", "/orders", ta).send({ address_id: addr.address_id })).body.data;
        const init = await api("post", `/payments/online/orders/${order.order_id}/checkout`, ta).send({});
        await api("post", `/payments/online/mock/attempts/${init.body.data.attemptId}/complete`, ta).send({ status: "FAILED" });
        expect((await api("get", `/orders/${order.order_id}`, ta)).body.data.payment_status).toBe("FAILED");
      });
    });

    describe("cancellation", () => {
      it("restores stock and releases the coupon; others get 403; cannot cancel twice", async () => {
        const before = await stock();
        expect((await api("patch", `/orders/${couponOrderId}/cancel`, tb).send({})).status).toBe(403);
        const r = await api("patch", `/orders/${couponOrderId}/cancel`, ta).send({});
        expect(r.status, JSON.stringify(r.body)).toBe(200);
        expect(await stock()).toBe(before + 2);
        const [[u]] = await pool.execute("SELECT status FROM coupon_usages WHERE order_id=?", [couponOrderId]);
        expect(u.status).toBe("RELEASED");
        expect((await api("patch", `/orders/${couponOrderId}/cancel`, ta).send({})).status).toBeGreaterThanOrEqual(400);
      });
    });
  });

  describe("admin seed + role protection", () => {
    it("refuses a weak password and creates an admin with a hashed password", async () => {
      const env = { ...process.env, ADMIN_EMAIL: ADMIN.email, ADMIN_PASSWORD: "short" };
      let failed = false;
      try { execFileSync("node", ["src/database/seeds/seed-admin.js"], { env, stdio: "pipe" }); } catch { failed = true; }
      expect(failed).toBe(true);
      execFileSync("node", ["src/database/seeds/seed-admin.js"], { env: { ...env, ADMIN_PASSWORD: ADMIN.password }, stdio: "pipe" });
      const [[u]] = await pool.execute("SELECT password FROM users WHERE email=?", [ADMIN.email]);
      expect(u.password).not.toContain(ADMIN.password);
      expect(u.password).toMatch(/^\$2[aby]\$/);
    });
    it("admin can reach admin routes, customer cannot", async () => {
      const tadm = (await api("post", "/auth/login").send(ADMIN)).body.data.accessToken;
      expect(tadm).toBeTruthy();
      expect((await api("get", "/auth/me", tadm)).body.data.user.role).toBe("Admin");
      expect((await api("get", "/coupons", tadm)).status).toBe(200);
      expect((await api("get", "/coupons", ta)).status).toBe(403);
    });
  });
});
