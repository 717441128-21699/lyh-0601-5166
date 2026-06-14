import { Router, type Request, type Response } from 'express';
import { mockBids, mockApplications, mockProjects, mockPayments } from '../../shared/mockData.js';
import type { Bid, Project, Payment, Task, MaterialItem } from '../../shared/types.js';

const router = Router();

const taskTypes = ['拆除工程', '水电改造', '防水工程', '泥瓦工程', '木工工程', '油漆工程', '安装工程', '竣工验收'];
const workerNames = ['李强', '王芳', '陈明'];
const workerIds = ['user-002', 'user-003', 'user-004'];

const materialList = [
  { name: 'PPR水管', specification: '25mm', unit: '米', unitPrice: 15, safeStock: 100 },
  { name: '电线电缆', specification: '2.5mm²', unit: '米', unitPrice: 5, safeStock: 500 },
  { name: '乳胶漆', specification: '5L装', unit: '桶', unitPrice: 380, safeStock: 20 },
  { name: '地砖', specification: '800x800mm', unit: '片', unitPrice: 85, safeStock: 100 },
  { name: '木地板', specification: '12mm', unit: '㎡', unitPrice: 180, safeStock: 50 },
  { name: '石膏板', specification: '1200x2400mm', unit: '张', unitPrice: 35, safeStock: 80 },
  { name: '水泥', specification: 'P.O 42.5', unit: '袋', unitPrice: 28, safeStock: 200 },
  { name: '沙子', specification: '河沙', unit: '方', unitPrice: 120, safeStock: 30 },
  { name: '防水涂料', specification: '20kg', unit: '桶', unitPrice: 280, safeStock: 15 },
  { name: '瓷砖胶', specification: '20kg', unit: '袋', unitPrice: 45, safeStock: 60 },
];

const generateTasks = (projectId: string, startDate: string): Task[] => {
  const tasks: Task[] = [];
  const start = new Date(startDate);
  taskTypes.forEach((type, index) => {
    const planned = new Date(start.getTime() + index * 7 * 86400000);
    const workerIdx = index % workerNames.length;
    tasks.push({
      id: `task-${projectId}-${index}`,
      projectId,
      name: type,
      type,
      assignedWorkerId: workerIds[workerIdx],
      assignedWorkerName: workerNames[workerIdx],
      status: 'pending',
      plannedDate: planned.toISOString().split('T')[0],
      qrCode: `QR-${projectId}-${index}`,
    });
  });
  return tasks;
};

const generateMaterials = (projectId: string, area: number): MaterialItem[] => {
  return materialList.map((m, i) => {
    const required = Math.floor(area * (0.5 + Math.random() * 2) / (i < 3 ? 1 : 5));
    const current = Math.floor(required * 0.8);
    const status: MaterialItem['status'] = current < m.safeStock * 0.3 ? 'shortage' : current < m.safeStock ? 'warning' : 'normal';
    return {
      id: `mat-${projectId}-${i}`,
      projectId,
      name: m.name,
      specification: m.specification,
      unit: m.unit,
      requiredQuantity: required,
      currentStock: current,
      safeStock: m.safeStock,
      unitPrice: m.unitPrice,
      status,
      purchaseOrders: [],
    };
  });
};

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { applicationId, ownerId } = req.query;
  let bids = [...mockBids];
  
  if (ownerId) {
    const ownerApplicationIds = new Set(
      mockApplications.filter((a) => a.ownerId === ownerId).map((a) => a.id)
    );
    bids = bids.filter((b) => ownerApplicationIds.has(b.applicationId));
  }
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

  const application = mockApplications.find((a) => a.id === bid.applicationId);
  if (application) {
    application.status = 'signed';
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7);
  const endDate = new Date(startDate.getTime() + bid.duration * 86400000);
  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = endDate.toISOString().split('T')[0];

  const existingProject = mockProjects.find((p) => p.applicationId === bid.applicationId);
  let project: Project;

  if (existingProject) {
    existingProject.status = 'signed';
    existingProject.companyId = bid.companyId;
    existingProject.companyName = bid.companyName;
    existingProject.totalBudget = bid.price;
    existingProject.startDate = startDateStr;
    existingProject.estimatedEndDate = endDateStr;
    project = existingProject;
  } else {
    const projectId = `proj-${Date.now()}`;
    project = {
      id: projectId,
      applicationId: bid.applicationId,
      ownerId: application?.ownerId || 'user-001',
      ownerName: application?.ownerName || '业主',
      companyId: bid.companyId,
      companyName: bid.companyName,
      houseInfo: application?.houseInfo || {
        community: '', houseType: '', area: 0, floor: 0, totalFloors: 0, style: '',
      },
      totalBudget: bid.price,
      usedBudget: 0,
      status: 'signed',
      progress: 0,
      startDate: startDateStr,
      estimatedEndDate: endDateStr,
      supervisorId: 'user-005',
      tasks: generateTasks(projectId, startDateStr),
      materials: generateMaterials(projectId, application?.houseInfo.area || 100),
      createdAt: new Date().toISOString(),
    };
    mockProjects.push(project);

    const depositAmount = Math.round(bid.price * 0.2);
    const depositPayment: Payment = {
      id: `pay-${projectId}-deposit`,
      projectId: project.id,
      type: 'deposit',
      amount: depositAmount,
      stage: '签约定金',
      status: 'pending',
      dueDate: startDateStr,
      description: `${application?.houseInfo.community || '项目'}签约定金（合同额20%）`,
    };
    mockPayments.push(depositPayment);
  }

  res.json({ success: true, data: { bid, project } });
});

router.put('/:id/sign-and-pay', async (req: Request, res: Response): Promise<void> => {
  const { bidId, projectId } = req.body;
  const depositPayment = mockPayments.find((p) => p.projectId === projectId && p.type === 'deposit');
  if (depositPayment) {
    depositPayment.status = 'paid';
    depositPayment.paidDate = new Date().toISOString().split('T')[0];
  }
  const project = mockProjects.find((p) => p.id === projectId);
  if (project) {
    project.status = 'constructing';
    project.usedBudget = depositPayment?.amount || 0;
  }
  res.json({ success: true, data: { payment: depositPayment, project } });
});

export default router;
