import { useAuth } from '../hooks/useAuth';
import { getRoleLabel, formatDate } from '../utils/helpers';
import { User, Mail, Shield, Calendar } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  const fields = [
    { label: 'Name', value: user?.name, icon: User },
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Role', value: getRoleLabel(user?.role), icon: Shield },
    { label: 'Member Since', value: formatDate(user?.created_at), icon: Calendar },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Profile</h1>
        <p className="text-slate-500 mt-1">Your account information</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{user?.name}</h2>
            <p className="text-sm text-slate-500">{getRoleLabel(user?.role)}</p>
          </div>
        </div>

        <div className="space-y-4">
          {fields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-50 rounded-lg flex items-center justify-center">
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-medium text-slate-700">{value || '—'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
