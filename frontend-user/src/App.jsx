import React, { Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';
import Play from './pages/Play';
// ============================================================
// ErrorBoundary (same as before)
// ============================================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    console.error('🔥 FULL ERROR:', error);
    console.error('🔥 ERROR MESSAGE:', error?.message);
    console.error('🔥 ERROR STACK:', error?.stack);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary caught:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error';
      return (
        <div style={{ padding: '20px', color: '#fff', background: '#1a1a2e', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#f1c40f' }}>⚠️ Something went wrong</h1>
          <pre style={{ color: '#ff6b6b', whiteSpace: 'pre-wrap', background: '#2d2d44', padding: '12px', borderRadius: '8px' }}>
            {errorMessage}
          </pre>
          <details>
            <summary style={{ color: '#aaa', cursor: 'pointer' }}>Stack Trace</summary>
            <pre style={{ color: '#aaa', whiteSpace: 'pre-wrap', background: '#2d2d44', padding: '12px', borderRadius: '8px', fontSize: '12px' }}>
              {this.state.error?.stack || 'No stack available'}
            </pre>
          </details>
          <button onClick={() => window.location.reload()} style={{ marginTop: '16px', padding: '8px 20px', background: '#f1c40f', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================
// Lazy-loaded pages
// ============================================================
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
const History = lazy(() => import('./pages/History'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Referral = lazy(() => import('./pages/Referral'));
const Support = lazy(() => import('./pages/Support'));
const NotFound = lazy(() => import('./pages/NotFound'));

// ============================================================
// Main App Component
// ============================================================
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
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <Router>
            <AuthProvider>
              <WalletProvider>
                <GameProvider>
                  <Toaster
                    position="top-center"
                    toastOptions={{
                      duration: 3000,
                      style: {
                        background: '#1a1a2e',
                        color: '#fff',
                        borderRadius: '12px',
                        maxWidth: '400px',
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
                        <Route path="/play/:gameId" element={<Play />} />
                        <Route path="/promotions" element={<Promotions />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/wallet" element={<Wallet />} />
                        <Route path="/wallet/deposit" element={<Deposit />} />
                        <Route path="/wallet/withdraw" element={<Withdraw />} />
                        <Route path="/history" element={<History />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/referral" element={<Referral />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </Layout>
                </GameProvider>
              </WalletProvider>
            </AuthProvider>
          </Router>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
