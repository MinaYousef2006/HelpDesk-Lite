import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Lock } from 'lucide-react';
import { ticketAPI, userAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge, UrgencyBadge } from '../components/ui/Badge';
import { formatDate } from '../utils/helpers';
import { STATUSES } from '../utils/constants';
import toast from 'react-hot-toast';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [confirmResolve, setConfirmResolve] = useState(false);
  const [agents, setAgents] = useState([]);
  const [assignAgent, setAssignAgent] = useState('');

  const isAgent = user?.role === 'Support_Agent';
  const isManager = user?.role === 'Manager';
  const isClient = user?.role === 'Client';

  const getBackPath = () => {
    if (isClient) return '/client/tickets';
    if (isAgent) return '/agent/tickets';
    return '/manager/tickets';
  };

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const { data } = await ticketAPI.getById(id);
        setTicket(data.ticket);
        setMessages(data.messages);
        setStatusHistory(data.statusHistory);
        setStatusUpdate(data.ticket.status);
      } catch {
        toast.error('Ticket not found');
        navigate(getBackPath());
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  useEffect(() => {
    if (isManager) {
      userAPI.getAgents().then(({ data }) => setAgents(data.agents)).catch(() => {});
    }
  }, [isManager]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    try {
      const { data } = await ticketAPI.addMessage(id, { message, is_internal: isInternal });
      setMessages([...messages, data.data]);
      setMessage('');
      toast.success('Message sent');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const { data } = await ticketAPI.updateStatus(id, { status: newStatus });
      setTicket(data.ticket);
      setStatusUpdate(newStatus);
      const { data: refreshed } = await ticketAPI.getById(id);
      setStatusHistory(refreshed.statusHistory);
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePickTicket = async () => {
    try {
      const { data } = await ticketAPI.assign(id);
      setTicket(data.ticket);
      toast.success('Ticket assigned to you');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to pick ticket');
    }
  };

  const handleAssign = async () => {
    if (!assignAgent) return;
    try {
      const { data } = await ticketAPI.assign(id, parseInt(assignAgent));
      setTicket(data.ticket);
      toast.success('Ticket assigned');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign ticket');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => navigate(getBackPath())}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to tickets
      </button>

      <div className="card mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm font-medium text-primary">{ticket.ticket_id}</span>
              <StatusBadge status={ticket.status} />
              <UrgencyBadge urgency={ticket.urgency} />
            </div>
            <h1 className="text-xl font-semibold text-slate-800">{ticket.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <p className="text-slate-500">Category</p>
            <p className="font-medium text-slate-700">{ticket.category}</p>
          </div>
          <div>
            <p className="text-slate-500">Client</p>
            <p className="font-medium text-slate-700">{ticket.client_name}</p>
          </div>
          <div>
            <p className="text-slate-500">Agent</p>
            <p className="font-medium text-slate-700">{ticket.agent_name || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-slate-500">Created</p>
            <p className="font-medium text-slate-700">{formatDate(ticket.created_at)}</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700">
          {ticket.description}
        </div>

        {(isAgent || isManager) && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-100">
            {isAgent && !ticket.agent_id && (
              <button onClick={handlePickTicket} className="btn-primary text-sm">
                Pick Ticket
              </button>
            )}
            {isManager && (
              <div className="flex items-center gap-2">
                <select
                  value={assignAgent}
                  onChange={(e) => setAssignAgent(e.target.value)}
                  className="input-field text-sm py-1.5"
                >
                  <option value="">Assign to agent...</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
                <button onClick={handleAssign} disabled={!assignAgent} className="btn-primary text-sm">
                  Assign
                </button>
              </div>
            )}
            {(isAgent && ticket.agent_id === user.id) || isManager ? (
              <div className="flex items-center gap-2">
                <select
                  value={statusUpdate}
                  onChange={(e) => {
                    if (e.target.value === 'Resolved') {
                      setConfirmResolve(true);
                    } else {
                      handleStatusUpdate(e.target.value);
                    }
                  }}
                  className="input-field text-sm py-1.5"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-800 mb-4">Conversation</h2>
            <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-8">No messages yet</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg text-sm ${
                      msg.is_internal
                        ? 'bg-amber-50 border border-amber-100'
                        : msg.user_id === user.id
                        ? 'bg-blue-50'
                        : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-700">{msg.user_name}</span>
                      {msg.is_internal && (
                        <span className="flex items-center gap-1 text-xs text-amber-600">
                          <Lock className="w-3 h-3" /> Internal
                        </span>
                      )}
                      <span className="text-xs text-slate-400">{formatDate(msg.created_at)}</span>
                    </div>
                    <p className="text-slate-600">{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            {ticket.status !== 'Resolved' && (
              <form onSubmit={handleSendMessage} className="border-t border-slate-100 pt-4">
                {(isAgent || isManager) && (
                  <label className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded"
                    />
                    Internal note (not visible to client)
                  </label>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="input-field flex-1"
                  />
                  <button type="submit" disabled={sending || !message.trim()} className="btn-primary">
                    {sending ? <Spinner size="sm" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">Status History</h2>
          <div className="space-y-3">
            {statusHistory.map((h) => (
              <div key={h.id} className="text-sm border-l-2 border-primary/30 pl-3">
                <p className="font-medium text-slate-700">
                  {h.old_status ? `${h.old_status} → ${h.new_status}` : h.new_status}
                </p>
                <p className="text-xs text-slate-500">
                  {h.changed_by_name} · {formatDate(h.created_at)}
                </p>
                {h.note && <p className="text-xs text-slate-500 mt-0.5">{h.note}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmResolve}
        title="Resolve Ticket"
        message="Are you sure you want to mark this ticket as resolved?"
        confirmText="Resolve"
        onConfirm={() => {
          handleStatusUpdate('Resolved');
          setConfirmResolve(false);
        }}
        onCancel={() => {
          setConfirmResolve(false);
          setStatusUpdate(ticket.status);
        }}
      />
    </div>
  );
};

export default TicketDetail;
