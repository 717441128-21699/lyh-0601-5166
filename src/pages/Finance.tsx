import { useEffect, useState } from 'react';
import { CreditCard, DollarSign, TrendingUp, AlertTriangle, CheckCircle2, Clock, Calendar, Search, Filter } from 'lucide-react';
import { api } from '@/utils/api';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/format';
import type { Payment } from '../../shared/types';

const typeConfig = {
  deposit: { label: '定金', color: 'bg-blue-100 text-blue-700' },
  progress: { label: '进度款', color: 'bg-primary-100 text-primary-700' },
  final: { label: '尾款', color: 'bg-green-100 text-green-700' },
};

export default function Finance() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const data = await api.get<Payment[]>(`/api/finance/payments${params}`);
      setPayments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (payment: Payment) => {
    try {
      await api.post(`/api/finance/payments/${payment.id}/confirm`);
      await fetchPayments();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPayments = payments.filter(
    (p) => !searchText || p.stage.includes(searchText) || p.description.includes(searchText)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalPaid = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter((p) => p.status === 'overdue').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">费用结算</h1>
        <p className="text-sm text-slate-500 mt-1">按进度自动结算，超预算10%自动预警</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="card p-5 card-hover animate-slide-up">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">已收款</p>
              <p className="text-2xl font-bold text-green-600 font-mono">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
              <CheckCircle2 size={22} className="text-white" />
            </div>
          </div>
        </div>
        <div className="card p-5 card-hover animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">待收款</p>
              <p className="text-2xl font-bold text-primary-600 font-mono">{formatCurrency(totalPending)}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Clock size={22} className="text-white" />
            </div>
          </div>
        </div>
        <div className="card p-5 card-hover animate-slide-up" style={{ animationDelay: '160ms' }}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">已逾期</p>
              <p className={`text-2xl font-bold font-mono ${totalOverdue > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                {formatCurrency(totalOverdue)}
              </p>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${totalOverdue > 0 ? 'bg-gradient-to-br from-red-500 to-red-700' : 'bg-slate-200'}`}>
              <AlertTriangle size={22} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      <div className="card p-4 animate-slide-up" style={{ animationDelay: '240ms' }}>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索款项..."
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
            <option value="pending">待支付</option>
            <option value="paid">已支付</option>
            <option value="overdue">已逾期</option>
          </select>
          <button className="btn-secondary flex items-center gap-2">
            <Filter size={16} />
            筛选
          </button>
        </div>
      </div>

      <div className="card overflow-hidden animate-slide-up" style={{ animationDelay: '320ms' }}>
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">款项信息</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">类型</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">金额</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">截止日期</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">状态</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((payment, index) => {
              const config = typeConfig[payment.type];
              const isOverBudget = false;
              return (
                <tr
                  key={payment.id}
                  className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors animate-slide-up ${
                    payment.status === 'overdue' ? 'bg-red-50/30' : ''
                  }`}
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <CreditCard size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{payment.stage}</p>
                        <p className="text-xs text-slate-500">{payment.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${config.color}`}>{config.label}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <DollarSign size={14} className="text-slate-400" />
                      <span className="text-lg font-bold font-mono text-slate-800">{formatCurrency(payment.amount)}</span>
                      {isOverBudget && (
                        <span className="badge bg-red-100 text-red-700 flex items-center gap-1 ml-2">
                          <AlertTriangle size={10} />
                          超预算
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Calendar size={13} className="text-slate-400" />
                      <span className="text-slate-600">{formatDate(payment.dueDate)}</span>
                      {payment.paidDate && (
                        <span className="text-xs text-green-600 ml-2">(支付: {formatDate(payment.paidDate)})</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-700' :
                      payment.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {payment.status === 'pending' && (
                      <button className="btn-primary text-sm py-1.5 px-3" onClick={() => handleConfirm(payment)}>
                        确认收款
                      </button>
                    )}
                    {payment.status === 'paid' && (
                      <span className="text-sm text-green-600 flex items-center justify-end gap-1">
                        <CheckCircle2 size={14} />
                        已完成
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
