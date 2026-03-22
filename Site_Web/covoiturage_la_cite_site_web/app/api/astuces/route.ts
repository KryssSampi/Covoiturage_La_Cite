import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";
import type { Tip } from "@/features/dashboard/types/lacite_astuces.types";

/**
 * GET /api/astuces
 * Retourne la liste complète des astuces La Cité depuis la base JSON.
 * Données statiques modifiables uniquement par l'administrateur (édition directe du fichier JSON).
 */
export async function GET() {
  try {
    const tips = persistenceManager.readAll<Tip>("astuces");
    return NextResponse.json(tips);
  } catch {
    return NextResponse.json(
      { error: "Impossible de lire les astuces" },
      { status: 500 }
    );
  }
}
