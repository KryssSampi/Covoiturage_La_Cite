"use client";

import { useEffect } from "react";

import { LoginArea } from "@/features/auth";
import { useLoader } from "@/core/context/loader.context";
import type { CoreUserResponse } from "@/features/auth/hooks/useloginForm";

export default function LoginPage() {
  const { setActiveLoader } = useLoader();

  useEffect(() => {
    setActiveLoader(false);
  }, [setActiveLoader]);

  const handleLogin = async (email: string): Promise<CoreUserResponse> => {
    const res = await fetch("/api/auth/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload?.error ?? "Erreur de connexion");
    }

    // Le Server Core renvoie { accessToken, expiresAt, user: {...}, isNewUser }
    // On extrait l'objet user qui correspond à CoreUserResponse
    return (payload.user ?? payload) as CoreUserResponse;
  };

  return (
    <div
      className="bg-white"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <main className="inline-flex flex-col max-w-md p-8 bg-transparent rounded-lg">
        <LoginArea onLogin={handleLogin} />
      </main>
    </div>
  );
}
