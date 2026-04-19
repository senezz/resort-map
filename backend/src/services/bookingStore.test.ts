import { describe, it, expect, beforeEach } from 'vitest';
import { createBookingStore } from './bookingStore.js';

describe('createBookingStore', () => {
  it('fresh store has no bookings', () => {
    const store = createBookingStore();
    expect(store.isBooked('cabana-0-0')).toBe(false);
    expect(store.getBooking('cabana-0-0')).toBeUndefined();
    expect(store.getAllBookings().size).toBe(0);
  });

  it('after bookCabana, isBooked returns true and getBooking returns the guest', () => {
    const store = createBookingStore();
    store.bookCabana('cabana-0-0', '101', 'Alice');
    expect(store.isBooked('cabana-0-0')).toBe(true);
    expect(store.getBooking('cabana-0-0')).toEqual({ room: '101', guestName: 'Alice' });
  });

  it('booking an already-booked cabana throws', () => {
    const store = createBookingStore();
    store.bookCabana('cabana-0-0', '101', 'Alice');
    expect(() => store.bookCabana('cabana-0-0', '102', 'Bob')).toThrow();
  });

  it('multiple bookings coexist independently', () => {
    const store = createBookingStore();
    store.bookCabana('cabana-0-0', '101', 'Alice');
    store.bookCabana('cabana-0-1', '102', 'Bob');
    expect(store.getAllBookings().size).toBe(2);
    expect(store.getBooking('cabana-0-0')).toEqual({ room: '101', guestName: 'Alice' });
    expect(store.getBooking('cabana-0-1')).toEqual({ room: '102', guestName: 'Bob' });
  });
});
