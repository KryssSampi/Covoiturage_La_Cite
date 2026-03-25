import { NextResponse } from "next/server";

import type { IndisponibilityDateRange, IndisponibilityModel } from "@/core/models/IndisponibilityModel";
import { sortAndDeduplicateIndisponibilityDates } from "@/core/utils/indisponibility.utils";
import { persistenceManager } from "@/tests/PersistenceManager";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const record = persistenceManager.readById<IndisponibilityModel>("indisponibilities", id);

    if (!record) {
      return NextResponse.json(
        {
          id,
          dates: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } satisfies IndisponibilityModel,
      );
    }

    return NextResponse.json(record);
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Partial<IndisponibilityModel>;
    const now = new Date().toISOString();

    const sanitizedDates = sortAndDeduplicateIndisponibilityDates(
      Array.isArray(body.dates) ? (body.dates as IndisponibilityDateRange[]) : [],
    );

    const existing = persistenceManager.readById<IndisponibilityModel>("indisponibilities", id);

    if (existing) {
      const updated = persistenceManager.updateItem<IndisponibilityModel>("indisponibilities", id, {
        dates: sanitizedDates,
      });
      return NextResponse.json(updated);
    }

    const created: IndisponibilityModel = {
      id,
      dates: sanitizedDates,
      createdAt: now,
      updatedAt: now,
    };

    persistenceManager.addItem("indisponibilities", created);
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
