import express from 'express';
import cors from 'cors';
import { loadMapFromFile } from './services/mapLoader.js';
import { createMapRouter } from './routes/map.js';

const mapPath = process.env.MAP_PATH ?? './map.ascii';
const mapData = loadMapFromFile(mapPath);
console.log(`Loaded map: ${mapData.width}x${mapData.height} with ${mapData.cabanas.length} cabanas`);

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', createMapRouter(mapData));

app.listen(3001, () => {
  console.log('Backend running on http://localhost:3001');
});

export { app };
