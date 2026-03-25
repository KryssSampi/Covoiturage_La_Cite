/**
 * POST /api/favoris/user-favori
 * Corps : { userId, targetUserId }
 * Crée ou met à jour l'affinité pour marquer isActuallyFavorite = true.
 *
 * DELETE /api/favoris/user-favori?affiniteId={id}
 * Met isActuallyFavorite = false sur l'affinité (la relation reste, seul le favori est retiré).
 */
import { NextResponse } from "next/server";
import { persistenceManager } from "@/tests/PersistenceManager";
import type { AffiniteModel } from "@/domain/models/AffiniteModel";

export async function POST(req: Request) {
  try {
    const { userId, targetUserId } = (await req.json()) as {
      userId?: string;
      targetUserId?: string;
    };

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: "userId et targetUserId requis" }, { status: 400 });
    }

    const all = persistenceManager.readAll<AffiniteModel>("affinites");

    // Chercher une affinité existante dans le sens userId → targetUserId
    const existing = all.find(
      (a) => a.idPersonneQuiAMisEnFavoris === userId && a.idPersonneEnFavoris === targetUserId,
    );

    if (existing) {
      // Mettre à jour isActuallyFavorite
      const updated = persistenceManager.updateItem<AffiniteModel>("affinites", existing.id, {
        isActuallyFavorite: true,
        updatedAt: new Date().toISOString(),
      });
      return NextResponse.json(updated);
    }

    // Créer une nouvelle affinité avec isActuallyFavorite = true
    const now = new Date().toISOString();
    const newAff: AffiniteModel = {
      id: `AFF-${Date.now()}`,
      idPersonneQuiAMisEnFavoris: userId,
      idPersonneEnFavoris: targetUserId,
      isActuallyFavorite: true,
      noteAffinite: 0,
      totalTrajetsEnsemble: 0,
      dernierTrajetDate: "",
      createdAt: now,
      updatedAt: now,
    } as AffiniteModel;

    persistenceManager.addItem("affinites", newAff);
    return NextResponse.json(newAff, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const affiniteId = searchParams.get("affiniteId");

    if (!affiniteId) {
      return NextResponse.json({ error: "affiniteId requis" }, { status: 400 });
    }

    // On ne supprime pas l'affinité, on retire juste le favori
    const updated = persistenceManager.updateItem<AffiniteModel>("affinites", affiniteId, {
      isActuallyFavorite: false,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      return NextResponse.json({ error: "Affinité non trouvée" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
