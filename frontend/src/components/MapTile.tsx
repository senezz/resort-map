import type { Cabana, Tile, TileType } from "../types.js";

const TILE_IMAGES: Record<TileType, string | null> = {
  empty: null,
  chalet: "/assets/houseChimney.png",
  path: "/assets/arrowStraight.png",
  pool: "/assets/pool.png",
  cabana: "/assets/cabana.png",
};

type Props = { tile: Tile; cabana?: Cabana; onClick?: () => void };

export default function MapTile({ tile, cabana, onClick }: Props) {
  const image = TILE_IMAGES[tile.type];
  return (
    <div
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: "cover",
        cursor: onClick ? "pointer" : undefined,
        ...(cabana?.booked && {
          boxShadow: "inset 0 0 0 100px rgba(220, 0, 0, 0.35)",
          border: "2px solid rgba(180, 0, 0, 0.9)",
          boxSizing: "border-box",
        }),
      }}
    />
  );
}
