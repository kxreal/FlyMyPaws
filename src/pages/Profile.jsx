import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Info, ShieldAlert, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Toast from '../components/Toast';
import EditPostModal from '../components/EditPostModal';

const Profile = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [completedFlights, setCompletedFlights] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [editingPost, setEditingPost] = useState(null); // post object to edit
  
  const [profile, setProfile] = useState({
    username: "",
    bio: "",
    flight_history: []
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
        fetchMyPosts(session.user.id);
        fetchHistoryAndReviews(session.user.id);
      } else {
        setLoading(false);
        navigate('/login');
      }
    });
  }, [navigate]);

  const fetchMyPosts = async (userId) => {
    const { data } = await supabase
      .from('posts')
      .select('id, post_type, pet_name, pet_emoji, breed, weight_kg, description, photos, origin, destination, status, airline, flight_date, is_hidden')
      .eq('author_id', userId)
      .neq('status', 'completed')
      .order('created_at', { ascending: false });
    setMyPosts(data || []);
  };

  const fetchHistoryAndReviews = async (userId) => {
    // History
    const { data: flights } = await supabase
      .from('posts')
      .select('*, author:profiles!author_id(username), assigned:profiles!assigned_user_id(username)')
      .eq('status', 'completed')
      .or(`author_id.eq.${userId},assigned_user_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    setCompletedFlights(flights || []);

    // Reviews
    const { data: revs } = await supabase
      .from('reviews')
      .select('*, reviewer:profiles!reviewer_id(username)')
      .eq('reviewee_id', userId)
      .order('created_at', { ascending: false });
    setMyReviews(revs || []);
  };

  const fetchProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select(`username, bio, flight_history`)
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      if (data) {
        setProfile({
          username: data.username || "",
          bio: data.bio || "",
          flight_history: data.flight_history || []
        });
      }
    } catch (error) {
      console.warn("Error fetching profile:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          bio: profile.bio
        })
        .eq('id', session.user.id);

      if (error) throw error;
      setToast({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      setToast({ message: 'Error updating profile: ' + error.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleArchiveToggle = async (post) => {
    const { error } = await supabase
      .from('posts')
      .update({ is_hidden: !post.is_hidden })
      .eq('id', post.id);
    if (!error) {
      setMyPosts(prev => prev.map(p => p.id === post.id ? { ...p, is_hidden: !p.is_hidden } : p));
      setToast({ message: post.is_hidden ? 'Post restored to listings.' : 'Post hidden from listings (record kept).', type: 'success' });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return <div className="container mt-4 text-center"><Loader2 className="animate-spin" size={32} style={{ margin: '0 auto', color: 'var(--color-primary)' }} /></div>;
  }

  return (
    <>
    <div className="container mt-4" style={{ maxWidth: '800px' }}>
      <div className="flex-between mb-4">
        <h2 style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <User /> My Profile
        </h2>
        <button className="btn btn-outline" onClick={handleLogout} style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>

      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderLeft: '4px solid var(--color-warning)',
        padding: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
        borderRadius: 'var(--border-radius-sm)',
        display: 'flex',
        gap: 'var(--spacing-md)',
        alignItems: 'flex-start'
      }}>
        <ShieldAlert color="var(--color-warning)" />
        <div>
          <strong>Privacy Reminder:</strong> Please do not disclose unnecessary personal data (like your full home address or ID numbers) in your public bio or posts for safety reasons.
        </div>
      </div>

      <div className="card glass-panel mb-4">
        <h3>Public Information</h3>
        <div className="form-group mt-4">
          <label className="form-label">Display Name (Username)</label>
          <input 
            className="form-control" 
            value={profile.username} 
            onChange={(e) => setProfile({...profile, username: e.target.value})}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Email (Private)</label>
          <input className="form-control" readOnly value={session?.user?.email || ''} style={{ backgroundColor: '#F3F4F6' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Self Introduction</label>
          <textarea 
            className="form-control" 
            rows="4" 
            value={profile.bio}
            onChange={(e) => setProfile({...profile, bio: e.target.value})}
            placeholder="Tell us a bit about yourself and your experience with pets."
          ></textarea>
        </div>
        <button onClick={handleUpdateProfile} disabled={saving} className="btn btn-primary mt-4">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* ── My Posts ── */}
      <div className="card glass-panel" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>My Posts</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{myPosts.length} post{myPosts.length !== 1 ? 's' : ''}</span>
        </div>

        {myPosts.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1.5rem 0' }}>
            You haven't posted anything yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {myPosts.map(p => (
              <div key={p.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.75rem 1rem', borderRadius: '10px',
                background: p.is_hidden ? 'var(--color-background)' : 'var(--color-surface)',
                border: `1px solid ${p.is_hidden ? 'var(--color-border)' : 'var(--color-border)'}`,
                opacity: p.is_hidden ? 0.6 : 1,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span>{p.post_type === 'need_help' ? '🐾' : '✈️'}</span>
                    <strong style={{ fontSize: '0.875rem' }}>{p.pet_name || `${p.origin} → ${p.destination}`}</strong>
                    {p.pet_name && <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{p.origin} → {p.destination}</span>}
                    {p.is_hidden && <span style={{ fontSize: '0.7rem', background: '#F3F4F6', color: '#6B7280', padding: '0.1rem 0.45rem', borderRadius: '999px', fontWeight: 600 }}>Hidden</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
                    {p.status?.replace('_', ' ')} {p.flight_date ? `· ${p.flight_date}` : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, marginLeft: '0.75rem' }}>
                  <button
                    onClick={() => setEditingPost(p)}
                    className="btn btn-outline btn-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleArchiveToggle(p)}
                    className="btn btn-sm"
                    style={{
                      border: `1px solid ${p.is_hidden ? 'var(--color-secondary)' : 'var(--color-error)'}`,
                      color: p.is_hidden ? 'var(--color-secondary)' : 'var(--color-error)',
                      background: 'transparent',
                    }}
                  >
                    {p.is_hidden ? 'Restore' : 'Hide'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card glass-panel mb-4">
        <h3 style={{ marginBottom: '1.25rem' }}>History of Appointed Flights</h3>
        {completedFlights.length === 0 ? (
          <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-muted)', textAlign: 'center', padding: 'var(--spacing-lg)' }}>
            <Info size={40} style={{ margin: '0 auto var(--spacing-sm)', opacity: 0.5 }} />
            <p>No past flights recorded yet. Complete a match to build your history.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {completedFlights.filter(f => (f.post_type === 'volunteer' && f.author_id === session?.user.id) || (f.post_type !== 'volunteer' && f.assigned_user_id === session?.user.id)).length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>As Volunteer</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {completedFlights.filter(f => (f.post_type === 'volunteer' && f.author_id === session?.user.id) || (f.post_type !== 'volunteer' && f.assigned_user_id === session?.user.id)).map(flight => (
                    <div key={flight.id} style={{ padding: '0.75rem 1rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <strong>{flight.post_type === 'volunteer' ? 'Flight Volunteer' : (flight.pet_name || 'Pet')} ({flight.origin} ✈️ {flight.destination})</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{flight.flight_date || 'Flexible Date'}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>
                        {session?.user.id === flight.author_id 
                          ? `Matched with: ${flight.assigned?.username || 'Unknown'}`
                          : `Posted by: ${flight.author?.username || 'Unknown'}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {completedFlights.filter(f => (f.post_type !== 'volunteer' && f.author_id === session?.user.id) || (f.post_type === 'volunteer' && f.assigned_user_id === session?.user.id)).length > 0 && (
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>As Pet Owner (Helped)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {completedFlights.filter(f => (f.post_type !== 'volunteer' && f.author_id === session?.user.id) || (f.post_type === 'volunteer' && f.assigned_user_id === session?.user.id)).map(flight => (
                    <div key={flight.id} style={{ padding: '0.75rem 1rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <strong>{flight.post_type === 'volunteer' ? 'Flight Volunteer' : (flight.pet_name || 'Pet')} ({flight.origin} ✈️ {flight.destination})</strong>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{flight.flight_date || 'Flexible Date'}</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)' }}>
                        {session?.user.id === flight.author_id 
                          ? `Matched with: ${flight.assigned?.username || 'Unknown'}`
                          : `Posted by: ${flight.author?.username || 'Unknown'}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="card glass-panel">
        <h3>My Reviews</h3>
        {myReviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: 'var(--spacing-md)' }}>
            {myReviews.map(r => (
              <div key={r.id} style={{ padding: '0.75rem 1rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.reviewer?.username || 'Anonymous'}</div>
                  <div style={{ color: '#F59E0B', fontSize: '0.9rem', letterSpacing: '2px' }}>
                    {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                  </div>
                </div>
                {r.comment && <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>"{r.comment}"</p>}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ marginTop: 'var(--spacing-sm)', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            No reviews received yet.
          </div>
        )}
      </div>
    </div>
    <Toast toast={toast} onClose={() => setToast(null)} />
    {editingPost && (
      <EditPostModal
        post={editingPost}
        onClose={() => setEditingPost(null)}
        onSaved={() => {
          setEditingPost(null);
          fetchMyPosts(session.user.id);
          setToast({ message: 'Post updated!', type: 'success' });
        }}
      />
    )}
    </>
  );
};

export default Profile;
