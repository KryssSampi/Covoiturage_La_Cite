/**
 * server/http-client.ts — Client HTTP générique vers le Server Core (.NET)
 *
 * Toutes les requêtes du site web vers le backend passent par ce client.
 * Gère : base URL, JSON, JWT forwarding, timeout, erreurs standardisées.
 */

import { SERVER_CORE_URL, DEFAULT_TIMEOUT } from './config';

// ── Types ─────────────────────────────────────────────────────────────────────

/** Réponse standardisée du Server Core */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface RequestOptions {
  /** Token JWT à transmettre au Server Core */
  token?: string;
  /** Query params (seront URL-encodés) */
  params?: Record<string, string | number | boolean | undefined>;
  /** Timeout en ms (défaut : 15s) */
  timeout?: number;
  /** Headers supplémentaires */
  headers?: Record<string, string>;
  /** Signal pour annulation */
  signal?: AbortSignal;
}

// ── Utilitaires ───────────────────────────────────────────────────────────────

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
  const url = new URL(path, SERVER_CORE_URL);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
}

function buildHeaders(options?: RequestOptions): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options?.headers,
  };
  if (options?.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (response.status === 204) {
    return { success: true };
  }

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: body?.message ?? `Server Core error: ${response.status}`,
      errors: body?.errors ?? [],
    };
  }

  // Server Core wraps dans { success, data, message, errors }
  // Pour les PATCH/DELETE qui ne retournent pas de data, on fournit un objet vide
  if (body && body.success !== undefined) {
    return { ...body, data: body.data ?? {} } as ApiResponse<T>;
  }

  return body as ApiResponse<T>;
}

// ── Méthodes HTTP ─────────────────────────────────────────────────────────────

export async function get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? DEFAULT_TIMEOUT);

  try {
    const response = await fetch(buildUrl(path, options?.params), {
      method: 'GET',
      headers: buildHeaders(options),
      signal: options?.signal ?? controller.signal,
    });
    return handleResponse<T>(response);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, message: 'Request timeout' };
    }
    return { success: false, message: (error as Error).message };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? DEFAULT_TIMEOUT);

  try {
    const response = await fetch(buildUrl(path, options?.params), {
      method: 'POST',
      headers: buildHeaders(options),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal ?? controller.signal,
    });
    return handleResponse<T>(response);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, message: 'Request timeout' };
    }
    return { success: false, message: (error as Error).message };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? DEFAULT_TIMEOUT);

  try {
    const response = await fetch(buildUrl(path, options?.params), {
      method: 'PUT',
      headers: buildHeaders(options),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal ?? controller.signal,
    });
    return handleResponse<T>(response);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, message: 'Request timeout' };
    }
    return { success: false, message: (error as Error).message };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? DEFAULT_TIMEOUT);

  try {
    const response = await fetch(buildUrl(path, options?.params), {
      method: 'PATCH',
      headers: buildHeaders(options),
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal ?? controller.signal,
    });
    return handleResponse<T>(response);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, message: 'Request timeout' };
    }
    return { success: false, message: (error as Error).message };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function del<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options?.timeout ?? DEFAULT_TIMEOUT);

  try {
    const response = await fetch(buildUrl(path, options?.params), {
      method: 'DELETE',
      headers: buildHeaders(options),
      signal: options?.signal ?? controller.signal,
    });
    return handleResponse<T>(response);
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return { success: false, message: 'Request timeout' };
    }
    return { success: false, message: (error as Error).message };
  } finally {
    clearTimeout(timeoutId);
  }
}
