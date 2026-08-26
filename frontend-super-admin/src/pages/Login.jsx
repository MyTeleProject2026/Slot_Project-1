import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaUserShield, FaLock, FaArrowRight } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    setSubmitError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = 'Username is required.';
    if (!form.password) nextErrors.password = 'Password is required.';
    if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }

    setLoading(true);
    setSubmitError('');
    try {
      const result = await login(form.username.trim(), form.password);
      if (result?.success) {
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      } else if (result?.error) {
        setSubmitError(result.error);
      }
    } catch (error) {
      setSubmitError(error?.message || 'Unable to sign in. Please check your credentials or server connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,.16),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(249,115,22,.10),transparent_35%)]" aria-hidden="true" />
      <motion.section className="relative w-full max-w-md" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }}>
        <div className="text-center mb-7">
          <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/30">
            <FaUserShield className="text-2xl text-slate-950" />
          </div>
          <p className="text-xs uppercase tracking-[.28em] text-amber-400 font-semibold">N999Bet</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black tracking-tight">Super Admin</h1>
          <p className="mt-2 text-sm text-slate-400">Secure control panel access</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="rounded-3xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-5 sm:p-7 shadow-2xl shadow-black/30">
          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">Username</label>
              <div className="relative">
                <FaUserShield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input id="username" name="username" type="text" autoComplete="username" value={form.username} onChange={handleChange} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'username-error' : undefined} placeholder="Enter your admin username" className={`w-full rounded-xl border bg-slate-950/70 py-3.5 pl-11 pr-4 text-white outline-none transition focus:ring-2 ${errors.username ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-amber-400 focus:ring-amber-400/15'}`} />
              </div>
              {errors.username && <p id="username-error" className="mt-1.5 text-xs text-red-400">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
                <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={handleChange} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-error' : undefined} placeholder="Enter your password" className={`w-full rounded-xl border bg-slate-950/70 py-3.5 pl-11 pr-12 text-white outline-none transition focus:ring-2 ${errors.password ? 'border-red-500 focus:ring-red-500/20' : 'border-white/10 focus:border-amber-400 focus:ring-amber-400/15'}`} />
                <button type="button" onClick={() => setShowPassword((current) => !current)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-amber-400/40">
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {errors.password && <p id="password-error" className="mt-1.5 text-xs text-red-400">{errors.password}</p>}
            </div>

            {submitError && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{submitError}</div>}

            <button type="submit" disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-4 py-3.5 font-bold text-slate-950 shadow-lg shadow-orange-900/20 transition hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-amber-300/60 disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><span className="h-5 w-5 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" /> Signing in…</> : <>Sign in <FaArrowRight className="text-sm" /></>}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">Authorized personnel only · N999Bet Administration</p>
      </motion.section>
    </main>
  );
};

export default Login;
