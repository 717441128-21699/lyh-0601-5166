import { Router, type Request, type Response } from 'express';
import { mockProjects } from '../../shared/mockData.js';
import type { Task } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { projectId, status, workerId } = req.query;
  let tasks: Task[] = [];
  
  mockProjects.forEach((p) => {
    tasks = tasks.concat(p.tasks);
  });
  
  if (projectId) {
    tasks = tasks.filter((t) => t.projectId === projectId);
  }
  if (status) {
    tasks = tasks.filter((t) => t.status === status);
  }
  if (workerId) {
    tasks = tasks.filter((t) => t.assignedWorkerId === workerId);
  }
  
  res.json({ success: true, data: tasks });
});

router.put('/:id/report', async (req: Request, res: Response): Promise<void> => {
  for (const project of mockProjects) {
    const task = project.tasks.find((t) => t.id === req.params.id);
    if (task) {
      task.status = 'completed';
      task.completedDate = new Date().toISOString().split('T')[0];
      res.json({ success: true, data: task });
      return;
    }
  }
  res.status(404).json({ success: false, error: '任务不存在' });
});

router.put('/:id/accept', async (req: Request, res: Response): Promise<void> => {
  const { score, comment } = req.body;
  for (const project of mockProjects) {
    const task = project.tasks.find((t) => t.id === req.params.id);
    if (task) {
      task.status = 'accepted';
      task.acceptedDate = new Date().toISOString().split('T')[0];
      task.score = score || 5;
      task.comment = comment;
      res.json({ success: true, data: task });
      return;
    }
  }
  res.status(404).json({ success: false, error: '任务不存在' });
});

export default router;
