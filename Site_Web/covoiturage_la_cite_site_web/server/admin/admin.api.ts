import { cookies } from "next/headers";

const API_URL = process.env.API_URL!;

export async function adminFetch(path: string, options: RequestInit = {}) {
  const token = cookies().get("access_token")?.value;

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  }).then(r => r.json());
}
``