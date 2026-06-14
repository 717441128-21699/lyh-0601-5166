import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Gavel,
  FolderKanban,
  ListTodo,
  Package,
  CreditCard,
  GitPullRequest,
  Users,
  Settings,
  Menu,
  X,
  ChevronRight,
  LogOut,
  ShieldAlert,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { getRoleLabel } from '@/utils/format';
import type { UserRole } from '../../shared/types';

interface MenuItem {
  key: string;
  label: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  { key: 'dashboard', label: '首页大屏', icon: LayoutDashboard, path: '/', roles: ['admin', 'supervisor'] },
  { key: 'applications', label: '装修申请', icon: FileText, path: '/applications', roles: ['admin', 'supervisor', 'owner'] },
  { key: 'bidding', label: '在线竞标', icon: Gavel, path: '/bidding', roles: ['admin', 'supervisor', 'owner'] },
  { key: 'projects', label: '项目管理', icon: FolderKanban, path: '/projects', roles: ['admin', 'supervisor', 'owner'] },
  { key: 'tasks', label: '施工任务', icon: ListTodo, path: '/tasks', roles: ['admin', 'supervisor', 'worker'] },
  { key: 'materials', label: '材料管控', icon: Package, path: '/materials', roles: ['admin', 'supervisor'] },
  { key: 'purchase', label: '采购审批', icon: Package, path: '/materials/purchase', roles: ['admin', 'supervisor', 'owner'] },
  { key: 'finance', label: '费用结算', icon: CreditCard, path: '/finance', roles: ['admin', 'owner'] },
  { key: 'changes', label: '变更管理', icon: GitPullRequest, path: '/changes', roles: ['admin', 'supervisor', 'owner'] },
  { key: 'users', label: '用户管理', icon: Users, path: '/users', roles: ['admin'] },
  { key: 'settings', label: '规则配置', icon: Settings, path: '/settings', roles: ['admin'] },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAppStore();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const visibleMenuItems = menuItems.filter((item) => item.roles.includes(currentUser.role));

  const hasPermission = useMemo(() => {
    const matchedItem = menuItems.find(
      (item) => location.pathname === item.path || location.pathname.startsWith(item.path + '/')
    );
    if (!matchedItem) return true;
    return matchedItem.roles.includes(currentUser.role);
  }, [location.pathname, currentUser.role]);

  return (
    <div className="flex h-screen bg-slate-50">
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-lg font-bold">
                智
              </div>
              <span className="font-semibold text-lg">智慧家装</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
          >
            {collapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <button
                key={item.key}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600/20 text-primary-300 border-r-2 border-primary-500'
                    : 'text-slate-300 hover:bg-slate-700/30 hover:text-white'
                }`}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                    {isActive && <ChevronRight size={16} />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700/30 hover:text-red-400 rounded-lg transition-all duration-200"
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!collapsed && <span className="text-sm font-medium">退出登录</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="text-sm">
              {visibleMenuItems.find((m) => location.pathname === m.path || location.pathname.startsWith(m.path + '/'))?.label || '首页大屏'}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{getRoleLabel(currentUser.role)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold">
                {currentUser.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          {hasPermission ? (
            children
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <ShieldAlert size={40} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">无权限访问</h2>
                <p className="text-sm text-slate-500">
                  您当前角色（{getRoleLabel(currentUser.role)}）没有访问该页面的权限
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
