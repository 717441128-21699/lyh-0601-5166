import { useEffect, useState } from 'react';
import { ShoppingCart, User, CheckCircle2, XCircle, Clock, Eye, AlertTriangle } from 'lucide-react';
import { api } from '@/utils/api';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/format';
import { useAppStore } from '@/store';
import type { PurchaseOrder } from '../../shared/types';

const statusStep = {
  pending: 0,
  supervisor_approved: 1,
  owner_approved: 2,
  completed: 3,
  rejected: -1,
};

export default function PurchaseOrders() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const { currentUser } = useAppStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await api.get<PurchaseOrder[]>('/api/materials/purchase-orders');
      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (order: PurchaseOrder, approved: boolean) => {
    try {
      const approverRole = currentUser?.role === 'owner' || currentUser?.role === 'admin' ? 'owner' : 'supervisor';
      await api.put(`/api/materials/purchase-orders/${order.id}/approve`, {
        approverRole,
        approverId: currentUser?.id,
        rejectionReason: !approved ? rejectionReason : undefined,
      });
      await fetchOrders();
      setSelectedOrder(null);
      setRejectionReason('');
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

  const pendingCount = orders.filter((o) => o.status === 'pending' || o.status === 'supervisor_approved').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">采购审批</h1>
          <p className="text-sm text-slate-500 mt-1">材料采购单两级审批流程</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-50 text-accent-700">
            <Clock size={16} />
            <span className="text-sm font-medium">{pendingCount} 项待审批</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {orders.map((order, index) => {
          const currentStep = statusStep[order.status];
          return (
            <div
              key={order.id}
              className="card p-5 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    order.status === 'rejected' ? 'bg-red-100' : order.status === 'completed' ? 'bg-green-100' : 'bg-primary-100'
                  }`}>
                    <ShoppingCart size={22} className={`${
                      order.status === 'rejected' ? 'text-red-600' : order.status === 'completed' ? 'text-green-600' : 'text-primary-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800">{order.materialName}</p>
                      <span className={`badge status-${order.status}`}>{getStatusLabel(order.status)}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      采购单号: {order.id.toUpperCase()} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">采购金额</p>
                  <p className="text-xl font-bold text-primary-600 font-mono">{formatCurrency(order.totalPrice)}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-5 p-4 rounded-xl bg-slate-50">
                <div>
                  <p className="text-xs text-slate-500 mb-1">采购数量</p>
                  <p className="font-semibold text-slate-700 font-mono">{order.quantity} 单位</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">申请人</p>
                  <p className="font-semibold text-slate-700 flex items-center gap-1">
                    <User size={13} className="text-slate-400" />
                    {order.applicantName || '监理'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">单价</p>
                  <p className="font-semibold text-slate-700 font-mono">
                    {formatCurrency(Math.round(order.totalPrice / order.quantity))}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {['监理审批', '业主审批', '采购完成'].map((step, i) => {
                    const isDone = currentStep > i || (order.status === 'rejected' && i === 0);
                    const isCurrent = currentStep === i;
                    const isRejected = order.status === 'rejected';
                    return (
                      <div key={step} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                          isRejected && i === 0
                            ? 'bg-red-500 text-white'
                            : isDone
                            ? 'bg-green-500 text-white'
                            : isCurrent
                            ? 'bg-primary-500 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {isRejected && i === 0 ? <XCircle size={14} /> : isDone ? <CheckCircle2 size={14} /> : i + 1}
                        </div>
                        <span className={`text-sm ${isDone || isCurrent ? 'text-slate-700' : 'text-slate-400'}`}>{step}</span>
                        {i < 2 && <div className={`w-10 h-0.5 ${isDone ? 'bg-green-500' : 'bg-slate-200'}`} />}
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  {order.rejectionReason && (
                    <span className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      拒绝原因: {order.rejectionReason}
                    </span>
                  )}
                  {(order.status === 'pending' && (currentUser?.role === 'supervisor' || currentUser?.role === 'admin')) ||
                   (order.status === 'supervisor_approved' && (currentUser?.role === 'owner' || currentUser?.role === 'admin')) ? (
                    <>
                      <button className="btn-danger flex items-center gap-2 text-sm py-1.5 px-3" onClick={() => setSelectedOrder(order)}>
                        <XCircle size={14} />
                        拒绝
                      </button>
                      <button className="btn-primary flex items-center gap-2 text-sm py-1.5 px-3" onClick={() => handleApprove(order, true)}>
                        <CheckCircle2 size={14} />
                        审批通过
                      </button>
                    </>
                  ) : (
                    <button className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
                      <Eye size={14} />
                      查看详情
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-xl font-bold text-slate-800 mb-4">拒绝采购申请</h3>
            <p className="text-sm text-slate-600 mb-5">请填写拒绝 <span className="font-medium">{selectedOrder.materialName}</span> 采购申请的原因</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="请输入拒绝原因..."
              className="input-base h-28 resize-none mb-5"
            />
            <div className="flex gap-3">
              <button className="flex-1 btn-secondary" onClick={() => { setSelectedOrder(null); setRejectionReason(''); }}>
                取消
              </button>
              <button className="flex-1 btn-danger" onClick={() => handleApprove(selectedOrder, false)} disabled={!rejectionReason}>
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
