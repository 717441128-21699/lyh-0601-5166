import { useEffect, useState } from 'react';
import { FileText, Plus, Building2, MapPin, Ruler, Palette, DollarSign, ChevronRight, Filter, Search, X, CheckCircle2, Home, Layers } from 'lucide-react';
import { api } from '@/utils/api';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/format';
import { useAppStore } from '@/store';
import type { DecorationApplication, DecorationPlan, HouseInfo } from '../../shared/types';

const styleOptions = ['现代简约', '新中式', '北欧风格', '美式乡村', '轻奢风格'];
const houseTypeOptions = ['一室一厅', '两室一厅', '三室两厅', '四室两厅', '复式楼'];
const communityOptions = ['翠湖天地', '阳光花园', '金色家园', '绿城玫瑰园', '保利中央公园', '万科城市花园'];

interface ApplicationForm {
  community: string;
  houseType: string;
  area: number | '';
  floor: number | '';
  totalFloors: number | '';
  style: string;
  budget: number | '';
}

const emptyForm: ApplicationForm = {
  community: '',
  houseType: '',
  area: '',
  floor: '',
  totalFloors: '',
  style: '',
  budget: '',
};

export default function Applications() {
  const { currentUser } = useAppStore();
  const [applications, setApplications] = useState<DecorationApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState<ApplicationForm>(emptyForm);
  const [showResult, setShowResult] = useState<DecorationApplication | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, currentUser]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (currentUser?.role === 'owner') params.set('ownerId', currentUser.id);
      const query = params.toString();
      const data = await api.get<DecorationApplication[]>(`/api/applications${query ? `?${query}` : ''}`);
      setApplications(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.community || !formData.houseType || !formData.area || !formData.floor || !formData.totalFloors || !formData.style || !formData.budget) return;
    setSubmitting(true);
    try {
      const houseInfo: HouseInfo = {
        community: formData.community,
        houseType: formData.houseType,
        area: Number(formData.area),
        floor: Number(formData.floor),
        totalFloors: Number(formData.totalFloors),
        style: formData.style,
      };
      const payload = {
        houseInfo,
        budget: Number(formData.budget),
        ownerId: currentUser?.role === 'owner' ? currentUser.id : 'user-001',
        ownerName: currentUser?.role === 'owner' ? currentUser.name : '张伟',
      };
      const newApp = await api.post<DecorationApplication>('/api/applications', payload);
      setShowResult(newApp);
      await fetchApplications();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setFormData(emptyForm);
    setShowResult(null);
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
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
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
        {filteredApps.length === 0 && (
          <div className="col-span-full card p-12 text-center">
            <FileText size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">暂无装修申请记录</p>
          </div>
        )}
      </div>

      {showCreateModal && !showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <h3 className="text-lg font-bold text-slate-800">新建装修申请</h3>
              <button
                onClick={closeCreateModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Home size={14} />
                  所在小区
                </label>
                <select
                  value={formData.community}
                  onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                  className="input-base"
                >
                  <option value="">请选择小区</option>
                  {communityOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Layers size={14} />
                    户型
                  </label>
                  <select
                    value={formData.houseType}
                    onChange={(e) => setFormData({ ...formData, houseType: e.target.value })}
                    className="input-base"
                  >
                    <option value="">请选择户型</option>
                    {houseTypeOptions.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <Ruler size={14} />
                    建筑面积（㎡）
                  </label>
                  <input
                    type="number"
                    placeholder="请输入面积"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value ? Number(e.target.value) : '' })}
                    className="input-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">所在楼层</label>
                  <input
                    type="number"
                    placeholder="如：8"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value ? Number(e.target.value) : '' })}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">总楼层</label>
                  <input
                    type="number"
                    placeholder="如：30"
                    value={formData.totalFloors}
                    onChange={(e) => setFormData({ ...formData, totalFloors: e.target.value ? Number(e.target.value) : '' })}
                    className="input-base"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Palette size={14} />
                  装修风格
                </label>
                <select
                  value={formData.style}
                  onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                  className="input-base"
                >
                  <option value="">请选择风格</option>
                  {styleOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <DollarSign size={14} />
                  预算金额（元）
                </label>
                <input
                  type="number"
                  placeholder="请输入预算金额"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value ? Number(e.target.value) : '' })}
                  className="input-base"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl sticky bottom-0">
              <button onClick={closeCreateModal} className="btn-secondary">
                取消
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !formData.community || !formData.houseType || !formData.area || !formData.floor || !formData.totalFloors || !formData.style || !formData.budget}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle2 size={16} />
                {submitting ? '提交中...' : '提交申请'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 size={18} className="text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">申请提交成功</h3>
              </div>
              <button
                onClick={closeCreateModal}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <div className="p-4 rounded-xl bg-green-50 border border-green-100 mb-5">
                <p className="text-sm text-green-700">
                  系统已根据您的房屋信息自动生成 <span className="font-bold">3 套</span> 装修方案，请查看：
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                {showResult.recommendedPlans.map((plan: DecorationPlan, idx: number) => (
                  <div
                    key={plan.id}
                    className={`p-5 rounded-xl border-2 transition-all ${
                      idx === 1
                        ? 'border-primary-500 bg-primary-50/50 shadow-lg relative'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {idx === 1 && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary-500 text-white text-xs font-medium rounded-full">
                        推荐
                      </span>
                    )}
                    <h4 className="font-bold text-slate-800 mb-1 text-center">{plan.name}</h4>
                    <p className="text-xs text-slate-500 mb-3 text-center">{plan.description}</p>
                    <div className="text-center mb-3">
                      <p className="text-2xl font-bold text-primary-600 font-mono">{formatCurrency(plan.basePrice)}</p>
                    </div>
                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      {plan.items.slice(0, 4).map((item) => (
                        <div key={item.name} className="flex justify-between text-xs">
                          <span className="text-slate-600">{item.name}</span>
                          <span className="text-slate-500 font-mono">{item.quantity}{item.unit}</span>
                        </div>
                      ))}
                      {plan.items.length > 4 && (
                        <p className="text-xs text-slate-400 text-center pt-1">+{plan.items.length - 4} 项</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 text-sm text-slate-600">
                <p>
                  申请编号: <span className="font-mono font-medium text-slate-800">{showResult.id.toUpperCase()}</span>
                  <span className="mx-3 text-slate-300">|</span>
                  状态: <span className="badge bg-yellow-100 text-yellow-700">{getStatusLabel(showResult.status)}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={closeCreateModal} className="btn-primary">
                完成，查看列表
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
