import * as service from "../services/platform.service.js";

const ok = (res, data, message, status = 200) => res.status(status).json({ success: true, message, data });

export async function getPublicBundles(req, res, next) {
  try { ok(res, await service.getPublicBundles(), "Product bundles retrieved."); } catch (error) { next(error); }
}

export async function createBundle(req, res, next) {
  try { ok(res, await service.createBundle(req.body, req.user?.user_id), "Product bundle created.", 201); } catch (error) { next(error); }
}

export async function subscribeBackInStock(req, res, next) {
  try { ok(res, await service.subscribeBackInStock(req.body, req.user), "Back-in-stock notification subscription saved.", 201); } catch (error) { next(error); }
}

export async function subscribeNewsletter(req, res, next) {
  try { ok(res, await service.subscribeNewsletter(req.body), "Newsletter subscription saved.", 201); } catch (error) { next(error); }
}

export async function unsubscribeNewsletter(req, res, next) {
  try { ok(res, await service.unsubscribeNewsletter(req.body.email), "Newsletter subscription removed."); } catch (error) { next(error); }
}

export async function createWishlistShare(req, res, next) {
  try { ok(res, await service.createWishlistShare(req.user.user_id, req.body), "Wishlist share link created.", 201); } catch (error) { next(error); }
}

export async function getWishlistShare(req, res, next) {
  try { ok(res, await service.getWishlistShare(req.params.token), "Shared wishlist retrieved."); } catch (error) { next(error); }
}

export async function createReferralCode(req, res, next) {
  try { ok(res, await service.createReferralCode(req.user.user_id), "Referral code created.", 201); } catch (error) { next(error); }
}

export async function applyReferral(req, res, next) {
  try { ok(res, await service.applyReferral(req.body.code, req.user.user_id), "Referral code applied."); } catch (error) { next(error); }
}

export async function listCampaigns(req, res, next) {
  try { ok(res, await service.listCampaigns(), "Promotional campaigns retrieved."); } catch (error) { next(error); }
}

export async function createCampaign(req, res, next) {
  try { ok(res, await service.createCampaign(req.body, req.user?.user_id), "Promotional campaign created.", 201); } catch (error) { next(error); }
}

export async function getStoreSettings(req, res, next) {
  try { ok(res, await service.getStoreSettings(req.params.key), "Store settings retrieved."); } catch (error) { next(error); }
}

export async function updateStoreSettings(req, res, next) {
  try { ok(res, await service.updateStoreSettings(req.body, req.user.user_id), "Store settings updated."); } catch (error) { next(error); }
}

export async function getAuditLogs(req, res, next) {
  try { ok(res, await service.getAuditLogs(req.query), "Audit logs retrieved."); } catch (error) { next(error); }
}

export async function getCustomerSegments(req, res, next) {
  try { ok(res, await service.getCustomerSegments(), "Customer segments retrieved."); } catch (error) { next(error); }
}

export async function getInventoryForecast(req, res, next) {
  try { ok(res, await service.getInventoryForecast(req.query), "Inventory forecast retrieved."); } catch (error) { next(error); }
}

function csvValue(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function exportSalesCsv(req, res, next) {
  try {
    const rows = await service.getSalesExport();
    const columns = rows.length ? Object.keys(rows[0]) : ["order_number","created_at","status","payment_status","subtotal","discount","shipping","tax","total","email"];
    const csv = [columns.join(","), ...rows.map((row) => columns.map((column) => csvValue(row[column])).join(","))].join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="sales-report.csv"');
    res.status(200).send(csv);
  } catch (error) { next(error); }
}

export async function exportSalesExcel(req, res, next) {
  try {
    const rows = await service.getSalesExport();
    const columns = rows.length ? Object.keys(rows[0]) : ["order_number","created_at","status","payment_status","subtotal","discount","shipping","tax","total","email"];
    const escapeXml = (value) => String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const table = [
      `<Worksheet ss:Name="Sales Report"><Table>`,
      `<Row>${columns.map((column) => `<Cell><Data ss:Type="String">${escapeXml(column)}</Data></Cell>`).join("")}</Row>`,
      ...rows.map((row) => `<Row>${columns.map((column) => `<Cell><Data ss:Type="String">${escapeXml(row[column])}</Data></Cell>`).join("")}</Row>`),
      `</Table></Worksheet>`,
    ].join("");
    const xml = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">${table}</Workbook>`;
    res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="sales-report.xls"');
    res.status(200).send(xml);
  } catch (error) { next(error); }
}
