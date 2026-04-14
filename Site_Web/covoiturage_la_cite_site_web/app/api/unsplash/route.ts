const cache = new Map<string, string>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get("city");

  if (!city) {
    return Response.json({ error: "No city" }, { status: 400 });
  }

  if (cache.has(city)) {
    return Response.json({ image: cache.get(city) });
  }

  const res = await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(`${city} Canada`)}&orientation=landscape&per_page=1`,    {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
      },
    }
  );

  if (!res.ok) {
    if (res.status === 401) {
      // Clé API manquante ou invalide — retourner null sans erreur pour ne pas bloquer l'UI
      return Response.json({ image: null });
    }
    console.error("Unsplash error:", res.status, res.statusText);
    return Response.json({ image: null });
  }

  const data = await res.json();
  const image = data.results[0]?.urls?.regular ?? null;

  if (image) {
    cache.set(city, image);
  }

  return Response.json({ image });
}