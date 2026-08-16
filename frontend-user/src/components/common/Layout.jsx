import React, { useState, useEffect, Component } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Marquee from './Marquee';
import FloatingButtons from './FloatingButtons';
import BottomNav from './BottomNav';

// Internal error boundary to isolate component failures
class ComponentErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error(`❌ ${this.props.name} crashed:`, error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '8px', background: 'rgba(255,0,0,0.2)', color: '#ff6b6b', textAlign: 'center', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', margin: '4px' }}>
          ⚠️ {this.props.name} crashed. Check console for details.
        </div>
      );
    }
    return this.props.children;
  }
}

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
      <ComponentErrorBoundary name="Navbar">
        <Navbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
      </ComponentErrorBoundary>

      <ComponentErrorBoundary name="Marquee">
        <Marquee />
      </ComponentErrorBoundary>

      <div className="flex flex-1">
        {isDesktop && (
          <ComponentErrorBoundary name="Sidebar (desktop)">
            <Sidebar isOpen={true} onClose={() => {}} />
          </ComponentErrorBoundary>
        )}

        {!isDesktop && (
          <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/70" onClick={() => setIsSidebarOpen(false)} />
            <div className={`absolute left-0 top-0 h-full w-72 bg-dark-900 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <ComponentErrorBoundary name="Sidebar (mobile)">
                <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
              </ComponentErrorBoundary>
            </div>
          </div>
        )}

        <main className={`flex-1 ${!isDesktop ? 'pb-20' : ''}`}>
          {children}
        </main>
      </div>

      {!isDesktop && (
        <ComponentErrorBoundary name="BottomNav">
          <BottomNav />
        </ComponentErrorBoundary>
      )}

      {isDesktop && (
        <ComponentErrorBoundary name="Footer">
          <Footer />
        </ComponentErrorBoundary>
      )}

      <ComponentErrorBoundary name="FloatingButtons">
        <FloatingButtons />
      </ComponentErrorBoundary>
    </div>
  );
};

export default Layout;
