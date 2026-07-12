import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getRoleDashboard } from '../../utils/helpers';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const data = await login(form);
      toast.success('Welcome back!');
      navigate(getRoleDashboard(data.user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-slate-800 mb-1">Sign in</h2>
      <p className="text-sm text-slate-500 mb-6">Enter your credentials to access your portal</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className={`input-field ${errors.email ? 'border-danger' : ''}`}
            placeholder="you@company.com"
          />
          {errors.email && <p className="text-xs text-danger mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className={`input-field ${errors.password ? 'border-danger' : ''}`}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Spinner size="sm" /> : 'Sign in'}
        </button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary font-medium hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
};

export default Login;
