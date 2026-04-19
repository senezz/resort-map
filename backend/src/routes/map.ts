import { Router } from 'express';
import type { MapData } from '../types.js';
import type { createBookingStore } from '../services/bookingStore.js';

export function createMapRouter(
  mapData: MapData,
  bookingStore: ReturnType<typeof createBookingStore>
): Router {
  const router = Router();

  router.get('/map', (_req, res) => {
    const cabanas = mapData.cabanas.map(c => {
      const booking = bookingStore.getBooking(c.id);
      return booking ? { ...c, booked: true, bookedBy: booking } : c;
    });
    res.json({ ...mapData, cabanas });
  });

  return router;
}
