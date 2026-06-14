import { useEffect, useState } from 'react';
import { FolderKanban, Building2, User, Briefcase, Calendar, DollarSign, ChevronRight, Search, Filter, Eye } from 'lucide-react';
import { api } from '@/utils/api';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/format';
import { useAppStore } from '@/store';
import type { Project } from '../../shared/types';

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { currentUser } = useAppStore();

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, currentUser]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (currentUser?.role === 'owner') {
        params.append('ownerId', currentUser.id);
      } else if (currentUser?.role === 'supervisor') {
        params.append('supervisorId', currentUser.id);
      }
      const queryString = params.toString();
      const data = await api.get<Project[]>(`/api/projects${queryString ? `?${queryString}` : ''}`);
      setProjects(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(
    (p) => !searchText || p.houseInfo.community.includes(searchText) || p.ownerName.includes(searchText)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">项目管理</h1>
          <p className="text-sm text-slate-500 mt-1">查看所有装修项目进度、任务和材料</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索小区或业主..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="input-base pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base w-auto"
          >
            <option value="">全部状态</option>
            <option value="signed">已签约</option>
            <option value="constructing">施工中</option>
            <option value="accepting">待验收</option>
            <option value="completed">已完成</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={16} />
            筛选
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">项目信息</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">业主/公司</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">进度</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">预算</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">周期</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">状态</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project, index) => (
              <tr
                key={project.id}
                className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <FolderKanban size={18} className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 flex items-center gap-2">
                        <Building2 size={14} className="text-slate-400" />
                        {project.houseInfo.community}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {project.houseInfo.houseType} · {project.houseInfo.area}㎡ · {project.houseInfo.style}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-700 flex items-center gap-1.5">
                      <User size={13} className="text-slate-400" />
                      {project.ownerName}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Briefcase size={13} className="text-slate-400" />
                      {project.companyName}
                    </p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="w-40">
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
                </td>
                <td className="px-5 py-4">
                  <div>
                    <p className={`text-sm font-semibold font-mono ${
                      project.usedBudget > project.totalBudget * 1.1 ? 'text-red-600' : 'text-slate-700'
                    }`}>
                      {formatCurrency(project.usedBudget)}
                    </p>
                    <p className="text-xs text-slate-500">/ {formatCurrency(project.totalBudget)}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="space-y-1">
                    <p className="text-sm text-slate-700 flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-400" />
                      {formatDate(project.startDate)}
                    </p>
                    <p className="text-xs text-slate-500">至 {formatDate(project.estimatedEndDate)}</p>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge status-${project.status}`}>{getStatusLabel(project.status)}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors inline-flex items-center gap-1">
                    <Eye size={16} />
                    <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
