import { Router } from 'express';
import type { MapData } from '../types.js';
import type { createGuestStore } from '../services/guestStore.js';
import type { createBookingStore } from '../services/bookingStore.js';

export function createBookingsRouter(
  mapData: MapData,
  guestStore: ReturnType<typeof createGuestStore>,
  bookingStore: ReturnType<typeof createBookingStore>
): Router {
  const router = Router();

  router.post('/bookings', (req, res) => {
    const { cabanaId, room, guestName } = req.body;

    if (!cabanaId || !room || !guestName ||
        typeof cabanaId !== 'string' || typeof room !== 'string' || typeof guestName !== 'string') {
      res.status(400).json({ error: 'Missing or invalid fields' });
      return;
    }

    const cabana = mapData.cabanas.find(c => c.id === cabanaId);
    if (!cabana) {
      res.status(404).json({ error: 'Cabana not found' });
      return;
    }

    if (!guestStore.isValidGuest(room, guestName)) {
      res.status(401).json({ error: 'Invalid guest credentials' });
      return;
    }

    if (bookingStore.isBooked(cabanaId)) {
      res.status(409).json({ error: 'Cabana is already booked' });
      return;
    }

    bookingStore.bookCabana(cabanaId, room, guestName);
    res.status(201).json({ cabana: { ...cabana, booked: true, bookedBy: { room, guestName } } });
  });

  return router;
}
