import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const UpdatePassword = ({ session }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // If not logged in, and no password recovery hash URL exists,
    // we redirect away. Supabase automatically parses the #access_token
    // from the recovery email and creates the session.
    if (!session && !window.location.hash) {
      navigate('/login');
    }
  }, [session, navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    // Since clicking the recovery link authenticates the user temporarily,
    // we can simply call updateUser to set a new password.
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully! Redirecting...');
      setTimeout(() => navigate('/'), 2000);
    }
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
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '1.75rem' }}>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', textAlign: 'center' }}>Reset Password</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          Enter your new password below.
        </p>

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

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-sub)' }}>New Password</label>
            <input 
              style={inputStyle}
              type="password" 
              placeholder="Min. 6 characters" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required
              onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.25rem' }} disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
