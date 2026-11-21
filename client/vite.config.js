import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const STATIC_PUBLIC_PATHS = ["/", "/products", "/categories", "/flash-sales"];

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function sitemapPlugin({ siteUrl, apiBaseUrl }) {
  return {
    name: "shopsphere-seo-files",
    apply: "build",
    async generateBundle() {
      const robots = [
        "User-agent: *",
        "Disallow: /account",
        "Disallow: /admin",
        "Disallow: /cart",
        "Disallow: /checkout",
        "Disallow: /login",
        "Disallow: /mock-payment",
        "Disallow: /orders",
        "Disallow: /support",
        "Disallow: /wishlist",
        ...(siteUrl ? [`Sitemap: ${siteUrl}/sitemap.xml`] : []),
        "",
      ].join("\n");
      this.emitFile({ type: "asset", fileName: "robots.txt", source: robots });

      if (!siteUrl) {
        this.warn("VITE_SITE_URL is unset; robots.txt was emitted without a sitemap URL.");
        return;
      }

      const urls = new Map(
        STATIC_PUBLIC_PATHS.map((path) => [`${siteUrl}${path}`, undefined])
      );

      if (apiBaseUrl) {
        try {
          const endpoint = `${apiBaseUrl.replace(/\/+$/, "")}/products/search`;
          const getPage = async (page) => {
            const requestUrl = new URL(endpoint);
            requestUrl.searchParams.set("sort", "newest");
            requestUrl.searchParams.set("page", String(page));
            requestUrl.searchParams.set("limit", "50");
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10_000);
            try {
              const response = await fetch(requestUrl, {
                signal: controller.signal,
              });
              if (!response.ok) {
                throw new Error(`Product API returned HTTP ${response.status}.`);
              }
              const payload = await response.json();
              return payload?.data ?? payload;
            } finally {
              clearTimeout(timeout);
            }
          };

          const firstPage = await getPage(1);
          const totalPages = Math.min(
            1000,
            Math.max(1, Number(firstPage?.pagination?.total_pages) || 1)
          );
          const addProducts = (pageData) => {
            for (const product of pageData?.products ?? []) {
              const id = product.product_id ?? product.id;
              if (!id) continue;
              const productUrl = `${siteUrl}/products/${encodeURIComponent(id)}`;
              urls.set(productUrl, product.updated_at);
              if (urls.size >= 50_000) break;
            }
          };
          addProducts(firstPage);

          for (let page = 2; page <= totalPages && urls.size < 50_000; page += 8) {
            const pages = Array.from(
              { length: Math.min(8, totalPages - page + 1) },
              (_, index) => page + index
            );
            const results = await Promise.all(pages.map(getPage));
            results.forEach(addProducts);
          }
        } catch (error) {
          this.warn(`Could not add live products to sitemap: ${error.message}`);
        }
      }

      const entries = [...urls].map(([url, updatedAt]) => {
        const lastmod = updatedAt && !Number.isNaN(Date.parse(updatedAt))
          ? `<lastmod>${new Date(updatedAt).toISOString()}</lastmod>`
          : "";
        return `<url><loc>${escapeXml(url)}</loc>${lastmod}</url>`;
      });
      this.emitFile({
        type: "asset",
        fileName: "sitemap.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.join("")}</urlset>`,
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const siteUrl = env.VITE_SITE_URL
    ? new URL(env.VITE_SITE_URL).origin.replace(/\/+$/, "")
    : "";

  return {
    plugins: [
      react(),
      tailwindcss(),
      sitemapPlugin({
        siteUrl,
        apiBaseUrl: env.VITE_API_BASE_URL,
      }),
    ],
    server: {
      port: 5174,
      host: true,
    },
  };
});