import { Router, type Request, type Response } from 'express';
import { mockPayments, mockProjects } from '../../shared/mockData.js';
import type { Payment } from '../../shared/types.js';

const router = Router();

router.get('/payments', async (req: Request, res: Response): Promise<void> => {
  const { projectId, status, type, ownerId } = req.query;
  let payments = [...mockPayments] as Payment[];
  
  if (ownerId) {
    const ownerProjectIds = new Set(
      mockProjects.filter((p) => p.ownerId === ownerId).map((p) => p.id)
    );
    payments = payments.filter((p) => ownerProjectIds.has(p.projectId));
  }
  if (projectId) {
    payments = payments.filter((p) => p.projectId === projectId);
  }
  if (status) {
    payments = payments.filter((p) => p.status === status);
  }
  if (type) {
    payments = payments.filter((p) => p.type === type);
  }
  
  res.json({ success: true, data: payments });
});

router.post('/payments/:id/confirm', async (req: Request, res: Response): Promise<void> => {
  const payment = mockPayments.find((p) => p.id === req.params.id);
  if (!payment) {
    res.status(404).json({ success: false, error: '付款记录不存在' });
    return;
  }
  payment.status = 'paid';
  payment.paidDate = new Date().toISOString().split('T')[0];
  res.json({ success: true, data: payment });
});

export default router;
