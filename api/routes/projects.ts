import { Router, type Request, type Response } from 'express';
import { mockProjects } from '../../shared/mockData.js';
import type { Project } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { status, ownerId, supervisorId } = req.query;
  let projects = [...mockProjects] as Project[];
  
  if (status) {
    projects = projects.filter((p) => p.status === status);
  }
  if (ownerId) {
    projects = projects.filter((p) => p.ownerId === ownerId);
  }
  if (supervisorId) {
    projects = projects.filter((p) => p.supervisorId === supervisorId);
  }
  
  res.json({ success: true, data: projects });
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const project = mockProjects.find((p) => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ success: false, error: '项目不存在' });
    return;
  }
  res.json({ success: true, data: project });
});

router.get('/:id/tasks', async (req: Request, res: Response): Promise<void> => {
  const project = mockProjects.find((p) => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ success: false, error: '项目不存在' });
    return;
  }
  res.json({ success: true, data: project.tasks });
});

export default router;
