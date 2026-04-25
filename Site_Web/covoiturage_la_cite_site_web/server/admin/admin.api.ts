import { SERVER_CORE_URL } from "@/server/config";

type WrappedResponse<T> = {
  success?: boolean;
  message?: string;
  errors?: string[];
  data?: T;
};

export async function adminFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const res = await fetch(`${SERVER_CORE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
  });

  const json = (await res.json().catch(() => null)) as WrappedResponse<T> | T | null;

  if (!res.ok) {
    const message =
      (json as WrappedResponse<T> | null)?.message ??
      `Admin API error (${res.status})`;
    throw new Error(message);
  }

  if (
    json &&
    typeof json === "object" &&
    "success" in json &&
    "data" in json
  ) {
    return (json as WrappedResponse<T>).data as T;
  }

  return json as T;
}
