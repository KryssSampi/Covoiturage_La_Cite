"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

const API_URL = process.env.API_URL;

type LoginState = { error: string } | null;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("motDePasse") as string;

  if (!email || !password) {
    return { error: "Veuillez remplir tous les champs." };
  }

  if (!API_URL) {
    return { error: "Erreur de configuration du serveur." };
  }

  let token: string;

  try {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (res.status === 401) {
      return { error: "Email ou mot de passe incorrect." };
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { error: data.message || "Erreur lors de la connexion." };
    }

    const data = await res.json();
    token = data.access_token ?? data.token ?? "";

    if (!token) {
      return { error: "Réponse invalide du serveur." };
    }
  } catch {
    return { error: "Impossible de joindre le serveur. Réessayez." };
  }

  const cookieStore = await cookies();
  cookieStore.set("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  const payload = jwt.decode(token) as { role?: string } | null;
  redirect(payload?.role === "Admin" ? "/admin/dashboard" : "/");
}
