import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export function getCurrentUser() {
  const token = cookies().get("access_token")?.value;
  if (!token) return null;

  try {
    return jwt.decode(token) as { role: string; email: string };
  } catch {
    return null;
  }
}
``