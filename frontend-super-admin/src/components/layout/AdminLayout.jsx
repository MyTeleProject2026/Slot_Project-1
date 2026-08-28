import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktop, setDesktop] = useState(() => window.innerWidth >= 1024);
  const location = useLocation();

  useEffect(() => {
    const onResize = () => setDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-amber-400/30">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex min-h-[calc(100vh-64px)]">
        {desktop ? (
          <aside className="sticky top-16 hidden h-[calc(100vh-64px)] w-72 shrink-0 border-r border-white/10 bg-[#0a0f1c] lg:block">
            <AdminSidebar isOpen onClose={() => {}} />
          </aside>
        ) : (
          <div className={`fixed inset-0 z-[70] lg:hidden ${sidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
            <button aria-label="Close navigation" onClick={() => setSidebarOpen(false)} className={`absolute inset-0 bg-black/70 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} />
            <aside className={`absolute left-0 top-0 h-full w-[min(86vw,320px)] bg-[#0a0f1c] shadow-2xl transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <AdminSidebar isOpen onClose={() => setSidebarOpen(false)} />
            </aside>
          </div>
        )}
        <main className="min-w-0 flex-1 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,.08),transparent_30%),#070b14]">
          <div className="mx-auto w-full max-w-[1800px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
