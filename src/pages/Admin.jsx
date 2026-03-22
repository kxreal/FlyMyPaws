import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Ban, CheckCircle, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

// Reusable Toggle component
const Toggle = ({ label, description, value, onChange, loading }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--color-border)' }}>
    <div>
      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{description}</div>
    </div>
    <button
      onClick={onChange}
      disabled={loading}
      style={{ background: 'none', border: 'none', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem', color: value ? 'var(--color-secondary)' : 'var(--color-text-muted)', fontSize: '0.85rem', fontWeight: 600, transition: 'color 0.2s' }}
    >
      {loading ? (
        <Loader2 size={26} className="spinner" />
      ) : value ? (
        <><ToggleRight size={32} /> ON</>
      ) : (
        <><ToggleLeft size={32} /> OFF</>
      )}
    </button>
  </div>
);

const AdminCenter = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [settings, setSettings] = useState({ email_registration_enabled: true });
  const [settingsLoading, setSettingsLoading] = useState({});
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthLoading(false); return; }

      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role === 'admin') {
        setIsAdmin(true);
        fetchData();
      }
      setAuthLoading(false);
    };
    init();
  }, []);

  const fetchData = async () => {
    // Fetch settings
    const { data: settingsData } = await supabase.from('app_settings').select('*');
    if (settingsData) {
      const map = {};
      settingsData.forEach(s => { map[s.key] = s.value === 'true'; });
      setSettings(map);
    }

    // Fetch profiles
    const { data: profileData } = await supabase
      .from('profiles').select('id, username, role').order('created_at', { ascending: false }).limit(50);
    if (profileData) setUsers(profileData);

    // Fetch posts
    const { data: postData } = await supabase
      .from('posts').select('id, pet_name, origin, destination, post_type, status, created_at')
      .order('created_at', { ascending: false }).limit(30);
    if (postData) setPosts(postData);
  };

  const toggleSetting = async (key) => {
    const newVal = !settings[key];
    setSettingsLoading(prev => ({ ...prev, [key]: true }));
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key, value: String(newVal), updated_at: new Date().toISOString() });
    if (!error) setSettings(prev => ({ ...prev, [key]: newVal }));
    setSettingsLoading(prev => ({ ...prev, [key]: false }));
  };

  const toggleUserRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', user.id);
    if (!error) setUsers(prev => prev.map(u => u.id === user.id ? { ...u, role: newRole } : u));
  };

  const removePost = async (postId) => {
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (!error) setPosts(prev => prev.filter(p => p.id !== postId));
  };

  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Loading…</div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔒</div>
        <h2>Admin Access Required</h2>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Your account does not have admin privileges.</p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          To gain access, an existing admin must set your <code>role</code> to <code>admin</code> in the <code>profiles</code> table.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem var(--spacing-lg)', maxWidth: '900px' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.6rem', marginBottom: '0.3rem' }}>
          <Shield size={24} color="var(--color-primary)" /> Admin Center
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Manage platform settings, users, and posts</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>

        {/* ── Platform Settings ── */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Platform Settings</h3>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', marginBottom: '0.5rem' }}>Control feature availability across the platform</p>

          <Toggle
            label="Email Registration"
            description="Allow new users to register with email & password"
            value={settings.email_registration_enabled}
            onChange={() => toggleSetting('email_registration_enabled')}
            loading={settingsLoading.email_registration_enabled}
          />
          <Toggle
            label="New Post Creation"
            description="Allow users to create pet or volunteer posts"
            value={settings.post_creation_enabled ?? true}
            onChange={() => toggleSetting('post_creation_enabled')}
            loading={settingsLoading.post_creation_enabled}
          />
          <Toggle
            label="Messaging"
            description="Allow users to send direct messages"
            value={settings.messaging_enabled ?? true}
            onChange={() => toggleSetting('messaging_enabled')}
            loading={settingsLoading.messaging_enabled}
          />
        </div>

        {/* ── User Management ── */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>User Management</h3>
          {users.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No users found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {users.map(u => (
                <div key={u.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem', borderRadius: '8px',
                  background: 'var(--color-background)', border: '1px solid var(--color-border)'
                }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.username || '(no username)'}</span>
                    <span style={{
                      marginLeft: '0.6rem', fontSize: '0.72rem', fontWeight: 600,
                      padding: '0.15rem 0.5rem', borderRadius: '999px',
                      background: u.role === 'admin' ? '#FEF3C7' : 'var(--color-primary-bg)',
                      color: u.role === 'admin' ? '#92400E' : 'var(--color-primary-dark)',
                    }}>{u.role || 'user'}</span>
                  </div>
                  <button
                    onClick={() => toggleUserRole(u)}
                    className="btn btn-sm btn-outline"
                    style={{ color: u.role === 'admin' ? 'var(--color-error)' : 'var(--color-secondary)', borderColor: u.role === 'admin' ? 'var(--color-error)' : 'var(--color-secondary)' }}
                  >
                    {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Post Moderation ── */}
        <div className="card">
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Post Moderation</h3>
          {posts.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No posts found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {posts.map(p => (
                <div key={p.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1rem', borderRadius: '8px',
                  background: 'var(--color-background)', border: '1px solid var(--color-border)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {p.post_type === 'need_help' ? '🐾' : '✈️'} {p.pet_name || `${p.origin} → ${p.destination}`}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                      {p.origin} → {p.destination} · {p.status}
                    </div>
                  </div>
                  <button
                    onClick={() => { if (window.confirm('Remove this post?')) removePost(p.id); }}
                    className="btn btn-sm"
                    style={{ color: 'var(--color-error)', border: '1px solid var(--color-error)', background: 'transparent' }}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCenter;
