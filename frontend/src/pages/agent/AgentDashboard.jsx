import { useEffect, useState } from 'react';
import { Inbox, Clock, CheckCircle, Timer } from 'lucide-react';
import { ticketAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import TicketTable from '../../components/TicketTable';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const AgentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [unassigned, setUnassigned] = useState([]);
  const [active, setActive] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, unassignedRes, activeRes] = await Promise.all([
          ticketAPI.getAgentStats(),
          ticketAPI.getAll({ unassigned: 'true', limit: 5 }),
          ticketAPI.getAll({ agent_id: 'me', limit: 5 }),
        ]);
        setStats(statsRes.data.stats);
        setUnassigned(unassignedRes.data.tickets);
        setActive(activeRes.data.tickets.filter((t) => t.status !== 'Resolved'));
      } catch {
        setStats({ new_tickets: 0, active_tickets: 0, resolved_today: 0, avg_resolution_hours: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePick = async (ticket) => {
    try {
      await ticketAPI.assign(ticket.id);
      toast.success('Ticket picked');
      const [unassignedRes, activeRes, statsRes] = await Promise.all([
        ticketAPI.getAll({ unassigned: 'true', limit: 5 }),
        ticketAPI.getAll({ agent_id: 'me', limit: 5 }),
        ticketAPI.getAgentStats(),
      ]);
      setUnassigned(unassignedRes.data.tickets);
      setActive(activeRes.data.tickets.filter((t) => t.status !== 'Resolved'));
      setStats(statsRes.data.stats);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pick ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800">Agent Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage and resolve support tickets</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="New Tickets" value={stats?.new_tickets || 0} icon={Inbox} color="primary" />
        <StatCard title="My Active" value={stats?.active_tickets || 0} icon={Clock} color="warning" />
        <StatCard title="Resolved Today" value={stats?.resolved_today || 0} icon={CheckCircle} color="success" />
        <StatCard
          title="Avg Resolution"
          value={`${stats?.avg_resolution_hours || 0}h`}
          icon={Timer}
          color="slate"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-medium text-slate-800 mb-4">Unassigned Tickets</h2>
          <TicketTable
            tickets={unassigned}
            loading={false}
            ticketLinkPrefix="/agent/tickets"
            actions={(ticket) => (
              <button onClick={() => handlePick(ticket)} className="text-sm text-primary hover:underline">
                Pick
              </button>
            )}
          />
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-slate-800 mb-4">My Active Tickets</h2>
          <TicketTable
            tickets={active}
            loading={false}
            ticketLinkPrefix="/agent/tickets"
            showAgent={false}
          />
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
