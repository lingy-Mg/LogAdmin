/**
 * 字符串处理工具函数
 */

/**
 * 转义正则表达式特殊字符
 */
export function escapeRegExp(str = '') {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * 转义 HTML 特殊字符
 */
export function escapeHtml(str = '') {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 高亮关键词
 */
export function highlightKeyword(text, keyword) {
  if (!keyword || !text) return escapeHtml(text)
  
  const escapedKeyword = escapeRegExp(keyword)
  const regex = new RegExp(`(${escapedKeyword})`, 'gi')
  
  return escapeHtml(text).replace(regex, '<mark>$1</mark>')
}

/**
 * 截断字符串
 */
export function truncate(str, maxLength = 50) {
  if (!str || str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

export default {
  escapeRegExp,
  escapeHtml,
  highlightKeyword,
  truncate
}
