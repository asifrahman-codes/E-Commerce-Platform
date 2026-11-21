const requests = new Map();
const MAX_ENTRIES = 100;

function trimCache() {
  while (requests.size > MAX_ENTRIES) {
    requests.delete(requests.keys().next().value);
  }
}

export function getCachedRequest(key, request, ttlMs = 0) {
  const cached = requests.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    requests.delete(key);
    requests.set(key, cached);
    return cached.promise ?? Promise.resolve(cached.value);
  }
  if (cached) requests.delete(key);

  const entry = { promise: null, value: undefined, expiresAt: Infinity };
  const promise = Promise.resolve()
    .then(request)
    .then((value) => {
      if (requests.get(key) === entry && ttlMs > 0) {
        entry.promise = null;
        entry.value = value;
        entry.expiresAt = Date.now() + ttlMs;
        trimCache();
      } else if (requests.get(key) === entry) {
        requests.delete(key);
      }
      return value;
    })
    .catch((error) => {
      if (requests.get(key) === entry) requests.delete(key);
      throw error;
    });

  entry.promise = promise;
  requests.set(key, entry);
  trimCache();
  return promise;
}

export function serializeRequestParams(params = {}) {
  return Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
}

export function clearCachedRequests(prefix) {
  for (const key of requests.keys()) {
    if (key.startsWith(prefix)) requests.delete(key);
  }
}
