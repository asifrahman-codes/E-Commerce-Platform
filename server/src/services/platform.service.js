import crypto from "node:crypto";
import * as repository from "../repositories/platform.repository.js";
import ApiError from "../utils/ApiError.js";

function positiveInteger(value, name) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number <= 0) throw new ApiError(400, `Invalid ${name}.`);
  return number;
}

function validEmail(value) {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function getPublicBundles() {
  return repository.listActiveBundles();
}

export async function createBundle(data, userId = null) {
  if (!data.name?.trim()) throw new ApiError(400, "Bundle name is required.");
  if (!["PERCENTAGE", "FIXED"].includes(data.discount_type)) throw new ApiError(400, "Invalid bundle discount type.");
  if (!Number.isFinite(Number(data.discount_value)) || Number(data.discount_value) < 0) throw new ApiError(400, "Invalid bundle discount.");
  if (!Array.isArray(data.items) || data.items.length === 0) throw new ApiError(400, "A bundle requires at least one item.");
  const items = data.items.map((item) => ({
    product_id: positiveInteger(item.product_id, "bundle product ID"),
    variant_id: item.variant_id == null ? null : positiveInteger(item.variant_id, "bundle variant ID"),
    quantity: positiveInteger(item.quantity ?? 1, "bundle quantity"),
  }));
  const id = await repository.createBundle({ ...data, name: data.name.trim(), items });
  await repository.writeAuditLog({ action: "CREATE", entity_type: "PRODUCT_BUNDLE", entity_id: String(id), new_values: data, user_id: userId });
  return { bundle_id: id };
}

export async function subscribeBackInStock(data, user) {
  const email = String(data.email ?? user?.email ?? "").trim().toLowerCase();
  if (!validEmail(email)) throw new ApiError(400, "A valid email address is required.");
  await repository.subscribeBackInStock({
    user_id: user?.user_id ?? null,
    email,
    product_id: positiveInteger(data.product_id, "product ID"),
    variant_id: data.variant_id == null ? null : positiveInteger(data.variant_id, "variant ID"),
  });
  return { subscribed: true };
}

export async function subscribeNewsletter(data) {
  const email = String(data.email ?? "").trim().toLowerCase();
  if (!validEmail(email)) throw new ApiError(400, "A valid email address is required.");
  await repository.subscribeNewsletter(email, data.source ?? "website");
  return { subscribed: true };
}

export async function unsubscribeNewsletter(email) {
  if (!validEmail(email)) throw new ApiError(400, "A valid email address is required.");
  await repository.unsubscribeNewsletter(email.trim().toLowerCase());
  return { subscribed: false };
}

export async function createWishlistShare(userId, data) {
  const token = await repository.createWishlistShare(userId, data.title?.trim() || null, data.expires_at ?? null);
  return { share_token: token, share_url: `/wishlist/shared/${token}` };
}

export async function getWishlistShare(token) {
  if (!/^[a-f0-9-]{36}$/i.test(token)) throw new ApiError(404, "Shared wishlist not found.");
  const share = await repository.getWishlistShare(token);
  if (!share) throw new ApiError(404, "Shared wishlist not found.");
  return share;
}

export async function createReferralCode(userId) {
  const normalized = `SHOP-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
  await repository.createReferralCode(userId, normalized, 100);
  return { code: normalized, reward_points: 100 };
}

export async function applyReferral(code, userId) {
  if (typeof code !== "string" || code.trim().length < 3) throw new ApiError(400, "A valid referral code is required.");
  const result = await repository.applyReferralCode(code.trim().toUpperCase(), userId);
  if (!result) throw new ApiError(404, "Referral code not found or inactive.");
  return { applied: true };
}

export async function listCampaigns() {
  return repository.listCampaigns();
}

export async function createCampaign(data, userId = null) {
  if (!data.name?.trim()) throw new ApiError(400, "Campaign name is required.");
  if (!["PERCENTAGE", "FIXED"].includes(data.discount_type ?? "PERCENTAGE")) throw new ApiError(400, "Invalid campaign discount type.");
  const id = await repository.createCampaign({ ...data, name: data.name.trim() });
  await repository.writeAuditLog({ action: "CREATE", entity_type: "PROMOTIONAL_CAMPAIGN", entity_id: String(id), new_values: data, user_id: userId });
  return { campaign_id: id };
}

export async function getStoreSettings(key) {
  if (key) return repository.getStoreSetting(key);
  const keys = ["store_name", "support_email", "currency", "timezone"];
  const settings = {};
  for (const settingKey of keys) {
    const setting = await repository.getStoreSetting(settingKey);
    if (setting) settings[setting.setting_key] = setting.setting_value;
  }
  return settings;
}

export async function updateStoreSettings(body, userId) {
  const allowed = new Set(["store_name", "support_email", "currency", "timezone"]);
  for (const [key, value] of Object.entries(body)) {
    if (!allowed.has(key)) throw new ApiError(400, `Unknown store setting: ${key}`);
  }
  for (const [key, value] of Object.entries(body)) await repository.setStoreSetting(key, value, userId);
  await repository.writeAuditLog({ action: "UPDATE", entity_type: "STORE_SETTINGS", new_values: body, user_id: userId });
  return getStoreSettings();
}

export async function getAuditLogs(query) {
  const limit = Math.min(500, Math.max(1, Number(query.limit) || 100));
  return repository.listAuditLogs(limit);
}

export async function getCustomerSegments() {
  return repository.getCustomerSegments();
}

export async function getInventoryForecast(query) {
  const days = Math.min(365, Math.max(7, Number(query.days) || 30));
  return repository.getInventoryForecast(days);
}

export async function getSalesExport() {
  return repository.getSalesExport();
}
