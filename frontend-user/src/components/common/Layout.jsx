import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Marquee from './Marquee';
import FloatingButtons from './FloatingButtons';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isDesktop) setIsSidebarOpen(false);
  }, [location, isDesktop]);

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col">
      <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      <Marquee />
      <div className="flex flex-1">
        {isDesktop && <Sidebar isOpen={true} onClose={() => {}} />}
        {!isDesktop && (
          <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/70" onClick={() => setIsSidebarOpen(false)} />
            <div className={`absolute left-0 top-0 h-full w-72 bg-dark-900 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </div>
          </div>
        )}
        <main className={`flex-1 ${!isDesktop ? 'pb-20' : ''}`}>
          {children}
        </main>
      </div>
      {!isDesktop && <BottomNav />}
      {isDesktop && <Footer />}
      <FloatingButtons />
    </div>
  );
};

export default Layout;
