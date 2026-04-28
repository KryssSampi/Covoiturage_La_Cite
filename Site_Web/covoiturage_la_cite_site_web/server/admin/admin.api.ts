import { cookies } from "next/headers";

const API_BASE =
  process.env.SERVER_CORE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000";

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
  Success?: boolean;
  Message?: string;
  Data?: T;
}

export class AdminApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "AdminApiError";
  }
}

function getEnvelopeValue<T>(
  envelope: ApiEnvelope<T>,
  lowercase: keyof ApiEnvelope<T>,
  uppercase: keyof ApiEnvelope<T>,
) {
  if (envelope[lowercase] !== undefined) return envelope[lowercase];
  return envelope[uppercase];
}

async function getAuthToken(): Promise<string> {
  const store = await cookies();
  const token = store.get("sc_token")?.value ?? store.get("auth_token")?.value;
  if (!token) throw new AdminApiError(401, "Non authentifie");
  return token;
}

export async function adminFetch<T = unknown>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const bearer = token ?? await getAuthToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let message = `Erreur serveur (${res.status})`;
    try {
      const body = (await res.json()) as ApiEnvelope<unknown> & { title?: string; Title?: string };
      message = String(
        getEnvelopeValue(body, "message", "Message") ??
        body.title ??
        body.Title ??
        message,
      );
    } catch {
      // keep default message
    }
    throw new AdminApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;

  const body = (await res.json()) as T | ApiEnvelope<T>;

  if (body && typeof body === "object") {
    const envelope = body as ApiEnvelope<T>;
    const hasSuccess = envelope.success !== undefined || envelope.Success !== undefined;
    if (hasSuccess) {
      const success = Boolean(getEnvelopeValue(envelope, "success", "Success"));
      const message = getEnvelopeValue(envelope, "message", "Message");

      if (!success) {
        throw new AdminApiError(res.status, String(message ?? "Erreur API admin"));
      }

      const data = getEnvelopeValue(envelope, "data", "Data");
      return (data ?? undefined) as T;
    }
  }

  return body as T;
}

export async function adminGet<T = unknown>(path: string): Promise<T> {
  return adminFetch<T>(path);
}

export async function adminPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  return adminFetch<T>(path, {
    method: "POST",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function adminPut<T = unknown>(path: string, body?: unknown): Promise<T> {
  return adminFetch<T>(path, {
    method: "PUT",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function adminPatch<T = unknown>(path: string, body?: unknown): Promise<T> {
  return adminFetch<T>(path, {
    method: "PATCH",
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function adminDelete<T = unknown>(path: string): Promise<T> {
  return adminFetch<T>(path, { method: "DELETE" });
}
