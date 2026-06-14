import { Router, type Request, type Response } from 'express';
import { generateDashboardSummary, mockPayments, mockProjects, mockChangeRequests } from '../../shared/mockData.js';

const router = Router();

router.get('/monthly', async (req: Request, res: Response): Promise<void> => {
  const { month } = req.query;
  const summary = generateDashboardSummary();
  
  const report = {
    month: month || new Date().toISOString().slice(0, 7),
    generatedAt: new Date().toISOString(),
    projectOverview: {
      total: summary.totalProjects,
      active: summary.activeProjects,
      completed: summary.completedProjects,
      statusDistribution: summary.projectStatusDistribution,
    },
    finance: {
      totalRevenue: mockPayments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0),
      pendingPayments: mockPayments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
      paymentDetails: mockPayments,
    },
    projects: mockProjects.map((p) => ({
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
    changes: mockChangeRequests,
    satisfaction: {
      average: summary.avgSatisfaction,
      trend: summary.satisfactionTrend,
    },
    workers: summary.topWorkers,
  };
  
  res.json({ success: true, data: report });
});

export default router;
