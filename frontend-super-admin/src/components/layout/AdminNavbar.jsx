import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaBell, FaUserCircle, FaSignOutAlt, FaCog, FaServer, FaCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

const AdminNavbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const initials = (user?.username || 'A').slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-white/10 bg-[#080d18]/90 backdrop-blur-2xl">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button aria-label="Open navigation" onClick={onMenuClick} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:text-white lg:hidden"><FaBars /></button>
          <Link to="/control-center" className="hidden items-center gap-2 sm:flex"><span className="text-sm font-black tracking-wide text-white">N999BET</span><span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-amber-300">Owner Console</span></Link>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 md:flex"><FaCircle className="text-[6px]" /> Backend connected</div>
          <div className="hidden items-center gap-2 text-xs text-slate-500 xl:flex"><FaServer /> Live operations</div>
          <button aria-label="Notifications" className="relative rounded-xl p-2.5 text-slate-400 hover:bg-white/5 hover:text-white"><FaBell /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-amber-400" /></button>
          <div className="relative">
            <button onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.03] p-1.5 pr-3 hover:bg-white/[.06]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-300 to-orange-600 text-sm font-black text-slate-950">{initials}</span>
              <span className="hidden text-left sm:block"><strong className="block text-xs font-bold text-white">{user?.username || 'Super Admin'}</strong><small className="block text-[9px] uppercase tracking-wider text-slate-500">Owner</small></span>
            </button>
            {open && <div className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-white/10 bg-[#101725] shadow-2xl">
              <div className="border-b border-white/10 p-4"><p className="font-bold text-white">{user?.username || 'Super Admin'}</p><p className="mt-1 text-xs text-slate-500">{user?.email || 'Owner account'}</p></div>
              <Link to="/settings/general" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-slate-300 hover:bg-white/5"><FaCog />Platform settings</Link>
              <button onClick={() => { setOpen(false); logout(); }} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-300 hover:bg-red-500/10"><FaSignOutAlt />Sign out</button>
            </div>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
