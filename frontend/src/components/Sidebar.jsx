import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  Users,
  User,
  LogOut,
  Menu,
  X,
  Headphones,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getRoleLabel } from '../utils/helpers';
import { ROLES } from '../utils/constants';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getBasePath = () => {
    switch (user?.role) {
      case ROLES.CLIENT:
        return '/client';
      case ROLES.AGENT:
        return '/agent';
      case ROLES.MANAGER:
        return '/manager';
      default:
        return '';
    }
  };

  const base = getBasePath();

  const navItems = [
    { to: `${base}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { to: `${base}/tickets`, label: 'Tickets', icon: Ticket },
    ...(user?.role === ROLES.CLIENT
      ? [{ to: `${base}/create-ticket`, label: 'Create Ticket', icon: PlusCircle }]
      : []),
    ...(user?.role === ROLES.MANAGER
      ? [{ to: `${base}/users`, label: 'Users', icon: Users }]
      : []),
    { to: `${base}/profile`, label: 'Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-100 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <Link to={base + '/dashboard'} className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-800">HelpDesk Lite</span>
          </Link>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(to)
                  ? 'bg-blue-50 text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <div className="px-3 mb-3">
            <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500">{getRoleLabel(user?.role)}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-danger transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export const TopNavbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 lg:px-6">
      <button onClick={onMenuClick} className="lg:hidden text-slate-600 hover:text-slate-800">
        <Menu className="w-5 h-5" />
      </button>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800">{user?.name}</p>
            <p className="text-xs text-slate-500">{getRoleLabel(user?.role)}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-danger transition-colors"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Sidebar;
