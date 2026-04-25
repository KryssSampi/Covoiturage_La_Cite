import { cookies } from "next/headers";

type JwtPayload = Record<string, unknown>;

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const segment = token.split(".")[1];
    if (!segment) return null;

    const padded = segment
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(segment.length / 4) * 4, "=");

    return JSON.parse(Buffer.from(padded, "base64").toString("utf8")) as JwtPayload;
  } catch {
    return null;
  }
}

function getClaimAsString(payload: JwtPayload, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const role = getClaimAsString(payload, [
    "role",
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
  ]);

  const email = getClaimAsString(payload, [
    "email",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
  ]);

  const id = getClaimAsString(payload, [
    "sub",
    "nameid",
    "nameidentifier",
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
  ]);

  if (!role) return null;

  return {
    id,
    email,
    role,
  };
}
