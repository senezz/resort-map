export type TileType = 'empty' | 'chalet' | 'path' | 'pool' | 'cabana';

export type Tile = {
  type: TileType;
};

export type Cabana = {
  id: string;
  x: number;
  y: number;
  booked: boolean;
  bookedBy?: { room: string; guestName: string };
};

export type MapData = {
  width: number;
  height: number;
  tiles: Tile[][];
  cabanas: Cabana[];
};
