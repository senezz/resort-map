import express, { type Express } from 'express';
import cors from 'cors';
import type { MapData } from './types.js';
import type { createGuestStore } from './services/guestStore.js';
import type { createBookingStore } from './services/bookingStore.js';
import { createMapRouter } from './routes/map.js';
import { createBookingsRouter } from './routes/bookings.js';

export function createApp(
  mapData: MapData,
  guestStore: ReturnType<typeof createGuestStore>,
  bookingStore: ReturnType<typeof createBookingStore>
): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', createMapRouter(mapData, bookingStore));
  app.use('/api', createBookingsRouter(mapData, guestStore, bookingStore));
  return app;
}
