import { useEffect, useState } from 'react';
import { Gavel, Clock, Building2, CheckCircle, XCircle, ChevronRight, Award } from 'lucide-react';
import { api } from '@/utils/api';
import { formatCurrency, formatDate, getStatusLabel } from '@/utils/format';
import type { Bid } from '../../shared/types';

export default function Bidding() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const data = await api.get<Bid[]>('/api/bids');
      setBids(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBid = async (bid: Bid) => {
    try {
      await api.put(`/api/bids/${bid.id}/select`);
      await fetchBids();
      setSelectedBid(null);
    } catch (error) {
      console.error(error);
    }
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
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedBid && (
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
              <button className="flex-1 btn-secondary" onClick={() => setSelectedBid(null)}>
                取消
              </button>
              <button className="flex-1 btn-primary" onClick={() => handleSelectBid(selectedBid)}>
                确认选择
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
