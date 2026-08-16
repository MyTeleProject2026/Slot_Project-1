import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// ---- ErrorBoundary defined BEFORE App ----
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: 'white', background: '#1a1a2e', minHeight: '100vh' }}>
          <h1>Something went wrong</h1>
          <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{this.state.error?.message}</pre>
          <button onClick={() => window.location.reload()} style={{ padding: '8px 16px', background: '#f1c40f', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy-loaded pages
const Home = lazy(() => import('./pages/Home'));
const Games = lazy(() => import('./pages/Games'));
const Slots = lazy(() => import('./pages/Slots'));
const LiveCasino = lazy(() => import('./pages/LiveCasino'));
const Sports = lazy(() => import('./pages/Sports'));
const Fishing = lazy(() => import('./pages/Fishing'));
const Lotto = lazy(() => import('./pages/Lotto'));
const Promotions = lazy(() => import('./pages/Promotions'));
const Profile = lazy(() => import('./pages/Profile'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Deposit = lazy(() => import('./pages/Deposit'));
const Withdraw = lazy(() => import('./pages/Withdraw'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));

function App() {
  // Fix mobile viewport height
  React.useEffect(() => {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVH();
    window.addEventListener('resize', setVH);
    return () => window.removeEventListener('resize', setVH);
  }, []);

  return (
    // ✅ Wrap everything with ErrorBoundary
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <WalletProvider>
            <GameProvider>
              <Router>
                <Toaster
                  position="top-center"
                  toastOptions={{
                    duration: 3000,
                    style: {
                      background: '#1a1a2e',
                      color: '#fff',
                      borderRadius: '12px',
                    },
                    success: {
                      iconTheme: { primary: '#4ade80', secondary: '#1a1a2e' },
                    },
                    error: {
                      iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' },
                    },
                  }}
                />
                <Layout>
                  <Suspense fallback={<LoadingSpinner fullScreen />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/games" element={<Games />} />
                      <Route path="/games/slots" element={<Slots />} />
                      <Route path="/games/live-casino" element={<LiveCasino />} />
                      <Route path="/games/sports" element={<Sports />} />
                      <Route path="/games/fishing" element={<Fishing />} />
                      <Route path="/games/lotto" element={<Lotto />} />
                      <Route path="/promotions" element={<Promotions />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/wallet" element={<Wallet />} />
                      <Route path="/wallet/deposit" element={<Deposit />} />
                      <Route path="/wallet/withdraw" element={<Withdraw />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </Layout>
              </Router>
            </GameProvider>
          </WalletProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
