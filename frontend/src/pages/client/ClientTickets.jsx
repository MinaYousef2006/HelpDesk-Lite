import { useEffect, useState } from 'react';
import { ticketAPI } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import TicketTable from '../../components/TicketTable';
import TicketFilters from '../../components/TicketFilters';
import Pagination from '../../components/ui/Pagination';
import FAQSidebar from '../../components/FAQSidebar';

const ClientTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', page: 1, limit: 10, sort: 'desc' });
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
  }, [debouncedSearch, filters.status, filters.page, filters.sort]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">My Tickets</h1>
        <p className="text-slate-500 mt-1">View and track all your support requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card">
            <TicketFilters filters={filters} onChange={setFilters} showAllFilters={false} />
            <TicketTable
              tickets={tickets}
              loading={loading}
              ticketLinkPrefix="/client/tickets"
            />
            <Pagination
              page={filters.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setFilters({ ...filters, page })}
            />
          </div>
        </div>
        <div>
          <FAQSidebar />
        </div>
      </div>
    </div>
  );
};

export default ClientTickets;
