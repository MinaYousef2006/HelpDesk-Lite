import { useEffect, useState } from 'react';
import { ticketAPI } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import TicketTable from '../../components/TicketTable';
import TicketFilters from '../../components/TicketFilters';
import Pagination from '../../components/ui/Pagination';

const ManagerTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category: '',
    urgency: '',
    page: 1,
    limit: 10,
    sort: 'desc',
  });
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const debouncedSearch = useDebounce(filters.search);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const params = { ...filters, search: debouncedSearch };
        Object.keys(params).forEach((k) => !params[k] && delete params[k]);
        const { data } = await ticketAPI.getAll(params);
        setTickets(data.tickets);
        setPagination(data.pagination);
      } catch {
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [debouncedSearch, filters.status, filters.category, filters.urgency, filters.page, filters.sort]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">All Tickets</h1>
        <p className="text-slate-500 mt-1">View, filter, and manage all support tickets</p>
      </div>

      <div className="card">
        <TicketFilters filters={filters} onChange={setFilters} />
        <TicketTable
          tickets={tickets}
          loading={loading}
          ticketLinkPrefix="/manager/tickets"
          showClient
        />
        <Pagination
          page={filters.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setFilters({ ...filters, page })}
        />
      </div>
    </div>
  );
};

export default ManagerTickets;
