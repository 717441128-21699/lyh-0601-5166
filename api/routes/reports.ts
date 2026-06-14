import { Router, type Request, type Response } from 'express';
import { generateDashboardSummary, getFilteredData } from '../../shared/mockData.js';

const router = Router();

router.get('/monthly', async (req: Request, res: Response): Promise<void> => {
  const { month, community, houseType, date } = req.query;
  const filters = {
    community: typeof community === 'string' ? community : undefined,
    houseType: typeof houseType === 'string' ? houseType : undefined,
    date: typeof date === 'string' ? date : undefined,
  };
  const summary = generateDashboardSummary(filters);
  const filtered = getFilteredData(filters);
  
  const report = {
    month: month || new Date().toISOString().slice(0, 7),
    generatedAt: new Date().toISOString(),
    filters,
    projectOverview: {
      total: summary.totalProjects,
      active: summary.activeProjects,
      completed: summary.completedProjects,
      statusDistribution: summary.projectStatusDistribution,
    },
    finance: {
      totalRevenue: filtered.payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
      pendingPayments: filtered.payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
      paymentDetails: filtered.payments,
    },
    projects: filtered.projects.map((p) => ({
      id: p.id,
      ownerName: p.ownerName,
      community: p.houseInfo.community,
      houseType: p.houseInfo.houseType,
      area: p.houseInfo.area,
      totalBudget: p.totalBudget,
      usedBudget: p.usedBudget,
      progress: p.progress,
      status: p.status,
    })),
    changes: filtered.changeRequests,
    satisfaction: {
      average: summary.avgSatisfaction,
      trend: summary.satisfactionTrend,
    },
    workers: summary.topWorkers,
  };
  
  res.json({ success: true, data: report });
});

export default router;
