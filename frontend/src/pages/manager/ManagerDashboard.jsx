import { useEffect, useState } from 'react';
import { Ticket, Clock, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { ticketAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import TicketTable from '../../components/TicketTable';
import Spinner from '../../components/ui/Spinner';

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [delayed, setDelayed] = useState([]);
  const [workload, setWorkload] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [statsRes, delayedRes, workloadRes] = await Promise.allSettled([
        ticketAPI.getManagerStats(),
        ticketAPI.getAll({ delayed: 'true', limit: 5 }),
        ticketAPI.getTeamWorkload(),
      ]);

      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.stats);
      } else {
        console.error('Manager stats error:', statsRes.reason);
        setStats({ total: 0, open_tickets: 0, need_info: 0, resolved: 0, delayed: 0 });
      }

      if (delayedRes.status === 'fulfilled') {
        setDelayed(delayedRes.value.data.tickets);
      } else {
        console.error('Delayed tickets error:', delayedRes.reason);
        setDelayed([]);
      }

      if (workloadRes.status === 'fulfilled') {
        setWorkload(workloadRes.value.data.workload);
      } else {
        console.error('Team workload error:', workloadRes.reason);
        setWorkload([]);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

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
        <h1 className="text-2xl font-semibold text-slate-800">Manager Dashboard</h1>
        <p className="text-slate-500 mt-1">Overview of team performance and ticket metrics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Tickets" value={stats?.total || 0} icon={Ticket} color="primary" />
        <StatCard title="Open" value={stats?.open_tickets || 0} icon={Clock} color="warning" />
        <StatCard title="Need Info" value={stats?.need_info || 0} icon={AlertCircle} color="danger" />
        <StatCard title="Resolved" value={stats?.resolved || 0} icon={CheckCircle} color="success" />
        <StatCard title="Delayed (48h+)" value={stats?.delayed || 0} icon={AlertTriangle} color="danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h2 className="text-lg font-medium text-slate-800 mb-4">Delayed Tickets</h2>
          <p className="text-xs text-slate-500 mb-4">Tickets older than 48 hours and not resolved</p>
          <TicketTable
            tickets={delayed}
            loading={false}
            ticketLinkPrefix="/manager/tickets"
          />
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-slate-800 mb-4">Team Workload</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 font-medium text-slate-500">Agent</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500">Assigned</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500">Active</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500">Resolved</th>
                  <th className="text-left py-2 px-3 font-medium text-slate-500">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {workload.map((agent) => (
                  <tr key={agent.id} className="border-b border-slate-50">
                    <td className="py-2 px-3 font-medium text-slate-700">{agent.name}</td>
                    <td className="py-2 px-3 text-slate-600">{agent.assigned_tickets}</td>
                    <td className="py-2 px-3 text-slate-600">{agent.active}</td>
                    <td className="py-2 px-3 text-slate-600">{agent.resolved}</td>
                    <td className="py-2 px-3 text-slate-600">{agent.avg_hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
