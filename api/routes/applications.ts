import { Router, type Request, type Response } from 'express';
import { mockApplications } from '../../shared/mockData.js';
import type { DecorationApplication } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { status, ownerId } = req.query;
  let applications = [...mockApplications];
  
  if (status) {
    applications = applications.filter((a) => a.status === status);
  }
  if (ownerId) {
    applications = applications.filter((a) => a.ownerId === ownerId);
  }
  
  res.json({ success: true, data: applications });
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const newApp: DecorationApplication = {
    id: `app-${Date.now()}`,
    ...req.body,
    status: 'pending',
    recommendedPlans: [],
    createdAt: new Date().toISOString(),
  };
  mockApplications.push(newApp);
  res.json({ success: true, data: newApp });
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const app = mockApplications.find((a) => a.id === req.params.id);
  if (!app) {
    res.status(404).json({ success: false, error: '申请不存在' });
    return;
  }
  res.json({ success: true, data: app });
});

export default router;
