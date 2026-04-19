import { readFileSync } from 'fs';

export type Guest = { room: string; guestName: string };

export function createGuestStore(guests: Guest[]) {
  return {
    isValidGuest(room: string, guestName: string): boolean {
      return guests.some(g => g.room === room && g.guestName === guestName);
    },
  };
}

export function loadGuestsFromFile(path: string): Guest[] {
  return JSON.parse(readFileSync(path, 'utf-8'));
}
