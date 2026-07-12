import { Outlet, Navigate } from 'react-router-dom';
import { Headphones } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const AuthLayout = () => {
  const { isAuthenticated, getDashboardPath } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Headphones className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">HelpDesk Lite</h1>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
