import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PawPrint, Loader2 } from 'lucide-react';

const Onboarding = () => {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) { setError('Please enter a display name.'); return; }

    setSaving(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate('/login'); return; }

    const { error: upsertErr } = await supabase
      .from('profiles')
      .update({ username: displayName.trim(), bio: bio.trim() || null })
      .eq('id', session.user.id);

    setSaving(false);
    if (upsertErr) { setError(upsertErr.message); return; }
    navigate('/');
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', background: 'var(--color-background)',
    }}>
      <div style={{
        width: '100%', maxWidth: '460px',
        background: 'var(--color-surface)',
        borderRadius: '20px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {/* Header strip */}
        <div style={{
          background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
          padding: '2rem 2rem 1.5rem',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🐾</div>
          <h1 style={{ color: '#fff', fontSize: '1.4rem', marginBottom: '0.25rem' }}>Welcome to FlightFurward!</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
            Just a couple of things before you get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Display Name <span style={{ color: 'var(--color-error)' }}>*</span>
            </label>
            <input
              className="form-control"
              placeholder="What should we call you?"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              maxLength={40}
              autoFocus
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              This is public and shown on your posts and profile.
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              About You <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              className="form-control"
              placeholder="Tell the community a little about yourself — e.g. experience with pets, flights you typically take…"
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={400}
              style={{ resize: 'vertical' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', textAlign: 'right' }}>
              {bio.length}/400
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.7rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {saving ? <><Loader2 size={16} className="spinner" /> Saving…</> : '✅ Let\'s go!'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', fontSize: '0.82rem', cursor: 'pointer', padding: 0, textAlign: 'center' }}
          >
            Skip for now
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
