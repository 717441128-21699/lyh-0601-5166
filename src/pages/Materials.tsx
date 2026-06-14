import { useEffect, useState } from 'react';
import { Package, AlertTriangle, CheckCircle2, Plus, Search, Filter, Ruler, DollarSign, Package as PackageIcon, X } from 'lucide-react';
import { api } from '@/utils/api';
import { formatCurrency, getStatusLabel } from '@/utils/format';
import { useAppStore } from '@/store';
import type { MaterialItem } from '../../shared/types';

export default function Materials() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialItem | null>(null);
  const [purchaseQuantity, setPurchaseQuantity] = useState(0);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser } = useAppStore();

  useEffect(() => {
    fetchMaterials();
  }, [statusFilter]);

  const fetchMaterials = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const data = await api.get<MaterialItem[]>(`/api/materials${params}`);
      setMaterials(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPurchaseModal = (material: MaterialItem) => {
    const defaultQuantity = Math.max(material.safeStock - material.currentStock, 10);
    setSelectedMaterial(material);
    setPurchaseQuantity(defaultQuantity);
    setShowPurchaseModal(true);
  };

  const handleClosePurchaseModal = () => {
    setSelectedMaterial(null);
    setShowPurchaseModal(false);
    setPurchaseQuantity(0);
  };

  const handleSubmitPurchase = async () => {
    if (!selectedMaterial || purchaseQuantity <= 0) return;
    
    setSubmitting(true);
    try {
      await api.post('/api/materials/purchase-orders', {
        materialId: selectedMaterial.id,
        materialName: selectedMaterial.name,
        quantity: purchaseQuantity,
        totalPrice: purchaseQuantity * selectedMaterial.unitPrice,
        applicantId: currentUser?.id,
        applicantName: currentUser?.name,
      });
      
      setSuccessMessage(`${selectedMaterial.name} 采购申请已提交`);
      handleClosePurchaseModal();
      await fetchMaterials();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredMaterials = materials.filter(
    (m) => !searchText || m.name.includes(searchText) || m.specification.includes(searchText)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const warningCount = materials.filter((m) => m.status !== 'normal').length;
  const shortageCount = materials.filter((m) => m.status === 'shortage').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">材料管控</h1>
          <p className="text-sm text-slate-500 mt-1">管理材料库存，自动预警和采购</p>
        </div>
        <div className="flex items-center gap-3">
          {warningCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 text-yellow-700">
              <AlertTriangle size={16} />
              <span className="text-sm font-medium">{warningCount} 项预警 · {shortageCount} 项缺货</span>
            </div>
          )}
          <button className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            新增材料
          </button>
        </div>
      </div>

      <div className="card p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[250px] max-w-md">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索材料名称或规格..."
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
            <option value="normal">正常</option>
            <option value="warning">预警</option>
            <option value="shortage">缺货</option>
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
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">材料信息</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">规格</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">库存/需求</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">安全线</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">单价</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-600 uppercase">状态</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-slate-600 uppercase">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredMaterials.map((material, index) => (
              <tr
                key={material.id}
                className={`border-b border-slate-50 transition-colors animate-slide-up ${
                  material.status !== 'normal' ? 'bg-yellow-50/30 hover:bg-yellow-50/50' : 'hover:bg-slate-50/50'
                }`}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      material.status === 'shortage' ? 'bg-red-100' : material.status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
                    }`}>
                      <PackageIcon size={18} className={`${
                        material.status === 'shortage' ? 'text-red-600' : material.status === 'warning' ? 'text-yellow-600' : 'text-green-600'
                      }`} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{material.name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-600">{material.specification}</span>
                </td>
                <td className="px-5 py-4">
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Ruler size={12} className="text-slate-400" />
                      <span className={`text-sm font-semibold font-mono ${
                        material.currentStock < material.requiredQuantity ? 'text-red-600' : 'text-slate-700'
                      }`}>
                        {material.currentStock}
                      </span>
                      <span className="text-slate-400">/</span>
                      <span className="text-sm text-slate-500 font-mono">{material.requiredQuantity}</span>
                      <span className="text-xs text-slate-400">{material.unit}</span>
                    </div>
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          (material.currentStock / material.requiredQuantity) < 0.5 ? 'bg-red-500' : (material.currentStock / material.requiredQuantity) < 1 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((material.currentStock / material.requiredQuantity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-sm font-mono text-slate-600">{material.safeStock} {material.unit}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    <DollarSign size={12} className="text-slate-400" />
                    <span className="text-sm font-semibold font-mono text-slate-700">{formatCurrency(material.unitPrice)}</span>
                    <span className="text-xs text-slate-400">/{material.unit}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`badge status-${material.status}`}>
                    {material.status === 'shortage' ? (
                      <span className="flex items-center gap-1">
                        <AlertTriangle size={10} />
                        缺货
                      </span>
                    ) : (
                      getStatusLabel(material.status)
                    )}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  {material.status !== 'normal' && (
                    <button 
                      className="btn-primary text-sm py-1.5 px-3"
                      onClick={() => handleOpenPurchaseModal(material)}
                    >
                      申请采购
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {successMessage && (
        <div className="fixed top-6 right-6 z-50 animate-slide-up">
          <div className="flex items-center gap-3 px-5 py-3 bg-green-50 border border-green-200 rounded-xl shadow-lg">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 size={16} className="text-green-600" />
            </div>
            <span className="font-medium text-green-800">{successMessage}</span>
          </div>
        </div>
      )}

      {showPurchaseModal && selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-800">申请采购</h3>
              <button
                onClick={handleClosePurchaseModal}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50">
                <div>
                  <p className="text-xs text-slate-500 mb-1">材料名称</p>
                  <p className="font-semibold text-slate-800">{selectedMaterial.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">规格</p>
                  <p className="font-semibold text-slate-800">{selectedMaterial.specification}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">当前库存</p>
                  <p className="font-semibold text-slate-800 font-mono">
                    {selectedMaterial.currentStock} {selectedMaterial.unit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">需求数量</p>
                  <p className="font-semibold text-slate-800 font-mono">
                    {selectedMaterial.requiredQuantity} {selectedMaterial.unit}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  采购数量 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={purchaseQuantity}
                    onChange={(e) => setPurchaseQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="input-base flex-1"
                    placeholder="请输入采购数量"
                  />
                  <span className="text-sm text-slate-500">{selectedMaterial.unit}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  单价: {formatCurrency(selectedMaterial.unitPrice)}/{selectedMaterial.unit}
                  {purchaseQuantity > 0 && (
                    <span className="ml-3 font-medium text-primary-600">
                      预计总价: {formatCurrency(purchaseQuantity * selectedMaterial.unitPrice)}
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 btn-secondary"
                onClick={handleClosePurchaseModal}
                disabled={submitting}
              >
                取消
              </button>
              <button
                className="flex-1 btn-primary"
                onClick={handleSubmitPurchase}
                disabled={submitting || purchaseQuantity <= 0}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    提交中...
                  </span>
                ) : (
                  '确认申请'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
