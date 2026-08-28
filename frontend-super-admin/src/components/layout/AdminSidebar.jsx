import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaGamepad, FaExchangeAlt, FaGift, FaImage, FaLanguage, FaCog, FaHeadset, FaSignOutAlt, FaTachometerAlt, FaChevronDown, FaChevronUp, FaShieldAlt, FaWallet, FaServer, FaUserShield, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState({ operations: true, content: false, settings: false });
  const active = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const toggle = (key) => setExpanded((v) => ({ ...v, [key]: !v[key] }));

  const groups = [
    { key: 'owner', title: 'OWNER', items: [
      { label: 'Command Center', path: '/control-center', icon: FaShieldAlt },
      { label: 'Dashboard', path: '/dashboard', icon: FaTachometerAlt },
    ] },
    { key: 'operations', title: 'OPERATIONS', children: [
      { label: 'Players & Accounts', path: '/users' },
      { label: 'Master Transactions', path: '/transactions' },
      { label: 'Deposits / Settlement', path: '/transactions/deposits' },
      { label: 'Withdrawals / Settlement', path: '/transactions/withdrawals' },
      { label: 'Slotopol Games', path: '/games' },
    ], icon: FaChartLine },
    { key: 'content', title: 'CONTENT & GROWTH', children: [
      { label: 'Promotions', path: '/promotions' },
      { label: 'Banners', path: '/banners' },
      { label: 'Languages', path: '/languages' },
    ], icon: FaGift },
    { key: 'settings', title: 'PLATFORM', children: [
      { label: 'General', path: '/settings/general' },
      { label: 'Appearance', path: '/settings/appearance' },
      { label: 'Payment Methods', path: '/settings/payment' },
      { label: 'Countries & Currency', path: '/settings/countries' },
    ], icon: FaCog },
  ];

  return (
    <aside className={`flex h-full w-full flex-col bg-[#0a0f1c] ${isOpen ? 'flex' : 'hidden'}`}>
      <div className="border-b border-white/10 px-5 py-5">
        <Link to="/control-center" onClick={onClose} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 text-slate-950 shadow-lg shadow-amber-950/30"><FaShieldAlt /></span>
          <span><strong className="block text-lg font-black tracking-tight text-white">N999Bet</strong><span className="block text-[10px] font-bold uppercase tracking-[.22em] text-amber-400">Owner Control</span></span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => {
          if (!group.children) return <div key={group.key} className="mb-5"><p className="px-3 pb-2 text-[10px] font-black tracking-[.2em] text-slate-600">{group.title}</p>{group.items.map((item) => <Link key={item.path} to={item.path} onClick={onClose} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${active(item.path) ? 'bg-amber-400/10 text-amber-300 ring-1 ring-amber-400/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><item.icon />{item.label}</Link>)}</div>;
          const open = expanded[group.key];
          return <div key={group.key} className="mb-4"><button type="button" onClick={() => toggle(group.key)} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${open ? 'text-white' : 'text-slate-400 hover:bg-white/5'}`}><group.icon className="text-sm" /><span className="flex-1 text-[10px] font-black tracking-[.18em]">{group.title}</span>{open ? <FaChevronUp className="text-[9px]" /> : <FaChevronDown className="text-[9px]" />}</button>{open && <div className="ml-3 space-y-1 border-l border-white/10 pl-2">{group.children.map((item) => <Link key={item.path} to={item.path} onClick={onClose} className={`block rounded-lg px-3 py-2.5 text-sm transition ${active(item.path) ? 'bg-white/5 font-semibold text-amber-300' : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'}`}>{item.label}</Link>)}</div>}</div>;
        })}
        <div className="mb-4"><p className="px-3 pb-2 text-[10px] font-black tracking-[.2em] text-slate-600">SERVICE</p><Link to="/support" onClick={onClose} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${active('/support') ? 'bg-amber-400/10 text-amber-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><FaHeadset />Support</Link></div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.025] p-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/15 text-amber-300"><FaUserShield /></div><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{user?.username || 'Super Admin'}</p><p className="truncate text-[10px] uppercase tracking-wider text-slate-500">{user?.role || 'owner'}</p></div></div>
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"><FaSignOutAlt />Sign out</button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
