import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import PaymentForm from './components/PaymentForm';
import PaymentsList from './components/PaymentsList';
import ChannelManager from './components/ChannelManager';
import './App.css';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'payments' | 'channels'>('payments');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const handleSignUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    alert('Account created! Please sign in.');
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1>PayHero Payment Gateway</h1>
          <div className="user-info">
            <span>{user.email}</span>
            <button onClick={handleSignOut} className="btn-secondary">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments
            </button>
            <button
              className={`tab ${activeTab === 'channels' ? 'active' : ''}`}
              onClick={() => setActiveTab('channels')}
            >
              Payment Channels
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'payments' ? (
              <div className="payments-section">
                <PaymentForm />
                <PaymentsList />
              </div>
            ) : (
              <ChannelManager />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function AuthForm({ onSignIn, onSignUp }: {
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (email: string, password: string) => Promise<void>;
}) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        await onSignUp(email, password);
      } else {
        await onSignIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>PayHero Payment Gateway</h1>
        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={loading}
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <p className="auth-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsSignUp(!isSignUp)} className="link-button">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
