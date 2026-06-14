import { Router, type Request, type Response } from 'express';
import { mockChangeRequests } from '../../shared/mockData.js';
import type { ChangeRequest } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { projectId, status, ownerId } = req.query;
  let changes = [...mockChangeRequests] as ChangeRequest[];
  
  if (ownerId) {
    changes = changes.filter((c) => c.ownerId === ownerId);
  }
  if (projectId) {
    changes = changes.filter((c) => c.projectId === projectId);
  }
  if (status) {
    changes = changes.filter((c) => c.status === status);
  }
  
  res.json({ success: true, data: changes });
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const newChange: ChangeRequest = {
    id: `cr-${Date.now()}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  mockChangeRequests.push(newChange);
  res.json({ success: true, data: newChange });
});

router.put('/:id/approve', async (req: Request, res: Response): Promise<void> => {
  const { approved } = req.body;
  const change = mockChangeRequests.find((c) => c.id === req.params.id);
  
  if (!change) {
    res.status(404).json({ success: false, error: '变更申请不存在' });
    return;
  }
  
  change.status = approved ? 'approved' : 'rejected';
  res.json({ success: true, data: change });
});

export default router;
