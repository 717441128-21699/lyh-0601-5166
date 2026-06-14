import { create } from 'zustand';
import type { User, UserRole, DashboardSummary, Project, DecorationApplication, Bid, Task, MaterialItem, PurchaseOrder, Payment, ChangeRequest, SystemSettings } from '../../shared/types';

interface AppState {
  currentUser: User | null;
  dashboardData: DashboardSummary | null;
  projects: Project[];
  applications: DecorationApplication[];
  bids: Bid[];
  tasks: Task[];
  materials: MaterialItem[];
  purchaseOrders: PurchaseOrder[];
  payments: Payment[];
  changes: ChangeRequest[];
  users: User[];
  settings: SystemSettings | null;
  loading: boolean;
  
  setCurrentUser: (user: User | null) => void;
  setDashboardData: (data: DashboardSummary | null) => void;
  setProjects: (projects: Project[]) => void;
  setApplications: (apps: DecorationApplication[]) => void;
  setBids: (bids: Bid[]) => void;
  setTasks: (tasks: Task[]) => void;
  setMaterials: (materials: MaterialItem[]) => void;
  setPurchaseOrders: (orders: PurchaseOrder[]) => void;
  setPayments: (payments: Payment[]) => void;
  setChanges: (changes: ChangeRequest[]) => void;
  setUsers: (users: User[]) => void;
  setSettings: (settings: SystemSettings | null) => void;
  setLoading: (loading: boolean) => void;
  
  login: (role?: UserRole) => Promise<void>;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  dashboardData: null,
  projects: [],
  applications: [],
  bids: [],
  tasks: [],
  materials: [],
  purchaseOrders: [],
  payments: [],
  changes: [],
  users: [],
  settings: null,
  loading: false,

  setCurrentUser: (user) => set({ currentUser: user }),
  setDashboardData: (data) => set({ dashboardData: data }),
  setProjects: (projects) => set({ projects }),
  setApplications: (apps) => set({ applications: apps }),
  setBids: (bids) => set({ bids }),
  setTasks: (tasks) => set({ tasks }),
  setMaterials: (materials) => set({ materials }),
  setPurchaseOrders: (orders) => set({ purchaseOrders: orders }),
  setPayments: (payments) => set({ payments }),
  setChanges: (changes) => set({ changes }),
  setUsers: (users) => set({ users }),
  setSettings: (settings) => set({ settings }),
  setLoading: (loading) => set({ loading }),

  login: async (role) => {
    set({ loading: true });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: role || 'admin' }),
      });
      const json = await res.json();
      if (json.success) {
        set({ currentUser: json.data });
      }
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ currentUser: null });
  },
}));
