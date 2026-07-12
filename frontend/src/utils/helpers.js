export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatRelativeDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'Just now';
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const getRoleDashboard = (role) => {
  switch (role) {
    case 'Client':
      return '/client/dashboard';
    case 'Support_Agent':
      return '/agent/dashboard';
    case 'Manager':
      return '/manager/dashboard';
    default:
      return '/login';
  }
};

export const getRoleLabel = (role) => {
  switch (role) {
    case 'Client':
      return 'Client';
    case 'Support_Agent':
      return 'Support Agent';
    case 'Manager':
      return 'Manager';
    default:
      return role;
  }
};
