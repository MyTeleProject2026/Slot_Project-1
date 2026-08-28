import React, { Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AdminLayout from './components/layout/AdminLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('Super Admin UI error:', error, info); }
  render() {
    if (this.state.hasError) return <div style={{padding:20,color:'#fff',background:'#1a1a2e',minHeight:'100vh'}}><h1>Something went wrong</h1><pre>{this.state.error?.message}</pre><button onClick={() => window.location.reload()}>Reload</button></div>;
    return this.props.children;
  }
}

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ControlCenter = lazy(() => import('./pages/ControlCenter'));
const MasterAssets = lazy(() => import('./pages/MasterAssets'));
const AdminManagement = lazy(() => import('./pages/AdminManagement'));
const SettlementCenter = lazy(() => import('./pages/SettlementCenter'));
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

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  React.useEffect(() => {
    const setVH = () => document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    setVH(); window.addEventListener('resize', setVH); return () => window.removeEventListener('resize', setVH);
  }, []);
  return <ErrorBoundary><ThemeProvider><Router><AuthProvider><AdminProvider><Toaster position="top-right" toastOptions={{duration:3000,style:{background:'#1a1a2e',color:'#fff',borderRadius:'12px'}}}/><Suspense fallback={<LoadingSpinner />}><Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/*" element={<ProtectedRoute><AdminLayout><Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/control-center" element={<ControlCenter />} />
      <Route path="/master-assets" element={<MasterAssets />} />
      <Route path="/admin-management" element={<AdminManagement />} />
      <Route path="/settlement-center" element={<SettlementCenter />} />
      <Route path="/users" element={<UserList />} /><Route path="/users/:id" element={<UserDetails />} />
      <Route path="/games" element={<GameList />} /><Route path="/games/add" element={<GameAdd />} /><Route path="/games/:id/edit" element={<GameEdit />} /><Route path="/games/:id/control" element={<GameControl />} />
      <Route path="/transactions" element={<TransactionList />} /><Route path="/transactions/deposits" element={<DepositApproval />} /><Route path="/transactions/withdrawals" element={<WithdrawApproval />} />
      <Route path="/promotions" element={<PromotionList />} /><Route path="/promotions/add" element={<PromotionAdd />} />
      <Route path="/banners" element={<BannerList />} /><Route path="/banners/add" element={<BannerAdd />} />
      <Route path="/languages" element={<LanguageSettings />} /><Route path="/languages/:code/edit" element={<TranslationEditor />} />
      <Route path="/settings/general" element={<GeneralSettings />} /><Route path="/settings/appearance" element={<AppearanceSettings />} /><Route path="/settings/payment" element={<PaymentSettings />} /><Route path="/settings/countries" element={<CountrySettings />} />
      <Route path="/support" element={<SupportChat />} />
    </Routes></AdminLayout></ProtectedRoute>} />
  </Routes></Suspense></AdminProvider></AuthProvider></Router></ThemeProvider></ErrorBoundary>;
}
export default App;
