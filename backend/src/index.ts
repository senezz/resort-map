import express from 'express';
import cors from 'cors';
import { loadMapFromFile } from './services/mapLoader.js';
import { loadGuestsFromFile, createGuestStore } from './services/guestStore.js';
import { createBookingStore } from './services/bookingStore.js';
import { createMapRouter } from './routes/map.js';
import { createBookingsRouter } from './routes/bookings.js';

const mapPath = process.env.MAP_PATH ?? './map.ascii';
const bookingsPath = process.env.BOOKINGS_PATH ?? './bookings.json';

const mapData = loadMapFromFile(mapPath);
const guests = loadGuestsFromFile(bookingsPath);
const guestStore = createGuestStore(guests);
const bookingStore = createBookingStore();

console.log(`Loaded map: ${mapData.width}x${mapData.height} with ${mapData.cabanas.length} cabanas and ${guests.length} guests`);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', createMapRouter(mapData, bookingStore));
app.use('/api', createBookingsRouter(mapData, guestStore, bookingStore));

app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});

export { app };
