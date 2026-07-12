import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Clock, CheckCircle, PlusCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ticketAPI } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import FAQSidebar from '../../components/FAQSidebar';
import Spinner from '../../components/ui/Spinner';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await ticketAPI.getClientStats();
        setStats(data.stats);
      } catch {
        setStats({ total: 0, open_tickets: 0, resolved_tickets: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
        <h1 className="text-2xl font-semibold text-slate-800">Welcome, {user?.name}</h1>
        <p className="text-slate-500 mt-1">Manage your support tickets from one place</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card bg-gradient-to-r from-primary/5 to-blue-50 border-primary/10">
            <h2 className="text-lg font-medium text-slate-800 mb-2">Need help?</h2>
            <p className="text-sm text-slate-600 mb-4">
              Submit a new ticket and our support team will get back to you as soon as possible.
            </p>
            <Link to="/client/create-ticket" className="btn-primary inline-flex items-center gap-2">
              <PlusCircle className="w-4 h-4" />
              Create Ticket
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Tickets" value={stats?.total || 0} icon={Ticket} color="primary" />
            <StatCard title="Open Tickets" value={stats?.open_tickets || 0} icon={Clock} color="warning" />
            <StatCard title="Resolved" value={stats?.resolved_tickets || 0} icon={CheckCircle} color="success" />
          </div>
        </div>

        <div>
          <FAQSidebar />
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
