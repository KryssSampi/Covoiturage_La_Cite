import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";
import type { GoTask } from "@/features/dashboard/types/goboard.types";

/**
 * GET /api/gotasks
 * Retourne la liste complète des GoTasks depuis la base JSON.
 */
export async function GET() {
  try {
    const tasks = persistenceManager.readAll<GoTask>("gotasks");
    return NextResponse.json(tasks);
  } catch {
    return NextResponse.json(
      { error: "Impossible de lire les gotasks" },
      { status: 500 },
    );
  }
}
