import React, { useEffect, useState } from 'react';
import { FaPlus, FaSync, FaTrash, FaUserShield, FaWallet } from 'react-icons/fa';
import toast from 'react-hot-toast';
import superAdminApi from '../services/superAdminApi';

const money = (v) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(v || 0));

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showFunds, setShowFunds] = useState(null);
  const [form, setForm] = useState({ username:'', email:'', password:'', fullName:'', phone:'', role:'admin', employeeId:'' });
  const [fund, setFund] = useState({ amount:'', description:'' });

  const load = async () => {
    setLoading(true);
    try { const data = await superAdminApi.getAdmins(); setAdmins(data?.admins || data || []); }
    catch (e) { toast.error(e.response?.data?.error || 'Unable to load administrators'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try { await superAdminApi.createAdmin(form); toast.success('Administrator created'); setShowCreate(false); setForm({ username:'', email:'', password:'', fullName:'', phone:'', role:'admin', employeeId:'' }); load(); }
    catch (e) { toast.error(e.response?.data?.error || 'Failed to create administrator'); }
  };

  const updateStatus = async (admin, status) => {
    try { await superAdminApi.updateAdmin(admin.id, { status }); toast.success('Administrator status updated'); load(); }
    catch (e) { toast.error(e.response?.data?.error || 'Status update failed'); }
  };

  const remove = async (admin) => {
    if (!window.confirm(`Delete administrator ${admin.username}? This cannot be undone.`)) return;
    try { await superAdminApi.deleteAdmin(admin.id); toast.success('Administrator deleted'); load(); }
    catch (e) { toast.error(e.response?.data?.error || 'Delete failed'); }
  };

  const addFunds = async (e) => {
    e.preventDefault();
    try { await superAdminApi.addBalance({ adminId: showFunds.id, amount: Number(fund.amount), description: fund.description }); toast.success('Balance distributed successfully'); setShowFunds(null); setFund({ amount:'', description:'' }); load(); }
    catch (e) { toast.error(e.response?.data?.error || 'Balance distribution failed'); }
  };

  return <div className="space-y-6 p-4 md:p-6">
    <header className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#111827] p-6 lg:flex-row lg:items-center lg:justify-between">
      <div><p className="text-xs font-black uppercase tracking-[.25em] text-amber-400">Owner Operations</p><h1 className="text-2xl font-black text-white">Administrators & Employee Control</h1><p className="mt-1 text-sm text-slate-400">Manage authorized operational accounts and distribute controlled working balances.</p></div>
      <div className="flex gap-2"><button onClick={load} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-200"><FaSync className={loading?'animate-spin inline mr-2':'inline mr-2'}/>Refresh</button><button onClick={()=>setShowCreate(true)} className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950"><FaPlus className="inline mr-2"/>Add Administrator</button></div>
    </header>

    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
      <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-white/[.03] text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Account</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Available</th><th className="px-5 py-4">Frozen</th><th className="px-5 py-4 text-right">Controls</th></tr></thead><tbody>{admins.length ? admins.map(a => <tr key={a.id} className="border-t border-white/5"><td className="px-5 py-4"><div className="font-bold text-white">{a.full_name || a.username}</div><div className="text-xs text-slate-500">{a.username} · {a.email}</div></td><td className="px-5 py-4"><span className="rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-300">{a.role}</span></td><td className="px-5 py-4"><span className={`rounded-full px-2 py-1 text-xs ${a.status==='active'?'bg-emerald-500/10 text-emerald-300':'bg-red-500/10 text-red-300'}`}>{a.status}</span></td><td className="px-5 py-4 font-bold text-white">{money(a.balance)} MMK</td><td className="px-5 py-4 text-slate-400">{money(a.frozen_balance)} MMK</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><button onClick={()=>setShowFunds(a)} className="rounded-lg border border-amber-400/30 px-3 py-1.5 text-xs text-amber-300"><FaWallet className="inline mr-1"/>Fund</button><button onClick={()=>updateStatus(a,a.status==='active'?'suspended':'active')} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300">{a.status==='active'?'Suspend':'Activate'}</button><button onClick={()=>remove(a)} className="rounded-lg border border-red-500/20 px-3 py-1.5 text-xs text-red-300"><FaTrash/></button></div></td></tr>) : <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">{loading?'Loading administrators…':'No administrators found.'}</td></tr>}</tbody></table></div>
    </div>

    {showCreate && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><form onSubmit={create} className="w-full max-w-lg space-y-4 rounded-2xl border border-white/10 bg-[#111827] p-6"><div className="flex items-center gap-2"><FaUserShield className="text-amber-400"/><h2 className="font-bold text-white">Create Operational Account</h2></div><div className="grid gap-3 sm:grid-cols-2">{[['username','Username'],['email','Email'],['password','Password'],['fullName','Full Name'],['phone','Phone'],['employeeId','Employee ID']].map(([key,label])=><input key={key} required={['username','email','password'].includes(key)} type={key==='password'?'password':'text'} placeholder={label} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none"/>)}</div><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white"><option value="admin">Administrator</option><option value="employee">Employee</option></select><div className="flex justify-end gap-2"><button type="button" onClick={()=>setShowCreate(false)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300">Cancel</button><button className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950">Create Account</button></div></form></div>}

    {showFunds && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><form onSubmit={addFunds} className="w-full max-w-md space-y-4 rounded-2xl border border-white/10 bg-[#111827] p-6"><h2 className="font-bold text-white">Distribute Working Balance</h2><p className="text-sm text-slate-400">Recipient: <b className="text-white">{showFunds.username}</b></p><input required min="0.01" step="0.01" type="number" placeholder="Amount (MMK)" value={fund.amount} onChange={e=>setFund({...fund,amount:e.target.value})} className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white"/><textarea placeholder="Description (optional)" value={fund.description} onChange={e=>setFund({...fund,description:e.target.value})} className="min-h-24 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-white"/><div className="flex justify-end gap-2"><button type="button" onClick={()=>setShowFunds(null)} className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300">Cancel</button><button className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-bold text-slate-950">Confirm Distribution</button></div></form></div>}
  </div>;
}