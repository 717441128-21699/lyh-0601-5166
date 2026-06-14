export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('zh-CN').format(num);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: '待处理',
    bidding: '竞标中',
    signed: '已签约',
    constructing: '施工中',
    accepting: '待验收',
    completed: '已完成',
    in_progress: '进行中',
    accepted: '已验收',
    normal: '正常',
    warning: '预警',
    shortage: '缺货',
    supervisor_approved: '监理已批',
    owner_approved: '业主已批',
    rejected: '已拒绝',
    paid: '已支付',
    overdue: '已逾期',
    approved: '已批准',
  };
  return labels[status] || status;
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    owner: '业主',
    worker: '施工队',
    supervisor: '项目监理',
    admin: '管理员',
  };
  return labels[role] || role;
};
