class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Log the full error object to console
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
        <div style={{ padding: '20px', color: '#fff', background: '#1a1a2e', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h1 style={{ color: '#f1c40f' }}>⚠️ Something went wrong</h1>
          <div style={{ background: '#2d2d44', padding: '16px', borderRadius: '8px', marginTop: '12px' }}>
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
            {this.state.errorInfo?.componentStack && (
              <>
                <p style={{ color: '#74c0fc', fontWeight: 'bold', marginTop: '12px' }}>Component Stack:</p>
                <pre style={{ color: '#aaa', whiteSpace: 'pre-wrap', fontSize: '12px', maxHeight: '200px', overflow: 'auto' }}>
                  {this.state.errorInfo.componentStack}
                </pre>
              </>
            )}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: '16px', padding: '8px 20px', background: '#f1c40f', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
