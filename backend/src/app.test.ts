import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';
import { parseMap } from './services/mapLoader.js';
import { createGuestStore } from './services/guestStore.js';
import { createBookingStore } from './services/bookingStore.js';
import type { Express } from 'express';

const mapData = parseMap('W.W\n...\n.W.');
const guests = [{ room: '101', guestName: 'Alice' }];

function createTestApp(): { app: Express } {
  const bookingStore = createBookingStore();
  const app = createApp(mapData, createGuestStore(guests), bookingStore);
  return { app };
}

describe('GET /api/map', () => {
  it('returns map with all cabanas unbooked', async () => {
    const { app } = createTestApp();
    const res = await request(app).get('/api/map');
    expect(res.status).toBe(200);
    expect(res.body.cabanas).toHaveLength(3);
    expect(res.body.cabanas.every((c: any) => c.booked === false)).toBe(true);
  });
});

describe('POST /api/bookings', () => {
  let app: Express;
  beforeEach(() => { ({ app } = createTestApp()); });

  it('returns 201 and the booked cabana for valid data', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ cabanaId: 'cabana-0-0', room: '101', guestName: 'Alice' });
    expect(res.status).toBe(201);
    expect(res.body.cabana.id).toBe('cabana-0-0');
    expect(res.body.cabana.booked).toBe(true);
    expect(res.body.cabana.bookedBy).toEqual({ room: '101', guestName: 'Alice' });
  });

  it('returns 400 for missing fields', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ cabanaId: 'cabana-0-0' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('returns 404 for non-existent cabanaId', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ cabanaId: 'cabana-9-9', room: '101', guestName: 'Alice' });
    expect(res.status).toBe(404);
  });

  it('returns 401 for wrong guest credentials', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .send({ cabanaId: 'cabana-0-0', room: '101', guestName: 'Wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 409 when cabana is already booked', async () => {
    await request(app)
      .post('/api/bookings')
      .send({ cabanaId: 'cabana-0-0', room: '101', guestName: 'Alice' });
    const res = await request(app)
      .post('/api/bookings')
      .send({ cabanaId: 'cabana-0-0', room: '101', guestName: 'Alice' });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/map after booking', () => {
  it('shows booked cabana with bookedBy', async () => {
    const { app } = createTestApp();
    await request(app)
      .post('/api/bookings')
      .send({ cabanaId: 'cabana-0-0', room: '101', guestName: 'Alice' });
    const res = await request(app).get('/api/map');
    const cabana = res.body.cabanas.find((c: any) => c.id === 'cabana-0-0');
    expect(cabana.booked).toBe(true);
    expect(cabana.bookedBy).toEqual({ room: '101', guestName: 'Alice' });
  });
});
