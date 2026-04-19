import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { parseMap } from './services/mapLoader.js';
import { createGuestStore } from './services/guestStore.js';
import { createBookingStore } from './services/bookingStore.js';

const mapData = parseMap('W.\n..');
const guestStore = createGuestStore([{ room: '101', guestName: 'Alice' }]);
const bookingStore = createBookingStore();
const app = createApp(mapData, guestStore, bookingStore);

describe('GET /api/map', () => {
  it('returns map data with cabanas', async () => {
    const res = await request(app).get('/api/map');
    expect(res.status).toBe(200);
    expect(res.body.cabanas).toHaveLength(1);
    expect(res.body.cabanas[0].id).toBe('cabana-0-0');
  });
});
