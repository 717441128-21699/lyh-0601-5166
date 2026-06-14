import { useEffect, useState } from 'react';
import { GitPullRequest, Plus, Calendar, DollarSign, Clock, CheckCircle2, XCircle, User, Search, Filter } from 'lucide-react';
import { api } from '@/utils/api';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/format';
import type { ChangeRequest } from '../../shared/types';

export default function Changes() {
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChange, setNewChange] = useState({ title: '', description: '', budgetImpact: 0, durationImpact: 0 });

  useEffect(() => {
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    try {
      const data = await api.get<ChangeRequest[]>('/api/changes');
      setChanges(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await api.post('/api/changes', {
        ...newChange,
        projectId: 'proj-1',
        ownerId: 'user-001',
      });
      await fetchChanges();
      setShowCreateModal(false);
      setNewChange({ title: '', description: '', budgetImpact: 0, durationImpact: 0 });
    } catch (error) {
      console.error(error);
    }
  };

  const handleApprove = async (change: ChangeRequest, approved: boolean) => {
    try {
      await api.put(`/api/changes/${change.id}/approve`, { approved });
      await fetchChanges();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingCount = changes.filter((c) => c.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">变更管理</h1>
          <p className="text-sm text-slate-500 mt-1">业主变更申请，自动调整预算和工期</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-50 text-accent-700">
              <Clock size={16} />
              <span className="text-sm font-medium">{pendingCount} 项待审批</span>
            </div>
          )}
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            提交变更
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="搜索变更内容..." className="input-base pl-10" />
          </div>
          <select className="input-base w-auto">
            <option>全部状态</option>
            <option>待审批</option>
            <option>已批准</option>
            <option>已拒绝</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={16} />
            筛选
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {changes.map((change, index) => (
          <div
            key={change.id}
            className="card p-5 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  change.status === 'approved' ? 'bg-green-100' :
                  change.status === 'rejected' ? 'bg-red-100' : 'bg-accent-100'
                }`}>
                  <GitPullRequest size={22} className={`${
                    change.status === 'approved' ? 'text-green-600' :
                    change.status === 'rejected' ? 'text-red-600' : 'text-accent-600'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800 text-lg">{change.title}</p>
                    <span className={`badge ${
                      change.status === 'approved' ? 'bg-green-100 text-green-700' :
                      change.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-accent-100 text-accent-700'
                    }`}>
                      {getStatusLabel(change.status)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <User size={11} className="text-slate-400" />
                    申请人: 业主
                    <span className="mx-1">·</span>
                    <Calendar size={11} className="text-slate-400" />
                    {formatDate(change.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-4 leading-relaxed">{change.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 mb-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">预算影响</p>
                <p className={`text-lg font-bold font-mono ${change.budgetImpact > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {change.budgetImpact >= 0 ? '+' : ''}{formatCurrency(change.budgetImpact)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">工期影响</p>
                <p className={`text-lg font-bold font-mono ${change.durationImpact > 0 ? 'text-accent-600' : 'text-green-600'}`}>
                  {change.durationImpact >= 0 ? '+' : ''}{change.durationImpact} 天
                </p>
              </div>
              <div className="md:col-span-2 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 mb-1">关联项目</p>
                  <p className="font-medium text-slate-700">{change.projectId.toUpperCase()}</p>
                </div>
              </div>
            </div>

            {change.status === 'pending' && (
              <div className="flex justify-end gap-3">
                <button className="btn-danger flex items-center gap-2" onClick={() => handleApprove(change, false)}>
                  <XCircle size={16} />
                  拒绝
                </button>
                <button className="btn-primary flex items-center gap-2" onClick={() => handleApprove(change, true)}>
                  <CheckCircle2 size={16} />
                  批准变更
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-slate-800 mb-5">提交变更申请</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">变更标题</label>
                <input
                  type="text"
                  value={newChange.title}
                  onChange={(e) => setNewChange({ ...newChange, title: e.target.value })}
                  placeholder="请输入变更标题"
                  className="input-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">变更说明</label>
                <textarea
                  value={newChange.description}
                  onChange={(e) => setNewChange({ ...newChange, description: e.target.value })}
                  placeholder="请详细描述变更内容..."
                  className="input-base h-28 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                    <DollarSign size={14} />
                    预算变化（元）
                  </label>
                  <input
                    type="number"
                    value={newChange.budgetImpact}
                    onChange={(e) => setNewChange({ ...newChange, budgetImpact: Number(e.target.value) })}
                    placeholder="正数为增加"
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                    <Clock size={14} />
                    工期变化（天）
                  </label>
                  <input
                    type="number"
                    value={newChange.durationImpact}
                    onChange={(e) => setNewChange({ ...newChange, durationImpact: Number(e.target.value) })}
                    placeholder="正数为延期"
                    className="input-base"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button className="flex-1 btn-secondary" onClick={() => setShowCreateModal(false)}>
                取消
              </button>
              <button
                className="flex-1 btn-primary"
                onClick={handleCreate}
                disabled={!newChange.title || !newChange.description}
              >
                提交申请
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
