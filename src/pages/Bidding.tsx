import { useEffect, useState } from 'react';
import { Gavel, Clock, Building2, CheckCircle, XCircle, ChevronRight, Award, FileCheck, CreditCard, Calendar, DollarSign, X, CheckCircle2 } from 'lucide-react';
import { api } from '@/utils/api';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/format';
import { useAppStore } from '@/store';
import type { Bid, Project } from '../../shared/types';

type SignStep = 'confirm' | 'sign' | 'pay' | 'done';

export default function Bidding() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [signStep, setSignStep] = useState<SignStep>('confirm');
  const [createdProject, setCreatedProject] = useState<Project | null>(null);
  const [processing, setProcessing] = useState(false);
  const { currentUser } = useAppStore();

  useEffect(() => {
    fetchBids();
  }, [currentUser]);

  const fetchBids = async () => {
    try {
      const params = new URLSearchParams();
      if (currentUser?.role === 'owner') {
        params.append('ownerId', currentUser.id);
      }
      const queryString = params.toString();
      const data = await api.get<Bid[]>(`/api/bids${queryString ? `?${queryString}` : ''}`);
      setBids(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBid = async (bid: Bid) => {
    setProcessing(true);
    try {
      const res = await api.put<{ bid: Bid; project: Project }>(`/api/bids/${bid.id}/select`);
      setCreatedProject(res.project);
      setSelectedBid(bid);
      setSignStep('sign');
      await fetchBids();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmSign = async () => {
    if (!selectedBid || !createdProject) return;
    setProcessing(true);
    try {
      await api.put(`/api/bids/${selectedBid.id}/sign-and-pay`, {
        bidId: selectedBid.id,
        projectId: createdProject.id,
      });
      setSignStep('done');
      await fetchBids();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessing(false);
    }
  };

  const closeModal = () => {
    setSelectedBid(null);
    setSignStep('confirm');
    setCreatedProject(null);
  };

  const groupedBids = bids.reduce((acc, bid) => {
    if (!acc[bid.applicationId]) {
      acc[bid.applicationId] = [];
    }
    acc[bid.applicationId].push(bid);
    return acc;
  }, {} as Record<string, Bid[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">在线竞标</h1>
        <p className="text-sm text-slate-500 mt-1">装修公司在线投标，业主对比选择后签约</p>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedBids).map(([appId, appBids], groupIndex) => {
          const hasSelected = appBids.some((b) => b.status === 'selected');
          const selectedBidItem = appBids.find((b) => b.status === 'selected');
          
          return (
            <div key={appId} className="card p-6 animate-slide-up" style={{ animationDelay: `${groupIndex * 100}ms` }}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Gavel size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-slate-800">项目竞标 - 申请{appId.toUpperCase()}</h2>
                    <p className="text-sm text-slate-500">
                      共 {appBids.length} 家公司投标 · {hasSelected ? '已确定中标' : '竞标进行中'}
                    </p>
                  </div>
                </div>
                {selectedBidItem && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                    <Award size={18} className="text-green-600" />
                    <span className="text-sm font-medium text-green-700">中标: {selectedBidItem.companyName}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {appBids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`relative p-5 rounded-xl border-2 transition-all duration-200 ${
                      bid.status === 'selected'
                        ? 'border-primary-500 bg-primary-50/50 shadow-lg'
                        : bid.status === 'rejected'
                        ? 'border-slate-100 bg-slate-50 opacity-60'
                        : 'border-slate-200 hover:border-primary-300 hover:shadow-md cursor-pointer'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => !hasSelected && bid.status === 'pending' && setSelectedBid(bid)}
                  >
                    {bid.status === 'selected' && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center shadow-md">
                        <CheckCircle size={18} className="text-white" />
                      </div>
                    )}
                    {bid.status === 'rejected' && (
                      <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-400 flex items-center justify-center shadow-md">
                        <XCircle size={18} className="text-white" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl">
                        {bid.companyLogo}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{bid.companyName}</p>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={11} />
                          {formatDate(bid.createdAt)}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">{bid.description}</p>

                    <div className="flex items-end justify-between pt-4 border-t border-slate-100">
                      <div>
                        <p className="text-xs text-slate-500">投标报价</p>
                        <p className="text-2xl font-bold text-primary-600 font-mono">{formatCurrency(bid.price)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">施工周期</p>
                        <p className="text-lg font-semibold text-slate-700 font-mono">{bid.duration} 天</p>
                      </div>
                    </div>

                    {!hasSelected && bid.status === 'pending' && (
                      <button
                        className="w-full mt-4 btn-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBid(bid);
                        }}
                      >
                        选择该公司
                      </button>
                    )}
                    {bid.status === 'rejected' && (
                      <div className="w-full mt-4 py-2 text-center text-sm text-slate-500">
                        未中标
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {Object.keys(groupedBids).length === 0 && (
          <div className="card p-12 text-center">
            <Gavel size={48} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">暂无竞标记录</p>
          </div>
        )}
      </div>

      {selectedBid && signStep === 'confirm' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
            <h3 className="text-xl font-bold text-slate-800 mb-4">确认选择装修公司</h3>
            <div className="p-4 rounded-xl bg-slate-50 mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-xl">
                  {selectedBid.companyLogo}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{selectedBid.companyName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">报价</p>
                  <p className="font-semibold text-primary-600 font-mono">{formatCurrency(selectedBid.price)}</p>
                </div>
                <div>
                  <p className="text-slate-500">周期</p>
                  <p className="font-semibold text-slate-700 font-mono">{selectedBid.duration} 天</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-5">
              确认选择后将生成项目并进入签约阶段，其他竞标公司将被标记为未中标。
            </p>
            <div className="flex gap-3">
              <button className="flex-1 btn-secondary" onClick={closeModal}>
                取消
              </button>
              <button
                className="flex-1 btn-primary"
                onClick={() => handleSelectBid(selectedBid)}
                disabled={processing}
              >
                {processing ? '处理中...' : '确认选择'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBid && signStep === 'sign' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white">
              <div className="flex items-center gap-2">
                <FileCheck size={20} className="text-primary-600" />
                <h3 className="text-lg font-bold text-slate-800">在线签约</h3>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-center gap-2 mb-2">
                {['确认选择', '在线签约', '支付定金', '完成'].map((step, i) => {
                  const stepIdx = ['confirm', 'sign', 'pay', 'done'].indexOf(signStep);
                  const done = i < stepIdx;
                  const current = i === stepIdx;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                        done ? 'bg-green-500 text-white' : current ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {done ? <CheckCircle2 size={14} /> : i + 1}
                      </div>
                      <span className={`text-xs ${done || current ? 'text-slate-700' : 'text-slate-400'}`}>{step}</span>
                      {i < 3 && <div className={`w-6 h-0.5 ${done ? 'bg-green-500' : 'bg-slate-200'}`} />}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">甲方（业主）</span>
                  <span className="font-medium text-slate-800">{createdProject?.ownerName || '业主'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">乙方（装修公司）</span>
                  <span className="font-medium text-slate-800">{selectedBid.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Building2 size={12} />
                    施工地址
                  </span>
                  <span className="font-medium text-slate-800">
                    {createdProject?.houseInfo.community} {createdProject?.houseInfo.houseType}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar size={12} />
                    施工周期
                  </span>
                  <span className="font-medium text-slate-800">
                    {createdProject ? formatDate(createdProject.startDate) : ''} 至 {createdProject ? formatDate(createdProject.estimatedEndDate) : ''}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                  <span className="text-slate-500 flex items-center gap-1">
                    <DollarSign size={12} />
                    合同总金额
                  </span>
                  <span className="text-xl font-bold text-primary-600 font-mono">
                    {formatCurrency(selectedBid.price)}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                <p className="text-xs text-blue-700">
                  <strong>合同条款摘要：</strong>乙方应按质按期完成装修工程，甲方按进度支付款项。
                  工程质保期2年，水电工程质保5年。变更需双方书面确认。
                </p>
              </div>

              <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-0.5 accent-primary-500" />
                <span>我已阅读并同意《装修工程施工合同》全部条款</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl sticky bottom-0">
              <button onClick={closeModal} className="btn-secondary">
                稍后再签
              </button>
              <button
                onClick={() => setSignStep('pay')}
                className="btn-primary flex items-center gap-2"
              >
                <FileCheck size={16} />
                确认签约
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBid && signStep === 'pay' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CreditCard size={20} className="text-primary-600" />
                <h3 className="text-lg font-bold text-slate-800">支付定金</h3>
              </div>
              <button onClick={closeModal} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-center gap-2 mb-2">
                {['确认选择', '在线签约', '支付定金', '完成'].map((step, i) => {
                  const stepIdx = ['confirm', 'sign', 'pay', 'done'].indexOf(signStep);
                  const done = i < stepIdx;
                  const current = i === stepIdx;
                  return (
                    <div key={step} className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                        done ? 'bg-green-500 text-white' : current ? 'bg-primary-500 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {done ? <CheckCircle2 size={14} /> : i + 1}
                      </div>
                      <span className={`text-xs ${done || current ? 'text-slate-700' : 'text-slate-400'}`}>{step}</span>
                      {i < 3 && <div className={`w-6 h-0.5 ${done ? 'bg-green-500' : 'bg-slate-200'}`} />}
                    </div>
                  );
                })}
              </div>

              <div className="p-5 rounded-xl bg-gradient-to-br from-primary-50 to-primary-100/50 text-center">
                <p className="text-sm text-slate-600 mb-2">定金金额（合同总额20%）</p>
                <p className="text-4xl font-bold text-primary-700 font-mono">
                  {formatCurrency(Math.round(selectedBid.price * 0.2))}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">选择支付方式</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '微信支付', icon: '💚' },
                    { label: '支付宝', icon: '💙' },
                    { label: '银行卡', icon: '💳' },
                  ].map((m, idx) => (
                    <button
                      key={m.label}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        idx === 0 ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <p className="text-xs text-slate-700">{m.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <button onClick={() => setSignStep('sign')} className="btn-secondary">
                返回
              </button>
              <button
                onClick={handleConfirmSign}
                disabled={processing}
                className="btn-primary flex items-center gap-2"
              >
                <CreditCard size={16} />
                {processing ? '支付中...' : '确认支付'}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedBid && signStep === 'done' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md text-center animate-slide-up">
            <div className="p-8">
              <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4 animate-bounce-in">
                <CheckCircle2 size={40} className="text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">签约支付成功！</h3>
              <p className="text-sm text-slate-500 mb-5">
                施工档期已锁定，项目已自动创建并分配监理
              </p>
              {createdProject && (
                <div className="p-4 rounded-xl bg-slate-50 text-left space-y-2 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">项目编号</span>
                    <span className="font-mono font-medium text-slate-800">{createdProject.id.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">开工日期</span>
                    <span className="font-medium text-slate-800">{formatDate(createdProject.startDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">预计竣工</span>
                    <span className="font-medium text-slate-800">{formatDate(createdProject.estimatedEndDate)}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="text-slate-500">已支付定金</span>
                    <span className="font-bold text-primary-600 font-mono">
                      {formatCurrency(Math.round(selectedBid.price * 0.2))}
                    </span>
                  </div>
                </div>
              )}
              <button onClick={closeModal} className="btn-primary w-full">
                查看项目列表
                <ChevronRight size={16} className="inline" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
