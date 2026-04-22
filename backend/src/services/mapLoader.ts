import { readFileSync } from "fs";
import type { Cabana, MapData, PathVariant, Tile, TileType } from "../types.js";

function charToTileType(ch: string): TileType {
  switch (ch) {
    case "W":
      return "cabana";
    case "p":
      return "pool";
    case "#":
      return "path";
    case "c":
      return "chalet";
    default:
      return "empty";
  }
}

export function computePathVariant(
  tiles: Tile[][],
  x: number,
  y: number,
): { variant: PathVariant; rotation: 0 | 90 | 180 | 270 } {
  const isPath = (tx: number, ty: number) =>
    ty >= 0 &&
    ty < tiles.length &&
    tx >= 0 &&
    tx < tiles[ty].length &&
    tiles[ty][tx].type === "path";

  const N = isPath(x, y - 1);
  const E = isPath(x + 1, y);
  const S = isPath(x, y + 1);
  const W = isPath(x - 1, y);
  const count = [N, E, S, W].filter(Boolean).length;

  if (count === 4) return { variant: "crossing", rotation: 0 };

  if (count === 3) {
    if (!N) return { variant: "split", rotation: 90 };
    if (!E) return { variant: "split", rotation: 180 };
    if (!S) return { variant: "split", rotation: 270 };
    return { variant: "split", rotation: 0 }; // !W: N+E+S
  }

  if (count === 2) {
    if (N && S) return { variant: "straight", rotation: 0 };
    if (E && W) return { variant: "straight", rotation: 90 };
    if (N && E) return { variant: "corner", rotation: 0 };
    if (E && S) return { variant: "corner", rotation: 90 };
    if (S && W) return { variant: "corner", rotation: 180 };
    return { variant: "corner", rotation: 270 }; // N && W
  }

  if (S && !N && !E && !W) return { variant: "end", rotation: 0 };
  if (W && !N && !E && !S) return { variant: "end", rotation: 90 };
  if (N && !E && !S && !W) return { variant: "end", rotation: 180 };
  return { variant: "end", rotation: 270 }; // E only, or 0 neighbors
}

export function parseMap(raw: string): MapData {
  const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);

  const tiles: Tile[][] = lines.map((line) =>
    line.split("").map((ch) => ({ type: charToTileType(ch) })),
  );

  // Second pass: set variant/rotation for path tiles
  tiles.forEach((row, y) =>
    row.forEach((tile, x) => {
      if (tile.type === "path") {
        Object.assign(tile, computePathVariant(tiles, x, y));
      }
    }),
  );

  const cabanas: Cabana[] = [];
  lines.forEach((line, y) => {
    [...line].forEach((ch, x) => {
      if (ch === "W") {
        cabanas.push({ id: `cabana-${y}-${x}`, x, y, booked: false });
      }
    });
  });

  return {
    width: Math.max(...lines.map((l) => l.length)),
    height: lines.length,
    tiles,
    cabanas,
  };
}

export function loadMapFromFile(path: string): MapData {
  return parseMap(readFileSync(path, "utf-8"));
}
