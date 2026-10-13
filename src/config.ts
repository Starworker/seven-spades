export const site = {
  name: '黑桃七', englishName: 'SEVEN SPADES', author: '黑桃七',
  description: '把复杂的工具，讲成可以照着做的教程。代理 IP、网络检测、浏览器指纹与跨境电商工具的实用指南。',
  email: '', github: '', videoChannel: '',
};
export const categories = [
  { id: 'proxy-ip', name: '代理 IP', icon: '↗', color: 'blue', description: '从协议选择到连接验证，理解代理的工作方式。' },
  { id: 'network-check', name: '网络检测', icon: '⌁', color: 'green', description: '检查出口、延迟与 DNS，让网络问题有迹可循。' },
  { id: 'browser-fingerprint', name: '浏览器指纹', icon: '◎', color: 'purple', description: '认识浏览器环境，读懂指纹检测结果。' },
  { id: 'ecommerce-tools', name: '跨境电商工具', icon: '▦', color: 'orange', description: '用清晰的流程，搭建更顺手的日常工作环境。' },
] as const;
export function url(path = '') {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
export function dateLabel(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date);
}
