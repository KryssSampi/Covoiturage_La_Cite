import { NextRequest, NextResponse } from "next/server";
import { fetchCircuits } from "@/core/services/routing.service";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const depParam  = searchParams.get("dep");
    const arrParam  = searchParams.get("arr");
    const depLabel  = searchParams.get("depLabel") || "Départ";
    const arrLabel  = searchParams.get("arrLabel") || "Arrivée";

    if (!depParam || !arrParam) {
        return NextResponse.json(
            { error: "Paramètres 'dep' et 'arr' requis" },
            { status: 400 }
        );
    }

    const dep = depParam.split(",").map(Number) as [number, number];
    const arr = arrParam.split(",").map(Number) as [number, number];

    try {
        const circuits = await fetchCircuits(dep, arr, depLabel, arrLabel);
        return NextResponse.json(circuits);
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : "Erreur inconnue" },
            { status: 500 }
        );
    }
}
