import { useState } from 'react';
import type { Cabana } from '../types.js';
import { bookCabana } from '../api/client.js';

type Props = { cabana: Cabana; onClose: () => void; onBooked: (cabana: Cabana) => void };

export default function BookingDialog({ cabana, onClose, onBooked }: Props) {
  const [room, setRoom] = useState('');
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const booked = await bookCabana(cabana.id, room, guestName);
      onBooked(booked);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 100,
    }}>
      <div style={{
        background: '#fff', borderRadius: 8, padding: 24,
        minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
      }}>
        <h2 style={{ marginTop: 0 }}>Cabana {cabana.id}</h2>

        {cabana.booked ? (
          <>
            <p>
              This cabana is already booked by <strong>{cabana.bookedBy!.guestName}</strong>{' '}
              (room {cabana.bookedBy!.room}).
            </p>
            <button onClick={onClose}>Close</button>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="room" style={{ display: 'block', marginBottom: 4 }}>Room number</label>
              <input
                id="room"
                value={room}
                onChange={e => setRoom(e.target.value)}
                required
                style={{ width: '100%', padding: 6, boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="guestName" style={{ display: 'block', marginBottom: 4 }}>Guest name</label>
              <input
                id="guestName"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                required
                style={{ width: '100%', padding: 6, boxSizing: 'border-box' }}
              />
            </div>
            {error && <p style={{ color: 'red', margin: '8px 0' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={loading}>
                {loading ? 'Booking…' : 'Book'}
              </button>
              <button type="button" onClick={onClose}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
