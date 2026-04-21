const API_URL = process.env.API_URL;

export async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  if (!API_URL) {
    throw new Error("API_URL environment variable is not set");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Admin API error (${res.status})`);
  }

  return res.json();
}