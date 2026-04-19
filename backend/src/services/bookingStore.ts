export function createBookingStore() {
  const bookings = new Map<string, { room: string; guestName: string }>();

  return {
    bookCabana(cabanaId: string, room: string, guestName: string): void {
      if (bookings.has(cabanaId)) throw new Error(`Cabana ${cabanaId} is already booked`);
      bookings.set(cabanaId, { room, guestName });
    },
    isBooked(cabanaId: string): boolean {
      return bookings.has(cabanaId);
    },
    getBooking(cabanaId: string): { room: string; guestName: string } | undefined {
      return bookings.get(cabanaId);
    },
    getAllBookings(): Map<string, { room: string; guestName: string }> {
      return bookings;
    },
  };
}
