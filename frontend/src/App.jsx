import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ClientDashboard from './pages/client/ClientDashboard';
import CreateTicket from './pages/client/CreateTicket';
import ClientTickets from './pages/client/ClientTickets';
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentTickets from './pages/agent/AgentTickets';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerTickets from './pages/manager/ManagerTickets';
import ManagerUsers from './pages/manager/ManagerUsers';
import TicketDetail from './pages/TicketDetail';
import Profile from './pages/Profile';
import { ROLES } from './utils/constants';

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '0.75rem',
              background: '#1e293b',
              color: '#f8fafc',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#16A34A', secondary: '#f8fafc' } },
            error: { iconTheme: { primary: '#DC2626', secondary: '#f8fafc' } },
          }}
        />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          <Route element={<DashboardLayout allowedRoles={[ROLES.CLIENT]} />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/create-ticket" element={<CreateTicket />} />
            <Route path="/client/tickets" element={<ClientTickets />} />
            <Route path="/client/tickets/:id" element={<TicketDetail />} />
            <Route path="/client/profile" element={<Profile />} />
          </Route>

          <Route element={<DashboardLayout allowedRoles={[ROLES.AGENT]} />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/tickets" element={<AgentTickets />} />
            <Route path="/agent/tickets/:id" element={<TicketDetail />} />
            <Route path="/agent/profile" element={<Profile />} />
          </Route>

          <Route element={<DashboardLayout allowedRoles={[ROLES.MANAGER]} />}>
            <Route path="/manager/dashboard" element={<ManagerDashboard />} />
            <Route path="/manager/tickets" element={<ManagerTickets />} />
            <Route path="/manager/tickets/:id" element={<TicketDetail />} />
            <Route path="/manager/users" element={<ManagerUsers />} />
            <Route path="/manager/profile" element={<Profile />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
