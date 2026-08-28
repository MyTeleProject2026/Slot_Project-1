import React, { useCallback, useEffect, useState } from 'react';
import { FaSync, FaServer, FaWallet, FaDatabase, FaPlug, FaUsersCog } from 'react-icons/fa';
import toast from 'react-hot-toast';
import superAdminApi from '../services/superAdminApi';

const Card = ({ title, icon: Icon, children }) => (
  <section className="rounded-2xl border border-dark-700/60 bg-dark-800/80 p-5 shadow-xl">
    <div className="mb-4 flex items-center gap-3"><Icon className="text-primary-400" /><h2 className="font-semibold text-white">{title}</h2></div>
    {children}
  </section>
);

const JsonValue = ({ value }) => (
  <pre className="max-h-72 overflow-auto rounded-xl bg-dark-900/70 p-3 text-xs text-gray-300">{JSON.stringify(value ?? {}, null, 2)}</pre>
);

export default function ControlCenter() {
  const [state, setState] = useState({ loading: true, health: null, integration: null, balance: null, overview: null, admins: null });
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
    setState({
      loading: false,
      health: health.status === 'fulfilled' ? health.value : { error: health.reason?.message },
      integration: integration.status === 'fulfilled' ? integration.value : { error: integration.reason?.message },
      balance: balance.status === 'fulfilled' ? balance.value : { error: balance.reason?.message },
      overview: overview.status === 'fulfilled' ? overview.value : { error: overview.reason?.message },
      admins: admins.status === 'fulfilled' ? admins.value : { error: admins.reason?.message },
    });
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (label, action) => {
    try { await action(); toast.success(`${label} completed`); await load(); }
    catch (error) { toast.error(error.response?.data?.error || error.message || `${label} failed`); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div><h1 className="text-2xl font-bold text-white">Owner Control Center</h1><p className="text-sm text-gray-400">Live N999Bet control-plane status and backend operations.</p></div>
        <button onClick={load} disabled={state.loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-500 px-4 py-2 font-semibold text-dark-900 disabled:opacity-50"><FaSync className={state.loading ? 'animate-spin' : ''} /> Refresh live state</button>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Backend Health" icon={FaServer}><JsonValue value={state.health} /></Card>
        <Card title="Slotopol Integration" icon={FaPlug}><JsonValue value={state.integration} /></Card>
        <Card title="N999Bet Master Balance" icon={FaWallet}><JsonValue value={state.balance} /></Card>
        <Card title="Admin Balance Overview" icon={FaDatabase}><JsonValue value={state.overview} /></Card>
        <Card title="Owner/Admin Accounts" icon={FaUsersCog}><JsonValue value={state.admins} /></Card>
      </div>

      <Card title="Verified server operations" icon={FaServer}>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => run('Health check', () => superAdminApi.health())} className="rounded-xl border border-dark-600 px-4 py-2 text-sm text-white hover:bg-dark-700">Health check</button>
          <button onClick={() => run('Integration check', () => superAdminApi.getIntegrationStatus())} className="rounded-xl border border-dark-600 px-4 py-2 text-sm text-white hover:bg-dark-700">Check Slotopol integration</button>
          <button onClick={() => run('Funding history refresh', () => superAdminApi.getFundingHistory({ limit: 50 }))} className="rounded-xl border border-dark-600 px-4 py-2 text-sm text-white hover:bg-dark-700">Refresh funding ledger</button>
        </div>
        <p className="mt-4 text-xs text-gray-500">This page deliberately performs read/verification operations only. Financial mutations remain behind their dedicated authenticated forms and are never simulated in the UI.</p>
      </Card>
    </div>
  );
}
