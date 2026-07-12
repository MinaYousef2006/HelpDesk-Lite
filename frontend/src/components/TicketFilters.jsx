import { Search, Filter } from 'lucide-react';
import { CATEGORIES, URGENCY_LEVELS, STATUSES } from '../utils/constants';

const TicketFilters = ({ filters, onChange, showAllFilters = true }) => {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by ticket ID or title..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="input-field pl-9"
        />
      </div>
      {showAllFilters && (
        <>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select
              value={filters.status || ''}
              onChange={(e) => handleChange('status', e.target.value)}
              className="input-field pl-9 pr-8 appearance-none min-w-[140px]"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <select
            value={filters.category || ''}
            onChange={(e) => handleChange('category', e.target.value)}
            className="input-field min-w-[140px]"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={filters.urgency || ''}
            onChange={(e) => handleChange('urgency', e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="">All Urgency</option>
            {URGENCY_LEVELS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
          <select
            value={filters.sort || 'desc'}
            onChange={(e) => handleChange('sort', e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </>
      )}
    </div>
  );
};

export default TicketFilters;
