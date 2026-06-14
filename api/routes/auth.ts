import { Router, type Request, type Response } from 'express';
import { mockUsers } from '../../shared/mockData.js';
import type { User } from '../../shared/types.js';

const router = Router();

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { phone, role } = req.body;
  let user: User | undefined;
  
  if (role) {
    user = mockUsers.find((u) => u.role === role);
  } else if (phone) {
    user = mockUsers.find((u) => u.phone === phone);
  } else {
    user = mockUsers.find((u) => u.role === 'admin');
  }
  
  if (!user) {
    res.status(401).json({ success: false, error: '用户不存在' });
    return;
  }
  
  res.json({ success: true, data: user });
});

router.get('/current', async (req: Request, res: Response): Promise<void> => {
  const user = mockUsers.find((u) => u.role === 'admin');
  res.json({ success: true, data: user });
});

router.post('/logout', async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, message: '登出成功' });
});

export default router;
