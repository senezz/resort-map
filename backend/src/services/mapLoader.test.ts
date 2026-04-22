import { describe, it, expect } from 'vitest';
import { parseMap, computePathVariant } from './mapLoader.js';
import type { Tile } from '../types.js';

function buildTiles(ascii: string): Tile[][] {
  return parseMap(ascii).tiles;
}

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

describe('computePathVariant', () => {
  it('isolated path tile returns end, rotation 270 (fallback)', () => {
    const tiles = buildTiles('.#.\n...');
    expect(computePathVariant(tiles, 1, 0)).toEqual({ variant: 'end', rotation: 270 });
  });

  it('horizontal straight: E+W neighbors returns straight, rotation 90', () => {
    const tiles = buildTiles('###');
    expect(computePathVariant(tiles, 1, 0)).toEqual({ variant: 'straight', rotation: 90 });
  });

  it('vertical straight: N+S neighbors returns straight, rotation 0', () => {
    const tiles = buildTiles('#\n#\n#');
    expect(computePathVariant(tiles, 0, 1)).toEqual({ variant: 'straight', rotation: 0 });
  });

  it('corner N+E returns corner, rotation 0', () => {
    // (0,1) has N=(0,0)='#' and E=(1,1)='#'
    const tiles = buildTiles('#.\n##');
    expect(computePathVariant(tiles, 0, 1)).toEqual({ variant: 'corner', rotation: 0 });
  });

  it('corner S+W returns corner, rotation 180', () => {
    // (1,0) has S=(1,1)='#' and W=(0,0)='#'
    const tiles = buildTiles('##\n##');
    expect(computePathVariant(tiles, 1, 0)).toEqual({ variant: 'corner', rotation: 180 });
  });

  it('T-junction without N (E+S+W) returns split, rotation 90', () => {
    const tiles = buildTiles('...\n###\n.#.');
    expect(computePathVariant(tiles, 1, 1)).toEqual({ variant: 'split', rotation: 90 });
  });

  it('T-junction without W (N+E+S) returns split, rotation 0', () => {
    // (0,1) is at left edge (no W), has N=(0,0)='#', E=(1,1)='#', S=(0,2)='#'
    const tiles = buildTiles('#.\n##\n#.');
    expect(computePathVariant(tiles, 0, 1)).toEqual({ variant: 'split', rotation: 0 });
  });

  it('crossroads returns crossing, rotation 0', () => {
    const tiles = buildTiles('.#.\n###\n.#.');
    expect(computePathVariant(tiles, 1, 1)).toEqual({ variant: 'crossing', rotation: 0 });
  });

  it('end tile pointing south (only S neighbor) returns end, rotation 0', () => {
    const tiles = buildTiles('.#.\n.#.');
    expect(computePathVariant(tiles, 1, 0)).toEqual({ variant: 'end', rotation: 0 });
  });

  it('end tile pointing west (only W neighbor) returns end, rotation 90', () => {
    const tiles = buildTiles('##.');
    expect(computePathVariant(tiles, 1, 0)).toEqual({ variant: 'end', rotation: 90 });
  });
});
