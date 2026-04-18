import { Router } from 'express';
import type { MapData } from '../types.js';

export function createMapRouter(mapData: MapData): Router {
  const router = Router();

  router.get('/map', (_req, res) => {
    res.json(mapData);
  });

  return router;
}
