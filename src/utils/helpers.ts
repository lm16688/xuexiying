// 工具函数

// 生成唯一ID
export const generateId = () => Math.random().toString(36).substr(2, 9);

// 格式化日期
export const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// 格式化日期时间
export const formatDateTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 格式化文件大小
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取文件图标颜色
export const getFileIconColor = (type: string) => {
  if (type.startsWith('image/')) return '#7b9e87';
  if (type === 'application/pdf') return '#e74c3c';
  if (type.includes('word') || type.includes('document')) return '#3498db';
  if (type.includes('excel') || type.includes('sheet')) return '#27ae60';
  if (type.includes('powerpoint') || type.includes('presentation')) return '#e67e22';
  return '#a6857b';
};

// 获取文件类型名称
export const getFileTypeName = (type: string) => {
  if (type.startsWith('image/')) return '图片';
  if (type === 'application/pdf') return 'PDF';
  if (type.includes('word') || type.includes('document')) return 'Word';
  if (type.includes('excel') || type.includes('sheet')) return 'Excel';
  if (type.includes('powerpoint') || type.includes('presentation')) return 'PPT';
  return '文件';
};

// 检查作业是否逾期
export const isOverdue = (deadline: number) => {
  return Date.now() > deadline;
};

// 获取剩余时间文本
export const getRemainingTime = (deadline: number) => {
  const now = Date.now();
  const diff = deadline - now;
  
  if (diff <= 0) return '已逾期';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `还剩 ${days} 天`;
  if (hours > 0) return `还剩 ${hours} 小时`;
  return '即将截止';
};

// 延迟函数
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
