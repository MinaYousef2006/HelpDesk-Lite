import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Sidebar, { TopNavbar } from '../components/Sidebar';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';

const DashboardLayout = ({ allowedRoles }) => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirectMap = {
      Client: '/client/dashboard',
      Support_Agent: '/agent/dashboard',
      Manager: '/manager/dashboard',
    };
    return <Navigate to={redirectMap[user.role] || '/login'} replace />;
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
