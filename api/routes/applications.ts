import { Router, type Request, type Response } from 'express';
import { mockApplications } from '../../shared/mockData.js';
import type { DecorationApplication, DecorationPlan, HouseInfo, PlanItem } from '../../shared/types.js';

const router = Router();

const generatePlanItems = (area: number): PlanItem[] => {
  const baseItems = [
    { name: '墙面乳胶漆', unit: '㎡', price: 85 },
    { name: '地板铺装', unit: '㎡', price: 180 },
    { name: '吊顶安装', unit: '㎡', price: 220 },
    { name: '卫生间防水', unit: '㎡', price: 95 },
    { name: '水电改造', unit: '项', price: 8000 },
    { name: '瓷砖铺贴', unit: '㎡', price: 150 },
  ];
  return baseItems.map((item) => ({
    ...item,
    quantity: item.unit === '项' ? 1 : Math.floor(area * (Math.random() * 0.5 + 0.5)),
  }));
};

const generatePlans = (houseInfo: HouseInfo): DecorationPlan[] => {
  const planNames = ['经济实惠型', '品质舒适型', '豪华尊享型'];
  const multipliers = [0.8, 1, 1.4];
  return planNames.map((name, i) => {
    const items = generatePlanItems(houseInfo.area);
    const basePrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0) * multipliers[i];
    return {
      id: Math.random().toString(36).substring(2, 10),
      name,
      description: `${houseInfo.style}风格${name}装修方案，包含${items.length}项基础工程`,
      style: houseInfo.style,
      basePrice: Math.round(basePrice),
      items,
    };
  });
};

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
  const { houseInfo, budget, ownerId, ownerName } = req.body;
  const recommendedPlans = generatePlans(houseInfo);
  const newApp: DecorationApplication = {
    id: `app-${Date.now()}`,
    ownerId,
    ownerName,
    houseInfo,
    budget,
    status: 'pending',
    recommendedPlans,
    createdAt: new Date().toISOString(),
  };
  mockApplications.unshift(newApp);
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
