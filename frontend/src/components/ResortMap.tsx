import { useEffect, useState } from 'react';
import type { MapData } from '../types.js';
import { fetchMap } from '../api/client.js';
import MapTile from './MapTile.js';

export default function ResortMap() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMap()
      .then(setMapData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading map...</p>;
  if (error) return <p>{error}</p>;
  if (!mapData) return null;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${mapData.width}, 32px)`,
        gridAutoRows: '32px',
      }}
    >
      {mapData.tiles.flatMap((row, y) =>
        row.map((tile, x) => {
          const cabana = tile.type === 'cabana'
            ? mapData.cabanas.find(c => c.x === x && c.y === y)
            : undefined;
          return <MapTile key={`${y}-${x}`} tile={tile} cabana={cabana} />;
        })
      )}
    </div>
  );
}
