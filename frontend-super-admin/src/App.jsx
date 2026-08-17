import React, { Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AdminLayout from './components/layout/AdminLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// ============================================================
// ErrorBoundary
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
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserList = lazy(() => import('./pages/Users/UserList'));
const UserDetails = lazy(() => import('./pages/Users/UserDetails'));
const GameList = lazy(() => import('./pages/Games/GameList'));
const GameAdd = lazy(() => import('./pages/Games/GameAdd'));
const GameEdit = lazy(() => import('./pages/Games/GameEdit'));
const GameControl = lazy(() => import('./pages/Games/GameControl'));
const TransactionList = lazy(() => import('./pages/Transactions/TransactionList'));
const DepositApproval = lazy(() => import('./pages/Transactions/DepositApproval'));
const WithdrawApproval = lazy(() => import('./pages/Transactions/WithdrawApproval'));
const PromotionList = lazy(() => import('./pages/Promotions/PromotionList'));
const PromotionAdd = lazy(() => import('./pages/Promotions/PromotionAdd'));
const BannerList = lazy(() => import('./pages/Banners/BannerList'));
const BannerAdd = lazy(() => import('./pages/Banners/BannerAdd'));
const LanguageSettings = lazy(() => import('./pages/Languages/LanguageSettings'));
const TranslationEditor = lazy(() => import('./pages/Languages/TranslationEditor'));
const GeneralSettings = lazy(() => import('./pages/Settings/GeneralSettings'));
const AppearanceSettings = lazy(() => import('./pages/Settings/AppearanceSettings'));
const PaymentSettings = lazy(() => import('./pages/Settings/PaymentSettings'));
const CountrySettings = lazy(() => import('./pages/Settings/CountrySettings'));
const SupportChat = lazy(() => import('./pages/Support/SupportChat'));

// ============================================================
// Protected Route Component - MOVED INSIDE App
// ============================================================
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <LoadingSpinner />;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

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
        <Router>
          <AuthProvider>
            <AdminProvider>
              <Toaster
                position="top-right"
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
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/*"
                    element={
                      <ProtectedRoute>
                        <AdminLayout>
                          <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            
                            {/* Users */}
                            <Route path="/users" element={<UserList />} />
                            <Route path="/users/:id" element={<UserDetails />} />
                            
                            {/* Games */}
                            <Route path="/games" element={<GameList />} />
                            <Route path="/games/add" element={<GameAdd />} />
                            <Route path="/games/:id/edit" element={<GameEdit />} />
                            <Route path="/games/:id/control" element={<GameControl />} />
                            
                            {/* Transactions */}
                            <Route path="/transactions" element={<TransactionList />} />
                            <Route path="/transactions/deposits" element={<DepositApproval />} />
                            <Route path="/transactions/withdrawals" element={<WithdrawApproval />} />
                            
                            {/* Promotions */}
                            <Route path="/promotions" element={<PromotionList />} />
                            <Route path="/promotions/add" element={<PromotionAdd />} />
                            
                            {/* Banners */}
                            <Route path="/banners" element={<BannerList />} />
                            <Route path="/banners/add" element={<BannerAdd />} />
                            
                            {/* Languages */}
                            <Route path="/languages" element={<LanguageSettings />} />
                            <Route path="/languages/:code/edit" element={<TranslationEditor />} />
                            
                            {/* Settings */}
                            <Route path="/settings/general" element={<GeneralSettings />} />
                            <Route path="/settings/appearance" element={<AppearanceSettings />} />
                            <Route path="/settings/payment" element={<PaymentSettings />} />
                            <Route path="/settings/countries" element={<CountrySettings />} />
                            
                            {/* Support */}
                            <Route path="/support" element={<SupportChat />} />
                          </Routes>
                        </AdminLayout>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </Suspense>
            </AdminProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
