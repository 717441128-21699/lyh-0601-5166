import { Router, type Request, type Response } from 'express';
import { mockUsers } from '../../shared/mockData.js';
import type { User } from '../../shared/types.js';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { role, status } = req.query;
  let users = [...mockUsers] as User[];
  
  if (role) {
    users = users.filter((u) => u.role === role);
  }
  if (status) {
    users = users.filter((u) => u.status === status);
  }
  
  res.json({ success: true, data: users });
});

router.post('/', async (req: Request, res: Response): Promise<void> => {
  const newUser: User = {
    id: `user-${Date.now()}`,
    ...req.body,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  mockUsers.push(newUser);
  res.json({ success: true, data: newUser });
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  const user = mockUsers.find((u) => u.id === req.params.id);
  if (!user) {
    res.status(404).json({ success: false, error: '用户不存在' });
    return;
  }
  Object.assign(user, req.body);
  res.json({ success: true, data: user });
});

export default router;
