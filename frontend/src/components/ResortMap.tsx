import { useEffect, useState } from 'react';
import type { Cabana, MapData } from '../types.js';
import { fetchMap } from '../api/client.js';
import MapTile from './MapTile.js';
import BookingDialog from './BookingDialog.js';

export default function ResortMap() {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCabana, setSelectedCabana] = useState<Cabana | null>(null);

  function loadMap() {
    fetchMap()
      .then(setMapData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(loadMap, []);

  if (loading) return <p>Loading map...</p>;
  if (error) return <p>{error}</p>;
  if (!mapData) return null;

  return (
    <>
      <div
        style={{
          display: 'inline-block',
          padding: 16,
          backgroundImage: 'url(/assets/parchmentBasic.png)',
          backgroundRepeat: 'repeat',
          backgroundSize: 'cover',
        }}
      >
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
            return (
              <MapTile
                key={`${y}-${x}`}
                tile={tile}
                cabana={cabana}
                onClick={cabana ? () => setSelectedCabana(cabana) : undefined}
              />
            );
          })
        )}
      </div>
      </div>

      {selectedCabana && (
        <BookingDialog
          cabana={selectedCabana}
          onClose={() => setSelectedCabana(null)}
          onBooked={() => { setSelectedCabana(null); loadMap(); }}
        />
      )}
    </>
  );
}
