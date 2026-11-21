function setMeta(attribute, key, content) {
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector(selector);

  if (content == null || content === "") {
    element?.remove();
    return;
  }

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

export function setPageMetadata({
  title,
  description,
  canonicalUrl = null,
  image = null,
  type = "website",
  robots = "index,follow",
}) {
  document.title = title;
  setMeta("name", "description", description);
  setMeta("name", "robots", robots);
  setMeta("property", "og:site_name", "ShopSphere");
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:type", type);
  setMeta("property", "og:url", canonicalUrl);
  setMeta("property", "og:image", image);
  setMeta("name", "twitter:card", image ? "summary_large_image" : "summary");
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", image);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonicalUrl) {
    canonical?.remove();
    return;
  }

  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
}
