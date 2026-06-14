import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, User, HardHat, Eye, Shield, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store';
import type { UserRole } from '../../shared/types';
import { getRoleLabel } from '@/utils/format';

interface RoleOption {
  role: UserRole;
  label: string;
  icon: React.ElementType;
  description: string;
  color: string;
}

const roleOptions: RoleOption[] = [
  { role: 'admin', label: '管理员', icon: Shield, description: '全局数据管理、用户管理、规则配置', color: 'from-primary-500 to-primary-700' },
  { role: 'supervisor', label: '项目监理', icon: Eye, description: '管理负责项目、审批材料、监督施工', color: 'from-blue-500 to-blue-700' },
  { role: 'owner', label: '业主', icon: Home, description: '提交申请、选择公司、验收评分、查看费用', color: 'from-accent-500 to-accent-700' },
  { role: 'worker', label: '施工队', icon: HardHat, description: '查看任务、扫码报工、查看绩效', color: 'from-emerald-500 to-emerald-700' },
];

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const { login, currentUser, loading } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleLogin = async (role: UserRole) => {
    setSelectedRole(role);
    await login(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center p-8">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow">
              <Home size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">智慧家装管理平台</h1>
          </div>
          <p className="text-lg text-slate-300">
            整合装修申请、方案推荐、在线竞标、施工调度、材料管控与费用结算全链路
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {roleOptions.map((option, index) => {
            const Icon = option.icon;
            const isSelected = selectedRole === option.role;
            return (
              <button
                key={option.role}
                onClick={() => handleLogin(option.role)}
                disabled={loading}
                className={`group relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border transition-all duration-300 animate-slide-up ${
                  isSelected
                    ? 'bg-white/10 border-primary-400/50 shadow-glow scale-[1.02]'
                    : 'border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1'
                }`}
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{option.label}</h3>
                <p className="text-sm text-slate-400 mb-4 leading-relaxed">{option.description}</p>
                <div className="flex items-center gap-2 text-primary-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>进入{getRoleLabel(option.role)}端</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
                {loading && isSelected && (
                  <div className="absolute inset-0 rounded-2xl bg-slate-900/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-12 text-center text-sm text-slate-500 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <p>点击上方任意角色卡片即可快速登录体验对应功能</p>
        </div>
      </div>
    </div>
  );
}
