export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return date.toLocaleDateString('zh-CN');
};

export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatMoney = (amount: number): string => {
  return `¥${amount.toFixed(2)}`;
};

export const getOrderStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待接单',
    accepted: '已接单',
    picked: '已取货',
    delivering: '配送中',
    completed: '已完成',
    cancelled: '已取消',
    disputed: '争议中',
  };
  return statusMap[status] || status;
};

export const getOrderStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: 'bg-warning text-yellow-800',
    accepted: 'bg-info text-white',
    picked: 'bg-secondary-500 text-white',
    delivering: 'bg-primary-500 text-white',
    completed: 'bg-success text-white',
    cancelled: 'bg-gray-400 text-white',
    disputed: 'bg-danger text-white',
  };
  return colorMap[status] || 'bg-gray-400 text-white';
};

export const getOrderTypeText = (type: string): string => {
  return type === 'express' ? '代取快递' : '跑腿代买';
};
