import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(identifier, password);
      if (redirectPath) {
        navigate(redirectPath);
      } else {
        if (loggedInUser.role === 'admin') navigate('/admin');
        else if (loggedInUser.role === 'owner') navigate('/owner');
        else navigate('/customer/bookings');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Quick fill helper for review/testing
  const fillCredentials = (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-2xl gold-gradient flex items-center justify-center shadow-md">
            <Car className="w-7 h-7 text-navy-900" />
          </div>
        </Link>
        <h2 className="font-serif text-3xl font-extrabold text-navy-900">
          Sign In to ShaadiYatra
        </h2>
        <p className="mt-2 text-xs text-slate-500">
          Access your wedding vehicle bookings or manage your fleet dashboard.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="name@email.com or +919876543210"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-medium border border-slate-200 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none bg-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl gold-gradient text-navy-900 font-extrabold text-sm shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-navy-900 border-t-transparent" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Test Buttons */}
          <div className="pt-4 border-t border-slate-100">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 text-center">
              Quick One-Click Demo Logins
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => fillCredentials('rohit.verma@gmail.com', 'CustomerPassword123!')}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-gold-50 font-semibold text-slate-700"
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('rajesh.patna@shaadiyatra.in', 'OwnerPassword123!')}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-gold-50 font-semibold text-slate-700"
              >
                Owner
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('admin@shaadiyatra.in', 'AdminPassword123!')}
                className="p-2 rounded-lg bg-slate-50 border border-slate-200 hover:bg-gold-50 font-semibold text-slate-700"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="pt-2 text-center text-xs text-slate-500 space-y-1">
            <p>
              New customer?{' '}
              <Link to="/register" className="font-bold text-gold-600 hover:underline">
                Create Account
              </Link>
            </p>
            <p>
              Vehicle Owner?{' '}
              <Link to="/register-owner" className="font-bold text-navy-900 hover:underline">
                List Your Vehicles Here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
