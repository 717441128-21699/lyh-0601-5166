import { useEffect, useState } from 'react';
import { FileText, Plus, Building2, MapPin, Ruler, Palette, DollarSign, ChevronRight, Filter, Search } from 'lucide-react';
import { api } from '@/utils/api';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/format';
import type { DecorationApplication } from '../../shared/types';

export default function Applications() {
  const [applications, setApplications] = useState<DecorationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const data = await api.get<DecorationApplication[]>(`/api/applications${params}`);
      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApps = applications.filter(
    (app) =>
      !searchText ||
      app.houseInfo.community.includes(searchText) ||
      app.ownerName.includes(searchText)
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
          <h1 className="text-2xl font-bold text-slate-800">装修申请</h1>
          <p className="text-sm text-slate-500 mt-1">管理业主提交的装修申请，查看推荐方案</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus size={18} />
          新建申请
        </button>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索小区名称或业主姓名..."
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
            <option value="pending">待处理</option>
            <option value="bidding">竞标中</option>
            <option value="signed">已签约</option>
            <option value="constructing">施工中</option>
            <option value="completed">已完成</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={16} />
            更多筛选
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredApps.map((app, index) => (
          <div
            key={app.id}
            className="card p-5 card-hover cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                  <FileText size={20} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{app.houseInfo.community}</p>
                  <p className="text-xs text-slate-500">申请编号: {app.id.toUpperCase()}</p>
                </div>
              </div>
              <span className={`badge status-${app.status}`}>{getStatusLabel(app.status)}</span>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="text-slate-400" />
                <span className="text-slate-600">{app.houseInfo.houseType}</span>
                <span className="text-slate-300">|</span>
                <Ruler size={14} className="text-slate-400" />
                <span className="text-slate-600">{app.houseInfo.area}㎡</span>
                <span className="text-slate-300">|</span>
                <Building2 size={14} className="text-slate-400" />
                <span className="text-slate-600">{app.houseInfo.floor}F/{app.houseInfo.totalFloors}F</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Palette size={14} className="text-slate-400" />
                <span className="text-slate-600">{app.houseInfo.style}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign size={14} className="text-slate-400" />
                <span className="text-slate-600">预算:</span>
                <span className="font-semibold text-primary-600 font-mono">{formatCurrency(app.budget)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500">业主</p>
                <p className="text-sm font-medium text-slate-700">{app.ownerName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">提交时间</p>
                <p className="text-sm text-slate-600">{formatDate(app.createdAt)}</p>
              </div>
              <button className="p-2 rounded-lg hover:bg-primary-50 text-primary-600 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>

            {app.recommendedPlans.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-2">推荐方案</p>
                <div className="flex gap-2">
                  {app.recommendedPlans.map((plan) => (
                    <div
                      key={plan.id}
                      className="flex-1 p-2 rounded-lg bg-slate-50 border border-slate-100 text-center"
                    >
                      <p className="text-xs text-slate-600 mb-1">{plan.name}</p>
                      <p className="text-sm font-semibold text-primary-600 font-mono">
                        {formatCurrency(plan.basePrice)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
