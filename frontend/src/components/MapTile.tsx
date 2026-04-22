import type { Cabana, PathVariant, Tile, TileType } from "../types.js";

const TILE_IMAGES: Record<Exclude<TileType, 'path'>, string | null> = {
  empty:  null,
  chalet: "/assets/houseChimney.png",
  pool:   "/assets/textureWater.png",
  cabana: "/assets/cabana.png",
};

const PATH_IMAGES: Record<PathVariant, string> = {
  straight: "/assets/arrowStraight.png",
  corner:   "/assets/arrowCornerSquare.png",
  split:    "/assets/arrowSplit.png",
  crossing: "/assets/arrowCrossing.png",
  end:      "/assets/arrowEnd.png",
};

type Props = { tile: Tile; cabana?: Cabana; onClick?: () => void };

export default function MapTile({ tile, cabana, onClick }: Props) {
  const image = tile.type === 'path' && tile.variant
    ? PATH_IMAGES[tile.variant]
    : tile.type !== 'path' ? TILE_IMAGES[tile.type] : null;

  return (
    <div
      onClick={onClick}
      style={{
        width: 32,
        height: 32,
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: "cover",
        cursor: onClick ? "pointer" : undefined,
        transform: tile.type === 'path' && tile.rotation ? `rotate(${tile.rotation}deg)` : undefined,
        ...(cabana?.booked && {
          boxShadow: "inset 0 0 0 100px rgba(220, 0, 0, 0.35)",
          border: "2px solid rgba(180, 0, 0, 0.9)",
          boxSizing: "border-box",
        }),
      }}
    />
  );
}
