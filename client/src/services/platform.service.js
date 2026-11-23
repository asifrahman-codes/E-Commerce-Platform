import api from "./api";

export async function getBundles() {
  return api.get("/platform/bundles");
}
export async function subscribeNewsletter(email, source = "website") {
  return api.post("/platform/newsletter/subscribe", { email, source });
}
export async function subscribeBackInStock(payload) {
  return api.post("/platform/back-in-stock", payload);
}
export async function shareWishlist(title) {
  return api.post("/platform/wishlist/share", { title });
}
export async function getSharedWishlist(token) {
  return api.get(`/platform/wishlist/shared/${encodeURIComponent(token)}`);
}
export async function getStoreSettings() {
  return api.get("/platform/admin/store-settings");
}
export async function updateStoreSettings(payload) {
  return api.put("/platform/admin/store-settings", payload);
}
export async function getAuditLogs() {
  return api.get("/platform/admin/audit-logs");
}
export async function getCustomerSegments() {
  return api.get("/platform/admin/customer-segments");
}
export async function getInventoryForecast() {
  return api.get("/platform/admin/inventory-forecast");
}
export function salesCsvUrl() {
  return `${import.meta.env.VITE_API_BASE_URL}/platform/admin/reports/sales.csv`;
}
export function salesExcelUrl() {
  return `${import.meta.env.VITE_API_BASE_URL}/platform/admin/reports/sales.xls`;
}

export async function downloadSalesCsv() {
  const response = await api.get("/platform/admin/reports/sales.csv", { responseType: "blob" });
  const blob = response instanceof Blob ? response : new Blob([response]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sales-report.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadSalesExcel() {
  const response = await api.get("/platform/admin/reports/sales.xls", { responseType: "blob" });
  const blob = response instanceof Blob ? response : new Blob([response]);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "sales-report.xls";
  link.click();
  URL.revokeObjectURL(url);
}
