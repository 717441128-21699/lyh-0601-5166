import { useEffect, useState } from 'react';
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart as ReAreaChart,
  Area,
} from 'recharts';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Star,
  TrendingUp,
  Users,
  Package,
  Download,
  Filter,
  Building2,
  Calendar,
  RefreshCw,
  PieChart,
  BarChart,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { api } from '@/utils/api';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/format';
import type { DashboardSummary, ProjectStatus, MaterialItem } from '../../shared/types';

const STATUS_COLORS: Record<ProjectStatus, string> = {
  pending: '#94A3B8',
  bidding: '#3B82F6',
  signed: '#8B5CF6',
  constructing: '#0D9488',
  accepting: '#F97316',
  completed: '#22C55E',
};

const STATUS_ORDER: ProjectStatus[] = ['bidding', 'signed', 'constructing', 'accepting', 'completed'];

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  trend?: string;
  color: string;
  delay?: number;
}

function StatCard({ icon: Icon, label, value, trend, color, delay = 0 }: StatCardProps) {
  return (
    <div
      className="card p-5 card-hover animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-800 font-mono animate-number-roll">{value}</p>
          {trend && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              {trend}
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { setDashboardData, dashboardData } = useAppStore();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      const summary = await api.get<DashboardSummary>('/api/dashboard/summary');
      setData(summary);
      setDashboardData(summary);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const pieData = data?.projectStatusDistribution
    .filter((d) => STATUS_ORDER.includes(d.status))
    .map((d) => ({
      name: getStatusLabel(d.status),
      value: d.count,
      color: STATUS_COLORS[d.status],
    })) || [];

  const handleExport = () => {
    api.get('/api/reports/monthly').then((report) => {
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `月度报告_${new Date().toISOString().slice(0, 7)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">运营数据大屏</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <RefreshCw size={14} className={`${loading ? 'animate-spin' : ''}`} />
            每10秒自动刷新 · 最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <select className="input-base w-auto text-sm">
              <option>全部小区</option>
              <option>翠湖天地</option>
              <option>阳光花园</option>
              <option>金色家园</option>
            </select>
            <select className="input-base w-auto text-sm">
              <option>全部户型</option>
              <option>一室一厅</option>
              <option>两室一厅</option>
              <option>三室两厅</option>
            </select>
            <input type="date" className="input-base w-auto text-sm" />
            <button className="btn-secondary flex items-center gap-2 text-sm">
              <Filter size={16} />
              筛选
            </button>
          </div>
          <button onClick={handleExport} className="btn-primary flex items-center gap-2 text-sm">
            <Download size={16} />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={FolderKanban}
          label="项目总数"
          value={data.totalProjects}
          trend={`进行中 ${data.activeProjects} 个`}
          color="bg-gradient-to-br from-primary-500 to-primary-700"
          delay={0}
        />
        <StatCard
          icon={CheckCircle2}
          label="已完成项目"
          value={data.completedProjects}
          color="bg-gradient-to-br from-green-500 to-green-700"
          delay={80}
        />
        <StatCard
          icon={TrendingUp}
          label="累计营收"
          value={formatCurrency(data.totalRevenue)}
          color="bg-gradient-to-br from-blue-500 to-blue-700"
          delay={160}
        />
        <StatCard
          icon={Star}
          label="平均满意度"
          value={`${data.avgSatisfaction} 分`}
          color="bg-gradient-to-br from-accent-500 to-accent-700"
          delay={240}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 lg:col-span-2 animate-slide-up" style={{ animationDelay: '320ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <FolderKanban size={18} className="text-primary-600" />
              项目进度总览
            </h2>
            <span className="text-xs text-slate-500">共 {data.projects.length} 个项目</span>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin pr-2">
            {data.projects.map((project, index) => (
              <div
                key={project.id}
                className="p-4 rounded-xl border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-all cursor-pointer"
                style={{ animationDelay: `${400 + index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 size={15} className="text-slate-400" />
                      <span className="font-medium text-slate-800">{project.houseInfo.community}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-sm text-slate-500">{project.houseInfo.houseType}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-sm text-slate-500">{project.houseInfo.area}㎡</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      业主: {project.ownerName} · {project.companyName}
                    </p>
                  </div>
                  <span className={`badge status-${project.status}`}>{getStatusLabel(project.status)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500">施工进度</span>
                      <span className="font-semibold text-primary-600 font-mono">{project.progress}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">预算使用</p>
                    <p className={`text-sm font-semibold font-mono ${
                      project.usedBudget > project.totalBudget * 1.1 ? 'text-red-600' : 'text-slate-700'
                    }`}>
                      {formatCurrency(project.usedBudget)} / {formatCurrency(project.totalBudget)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <PieChart size={18} className="text-primary-600" />
            项目状态分布
          </h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-slate-600">{item.name}</span>
                <span className="text-xs font-semibold text-slate-800 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 animate-slide-up" style={{ animationDelay: '480ms' }}>
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <Star size={18} className="text-accent-500" />
            满意度趋势
          </h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <ReAreaChart data={data.satisfactionTrend}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="score" stroke="#F97316" strokeWidth={2} fill="url(#colorScore)" />
              </ReAreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 animate-slide-up" style={{ animationDelay: '560ms' }}>
          <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
            <Users size={18} className="text-blue-500" />
            施工绩效排行
          </h2>
          <div className="space-y-3">
            {data.topWorkers.map((worker, index) => (
              <div key={worker.id} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                      : index === 1
                      ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white'
                      : index === 2
                      ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-800">{worker.name}</span>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Star size={11} className="text-accent-500 fill-accent-500" />
                      {worker.avgScore}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
                      style={{ width: `${(worker.completedTasks / Math.max(...data.topWorkers.map((w) => w.completedTasks))) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-700 font-mono min-w-[50px] text-right">
                  {worker.completedTasks}项
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 animate-slide-up" style={{ animationDelay: '640ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-slate-800 flex items-center gap-2">
              <Package size={18} className="text-red-500" />
              材料库存预警
            </h2>
            {data.materialsWarning > 0 && (
              <span className="badge bg-red-100 text-red-700 flex items-center gap-1">
                <AlertTriangle size={11} />
                {data.materialsWarning} 项缺货
              </span>
            )}
          </div>
          <div className="space-y-3 max-h-56 overflow-y-auto scrollbar-thin">
            {data.materialWarnings.map((mat: MaterialItem) => (
              <div key={mat.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{mat.name}</p>
                    <p className="text-xs text-slate-500">{mat.specification}</p>
                  </div>
                  <span className={`badge status-${mat.status}`}>
                    {mat.status === 'shortage' ? (
                      <span className="flex items-center gap-1">
                        <AlertTriangle size={10} />
                        缺货
                      </span>
                    ) : (
                      '预警'
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    库存 <span className="font-mono font-semibold text-slate-700">{mat.currentStock}</span>
                    / 需求 <span className="font-mono">{mat.requiredQuantity}</span> {mat.unit}
                  </span>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar size={11} />
                    安全线 {mat.safeStock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card p-5 animate-slide-up" style={{ animationDelay: '720ms' }}>
        <h2 className="font-semibold text-slate-800 mb-5 flex items-center gap-2">
          <BarChart size={18} className="text-primary-600" />
          各工种任务完成统计
        </h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart
              data={[
                { name: '拆除工程', completed: 5, total: 6 },
                { name: '水电改造', completed: 4, total: 5 },
                { name: '防水工程', completed: 3, total: 5 },
                { name: '泥瓦工程', completed: 4, total: 6 },
                { name: '木工工程', completed: 2, total: 5 },
                { name: '油漆工程', completed: 1, total: 6 },
                { name: '安装工程', completed: 0, total: 5 },
                { name: '竣工验收', completed: 1, total: 1 },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} />
              <Tooltip />
              <Bar dataKey="completed" name="已完成" fill="#0D9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total" name="总数" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
