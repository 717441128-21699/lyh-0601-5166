import { Router, type Request, type Response } from 'express';
import { mockProjects, mockPurchaseOrders } from '../../shared/mockData.js';
import type { MaterialItem, PurchaseOrder } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { projectId, status } = req.query;
  let materials: MaterialItem[] = [];
  
  mockProjects.forEach((p) => {
    materials = materials.concat(p.materials);
  });
  
  if (projectId) {
    materials = materials.filter((m) => m.projectId === projectId);
  }
  if (status) {
    materials = materials.filter((m) => m.status === status);
  }
  
  res.json({ success: true, data: materials });
});

router.get('/purchase-orders', async (req: Request, res: Response): Promise<void> => {
  const { status } = req.query;
  let orders = [...mockPurchaseOrders];
  
  if (status) {
    orders = orders.filter((o) => o.status === status);
  }
  
  res.json({ success: true, data: orders });
});

router.post('/purchase-orders', async (req: Request, res: Response): Promise<void> => {
  const newOrder: PurchaseOrder = {
    id: `po-${Date.now()}`,
    ...req.body,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  mockPurchaseOrders.push(newOrder);
  res.json({ success: true, data: newOrder });
});

router.put('/purchase-orders/:id/approve', async (req: Request, res: Response): Promise<void> => {
  const { approverRole, approverId, rejectionReason } = req.body;
  const order = mockPurchaseOrders.find((o) => o.id === req.params.id);
  
  if (!order) {
    res.status(404).json({ success: false, error: '采购单不存在' });
    return;
  }
  
  if (rejectionReason) {
    order.status = 'rejected';
    order.rejectionReason = rejectionReason;
  } else if (approverRole === 'supervisor') {
    order.status = 'supervisor_approved';
    order.supervisorApprovalId = approverId;
  } else if (approverRole === 'owner' || approverRole === 'admin') {
    order.status = 'owner_approved';
    order.ownerApprovalId = approverId;
  }
  
  res.json({ success: true, data: order });
});

export default router;
