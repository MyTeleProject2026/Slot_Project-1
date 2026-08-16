import React, { Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { GameProvider } from './contexts/GameContext';
import { WalletProvider } from './contexts/WalletContext';
import { ThemeProvider } from './contexts/ThemeContext';
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
// Simple Layout (No complex imports)
// ============================================================
const SimpleLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', color: 'white' }}>
      <nav style={{ padding: '16px', background: '#1a1a2e', borderBottom: '1px solid #333' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ color: '#f1c40f', fontSize: '1.5rem' }}>FattBet</h1>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="/" style={{ color: 'white', textDecoration: 'none' }}>Home</a>
            <a href="/games" style={{ color: 'white', textDecoration: 'none' }}>Games</a>
            <a href="/login" style={{ color: '#f1c40f', textDecoration: 'none' }}>Login</a>
          </div>
        </div>
      </nav>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {children}
      </main>
    </div>
  );
};

// ============================================================
// Simple Pages for Testing
// ============================================================
const HomePage = () => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <h1 style={{ color: '#f1c40f', fontSize: '2.5rem' }}>Welcome to FattBet</h1>
    <p style={{ color: '#aaa', fontSize: '1.2rem', margin: '20px 0' }}>Your trusted online gaming platform</p>
    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <a href="/games" style={{ padding: '12px 30px', background: '#f1c40f', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Play Now</a>
      <a href="/login" style={{ padding: '12px 30px', background: 'transparent', color: '#f1c40f', borderRadius: '8px', textDecoration: 'none', border: '1px solid #f1c40f' }}>Login</a>
    </div>
  </div>
);

const GamesPage = () => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <h1 style={{ color: '#f1c40f', fontSize: '2rem' }}>Games</h1>
    <p style={{ color: '#aaa' }}>Game lobby loading...</p>
  </div>
);

const LoginPage = () => (
  <div style={{ maxWidth: '400px', margin: '40px auto', background: '#1a1a2e', padding: '30px', borderRadius: '12px' }}>
    <h2 style={{ color: 'white', textAlign: 'center' }}>Login</h2>
    <input type="text" placeholder="Username" style={{ width: '100%', padding: '12px', margin: '10px 0', background: '#2d2d44', border: 'none', borderRadius: '8px', color: 'white' }} />
    <input type="password" placeholder="Password" style={{ width: '100%', padding: '12px', margin: '10px 0', background: '#2d2d44', border: 'none', borderRadius: '8px', color: 'white' }} />
    <button style={{ width: '100%', padding: '12px', background: '#f1c40f', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Sign In</button>
  </div>
);

// ============================================================
// Lazy-loaded pages
// ============================================================
const Home = lazy(() => Promise.resolve({ default: HomePage }));
const Games = lazy(() => Promise.resolve({ default: GamesPage }));
const Login = lazy(() => Promise.resolve({ default: LoginPage }));
const NotFound = lazy(() => Promise.resolve({ default: () => <div style={{ textAlign: 'center', padding: '40px' }}><h1 style={{ color: '#f1c40f' }}>404 - Page Not Found</h1></div> }));

// ============================================================
// Main App Component
// ============================================================
function App() {
  return (
    <ErrorBoundary>
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
          }}
        />
        <SimpleLayout>
          <Suspense fallback={<LoadingSpinner fullScreen />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/games" element={<Games />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </SimpleLayout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
