import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResortMap from './ResortMap.js';
import type { MapData } from '../types.js';

vi.mock('../api/client.js', () => ({
  fetchMap: vi.fn(),
  bookCabana: vi.fn(),
}));

import { fetchMap, bookCabana } from '../api/client.js';

const mockMap: MapData = {
  width: 3,
  height: 2,
  tiles: [
    [{ type: 'cabana' }, { type: 'pool' }, { type: 'cabana' }],
    [{ type: 'path' },   { type: 'empty' }, { type: 'empty' }],
  ],
  cabanas: [
    { id: 'cabana-0-0', x: 0, y: 0, booked: false },
    { id: 'cabana-0-2', x: 2, y: 0, booked: true, bookedBy: { room: '202', guestName: 'Bob' } },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('ResortMap', () => {
  it('shows loading initially', () => {
    vi.mocked(fetchMap).mockReturnValue(new Promise(() => {}));
    render(<ResortMap />);
    expect(screen.getByText('Loading map...')).toBeInTheDocument();
  });

  it('renders the map after fetch resolves', async () => {
    vi.mocked(fetchMap).mockResolvedValue(mockMap);
    render(<ResortMap />);
    await waitFor(() => expect(screen.queryByText('Loading map...')).not.toBeInTheDocument());
    // 3×2 = 6 tiles rendered as divs inside the grid
    const grid = document.querySelector('div[style*="grid"]');
    expect(grid?.children).toHaveLength(6);
  });

  it('shows error message when fetch fails', async () => {
    vi.mocked(fetchMap).mockRejectedValue(new Error('Network error'));
    render(<ResortMap />);
    expect(await screen.findByText('Network error')).toBeInTheDocument();
  });

  it('clicking a free cabana opens the booking form', async () => {
    vi.mocked(fetchMap).mockResolvedValue(mockMap);
    render(<ResortMap />);
    await waitFor(() => expect(screen.queryByText('Loading map...')).not.toBeInTheDocument());

    const tiles = document.querySelectorAll('div[style*="cabana"]');
    // click the first tile with a pointer cursor (free cabana)
    const grid = document.querySelector('div[style*="grid"]')!;
    await userEvent.click(grid.children[0]);

    expect(screen.getByLabelText(/room number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/guest name/i)).toBeInTheDocument();
  });

  it('clicking an already-booked cabana shows booked info', async () => {
    vi.mocked(fetchMap).mockResolvedValue(mockMap);
    render(<ResortMap />);
    await waitFor(() => expect(screen.queryByText('Loading map...')).not.toBeInTheDocument());

    const grid = document.querySelector('div[style*="grid"]')!;
    await userEvent.click(grid.children[2]); // cabana-0-2, booked

    expect(screen.getByText(/already booked by/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/room number/i)).not.toBeInTheDocument();
  });

  it('successful booking closes modal and refetches map', async () => {
    vi.mocked(fetchMap).mockResolvedValue(mockMap);
    vi.mocked(bookCabana).mockResolvedValue({ ...mockMap.cabanas[0], booked: true, bookedBy: { room: '101', guestName: 'Alice' } });
    render(<ResortMap />);
    await waitFor(() => expect(screen.queryByText('Loading map...')).not.toBeInTheDocument());

    const grid = document.querySelector('div[style*="grid"]')!;
    await userEvent.click(grid.children[0]);

    await userEvent.type(screen.getByLabelText(/room number/i), '101');
    await userEvent.type(screen.getByLabelText(/guest name/i), 'Alice');
    await userEvent.click(screen.getByRole('button', { name: /book/i }));

    await waitFor(() => expect(screen.queryByLabelText(/room number/i)).not.toBeInTheDocument());
    expect(vi.mocked(fetchMap)).toHaveBeenCalledTimes(2);
  });

  it('booking error keeps modal open and shows message', async () => {
    vi.mocked(fetchMap).mockResolvedValue(mockMap);
    vi.mocked(bookCabana).mockRejectedValue(new Error('Invalid guest credentials'));
    render(<ResortMap />);
    await waitFor(() => expect(screen.queryByText('Loading map...')).not.toBeInTheDocument());

    const grid = document.querySelector('div[style*="grid"]')!;
    await userEvent.click(grid.children[0]);

    await userEvent.type(screen.getByLabelText(/room number/i), '999');
    await userEvent.type(screen.getByLabelText(/guest name/i), 'Nobody');
    await userEvent.click(screen.getByRole('button', { name: /book/i }));

    expect(await screen.findByText('Invalid guest credentials')).toBeInTheDocument();
    expect(screen.getByLabelText(/room number/i)).toBeInTheDocument();
  });
});
