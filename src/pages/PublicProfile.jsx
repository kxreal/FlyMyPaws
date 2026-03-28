import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Plane, Star, MessageCircle } from 'lucide-react';

const STATUS_LABELS = {
  still_needed: { label: 'Needs Volunteer', cls: 'status-still_needed' },
  on_hold:      { label: 'On Hold',         cls: 'status-on_hold' },
  confirmed:    { label: 'Confirmed',        cls: 'status-confirmed' },
  completed:    { label: 'Completed',        cls: 'status-completed' },
};

const StarRating = ({ rating }) => (
  <span style={{ color: '#F59E0B', letterSpacing: '-1px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ opacity: i <= rating ? 1 : 0.25 }}>★</span>
    ))}
  </span>
);

const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    if (id) fetchAll(id);
  }, [id]);

  const fetchAll = async (userId) => {
    setLoading(true);
    const [{ data: prof }, { data: userPosts }, { data: userReviews }] = await Promise.all([
      supabase.from('profiles').select('id, username, bio, flight_history, role').eq('id', userId).single(),
      supabase.from('posts').select('*').or(`author_id.eq.${userId},assigned_user_id.eq.${userId}`).order('created_at', { ascending: false }),
      supabase.from('reviews').select('*, reviewer:profiles!reviews_reviewer_id_fkey(username)').eq('reviewee_id', userId).order('created_at', { ascending: false }),
    ]);
    setProfile(prof);
    setPosts(userPosts || []);
    setReviews(userReviews || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
        Loading profile…
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
        <h2>User not found</h2>
        <Link to="/" style={{ color: 'var(--color-primary)', marginTop: '0.5rem', display: 'inline-block' }}>← Back to Home</Link>
      </div>
    );
  }

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const authoredPosts = posts.filter(p => p.author_id === id);
  const petPostsCount = authoredPosts.filter(p => p.post_type === 'need_help').length;
  const volPostsCount = authoredPosts.filter(p => p.post_type === 'volunteer').length;
  const completedCount = posts.filter(p => p.status === 'completed').length;

  return (
    <div className="container" style={{ padding: '2.5rem var(--spacing-lg)', maxWidth: '800px' }}>
      {/* Back */}
      <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}>
        ← Back
      </button>

      {/* Header Card */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Avatar + Name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: 'var(--color-primary-bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem'
            }}>
              {profile.username?.[0]?.toUpperCase() || '🐾'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>{profile.username || 'Anonymous'}</h2>
              {profile.role === 'admin' && (
                <span className="badge badge-yellow" style={{ fontSize: '0.7rem' }}>Admin</span>
              )}
              {avgRating && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <StarRating rating={Math.round(avgRating)} />
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{avgRating} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{petPostsCount}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Pet Posts</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{volPostsCount}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Volunteer Trips</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1.2rem' }}>{completedCount}</div>
              <div style={{ color: 'var(--color-text-muted)' }}>Completed</div>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <p style={{ color: 'var(--color-text-sub)', fontSize: '0.9rem', lineHeight: '1.7' }}>{profile.bio}</p>
          </div>
        )}

        {/* Message button */}
        {session && session.user.id !== id && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
            <Link to={`/messages?user=${profile.id}`} className="btn btn-primary btn-sm">
              <MessageCircle size={14} /> Send Message
            </Link>
          </div>
        )}
      </div>

      {/* Flight History */}
      {profile.flight_history?.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plane size={16} color="var(--color-primary)" /> Transport History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {profile.flight_history.map((f, i) => (
              <div key={i} style={{ padding: '0.6rem 0.75rem', background: 'var(--color-background)', borderRadius: '8px', fontSize: '0.85rem' }}>
                <strong>{f.date}</strong>: {f.origin} ✈️ {f.destination} — {f.pet}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      {authoredPosts.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Active Posts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {authoredPosts.map(p => {
              const s = STATUS_LABELS[p.status] || STATUS_LABELS.still_needed;
              return (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--color-background)', borderRadius: '8px', fontSize: '0.875rem' }}>
                  <div>
                    <span style={{ marginRight: '0.4rem' }}>{p.post_type === 'need_help' ? '🐾' : '✈️'}</span>
                    <strong>{p.pet_name || `${p.origin} → ${p.destination}`}</strong>
                    {p.pet_name && <span style={{ color: 'var(--color-text-muted)', marginLeft: '0.4rem' }}>{p.origin} → {p.destination}</span>}
                  </div>
                  <span className={`badge ${s.cls}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="card">
        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Star size={16} color="var(--color-primary)" /> Reviews {reviews.length > 0 && `(${reviews.length})`}
        </h3>
        {reviews.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>No reviews yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {reviews.map(r => (
              <div key={r.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.reviewer?.username || 'Anonymous'}</span>
                  <StarRating rating={r.rating} />
                </div>
                {r.comment && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', lineHeight: '1.6' }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
