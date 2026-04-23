import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
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

  app.use(helmet());
  app.use(cors({ origin: 'http://localhost:5173' }));
  app.use(express.json({ limit: '10kb' }));

  const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use('/api/bookings', bookingLimiter);

  app.use('/api', createMapRouter(mapData, bookingStore));
  app.use('/api', createBookingsRouter(mapData, guestStore, bookingStore));
  return app;
}
