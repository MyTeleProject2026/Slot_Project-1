import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaPlug, FaServer, FaSync, FaUsersCog, FaWallet } from 'react-icons/fa';
import toast from 'react-hot-toast';
import superAdminApi from '../services/superAdminApi';

const unwrap = (value) => value?.data ?? value ?? null;
const statusOf = (value) => {
  if (!value) return 'unknown';
  if (value.error) return 'error';
  const raw = String(value.status ?? value.state ?? value.health ?? '').toLowerCase();
  if (['ok', 'healthy', 'connected', 'online', 'active', 'success'].includes(raw)) return 'ok';
  if (raw) return raw;
  return 'ok';
};

function StatusCard({ title, icon: Icon, value, detail }) {
  const status = statusOf(value);
  const error = unwrap(value)?.error;
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0b1220] p-5 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/10 text-amber-300"><Icon /></span><div><h2 className="font-semibold text-white">{title}</h2><p className="text-xs text-slate-500">{detail}</p></div></div>
        {status === 'ok' ? <FaCheckCircle className="mt-1 text-emerald-400" /> : <FaExclamationTriangle className="mt-1 text-amber-400" />}
      </div>
      <div className="mt-5 rounded-xl border border-white/5 bg-black/20 p-4">
        {error ? <p className="text-sm text-red-300">{error}</p> : <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-slate-300">{JSON.stringify(unwrap(value), null, 2)}</pre>}
      </div>
    </section>
  );
}

export default function ControlCenter() {
  const [state, setState] = useState({ loading: true, health: null, integration: null, balance: null, overview: null, admins: null });
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const results = await Promise.allSettled([
      superAdminApi.health(),
      superAdminApi.getIntegrationStatus(),
      superAdminApi.getMasterBalance(),
      superAdminApi.getBalanceOverview(),
      superAdminApi.getAdmins(),
    ]);
    const [health, integration, balance, overview, admins] = results;
    const result = (item) => item.status === 'fulfilled' ? item.value : { error: item.reason?.response?.data?.error || item.reason?.message || 'Request failed' };
    setState({ loading: false, health: result(health), integration: result(integration), balance: result(balance), overview: result(overview), admins: result(admins) });
    setLastUpdated(new Date());
  }, []);

  useEffect(() => { load(); }, [load]);

  const summary = useMemo(() => {
    const values = [state.health, state.integration, state.balance, state.overview, state.admins];
    return { ok: values.filter((v) => statusOf(v) === 'ok').length, total: values.length };
  }, [state]);

  const run = async (label, action) => {
    try { await action(); toast.success(`${label} completed`); await load(); }
    catch (error) { toast.error(error.response?.data?.error || error.message || `${label} failed`); }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#111a2b] to-[#0b1220] p-6 shadow-xl shadow-black/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-amber-300">N999Bet Owner Operations</div><h1 className="text-3xl font-bold tracking-tight text-white">Control Center</h1><p className="mt-2 max-w-2xl text-sm text-slate-400">Live operational view of the N999Bet backend, Slotopol integration, master assets and authorized administrators.</p></div>
          <div className="flex items-center gap-3"><div className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-xs text-slate-400"><span className="font-semibold text-emerald-300">{summary.ok}/{summary.total}</span> services responding</div><button onClick={load} disabled={state.loading} className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"><FaSync className={state.loading ? 'animate-spin' : ''} /> Refresh</button></div>
        </div>
        <div className="mt-4 text-xs text-slate-500">{lastUpdated ? `Last synchronized ${lastUpdated.toLocaleTimeString()}` : 'Synchronizing live state…'}</div>
      </header>

      <div className="grid gap-5 xl:grid-cols-2">
        <StatusCard title="Backend Health" detail="N999Bet API service" icon={FaServer} value={state.health} />
        <StatusCard title="Slotopol Integration" detail="Provider connectivity" icon={FaPlug} value={state.integration} />
        <StatusCard title="Master Balance" detail="N999Bet owner balance service" icon={FaWallet} value={state.balance} />
        <StatusCard title="Balance Overview" detail="Administrative balance records" icon={FaWallet} value={state.overview} />
        <StatusCard title="Administrators" detail="Authorized owner/admin accounts" icon={FaUsersCog} value={state.admins} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-[#0b1220] p-5">
        <h2 className="font-semibold text-white">Verified operations</h2>
        <p className="mt-1 text-sm text-slate-500">These controls call the live backend and refresh the resulting state. Financial mutations remain in their dedicated authenticated workflows.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button onClick={() => run('Health check', () => superAdminApi.health())} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5">Health check</button>
          <button onClick={() => run('Slotopol integration check', () => superAdminApi.getIntegrationStatus())} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5">Check integration</button>
          <button onClick={() => run('Funding ledger refresh', () => superAdminApi.getFundingHistory({ limit: 50 }))} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/5">Refresh funding ledger</button>
        </div>
      </section>
    </div>
  );
}
