import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaUsers, FaGamepad, FaExchangeAlt, FaGift, FaImage, FaLanguage, FaCog, FaHeadset, FaSignOutAlt, FaTachometerAlt, FaChevronDown, FaChevronUp, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({ games: true, transactions: false, promotions: false, settings: false });
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const toggleMenu = (menu) => setExpandedMenus((current) => ({ ...current, [menu]: !current[menu] }));

  const menuItems = [
    { key: 'dashboard', icon: FaTachometerAlt, label: 'Dashboard', path: '/dashboard' },
    { key: 'users', icon: FaUsers, label: 'Players & Users', path: '/users' },
    { key: 'games', icon: FaGamepad, label: 'Games', children: [
      { label: 'All Games', path: '/games' },
      { label: 'Add Game', path: '/games/add' },
      { label: 'Game Control', path: '/games/control' },
    ] },
    { key: 'transactions', icon: FaExchangeAlt, label: 'Transactions', children: [
      { label: 'All Transactions', path: '/transactions' },
      { label: 'Deposits', path: '/transactions/deposits' },
      { label: 'Withdrawals', path: '/transactions/withdrawals' },
    ] },
    { key: 'promotions', icon: FaGift, label: 'Promotions', children: [
      { label: 'All Promotions', path: '/promotions' },
      { label: 'Add Promotion', path: '/promotions/add' },
    ] },
    { key: 'banners', icon: FaImage, label: 'Banners', path: '/banners' },
    { key: 'languages', icon: FaLanguage, label: 'Languages', path: '/languages' },
    { key: 'settings', icon: FaCog, label: 'Settings', children: [
      { label: 'General', path: '/settings/general' },
      { label: 'Appearance', path: '/settings/appearance' },
      { label: 'Payment', path: '/settings/payment' },
      { label: 'Countries & Currency', path: '/settings/countries' },
    ] },
    { key: 'support', icon: FaHeadset, label: 'Support', path: '/support' },
  ];

  return (
    <aside className={`flex h-full w-full flex-col border-r border-white/10 bg-slate-950/95 backdrop-blur-xl ${isOpen ? 'block' : 'hidden lg:flex'}`}>
      <div className="border-b border-white/10 p-5">
        <Link to="/dashboard" onClick={onClose} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 text-slate-950 shadow-lg shadow-orange-950/30"><FaShieldAlt /></span>
          <span className="min-w-0"><strong className="block truncate text-lg font-black tracking-tight text-white">N999Bet</strong><span className="block text-[10px] font-semibold uppercase tracking-[.18em] text-amber-400">Super Admin</span></span>
        </Link>
      </div>

      <nav aria-label="Super Admin navigation" className="flex-1 overflow-y-auto p-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          if (item.children) {
            const expanded = expandedMenus[item.key];
            return <div key={item.key} className="mb-1">
              <button type="button" onClick={() => toggleMenu(item.key)} aria-expanded={expanded} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 transition ${expanded ? 'bg-amber-400/10 text-amber-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Icon className="text-base" /><span className="flex-1 text-left text-sm font-semibold">{item.label}</span>{expanded ? <FaChevronUp className="text-[10px]" /> : <FaChevronDown className="text-[10px]" />}
              </button>
              {expanded && <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-2">{item.children.map((child) => <Link key={child.path} to={child.path} onClick={onClose} className={`block rounded-lg px-3 py-2 text-sm transition ${isActive(child.path) ? 'bg-amber-400/10 font-semibold text-amber-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>{child.label}</Link>)}</div>}
            </div>;
          }
          return <Link key={item.key} to={item.path} onClick={onClose} className={`mb-1 flex items-center gap-3 rounded-xl px-4 py-3 transition ${isActive(item.path) ? 'bg-gradient-to-r from-amber-400/15 to-orange-500/10 font-semibold text-amber-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}><Icon className="text-base" /><span className="text-sm">{item.label}</span></Link>;
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-white">{user?.username || user?.name || 'Super Admin'}</p>
          <p className="truncate text-[11px] uppercase tracking-wider text-slate-500">{user?.role || 'authorized administrator'}</p>
        </div>
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10"><FaSignOutAlt /> Sign out</button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
