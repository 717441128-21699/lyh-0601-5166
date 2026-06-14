import { useEffect, useState } from 'react';
import { Package, AlertTriangle, CheckCircle2, Plus, Search, Filter, Ruler, DollarSign, Package as PackageIcon } from 'lucide-react';
import { api } from '@/utils/api';
import { formatCurrency, getStatusLabel } from '@/utils/format';
import type { MaterialItem } from '../../shared/types';

export default function Materials() {
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
                    <button className="btn-primary text-sm py-1.5 px-3">申请采购</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
