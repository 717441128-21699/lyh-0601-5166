import { Router, type Request, type Response } from 'express';
import { mockSystemSettings } from '../../shared/mockData.js';
import type { SystemSettings } from '../../shared/types.js';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: mockSystemSettings });
});

router.put('/', async (req: Request, res: Response): Promise<void> => {
  const updated: SystemSettings = {
    ...mockSystemSettings,
    ...req.body,
  };
  Object.assign(mockSystemSettings, updated);
  res.json({ success: true, data: mockSystemSettings });
});

export default router;
