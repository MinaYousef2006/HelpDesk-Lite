import { Link } from 'react-router-dom';
import { StatusBadge, UrgencyBadge } from './ui/Badge';
import { formatDate } from '../utils/helpers';
import EmptyState from './ui/EmptyState';
import Spinner from './ui/Spinner';
import { Ticket } from 'lucide-react';

const TicketTable = ({ tickets, loading, ticketLinkPrefix, showAgent = true, showClient = false, actions }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tickets?.length) {
    return <EmptyState title="No tickets found" description="No tickets match your current filters." icon={Ticket} />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-3 px-4 font-medium text-slate-500">Ticket ID</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500">Title</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500 hidden md:table-cell">Category</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500 hidden sm:table-cell">Urgency</th>
            <th className="text-left py-3 px-4 font-medium text-slate-500">Status</th>
            {showAgent && (
              <th className="text-left py-3 px-4 font-medium text-slate-500 hidden lg:table-cell">Agent</th>
            )}
            {showClient && (
              <th className="text-left py-3 px-4 font-medium text-slate-500 hidden lg:table-cell">Client</th>
            )}
            <th className="text-left py-3 px-4 font-medium text-slate-500 hidden md:table-cell">Created</th>
            {actions && <th className="text-right py-3 px-4 font-medium text-slate-500">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
              <td className="py-3 px-4">
                <Link
                  to={`${ticketLinkPrefix}/${ticket.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {ticket.ticket_id}
                </Link>
              </td>
              <td className="py-3 px-4 text-slate-700 max-w-[200px] truncate">{ticket.title}</td>
              <td className="py-3 px-4 text-slate-600 hidden md:table-cell">{ticket.category}</td>
              <td className="py-3 px-4 hidden sm:table-cell">
                <UrgencyBadge urgency={ticket.urgency} />
              </td>
              <td className="py-3 px-4">
                <StatusBadge status={ticket.status} />
              </td>
              {showAgent && (
                <td className="py-3 px-4 text-slate-600 hidden lg:table-cell">
                  {ticket.agent_name || 'Unassigned'}
                </td>
              )}
              {showClient && (
                <td className="py-3 px-4 text-slate-600 hidden lg:table-cell">
                  {ticket.client_name}
                </td>
              )}
              <td className="py-3 px-4 text-slate-500 hidden md:table-cell">
                {formatDate(ticket.created_at)}
              </td>
              {actions && <td className="py-3 px-4 text-right">{actions(ticket)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TicketTable;
