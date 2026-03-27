import { NextResponse } from "next/server";
import { fetchPhotonSuggestions } from "@/core/services/location-suggestion.server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") ?? "";

    if (query.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const suggestions = await fetchPhotonSuggestions(query);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[API] GET /api/locations/suggestions", error);
    return NextResponse.json({ suggestions: [] });
  }
}
