const DEFAULT_CITY_IMAGE = "/assets/destinations-pictures/default-city.png";
const LACITE_IMAGE = "/assets/destinations-pictures/la-cite.png";
const HOME_IMAGE = "/assets/destinations-pictures/maison.png";
const WORK_IMAGE = "/assets/destinations-pictures/travail.png";

const imageCache = new Map<string, string>();
const inflightCache = new Map<string, Promise<string>>();

function normalizeCity(city: string) {
  return city
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s'-]/g, " ")
    .toLowerCase()
    .trim();
}

function getLocalImage(city: string) {
  const normalized = normalizeCity(city);

  if (
    normalized.includes("cite") ||
    normalized.includes("campus") ||
    normalized.includes("college")
  ) {
    return LACITE_IMAGE;
  }

  if (normalized.includes("maison") || normalized.includes("domicile")) {
    return HOME_IMAGE;
  }

  if (normalized.includes("travail")) {
    return WORK_IMAGE;
  }

  return DEFAULT_CITY_IMAGE;
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export async function getCityImage(city: string) {
  const cacheKey = normalizeCity(city);

  if (!cacheKey) {
    return DEFAULT_CITY_IMAGE;
  }

  if (imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey) ?? DEFAULT_CITY_IMAGE;
  }

  if (inflightCache.has(cacheKey)) {
    return inflightCache.get(cacheKey) ?? Promise.resolve(DEFAULT_CITY_IMAGE);
  }

  const localImage = getLocalImage(city);

  const promise = (async () => {
    try {
      const res = await fetchWithTimeout(
        `/api/unsplash?city=${encodeURIComponent(city)}`,
        2500
      );

      if (!res.ok) {
        imageCache.set(cacheKey, localImage);
        return localImage;
      }

      const data = await res.json();
      const image = data?.image || localImage;
      imageCache.set(cacheKey, image);
      return image;
    } catch {
      imageCache.set(cacheKey, localImage);
      return localImage;
    } finally {
      inflightCache.delete(cacheKey);
    }
  })();

  inflightCache.set(cacheKey, promise);
  return promise;
}
