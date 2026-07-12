import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { getRoleLabel, formatDate } from '../../utils/helpers';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import Pagination from '../../components/ui/Pagination';
import { Users } from 'lucide-react';

const ManagerUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = { page, limit: 10 };
        if (debouncedSearch) params.search = debouncedSearch;
        if (role) params.role = role;
        const { data } = await userAPI.getAll(params);
        setUsers(data.users);
        setPagination(data.pagination);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [debouncedSearch, role, page]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
        <p className="text-slate-500 mt-1">View all registered users</p>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field flex-1"
          />
          <select
            value={role}
            onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="input-field min-w-[160px]"
          >
            <option value="">All Roles</option>
            <option value="Client">Client</option>
            <option value="Support_Agent">Support Agent</option>
            <option value="Manager">Manager</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState title="No users found" icon={Users} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-500">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-medium text-slate-700">{u.name}</td>
                    <td className="py-3 px-4 text-slate-600">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className="badge bg-slate-100 text-slate-600">{getRoleLabel(u.role)}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      </div>
    </div>
  );
};

export default ManagerUsers;
