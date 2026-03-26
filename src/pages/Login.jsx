import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Login = () => {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [registrationEnabled, setRegistrationEnabled] = useState(true);
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(true);
  const navigate = useNavigate();

  // Check if admin has disabled specific features
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('*')
        .in('key', ['email_registration_enabled', 'google_auth_enabled']);
      
      if (data) {
        const reg = data.find(s => s.key === 'email_registration_enabled');
        const goog = data.find(s => s.key === 'google_auth_enabled');
        if (reg) setRegistrationEnabled(reg.value === 'true');
        if (goog) setGoogleAuthEnabled(goog.value === 'true');
      }
    };
    fetchSettings();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/');
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!registrationEnabled) {
      setError('New registrations are currently disabled. Please contact an admin.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username || email.split('@')[0] } }
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Account created! Check your email to confirm, then log in below.');
      setTab('login');
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password',
    });
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset instructions sent to your email.');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) setError('Google login failed. It may not be enabled yet.');
    setLoading(false);
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 0.9rem',
    border: '1.5px solid var(--color-border)',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    background: 'var(--color-surface)',
    color: 'var(--color-text-main)',
    marginTop: '0.3rem',
    outline: 'none',
    transition: 'border-color 0.15s',
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>🐾</div>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>
            {tab === 'login' ? 'Welcome back' : tab === 'register' ? 'Join FlightFurward' : 'Reset Password'}
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
            {tab === 'login'
              ? 'Sign in to connect with flight buddies'
              : tab === 'register' 
                ? 'Create a free account to get started'
                : 'Enter your email to reset your account password'}
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '1.75rem' }}>

          {/* Tab Toggle */}
          {tab !== 'reset' && (
            <div style={{ display: 'flex', background: 'var(--color-background)', borderRadius: '8px', padding: '3px', marginBottom: '1.5rem' }}>
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setMessage(''); }}
                style={{
                  flex: 1, padding: '0.5rem', border: 'none', borderRadius: '6px',
                  fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: tab === t ? 'var(--color-surface)' : 'transparent',
                  color: tab === t ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
          )}

          {/* Alert Messages */}
          {error && (
            <div style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.65rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #FECACA' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ background: '#F0FDF4', color: '#166534', padding: '0.65rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem', border: '1px solid #BBF7D0' }}>
              {message}
            </div>
          )}

          {/* Login Form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>Email</label>
                <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>Password</label>
                  <span onClick={() => { setTab('reset'); setError(''); setMessage(''); }} style={{ fontSize: '0.8rem', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600 }}>Forgot password?</span>
                </div>
                <input style={inputStyle} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }} disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === 'register' && (
            <>
              {!registrationEnabled ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--color-text-muted)', background: 'var(--color-background)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🔒</div>
                  <p style={{ fontSize: '0.875rem' }}>New registrations are currently closed.<br />Please contact an administrator.</p>
                </div>
              ) : (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>Username</label>
                    <input style={inputStyle} type="text" placeholder="Choose a display name" value={username} onChange={e => setUsername(e.target.value)}
                      onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>Email</label>
                    <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                      onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>Password</label>
                    <input style={inputStyle} type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required
                      onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
                  </div>
                  <p style={{ fontSize: '0.775rem', color: 'var(--color-text-muted)', background: 'var(--color-background)', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                    🔒 For your safety, avoid sharing your full name, address, or phone number in your profile.
                  </p>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                    {loading ? 'Creating account…' : 'Create Account'}
                  </button>
                </form>
              )}
            </>
          )}

          {/* Reset Password Form */}
          {tab === 'reset' && (
            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>Email</label>
                <input style={inputStyle} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required
                  onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }} disabled={loading}>
                {loading ? 'Sending link…' : 'Send Reset Link'}
              </button>
              <button type="button" onClick={() => { setTab('login'); setError(''); setMessage(''); }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>
                Back to Sign In
              </button>
            </form>
          )}

          {/* Google Auth - Universal */}
          {googleAuthEnabled && tab !== 'reset' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '1.25rem 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>or</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--color-border)' }} />
              </div>

              <button onClick={handleGoogleLogin} disabled={loading}
                style={{
                  width: '100%', padding: '0.65rem', border: '1.5px solid var(--color-border)',
                  borderRadius: '8px', background: 'var(--color-surface)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-main)',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          By continuing, you agree to our Terms of Service.
        </p>
      </div>
    </div>
  );
};

export default Login;
