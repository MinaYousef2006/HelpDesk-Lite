import { useEffect, useState } from 'react';
import { ticketAPI } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import TicketTable from '../../components/TicketTable';
import TicketFilters from '../../components/TicketFilters';
import Pagination from '../../components/ui/Pagination';
import toast from 'react-hot-toast';

const AgentTickets = () => {
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
    agent_id: 'me',
  });
  const [pagination, setPagination] = useState({ totalPages: 1 });
  const [view, setView] = useState('active');

  const debouncedSearch = useDebounce(filters.search);

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      try {
        const params = { ...filters, search: debouncedSearch };
        if (view === 'unassigned') {
          delete params.agent_id;
          params.unassigned = 'true';
        }
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
  }, [debouncedSearch, filters.status, filters.category, filters.urgency, filters.page, filters.sort, view]);

  const handlePick = async (ticket) => {
    try {
      await ticketAPI.assign(ticket.id);
      toast.success('Ticket picked');
      setFilters({ ...filters });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pick ticket');
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Tickets</h1>
        <p className="text-slate-500 mt-1">View and manage support tickets</p>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setView('active'); setFilters({ ...filters, page: 1 }); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'active' ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          My Tickets
        </button>
        <button
          onClick={() => { setView('unassigned'); setFilters({ ...filters, page: 1 }); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'unassigned' ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Unassigned
        </button>
      </div>

      <div className="card">
        <TicketFilters filters={filters} onChange={setFilters} />
        <TicketTable
          tickets={tickets}
          loading={loading}
          ticketLinkPrefix="/agent/tickets"
          showAgent={view === 'unassigned'}
          actions={
            view === 'unassigned'
              ? (ticket) => (
                  <button onClick={() => handlePick(ticket)} className="text-sm text-primary hover:underline">
                    Pick
                  </button>
                )
              : undefined
          }
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

export default AgentTickets;
