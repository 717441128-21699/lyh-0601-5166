import { useEffect, useState } from 'react';
import { ListTodo, User, Calendar, QrCode, Star, CheckCircle2, Clock, PlayCircle, AlertCircle, Search } from 'lucide-react';
import { api } from '@/utils/api';
import { formatDate, getStatusLabel } from '@/utils/format';
import type { Task } from '../../shared/types';

const statusConfig = {
  pending: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100' },
  in_progress: { icon: PlayCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  completed: { icon: CheckCircle2, color: 'text-accent-600', bg: 'bg-accent-100' },
  accepted: { icon: Star, color: 'text-green-600', bg: 'bg-green-100' },
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [showQrModal, setShowQrModal] = useState<Task | null>(null);
  const [showAcceptModal, setShowAcceptModal] = useState<Task | null>(null);
  const [acceptScore, setAcceptScore] = useState(5);
  const [acceptComment, setAcceptComment] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const fetchTasks = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const data = await api.get<Task[]>(`/api/tasks${params}`);
      setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReport = async (task: Task) => {
    try {
      await api.put(`/api/tasks/${task.id}/report`);
      await fetchTasks();
      setShowQrModal(null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAccept = async () => {
    if (!showAcceptModal) return;
    try {
      await api.put(`/api/tasks/${showAcceptModal.id}/accept`, { score: acceptScore, comment: acceptComment });
      await fetchTasks();
      setShowAcceptModal(null);
      setAcceptScore(5);
      setAcceptComment('');
    } catch (error) {
      console.error(error);
    }
  };

  const groupedTasks = tasks.reduce((acc, task) => {
    const date = task.plannedDate;
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const sortedDates = Object.keys(groupedTasks).sort();

  if (loading) {
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
          <h1 className="text-2xl font-bold text-slate-800">施工任务</h1>
          <p className="text-sm text-slate-500 mt-1">查看施工任务安排，扫码报工和工序验收</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-base w-auto"
          >
            <option value="">全部状态</option>
            <option value="pending">待开始</option>
            <option value="in_progress">进行中</option>
            <option value="completed">待验收</option>
            <option value="accepted">已验收</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {sortedDates.map((date, dateIndex) => (
          <div key={date} className="animate-slide-up" style={{ animationDelay: `${dateIndex * 80}ms` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                <Calendar size={18} className="text-primary-600" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-800">{formatDate(date)}</h2>
                <p className="text-xs text-slate-500">{groupedTasks[date].length} 个任务</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pl-13">
              {groupedTasks[date].map((task, index) => {
                const config = statusConfig[task.status];
                const StatusIcon = config.icon;
                return (
                  <div
                    key={task.id}
                    className="card p-5 card-hover animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                          <StatusIcon size={18} className={config.color} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{task.name}</p>
                          <p className="text-xs text-slate-500">{task.type}</p>
                        </div>
                      </div>
                      <span className={`badge status-${task.status}`}>{getStatusLabel(task.status)}</span>
                    </div>

                    {task.assignedWorkerName && (
                      <div className="flex items-center gap-2 mb-3 text-sm">
                        <User size={14} className="text-slate-400" />
                        <span className="text-slate-600">施工人员: {task.assignedWorkerName}</span>
                      </div>
                    )}

                    {task.status === 'accepted' && (
                      <div className="mb-3 p-3 rounded-lg bg-green-50">
                        <div className="flex items-center gap-1 mb-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < (task.score || 0) ? 'text-accent-500 fill-accent-500' : 'text-slate-300'}
                            />
                          ))}
                        </div>
                        {task.comment && <p className="text-xs text-slate-600">{task.comment}</p>}
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t border-slate-100">
                      {(task.status === 'pending' || task.status === 'in_progress') && (
                        <button
                          className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2"
                          onClick={() => setShowQrModal(task)}
                        >
                          <QrCode size={16} />
                          扫码报工
                        </button>
                      )}
                      {task.status === 'completed' && (
                        <button
                          className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm py-2"
                          onClick={() => setShowAcceptModal(task)}
                        >
                          <CheckCircle2 size={16} />
                          验收评分
                        </button>
                      )}
                      {task.status === 'accepted' && (
                        <div className="flex-1 flex items-center justify-center gap-2 text-sm text-green-600 py-2">
                          <CheckCircle2 size={16} />
                          已验收通过
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {showQrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-slide-up text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{showQrModal.name}</h3>
            <p className="text-sm text-slate-500 mb-5">工人扫码确认完成任务</p>
            <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl flex items-center justify-center mb-5">
              <div className="grid grid-cols-8 gap-0.5 p-4">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-sm ${Math.random() > 0.5 ? 'bg-slate-800' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-5 font-mono">{showQrModal.qrCode}</p>
            <div className="flex gap-3">
              <button className="flex-1 btn-secondary" onClick={() => setShowQrModal(null)}>
                关闭
              </button>
              <button className="flex-1 btn-primary" onClick={() => handleReport(showQrModal)}>
                模拟扫码报工
              </button>
            </div>
          </div>
        </div>
      )}

      {showAcceptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-xl font-bold text-slate-800 mb-4">工序验收评分</h3>
            <p className="text-sm text-slate-600 mb-5">
              <span className="font-medium">{showAcceptModal.name}</span> 已完成施工，请验收并评分。
              <span className="text-accent-600 ml-1">（超过48小时未验收将自动通过）</span>
            </p>
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">评分</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    className="p-2 transition-transform hover:scale-110"
                    onClick={() => setAcceptScore(score)}
                  >
                    <Star
                      size={32}
                      className={score <= acceptScore ? 'text-accent-500 fill-accent-500' : 'text-slate-300'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5">
              <label className="block text-sm font-medium text-slate-700 mb-2">评价（可选）</label>
              <textarea
                value={acceptComment}
                onChange={(e) => setAcceptComment(e.target.value)}
                placeholder="请输入您的评价..."
                className="input-base h-24 resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button className="flex-1 btn-secondary" onClick={() => setShowAcceptModal(null)}>
                取消
              </button>
              <button className="flex-1 btn-primary" onClick={handleAccept}>
                确认验收
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
