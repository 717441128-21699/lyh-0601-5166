import { useEffect, useState } from 'react';
import { Settings, AlertTriangle, Clock, PackageCheck, Save, RefreshCw, Info } from 'lucide-react';
import { api } from '@/utils/api';
import type { SystemSettings } from '../../shared/types';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await api.get<SystemSettings>('/api/settings');
      setSettings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await api.put('/api/settings', settings);
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2000);
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-800">规则配置</h1>
          <p className="text-sm text-slate-500 mt-1">配置系统业务规则和自动化参数</p>
        </div>
        <div className="flex items-center gap-3">
          {savedMsg && (
            <span className="text-sm text-green-600 flex items-center gap-1 animate-fade-in">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              保存成功
            </span>
          )}
          <button className="btn-secondary flex items-center gap-2" onClick={fetchSettings}>
            <RefreshCw size={16} />
            重置
          </button>
          <button
            className="btn-primary flex items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={16} />
            {saving ? '保存中...' : '保存配置'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 animate-slide-up">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">预算预警阈值</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                当实际费用超出预算此比例时，自动推送业主确认
              </p>
            </div>
          </div>
          {settings && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">预警比例</label>
                  <span className="text-lg font-bold text-red-600 font-mono">
                    {settings.budgetWarningThreshold}%
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={settings.budgetWarningThreshold}
                  onChange={(e) =>
                    setSettings({ ...settings, budgetWarningThreshold: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1%</span>
                  <span>15%</span>
                  <span>30%</span>
                </div>
              </div>
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
                <Info size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-700">
                  当前设置：超出预算 <span className="font-bold">{settings.budgetWarningThreshold}%</span> 时，
                  系统将自动向业主发送预警通知并暂停后续采购审批。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 animate-slide-up" style={{ animationDelay: '80ms' }}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
              <Clock size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">自动验收时效</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                工序完成后业主未验收，超此时长自动默认通过
              </p>
            </div>
          </div>
          {settings && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">超时时间（小时）</label>
                  <span className="text-lg font-bold text-primary-600 font-mono">
                    {settings.autoAcceptHours} 小时
                  </span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="120"
                  step="6"
                  value={settings.autoAcceptHours}
                  onChange={(e) =>
                    setSettings({ ...settings, autoAcceptHours: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>12h</span>
                  <span>60h</span>
                  <span>120h</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[24, 36, 48, 72].map((h) => (
                  <button
                    key={h}
                    onClick={() => setSettings({ ...settings, autoAcceptHours: h })}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      settings.autoAcceptHours === h
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
              <div className="p-3 bg-primary-50 border border-primary-100 rounded-xl flex items-start gap-2">
                <Info size={16} className="text-primary-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-primary-700">
                  工序完成后 <span className="font-bold">{settings.autoAcceptHours} 小时</span> 内，
                  若业主未进行验收操作，系统将自动标记为验收通过并记录默认评分 4.0。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 animate-slide-up" style={{ animationDelay: '160ms' }}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center flex-shrink-0">
              <PackageCheck size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">材料安全库存系数</h3>
              <p className="text-sm text-slate-500 mt-0.5">
                当前库存低于需求量此系数时，自动触发采购预警
              </p>
            </div>
          </div>
          {settings && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-700">安全系数</label>
                  <span className="text-lg font-bold text-amber-600 font-mono">
                    {(settings.materialSafetyStockRatio * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.05"
                  value={settings.materialSafetyStockRatio}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      materialSafetyStockRatio: Number(e.target.value),
                    })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>10%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.2, 0.3, 0.4, 0.5].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSettings({ ...settings, materialSafetyStockRatio: r })}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      Math.abs(settings.materialSafetyStockRatio - r) < 0.001
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {(r * 100).toFixed(0)}%
                  </button>
                ))}
              </div>
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
                <Info size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  当材料库存 低于 需求量 的 <span className="font-bold">{(settings.materialSafetyStockRatio * 100).toFixed(0)}%</span> 时，
                  系统将自动生成采购申请并推送至项目监理审批。
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 animate-slide-up" style={{ animationDelay: '240ms' }}>
          <div className="flex items-start gap-4 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center flex-shrink-0">
              <Settings size={22} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">系统规则说明</h3>
              <p className="text-sm text-slate-500 mt-0.5">了解各项配置的工作机制</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-800 mb-1">🔄 数据刷新机制</p>
              <p className="text-xs text-slate-500">
                首页大屏数据每 10 秒自动刷新，实时同步项目进度、材料库存和施工状态。
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-800 mb-1">✅ 两级审批流程</p>
              <p className="text-xs text-slate-500">
                采购单需经项目监理审批后，再推送业主最终确认方可生效。变更申请同样遵循此流程。
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-sm font-medium text-slate-800 mb-1">📊 月度报告</p>
              <p className="text-xs text-slate-500">
                支持按小区、户型、日期范围筛选数据，一键导出项目分析报告（含进度、成本、满意度维度）。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
