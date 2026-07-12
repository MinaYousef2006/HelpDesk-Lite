import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketAPI } from '../../services/api';
import { CATEGORIES, URGENCY_LEVELS } from '../../utils/constants';
import FAQSidebar from '../../components/FAQSidebar';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

const CreateTicket = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'Medium',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.category) newErrors.category = 'Category is required';
    if (!form.urgency) newErrors.urgency = 'Urgency is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { data } = await ticketAPI.create(form);
      toast.success(`Ticket ${data.ticket.ticket_id} created!`);
      navigate(`/client/tickets/${data.ticket.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Create Ticket</h1>
        <p className="text-slate-500 mt-1">Describe your issue and we'll help you resolve it</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={`input-field ${errors.title ? 'border-danger' : ''}`}
                placeholder="Brief summary of your issue"
                maxLength={200}
              />
              {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`input-field ${errors.category ? 'border-danger' : ''}`}
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Urgency *</label>
                <select
                  value={form.urgency}
                  onChange={(e) => setForm({ ...form, urgency: e.target.value })}
                  className="input-field"
                >
                  {URGENCY_LEVELS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`input-field min-h-[150px] resize-y ${errors.description ? 'border-danger' : ''}`}
                placeholder="Provide details about your issue..."
              />
              {errors.description && <p className="text-xs text-danger mt-1">{errors.description}</p>}
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <Spinner size="sm" /> : 'Submit Ticket'}
              </button>
            </div>
          </form>
        </div>

        <div>
          <FAQSidebar />
        </div>
      </div>
    </div>
  );
};

export default CreateTicket;
