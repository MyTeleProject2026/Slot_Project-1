import React, { Suspense, lazy, Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
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
// Simple Layout with React Router Links
// ============================================================
const SimpleLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f1a', color: 'white' }}>
      <nav style={{ padding: '16px', background: '#1a1a2e', borderBottom: '1px solid #333' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1200px', margin: '0 auto' }}>
          <Link to="/" style={{ color: '#f1c40f', fontSize: '1.5rem', textDecoration: 'none', fontWeight: 'bold' }}>
            FattBet
          </Link>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}>Home</Link>
            <Link to="/games" style={{ color: 'white', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}>Games</Link>
            <Link to="/login" style={{ color: '#f1c40f', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px', background: 'rgba(241, 196, 15, 0.1)' }}>Login</Link>
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
// Pages (hardcoded)
// ============================================================
const HomePage = () => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <h1 style={{ color: '#f1c40f', fontSize: '2.5rem' }}>Welcome to FattBet</h1>
    <p style={{ color: '#aaa', fontSize: '1.2rem', margin: '20px 0' }}>Your trusted online gaming platform</p>
    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <Link to="/games" style={{ padding: '12px 30px', background: '#f1c40f', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Play Now</Link>
      <Link to="/login" style={{ padding: '12px 30px', background: 'transparent', color: '#f1c40f', borderRadius: '8px', textDecoration: 'none', border: '1px solid #f1c40f' }}>Login</Link>
    </div>
  </div>
);

const GamesPage = () => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <h1 style={{ color: '#f1c40f', fontSize: '2rem' }}>Games</h1>
    <p style={{ color: '#aaa' }}>Game lobby loading...</p>
    <div style={{ marginTop: '20px' }}>
      <Link to="/" style={{ color: '#f1c40f', textDecoration: 'none' }}>← Back to Home</Link>
    </div>
  </div>
);

const LoginPage = () => (
  <div style={{ maxWidth: '400px', margin: '40px auto', background: '#1a1a2e', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
    <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Sign In</h2>
    <input type="text" placeholder="Username" style={{ width: '100%', padding: '12px', margin: '10px 0', background: '#2d2d44', border: 'none', borderRadius: '8px', color: 'white' }} />
    <input type="password" placeholder="Password" style={{ width: '100%', padding: '12px', margin: '10px 0', background: '#2d2d44', border: 'none', borderRadius: '8px', color: 'white' }} />
    <button style={{ width: '100%', padding: '12px', background: '#f1c40f', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Sign In</button>
    <p style={{ textAlign: 'center', color: '#666', marginTop: '15px' }}>
      Don't have an account? <Link to="/register" style={{ color: '#f1c40f', textDecoration: 'none' }}>Register</Link>
    </p>
  </div>
);

const RegisterPage = () => (
  <div style={{ maxWidth: '400px', margin: '40px auto', background: '#1a1a2e', padding: '30px', borderRadius: '12px', border: '1px solid #333' }}>
    <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Create Account</h2>
    <input type="text" placeholder="Username" style={{ width: '100%', padding: '12px', margin: '10px 0', background: '#2d2d44', border: 'none', borderRadius: '8px', color: 'white' }} />
    <input type="email" placeholder="Email" style={{ width: '100%', padding: '12px', margin: '10px 0', background: '#2d2d44', border: 'none', borderRadius: '8px', color: 'white' }} />
    <input type="password" placeholder="Password" style={{ width: '100%', padding: '12px', margin: '10px 0', background: '#2d2d44', border: 'none', borderRadius: '8px', color: 'white' }} />
    <button style={{ width: '100%', padding: '12px', background: '#f1c40f', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>Register</button>
    <p style={{ textAlign: 'center', color: '#666', marginTop: '15px' }}>
      Already have an account? <Link to="/login" style={{ color: '#f1c40f', textDecoration: 'none' }}>Sign In</Link>
    </p>
  </div>
);

const NotFoundPage = () => (
  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
    <h1 style={{ color: '#f1c40f', fontSize: '4rem' }}>404</h1>
    <h2 style={{ color: 'white' }}>Page Not Found</h2>
    <p style={{ color: '#aaa' }}>The page you're looking for doesn't exist.</p>
    <Link to="/" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 30px', background: '#f1c40f', color: '#000', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Go Home</Link>
  </div>
);

// ============================================================
// Lazy-loaded pages
// ============================================================
const Home = lazy(() => Promise.resolve({ default: HomePage }));
const Games = lazy(() => Promise.resolve({ default: GamesPage }));
const Login = lazy(() => Promise.resolve({ default: LoginPage }));
const Register = lazy(() => Promise.resolve({ default: RegisterPage }));
const NotFound = lazy(() => Promise.resolve({ default: NotFoundPage }));

// ============================================================
// Main App Component
// ============================================================
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
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
                  <Route path="/register" element={<Register />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </SimpleLayout>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
