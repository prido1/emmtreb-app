// Format currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);
};

// Format date
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format date with time
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get status badge class
export const getStatusBadgeClass = (status) => {
  const statusMap = {
    pending: 'status-pending',
    paid: 'status-paid',
    activated: 'status-activated',
    declined: 'status-declined',
    cancelled: 'status-cancelled',
    completed: 'status-paid',
    failed: 'status-declined',
  };
  return statusMap[status?.toLowerCase()] || 'bg-secondary';
};

// Get payment method badge class
export const getPaymentMethodBadgeClass = (method) => {
  return method === 'wallet' ? 'bg-info' : 'bg-primary';
};

// Calculate profit
export const calculateProfit = (sellingPrice, basePrice) => {
  const profit = (sellingPrice - basePrice).toFixed(2);
  const profitPercent = ((profit / basePrice) * 100).toFixed(1);
  return { profit, profitPercent };
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};
