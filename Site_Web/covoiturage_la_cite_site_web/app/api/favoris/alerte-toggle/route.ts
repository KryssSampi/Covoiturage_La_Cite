/**
 * PATCH /api/favoris/alerte-toggle
 * Corps : { alerteId, surveyIsOn }
 * Toggle le statut de surveillance d'une alerte de trajet.
 *
 * DELETE /api/favoris/alerte-toggle?alerteId={id}
 * Supprime une alerte de trajet.
 */
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  try {
    const { alerteId, surveyIsOn } = (await req.json()) as {
      alerteId?: string;
      surveyIsOn?: boolean;
    };

    if (!alerteId || typeof surveyIsOn !== "boolean") {
      return NextResponse.json({ error: "alerteId et surveyIsOn requis" }, { status: 400 });
    }

    // Simuler un délai backend réaliste (~400ms)
    await new Promise((r) => setTimeout(r, 400));

    return NextResponse.json({
      success: true,
      alerteId,
      surveyIsOn,
      statut: surveyIsOn ? "actif" : "desactive",
    });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const alerteId = searchParams.get("alerteId");

    if (!alerteId) {
      return NextResponse.json({ error: "alerteId requis" }, { status: 400 });
    }

    // Simuler un délai backend réaliste (~300ms)
    await new Promise((r) => setTimeout(r, 300));

    return NextResponse.json({ success: true, alerteId });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
