import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import Spinner from '../../components/ui/Spinner';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Invalid email format';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(form.password)) newErrors.password = 'Must contain an uppercase letter';
    else if (!/[0-9]/.test(form.password)) newErrors.password = 'Must contain a number';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      toast.success('Account created successfully!');
      navigate('/client/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-slate-800 mb-1">Create account</h2>
      <p className="text-sm text-slate-500 mb-6">Register as a client to submit support tickets</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={`input-field ${errors.name ? 'border-danger' : ''}`}
            placeholder="John Doe"
          />
          {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
        </div>

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
            placeholder="Min 8 chars, 1 uppercase, 1 number"
          />
          {errors.password && <p className="text-xs text-danger mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className={`input-field ${errors.confirmPassword ? 'border-danger' : ''}`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword}</p>}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Spinner size="sm" /> : 'Create Account'}
        </button>
      </form>

      <p className="text-sm text-slate-500 text-center mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
