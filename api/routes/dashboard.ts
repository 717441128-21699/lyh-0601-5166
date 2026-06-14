import { Router, type Request, type Response } from 'express';
import { generateDashboardSummary } from '../../shared/mockData.js';

const router = Router();

router.get('/summary', async (req: Request, res: Response): Promise<void> => {
  const { community, houseType, date } = req.query;
  const filters = {
    community: typeof community === 'string' ? community : undefined,
    houseType: typeof houseType === 'string' ? houseType : undefined,
    date: typeof date === 'string' ? date : undefined,
  };
  const summary = generateDashboardSummary(filters);
  res.json({ success: true, data: summary });
});

export default router;
