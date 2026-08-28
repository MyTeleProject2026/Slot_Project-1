import React, { useEffect, useState } from 'react';
import { FaWallet, FaSync, FaArrowDown, FaChartLine, FaLock } from 'react-icons/fa';
import { superAdminApi } from '../services/superAdminApi';

const money = (value) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(Number(value || 0));

export default function MasterAssets() {
  const [overview, setOverview] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    const [overviewResult, historyResult] = await Promise.allSettled([
      superAdminApi.getFundingOverview(),
      superAdminApi.getFundingHistory()
    ]);
    if (overviewResult.status === 'fulfilled') setOverview(overviewResult.value || {});
    else setError('Unable to load master asset overview.');
    if (historyResult.status === 'fulfilled') {
      const value = historyResult.value;
      setHistory(Array.isArray(value) ? value : (value?.funding || []));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const cards = [
    ['Master Balance', overview?.balance, FaWallet],
    ['Available Funds', overview?.availableBalance, FaChartLine],
    ['Frozen Funds', overview?.frozenBalance, FaLock],
    ['Total Funded', overview?.totalFunded, FaArrowDown],
  ];

  return <div className="space-y-6 p-4 md:p-6">
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div><p className="text-xs font-black uppercase tracking-[.25em] text-amber-400">Owner Treasury</p><h1 className="text-2xl font-black text-white">Master Assets & Funding</h1><p className="mt-1 text-sm text-slate-400">Live MMK master balance and Slotopol funding ledger.</p></div>
      <button onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 disabled:opacity-60"><FaSync className={loading ? 'animate-spin' : ''}/>Refresh</button>
    </div>
    {error && <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value,Icon]) => <div key={label} className="rounded-2xl border border-white/10 bg-[#111827] p-5 shadow-xl"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-slate-400">{label}</span><Icon className="text-amber-400"/></div><div className="text-2xl font-black text-white">{money(value)} <span className="text-xs text-amber-400">MMK</span></div></div>)}</div>
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-[#111827] p-5 lg:col-span-1"><h2 className="font-bold text-white">Funding Summary</h2><div className="mt-5 space-y-4 text-sm"><div className="flex justify-between"><span className="text-slate-400">Transfers</span><b className="text-white">{overview?.transferCount || 0}</b></div><div className="flex justify-between"><span className="text-slate-400">Funded Today</span><b className="text-white">{money(overview?.fundedToday)} MMK</b></div><div className="border-t border-white/10 pt-4 text-xs text-slate-500">Funding records are read directly from the protected backend ledger.</div></div></div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111827] lg:col-span-2"><div className="border-b border-white/10 p-5"><h2 className="font-bold text-white">Recent Funding Ledger</h2></div><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-white/[.03] text-xs uppercase tracking-wider text-slate-500"><tr><th className="px-5 py-3">Transfer</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr></thead><tbody>{history.length ? history.map(row => <tr key={row.id || row.transfer_id} className="border-t border-white/5 text-slate-300"><td className="px-5 py-4 font-mono text-xs">{row.transfer_id}</td><td className="px-5 py-4 font-bold text-white">{money(row.amount)} {row.currency || 'MMK'}</td><td className="px-5 py-4"><span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300">{row.status}</span></td><td className="px-5 py-4 text-slate-500">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td></tr>) : <tr><td colSpan="4" className="px-5 py-10 text-center text-slate-500">{loading ? 'Loading ledger…' : 'No funding records found.'}</td></tr>}</tbody></table></div></div>
    </div>
  </div>;
}