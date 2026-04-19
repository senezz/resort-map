import type { Cabana, Tile, TileType } from '../types.js';

const TILE_IMAGES: Record<TileType, string | null> = {
  empty:  null,
  chalet: '/assets/houseChimney.png',
  path:   '/assets/arrowStraight.png',
  pool:   '/assets/pool.png',
  cabana: '/assets/cabana.png',
};

type Props = { tile: Tile; cabana?: Cabana };

export default function MapTile({ tile, cabana: _cabana }: Props) {
  const image = TILE_IMAGES[tile.type];
  return (
    <div
      style={{
        width: 32,
        height: 32,
        backgroundImage: image ? `url(${image})` : undefined,
        backgroundSize: 'cover',
      }}
    />
  );
}
