import { STATUS_COLORS, URGENCY_COLORS } from '../../utils/constants';

export const StatusBadge = ({ status }) => (
  <span className={`badge ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-600'}`}>
    {status}
  </span>
);

export const UrgencyBadge = ({ urgency }) => (
  <span className={`badge ${URGENCY_COLORS[urgency] || 'bg-slate-100 text-slate-600'}`}>
    {urgency}
  </span>
);
