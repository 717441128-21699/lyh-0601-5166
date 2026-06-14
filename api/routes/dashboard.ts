import { Router, type Request, type Response } from 'express';
import { generateDashboardSummary } from '../../shared/mockData.js';

const router = Router();

router.get('/summary', async (_req: Request, res: Response): Promise<void> => {
  const summary = generateDashboardSummary();
  res.json({ success: true, data: summary });
});

export default router;
