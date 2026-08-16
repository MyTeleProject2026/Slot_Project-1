import React, { Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/common/Layout';
import LoadingSpinner from './components/common/LoadingSpinner';

// ============================================================
// PROFESSIONAL ERROR BOUNDARY with detailed logging
// ============================================================
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    console.error('🔥 FULL ERROR OBJECT:', error);
    console.error('🔥 ERROR STACK:', error?.stack);
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('❌ ErrorBoundary caught:');
    console.error('  Error:', error);
    console.error('  Error message:', error?.message);
    console.error('  Error stack:', error?.stack);
    console.error('  Component stack:', errorInfo?.componentStack);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || 'Unknown error';
      const errorStack = this.state.error?.stack || 'No stack trace';
      
      return (
        <div style={{ 
          padding: '20px', 
          color: '#fff', 
          background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%)', 
          minHeight: '100vh', 
          fontFamily: 'Inter, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ 
            maxWidth: '600px', 
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '20px',
            padding: '40px'
          }}>
            <h1 style={{ color: '#f1c40f', fontSize: '2rem', marginBottom: '20px' }}>⚠️ Something went wrong</h1>
            <div style={{ background: 'rgba(255,0,0,0.1)', padding: '16px', borderRadius: '12px', marginTop: '12px' }}>
              <p style={{ color: '#ff6b6b', fontWeight: 'bold' }}>Error:</p>
              <pre style={{ color: '#ff6b6b', whiteSpace: 'pre-wrap', margin: '8px 0' }}>
                {errorMessage}
              </pre>
              {errorStack && (
                <>
                  <p style={{ color: '#ffa94d', fontWeight: 'bold', marginTop: '12px' }}>Stack Trace:</p>
                  <pre style={{ color: '#aaa', whiteSpace: 'pre-wrap', fontSize: '12px', maxHeight: '300px', overflow: 'auto' }}>
                    {errorStack}
                  </pre>
                </>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              style={{ 
                marginTop: '16px', 
                padding: '12px 30px', 
                background: '#f1c40f', 
                color: '#000', 
                border: 'none', 
                borderRadius: '10px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            >
              Reload
            </button>
          </div>
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
