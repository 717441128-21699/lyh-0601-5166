import { Router, type Request, type Response } from 'express';
import { mockBids } from '../../shared/mockData.js';
import type { Bid } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { applicationId } = req.query;
  let bids = [...mockBids];
  
  if (applicationId) {
    bids = bids.filter((b) => b.applicationId === applicationId);
  }
  
  res.json({ success: true, data: bids });
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const newBid: Bid = {
    id: `bid-${Date.now()}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  mockBids.push(newBid);
  res.json({ success: true, data: newBid });
});

router.put('/:id/select', async (req: Request, res: Response): Promise<void> => {
  const bid = mockBids.find((b) => b.id === req.params.id);
  if (!bid) {
    res.status(404).json({ success: false, error: '竞标不存在' });
    return;
  }
  
  mockBids
    .filter((b) => b.applicationId === bid.applicationId)
    .forEach((b) => {
      b.status = b.id === bid.id ? 'selected' : 'rejected';
    });
  
  res.json({ success: true, data: bid });
});

export default router;
