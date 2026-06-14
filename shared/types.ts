export type UserRole = 'owner' | 'worker' | 'supervisor' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type ProjectStatus = 'pending' | 'bidding' | 'signed' | 'constructing' | 'accepting' | 'completed';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'accepted';
export type MaterialStatus = 'normal' | 'warning' | 'shortage';
export type PurchaseStatus = 'pending' | 'supervisor_approved' | 'owner_approved' | 'rejected' | 'completed';

export interface HouseInfo {
  community: string;
  houseType: string;
  area: number;
  floor: number;
  totalFloors: number;
  style: string;
}

export interface DecorationApplication {
  id: string;
  ownerId: string;
  ownerName: string;
  houseInfo: HouseInfo;
  budget: number;
  status: ProjectStatus;
  recommendedPlans: DecorationPlan[];
  createdAt: string;
}

export interface DecorationPlan {
  id: string;
  name: string;
  description: string;
  style: string;
  basePrice: number;
  items: PlanItem[];
}

export interface PlanItem {
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

export interface Bid {
  id: string;
  applicationId: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  price: number;
  duration: number;
  description: string;
  status: 'pending' | 'selected' | 'rejected';
  createdAt: string;
}

export interface Project {
  id: string;
  applicationId: string;
  ownerId: string;
  ownerName: string;
  companyId: string;
  companyName: string;
  houseInfo: HouseInfo;
  totalBudget: number;
  usedBudget: number;
  status: ProjectStatus;
  progress: number;
  startDate: string;
  estimatedEndDate: string;
  supervisorId?: string;
  tasks: Task[];
  materials: MaterialItem[];
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  type: string;
  assignedWorkerId?: string;
  assignedWorkerName?: string;
  status: TaskStatus;
  plannedDate: string;
  completedDate?: string;
  acceptedDate?: string;
  score?: number;
  comment?: string;
  qrCode: string;
}

export interface MaterialItem {
  id: string;
  projectId: string;
  name: string;
  specification: string;
  unit: string;
  requiredQuantity: number;
  currentStock: number;
  safeStock: number;
  unitPrice: number;
  status: MaterialStatus;
  purchaseOrders: PurchaseOrder[];
}

export interface PurchaseOrder {
  id: string;
  materialId: string;
  materialName: string;
  quantity: number;
  totalPrice: number;
  status: PurchaseStatus;
  applicantId: string;
  applicantName?: string;
  supervisorApprovalId?: string;
  ownerApprovalId?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  projectId: string;
  type: 'deposit' | 'progress' | 'final';
  amount: number;
  stage: string;
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paidDate?: string;
  description: string;
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  ownerId: string;
  title: string;
  description: string;
  attachments?: string[];
  budgetImpact: number;
  durationImpact: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  materialsWarning: number;
  pendingApprovals: number;
  avgSatisfaction: number;
  projectStatusDistribution: { status: ProjectStatus; count: number }[];
  projects: Project[];
  topWorkers: { id: string; name: string; completedTasks: number; avgScore: number }[];
  satisfactionTrend: { date: string; score: number }[];
  materialWarnings: MaterialItem[];
}

export interface SystemSettings {
  budgetWarningThreshold: number;
  autoAcceptHours: number;
  materialSafetyStockRatio: number;
}
