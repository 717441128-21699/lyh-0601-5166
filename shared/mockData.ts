import type {
  User,
  DecorationApplication,
  DecorationPlan,
  Bid,
  Project,
  Task,
  MaterialItem,
  PurchaseOrder,
  Payment,
  ChangeRequest,
  DashboardSummary,
  SystemSettings,
  HouseInfo,
} from './types';

const generateId = () => Math.random().toString(36).substring(2, 10);

export const mockUsers: User[] = [
  {
    id: 'user-001',
    name: '张伟',
    phone: '13800138001',
    role: 'owner',
    status: 'active',
    createdAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'user-002',
    name: '李强',
    phone: '13800138002',
    role: 'worker',
    status: 'active',
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'user-003',
    name: '王芳',
    phone: '13800138003',
    role: 'worker',
    status: 'active',
    createdAt: '2026-01-08T14:00:00Z',
  },
  {
    id: 'user-004',
    name: '陈明',
    phone: '13800138004',
    role: 'worker',
    status: 'active',
    createdAt: '2026-01-05T11:00:00Z',
  },
  {
    id: 'user-005',
    name: '刘建国',
    phone: '13800138005',
    role: 'supervisor',
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'user-006',
    name: '赵静',
    phone: '13800138006',
    role: 'owner',
    status: 'active',
    createdAt: '2026-02-01T10:00:00Z',
  },
  {
    id: 'user-admin',
    name: '系统管理员',
    phone: '13900139000',
    role: 'admin',
    status: 'active',
    createdAt: '2025-12-01T00:00:00Z',
  },
];

const communities = ['翠湖天地', '阳光花园', '金色家园', '绿城玫瑰园', '保利中央公园', '万科城市花园'];
const houseTypes = ['三室两厅', '两室一厅', '四室两厅', '一室一厅', '复式楼'];
const styles = ['现代简约', '新中式', '北欧风格', '美式乡村', '轻奢风格'];

const generateHouseInfo = (): HouseInfo => ({
  community: communities[Math.floor(Math.random() * communities.length)],
  houseType: houseTypes[Math.floor(Math.random() * houseTypes.length)],
  area: Math.floor(Math.random() * 120) + 60,
  floor: Math.floor(Math.random() * 20) + 1,
  totalFloors: 30,
  style: styles[Math.floor(Math.random() * styles.length)],
});

const generatePlanItems = (area: number) => {
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
      id: generateId(),
      name,
      description: `${houseInfo.style}风格${name}装修方案，包含${items.length}项基础工程`,
      style: houseInfo.style,
      basePrice: Math.round(basePrice),
      items,
    };
  });
};

export const mockApplications: DecorationApplication[] = [
  {
    id: 'app-001',
    ownerId: 'user-001',
    ownerName: '张伟',
    houseInfo: { community: '翠湖天地', houseType: '三室两厅', area: 120, floor: 8, totalFloors: 30, style: '现代简约' },
    budget: 150000,
    status: 'constructing',
    recommendedPlans: generatePlans({ community: '翠湖天地', houseType: '三室两厅', area: 120, floor: 8, totalFloors: 30, style: '现代简约' }),
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'app-002',
    ownerId: 'user-006',
    ownerName: '赵静',
    houseInfo: { community: '阳光花园', houseType: '两室一厅', area: 85, floor: 5, totalFloors: 18, style: '北欧风格' },
    budget: 100000,
    status: 'bidding',
    recommendedPlans: generatePlans({ community: '阳光花园', houseType: '两室一厅', area: 85, floor: 5, totalFloors: 18, style: '北欧风格' }),
    createdAt: '2026-05-10T14:00:00Z',
  },
  {
    id: 'app-003',
    ownerId: 'user-001',
    ownerName: '张伟',
    houseInfo: { community: '金色家园', houseType: '四室两厅', area: 160, floor: 12, totalFloors: 28, style: '新中式' },
    budget: 250000,
    status: 'signed',
    recommendedPlans: generatePlans({ community: '金色家园', houseType: '四室两厅', area: 160, floor: 12, totalFloors: 28, style: '新中式' }),
    createdAt: '2026-04-15T09:00:00Z',
  },
  {
    id: 'app-004',
    ownerId: 'user-006',
    ownerName: '赵静',
    houseInfo: { community: '绿城玫瑰园', houseType: '复式楼', area: 200, floor: 1, totalFloors: 6, style: '轻奢风格' },
    budget: 400000,
    status: 'constructing',
    recommendedPlans: generatePlans({ community: '绿城玫瑰园', houseType: '复式楼', area: 200, floor: 1, totalFloors: 6, style: '轻奢风格' }),
    createdAt: '2026-02-20T11:00:00Z',
  },
  {
    id: 'app-005',
    ownerId: 'user-001',
    ownerName: '张伟',
    houseInfo: { community: '保利中央公园', houseType: '一室一厅', area: 55, floor: 15, totalFloors: 32, style: '现代简约' },
    budget: 60000,
    status: 'completed',
    recommendedPlans: generatePlans({ community: '保利中央公园', houseType: '一室一厅', area: 55, floor: 15, totalFloors: 32, style: '现代简约' }),
    createdAt: '2026-01-10T16:00:00Z',
  },
  {
    id: 'app-006',
    ownerId: 'user-006',
    ownerName: '赵静',
    houseInfo: { community: '万科城市花园', houseType: '三室两厅', area: 110, floor: 3, totalFloors: 11, style: '美式乡村' },
    budget: 180000,
    status: 'accepting',
    recommendedPlans: generatePlans({ community: '万科城市花园', houseType: '三室两厅', area: 110, floor: 3, totalFloors: 11, style: '美式乡村' }),
    createdAt: '2026-03-20T13:00:00Z',
  },
];

const companies = [
  { id: 'comp-001', name: '尚品装饰', logo: '🏠' },
  { id: 'comp-002', name: '美居设计', logo: '🏢' },
  { id: 'comp-003', name: '家饰佳装饰', logo: '🏡' },
  { id: 'comp-004', name: '鸿扬家装', logo: '🏘️' },
];

export const mockBids: Bid[] = [];
mockApplications.forEach((app) => {
  if (app.status !== 'pending') {
    const numBids = app.status === 'completed' ? 3 : Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < numBids; i++) {
      const company = companies[i % companies.length];
      const selected = i === 0 && ['signed', 'constructing', 'accepting', 'completed'].includes(app.status);
      mockBids.push({
        id: `bid-${app.id}-${i}`,
        applicationId: app.id,
        companyId: company.id,
        companyName: company.name,
        companyLogo: company.logo,
        price: Math.round(app.budget * (0.85 + Math.random() * 0.3)),
        duration: Math.floor(Math.random() * 30) + 45,
        description: `${company.name}为您提供专业的${app.houseInfo.style}装修服务，包含设计、施工、主材一站式服务。`,
        status: selected ? 'selected' : 'pending',
        createdAt: new Date(Date.parse(app.createdAt) + Math.random() * 86400000 * 3).toISOString(),
      });
    }
  }
});

const taskTypes = ['拆除工程', '水电改造', '防水工程', '泥瓦工程', '木工工程', '油漆工程', '安装工程', '竣工验收'];
const workerNames = ['李强', '王芳', '陈明'];

const generateTasks = (projectId: string, progress: number, startDate: string): Task[] => {
  const tasks: Task[] = [];
  const start = new Date(startDate);
  taskTypes.forEach((type, index) => {
    const taskProgress = ((index + 1) / taskTypes.length) * 100;
    let status: Task['status'];
    if (progress >= taskProgress) {
      status = 'accepted';
    } else if (progress >= taskProgress - 100 / taskTypes.length / 2) {
      status = 'completed';
    } else if (progress >= taskProgress - 100 / taskTypes.length) {
      status = 'in_progress';
    } else {
      status = 'pending';
    }
    const planned = new Date(start.getTime() + index * 7 * 86400000);
    const worker = workerNames[index % workerNames.length];
    tasks.push({
      id: `task-${projectId}-${index}`,
      projectId,
      name: type,
      type,
      assignedWorkerId: `user-00${(index % 3) + 2}`,
      assignedWorkerName: worker,
      status,
      plannedDate: planned.toISOString().split('T')[0],
      completedDate: ['completed', 'accepted'].includes(status) ? planned.toISOString().split('T')[0] : undefined,
      acceptedDate: status === 'accepted' ? new Date(planned.getTime() + 86400000).toISOString().split('T')[0] : undefined,
      score: status === 'accepted' ? Math.floor(Math.random() * 2) + 4 : undefined,
      comment: status === 'accepted' ? (Math.random() > 0.5 ? '施工质量很好，工人专业' : '按时完成，效果满意') : undefined,
      qrCode: `QR-${projectId}-${index}`,
    });
  });
  return tasks;
};

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

const generateMaterials = (projectId: string, area: number): MaterialItem[] => {
  return materialList.map((m, i) => {
    const required = Math.floor(area * (0.5 + Math.random() * 2) / (i < 3 ? 1 : 5));
    const current = Math.floor(required * (Math.random() * 0.5 + 0.3));
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

export const mockProjects: Project[] = mockApplications
  .filter((app) => ['signed', 'constructing', 'accepting', 'completed'].includes(app.status))
  .map((app, index) => {
    const startDate = new Date(Date.parse(app.createdAt) + 86400000 * 7);
    const endDate = new Date(startDate.getTime() + 86400000 * 60);
    const progressByStatus: Record<string, number> = {
      signed: 5,
      constructing: 45 + index * 10,
      accepting: 95,
      completed: 100,
    };
    const progress = progressByStatus[app.status] || 0;
    const selectedBid = mockBids.find((b) => b.applicationId === app.id && b.status === 'selected');
    return {
      id: `proj-${index + 1}`,
      applicationId: app.id,
      ownerId: app.ownerId,
      ownerName: app.ownerName,
      companyId: selectedBid?.companyId || 'comp-001',
      companyName: selectedBid?.companyName || '尚品装饰',
      houseInfo: app.houseInfo,
      totalBudget: selectedBid?.price || app.budget,
      usedBudget: Math.round((selectedBid?.price || app.budget) * (progress / 100) * (0.95 + Math.random() * 0.15)),
      status: app.status as Project['status'],
      progress,
      startDate: startDate.toISOString().split('T')[0],
      estimatedEndDate: endDate.toISOString().split('T')[0],
      supervisorId: 'user-005',
      tasks: generateTasks(`proj-${index + 1}`, progress, startDate.toISOString().split('T')[0]),
      materials: generateMaterials(`proj-${index + 1}`, app.houseInfo.area),
      createdAt: app.createdAt,
    };
  });

export const mockPurchaseOrders: PurchaseOrder[] = [];
mockProjects.forEach((proj) => {
  proj.materials.forEach((mat, mi) => {
    if (mat.status !== 'normal' && Math.random() > 0.5) {
      const statuses: PurchaseOrder['status'][] = ['pending', 'supervisor_approved', 'owner_approved', 'completed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const qty = Math.max(mat.safeStock - mat.currentStock, 10);
      mockPurchaseOrders.push({
        id: `po-${proj.id}-${mi}`,
        materialId: mat.id,
        materialName: mat.name,
        quantity: qty,
        totalPrice: qty * mat.unitPrice,
        status,
        applicantId: 'user-005',
        applicantName: '刘建国',
        supervisorApprovalId: status !== 'pending' ? 'user-005' : undefined,
        ownerApprovalId: ['owner_approved', 'completed'].includes(status) ? proj.ownerId : undefined,
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      });
    }
  });
});

export const mockPayments: Payment[] = [];
mockProjects.forEach((proj) => {
  const paymentTypes: { type: Payment['type']; stage: string; ratio: number }[] = [
    { type: 'deposit', stage: '签约定金', ratio: 0.2 },
    { type: 'progress', stage: '水电完工', ratio: 0.3 },
    { type: 'progress', stage: '泥木完工', ratio: 0.3 },
    { type: 'final', stage: '竣工验收', ratio: 0.2 },
  ];
  paymentTypes.forEach((pt, pi) => {
    const triggerProgress = pi * 25;
    let status: Payment['status'];
    if (proj.progress >= triggerProgress + 20) {
      status = 'paid';
    } else if (proj.progress >= triggerProgress) {
      status = 'pending';
    } else {
      return;
    }
    const dueDate = new Date(Date.parse(proj.startDate) + pi * 15 * 86400000);
    mockPayments.push({
      id: `pay-${proj.id}-${pi}`,
      projectId: proj.id,
      type: pt.type,
      amount: Math.round(proj.totalBudget * pt.ratio),
      stage: pt.stage,
      status,
      dueDate: dueDate.toISOString().split('T')[0],
      paidDate: status === 'paid' ? new Date(dueDate.getTime() + 86400000 * 2).toISOString().split('T')[0] : undefined,
      description: `${proj.houseInfo.community}项目${pt.stage}款项`,
    });
  });
});

export const mockChangeRequests: ChangeRequest[] = [
  {
    id: 'cr-001',
    projectId: 'proj-1',
    ownerId: 'user-001',
    title: '客厅吊顶造型变更',
    description: '希望将原计划的平顶改为造型吊顶，增加灯带设计，提升客厅层次感。',
    budgetImpact: 8000,
    durationImpact: 3,
    status: 'approved',
    createdAt: '2026-04-10T10:00:00Z',
  },
  {
    id: 'cr-002',
    projectId: 'proj-4',
    ownerId: 'user-006',
    title: '主卫生间洁具升级',
    description: '将原定普通马桶和花洒升级为智能马桶和恒温花洒套装。',
    budgetImpact: 12000,
    durationImpact: 2,
    status: 'pending',
    createdAt: '2026-05-20T14:00:00Z',
  },
  {
    id: 'cr-003',
    projectId: 'proj-1',
    ownerId: 'user-001',
    title: '厨房墙面瓷砖更换',
    description: '希望将厨房墙面瓷砖从普通瓷砖更换为防滑仿古砖。',
    budgetImpact: 3500,
    durationImpact: 1,
    status: 'rejected',
    createdAt: '2026-04-15T11:00:00Z',
  },
  {
    id: 'cr-004',
    projectId: 'proj-2',
    ownerId: 'user-006',
    title: '新增阳台储物柜',
    description: '在阳台区域增加一组定制储物柜，用于存放杂物。',
    budgetImpact: 4500,
    durationImpact: 2,
    status: 'approved',
    createdAt: '2026-05-05T09:00:00Z',
  },
  {
    id: 'cr-005',
    projectId: 'proj-3',
    ownerId: 'user-001',
    title: '卧室地板材质变更',
    description: '将卧室复合地板更换为实木地板。',
    budgetImpact: 15000,
    durationImpact: 2,
    status: 'pending',
    createdAt: '2026-05-25T16:00:00Z',
  },
];

export const mockSystemSettings: SystemSettings = {
  budgetWarningThreshold: 10,
  autoAcceptHours: 48,
  materialSafetyStockRatio: 0.2,
};

export interface DashboardFilters {
  community?: string;
  houseType?: string;
  date?: string;
}

const filterByHouseInfo = <T extends { houseInfo: HouseInfo; createdAt: string }>(
  items: T[],
  filters?: DashboardFilters
): T[] => {
  return items.filter((item) => {
    if (filters?.community && item.houseInfo.community !== filters.community) {
      return false;
    }
    if (filters?.houseType && item.houseInfo.houseType !== filters.houseType) {
      return false;
    }
    if (filters?.date) {
      const itemDate = item.createdAt.split('T')[0];
      if (itemDate !== filters.date) {
        return false;
      }
    }
    return true;
  });
};

export const generateDashboardSummary = (filters?: DashboardFilters): DashboardSummary => {
  const filteredApplications = filterByHouseInfo(mockApplications, filters);
  const filteredProjects = filterByHouseInfo(mockProjects, filters);
  const filteredProjectIds = new Set(filteredProjects.map((p) => p.id));
  const filteredPayments = mockPayments.filter((p) => filteredProjectIds.has(p.projectId));

  const projectStatusDistribution = [
    { status: 'pending' as const, count: 0 },
    { status: 'bidding' as const, count: filteredApplications.filter((a) => a.status === 'bidding').length },
    { status: 'signed' as const, count: filteredProjects.filter((p) => p.status === 'signed').length },
    { status: 'constructing' as const, count: filteredProjects.filter((p) => p.status === 'constructing').length },
    { status: 'accepting' as const, count: filteredProjects.filter((p) => p.status === 'accepting').length },
    { status: 'completed' as const, count: filteredProjects.filter((p) => p.status === 'completed').length },
  ];

  const allTasks = filteredProjects.flatMap((p) => p.tasks);
  const completedTasksByWorker = workerNames.map((name, i) => {
    const workerId = `user-00${i + 2}`;
    const workerTasks = allTasks.filter((t) => t.assignedWorkerId === workerId);
    const accepted = workerTasks.filter((t) => t.status === 'accepted');
    return {
      id: workerId,
      name,
      completedTasks: accepted.length,
      avgScore: accepted.length > 0 ? Math.round((accepted.reduce((s, t) => s + (t.score || 0), 0) / accepted.length) * 10) / 10 : 0,
    };
  }).sort((a, b) => b.completedTasks - a.completedTasks);

  const satisfactionTrend = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      date: d.toISOString().split('T')[0],
      score: Math.round((4 + Math.random()) * 10) / 10,
    };
  });

  const materialWarnings = filteredProjects
    .flatMap((p) => p.materials)
    .filter((m) => m.status !== 'normal')
    .slice(0, 8);

  const allAcceptedTasks = allTasks.filter((t) => t.status === 'accepted');
  const avgSatisfaction = allAcceptedTasks.length > 0
    ? Math.round((allAcceptedTasks.reduce((s, t) => s + (t.score || 0), 0) / allAcceptedTasks.length) * 10) / 10
    : 4.5;

  const pendingApprovals = mockPurchaseOrders.filter((po) => {
    const project = filteredProjects.find((p) =>
      p.materials.some((m) => m.id === po.materialId)
    );
    return project ? ['pending', 'supervisor_approved'].includes(po.status) : false;
  }).length;

  return {
    totalProjects: filteredProjects.length + filteredApplications.filter((a) => a.status === 'bidding').length,
    activeProjects: filteredProjects.filter((p) => ['signed', 'constructing', 'accepting'].includes(p.status)).length,
    completedProjects: filteredProjects.filter((p) => p.status === 'completed').length,
    totalRevenue: filteredPayments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
    materialsWarning: materialWarnings.filter((m) => m.status === 'shortage').length,
    pendingApprovals,
    avgSatisfaction,
    projectStatusDistribution,
    projects: filteredProjects,
    topWorkers: completedTasksByWorker,
    satisfactionTrend,
    materialWarnings,
  };
};

export const getFilteredData = (filters?: DashboardFilters) => {
  const filteredApplications = filterByHouseInfo(mockApplications, filters);
  const filteredProjects = filterByHouseInfo(mockProjects, filters);
  const filteredProjectIds = new Set(filteredProjects.map((p) => p.id));
  const filteredPayments = mockPayments.filter((p) => filteredProjectIds.has(p.projectId));
  const filteredChangeRequests = mockChangeRequests.filter((cr) => filteredProjectIds.has(cr.projectId));
  return {
    applications: filteredApplications,
    projects: filteredProjects,
    payments: filteredPayments,
    changeRequests: filteredChangeRequests,
  };
};
