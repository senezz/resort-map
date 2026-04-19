import type { Cabana, MapData } from '../types.js';

export async function fetchMap(): Promise<MapData> {
  const res = await fetch('/api/map');
  if (!res.ok) throw new Error(`Failed to fetch map: ${res.status}`);
  return res.json();
}

export async function bookCabana(cabanaId: string, room: string, guestName: string): Promise<Cabana> {
  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cabanaId, room, guestName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Booking failed');
  return data.cabana;
}
