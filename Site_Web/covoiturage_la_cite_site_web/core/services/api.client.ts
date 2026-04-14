/**
 * Client HTTP simplifié pour les appels API du frontend.
 * - Convertit localDate+localTime → UTC avant envoi quand présent
 * - Ajoute `utcOffsetMinutes` si absent
 */
import { utcToLocalDateIso, utcToLocalTime } from '@/core/utils/date.utils';

function pad(n: number) { return String(n).padStart(2, '0'); }

function localDateTimeToUtcParts(date: string, time: string) {
  const localDt = new Date(`${date}T${time}:00`);
  const iso = localDt.toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

async function postJson(path: string, body: any) {
  const payload = { ...body };

  if (payload && payload.departureDate && payload.departureTime) {
    // Normaliser en UTC côté client et joindre offset
    try {
      const utc = localDateTimeToUtcParts(payload.departureDate, payload.departureTime);
      payload.departureDate = utc.date;
      payload.departureTime = utc.time;
    } catch {
      // noop
    }
  }

  if (payload && payload.arrivalDate && payload.arrivalTime) {
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

  let json: any = null;
  try { json = await res.json(); } catch { /* ignore */ }

  return { ok: res.ok, status: res.status, data: json };
}

async function getJson(path: string) {
  const res = await fetch(path, { method: 'GET' });
  let json: any = null;
  try { json = await res.json(); } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, data: json };
}

export const apiClient = {
  postJson,
  getJson,
};

export default apiClient;
