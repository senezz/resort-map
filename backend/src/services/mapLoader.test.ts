import { describe, it, expect } from 'vitest';
import { parseMap } from './mapLoader.js';

describe('parseMap', () => {
  it('parses width, height, and tile types at specific coordinates', () => {
    const map = parseMap('Wp.\n#c.');
    expect(map.width).toBe(3);
    expect(map.height).toBe(2);
    expect(map.tiles[0][0].type).toBe('cabana');
    expect(map.tiles[0][1].type).toBe('pool');
    expect(map.tiles[0][2].type).toBe('empty');
    expect(map.tiles[1][0].type).toBe('path');
    expect(map.tiles[1][1].type).toBe('chalet');
    expect(map.tiles[1][2].type).toBe('empty');
  });

  it('generates cabanas with correct id, x, y, and booked: false', () => {
    const map = parseMap('W.W\n...\n.W.');
    expect(map.cabanas).toEqual([
      { id: 'cabana-0-0', x: 0, y: 0, booked: false },
      { id: 'cabana-0-2', x: 2, y: 0, booked: false },
      { id: 'cabana-2-1', x: 1, y: 2, booked: false },
    ]);
  });

  it('produces identical output for \\n and \\r\\n line endings', () => {
    const lf = parseMap('Wp\n#c');
    const crlf = parseMap('Wp\r\n#c');
    expect(lf).toEqual(crlf);
  });

  it('maps unknown characters to empty tiles', () => {
    const map = parseMap('?!@');
    expect(map.tiles[0].every(t => t.type === 'empty')).toBe(true);
  });

  it('strips trailing empty lines without breaking the grid', () => {
    const map = parseMap('Wp\n#c\n\n');
    expect(map.height).toBe(2);
    expect(map.tiles).toHaveLength(2);
  });
});
