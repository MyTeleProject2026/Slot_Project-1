import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaSave } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';

export default function ChangePassword() {
  const { isAuthenticated, updatePassword } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const change = e => setForm(v => ({ ...v, [e.target.name]: e.target.value }));
  const submit = async e => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) return toast.error('New passwords do not match');
    if (form.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    setSaving(true);
    try { await updatePassword(form.currentPassword, form.newPassword); toast.success('Password changed successfully'); setForm({ currentPassword:'', newPassword:'', confirmPassword:'' }); }
    catch (err) { toast.error(err.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };
  if (!isAuthenticated) return <div className="min-h-[60vh] flex items-center justify-center text-gray-400">Please <Link className="text-primary-400 ml-1" to="/login">login</Link> to change your password.</div>;
  return <div className="container max-w-xl mx-auto px-4 py-6"><motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} className="rounded-2xl border border-dark-700/50 bg-dark-800/80 p-6 shadow-xl"><Link to="/profile" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-5"><FaArrowLeft/> Back to profile</Link><h1 className="text-2xl font-bold gradient-text mb-2">Change Password</h1><p className="text-sm text-gray-400 mb-6">Update your account password securely.</p><form onSubmit={submit} className="space-y-4">{[['currentPassword','Current password'],['newPassword','New password'],['confirmPassword','Confirm new password']].map(([name,label])=><label key={name} className="block text-sm text-gray-300">{label}<div className="relative mt-1"><FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/><input required minLength={name==='currentPassword'?1:8} type="password" name={name} value={form[name]} onChange={change} className="w-full rounded-xl border border-dark-600 bg-dark-700/80 py-3 pl-10 pr-4 text-white outline-none focus:ring-2 focus:ring-primary-500/30" /></div></label>)}<button disabled={saving} className="w-full rounded-xl bg-gradient-to-r from-primary-500 to-orange-500 py-3 font-semibold text-dark-900 disabled:opacity-50">{saving ? 'Saving…' : <><FaSave className="inline mr-2"/>Save Password</>}</button></form></motion.div></div>;
}