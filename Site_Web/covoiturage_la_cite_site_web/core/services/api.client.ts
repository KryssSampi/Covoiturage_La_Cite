/**
 * Client HTTP simplifié pour les appels API du frontend.
 * - Convertit localDate+localTime → UTC avant envoi quand présent
 * - Ajoute `utcOffsetMinutes` si absent
 */

function localDateTimeToUtcParts(date: string, time: string) {
  const localDt = new Date(`${date}T${time}:00`);
  const iso = localDt.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

async function postJson(path: string, body: Record<string, unknown>) {
  const payload = { ...body };

  if (payload.departureDate && typeof payload.departureDate === 'string' && payload.departureTime && typeof payload.departureTime === 'string') {
    // Normaliser en UTC côté client et joindre offset
    try {
      const utc = localDateTimeToUtcParts(payload.departureDate, payload.departureTime);
      payload.departureDate = utc.date;
      payload.departureTime = utc.time;
    } catch {
      // noop
    }
  }

  if (payload.arrivalDate && typeof payload.arrivalDate === 'string' && payload.arrivalTime && typeof payload.arrivalTime === 'string') {
    try {
      const utc = localDateTimeToUtcParts(payload.arrivalDate, payload.arrivalTime);
      payload.arrivalDate = utc.date;
      payload.arrivalTime = utc.time;
    } catch {
      // noop
    }
  }

  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let json: unknown = null;
  try { json = await res.json(); } catch { /* ignore */ }

  return { ok: res.ok, status: res.status, data: json };
}

async function getJson(path: string) {
  const res = await fetch(path, { method: 'GET' });
  let json: unknown = null;
  try { json = await res.json(); } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, data: json };
}

export const apiClient = {
  postJson,
  getJson,
};

export default apiClient;

