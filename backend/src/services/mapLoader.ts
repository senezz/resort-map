import { readFileSync } from "fs";
import type { Cabana, MapData, Tile, TileType } from "../types.js";

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

export function parseMap(raw: string): MapData {
  const lines = raw.split(/\r?\n/).filter((line) => line.length > 0);

  const tiles: Tile[][] = lines.map((line) =>
    line.split("").map((ch) => ({ type: charToTileType(ch) })),
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
