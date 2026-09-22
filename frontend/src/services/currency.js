export function formatCurrency(value) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 }).format(Number(value || 0));
}

export function resolveMediaUrl(url) {
  if (!url || !url.startsWith('/uploads/')) return url;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
  return `${baseUrl.replace(/\/api\/v1\/?$/, '')}${url}`;
}
