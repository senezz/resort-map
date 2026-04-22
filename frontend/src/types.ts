export type TileType = 'empty' | 'chalet' | 'path' | 'pool' | 'cabana';

export type PathVariant = 'straight' | 'corner' | 'split' | 'crossing' | 'end';

export type Tile = {
  type: TileType;
  variant?: PathVariant;
  rotation?: 0 | 90 | 180 | 270;
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
