import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MessageCircle, MapPin, Calendar, Weight, Plane, User, ChevronLeft, ChevronRight, X, Share2, Edit2, CheckCircle } from 'lucide-react';
import ShareModal from '../components/ShareModal';
import EditPostModal from '../components/EditPostModal';

const STATUS_LABELS = {
  still_needed: { label: 'Needs Volunteer', cls: 'status-still_needed' },
  on_hold:      { label: 'On Hold',         cls: 'status-on_hold' },
  confirmed:    { label: 'Confirmed',        cls: 'status-confirmed' },
  completed:    { label: 'Completed',        cls: 'status-completed' },
};

// ── Lightbox ──
const Lightbox = ({ photos, startIndex, onClose }) => {
  const [idx, setIdx] = useState(startIndex);
  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {/* Close */}
      <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <X size={18} />
      </button>

      {/* Prev */}
      {photos.length > 1 && (
        <button onClick={e => { e.stopPropagation(); prev(); }} style={{ position: 'absolute', left: '1rem', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronLeft size={20} />
        </button>
      )}

      <img
        src={photos[idx]}
        alt={`Photo ${idx + 1}`}
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '88vh', maxWidth: '90vw', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      />

      {/* Next */}
      {photos.length > 1 && (
        <button onClick={e => { e.stopPropagation(); next(); }} style={{ position: 'absolute', right: '1rem', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '40px', height: '40px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronRight size={20} />
        </button>
      )}

      {/* Counter */}
      {photos.length > 1 && (
        <div style={{ position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
          {idx + 1} / {photos.length}
        </div>
      )}
    </div>
  );
};

// ── Photo Gallery ──
const PhotoGallery = ({ photos }) => {
  const [lightboxIdx, setLightboxIdx] = useState(null);
  if (!photos || photos.length === 0) return null;

  const [main, ...rest] = photos;
  const GALLERY_HEIGHT = 400;

  return (
    <>
      <div style={{
        display: 'grid',
        gridTemplateColumns: rest.length > 0 ? '2fr 1fr' : '1fr',
        gap: '6px',
        height: `${GALLERY_HEIGHT}px`,
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '1.75rem',
      }}>
        {/* Main photo */}
        <div
          onClick={() => setLightboxIdx(0)}
          style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', height: '100%' }}
        >
          <img
            src={main}
            alt="Main"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
          />
        </div>

        {/* Side thumbnails */}
        {rest.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', height: '100%' }}>
            {rest.slice(0, 2).map((url, i) => (
              <div
                key={i}
                onClick={() => setLightboxIdx(i + 1)}
                style={{ flex: 1, position: 'relative', overflow: 'hidden', cursor: 'pointer' }}
              >
                <img
                  src={url}
                  alt={`Photo ${i + 2}`}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                />
                {i === 1 && photos.length > 3 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.25rem' }}>
                    +{photos.length - 3}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {lightboxIdx !== null && (
        <Lightbox photos={photos} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </>
  );
};

// ── Main Page ──
const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [owner, setOwner] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingPost, setEditingPost] = useState(false);

  const handleCompleteOffPlatform = async () => {
    if (!window.confirm("Mark as completed off-platform? (This won't assign a FlyMyPaws user to your flight history). To link a user and leave reviews, please click 'Complete' from inside your direct Messages instead!")) return;
    const { error } = await supabase.from('posts').update({ status: 'completed' }).eq('id', post.id);
    if (!error) {
      setPost(prev => ({ ...prev, status: 'completed' }));
      alert('Post marked as completed!');
    } else {
      alert('Error updating post: ' + error.message);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    const { data: postData, error } = await supabase.from('posts').select('*').eq('id', id).single();
    if (error || !postData) { setLoading(false); return; }
    setPost(postData);

    if (postData.author_id) {
      const { data: profile } = await supabase.from('profiles').select('id, username, bio').eq('id', postData.author_id).single();
      setOwner(profile);
    }
    setLoading(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>Loading…</div>;

  if (!post) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
      <h2>Post not found</h2>
      <Link to="/pets" style={{ color: 'var(--color-primary)', marginTop: '0.5rem', display: 'inline-block' }}>← Back to listings</Link>
    </div>
  );

  const s = STATUS_LABELS[post.status] || STATUS_LABELS.still_needed;
  const photos = post.photos || [];

  return (
    <div className="container" style={{ padding: '2.5rem var(--spacing-lg)', maxWidth: '860px' }}>
      {/* Back */}
      <button onClick={() => {
        if (window.history.state && window.history.state.idx > 0) {
          navigate(-1);
        } else {
          navigate('/pets');
        }
      }} style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: '0.875rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: 0 }}>
        ← Back to listings
      </button>

      <div className="main-content-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.75rem', alignItems: 'flex-start' }}>
        {/* ── Left: main content ── */}
        <div>
          {/* Photo gallery */}
          <PhotoGallery photos={photos} />

          {/* No photos placeholder */}
          {photos.length === 0 && (
            <div style={{ height: '200px', borderRadius: '14px', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', marginBottom: '1.75rem' }}>
              {post.pet_emoji || '🐾'}
            </div>
          )}

          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.75rem' }}>{post.pet_name || 'Unnamed Pet'}</h1>
                <span className={`badge ${s.cls}`}>{s.label}</span>
              </div>
              {post.breed && <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '0.95rem' }}>{post.breed}</p>}
            </div>
            <button onClick={() => setShowShareModal(true)} className="btn btn-outline btn-sm" style={{ padding: '0.4rem 0.75rem', borderRadius: '8px' }}>
              <Share2 size={15} /> Share
            </button>
          </div>

          {/* Meta pills */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {[
              { icon: <MapPin size={14} />, text: `${post.origin} → ${post.destination}` },
              { icon: <Calendar size={14} />, text: post.flight_date || 'Flexible date' },
              post.weight_kg && { icon: <Weight size={14} />, text: `${post.weight_kg} kg` },
              post.airline && { icon: <Plane size={14} />, text: post.airline },
            ].filter(Boolean).map((m, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.8rem', background: 'var(--color-primary-bg)', color: 'var(--color-primary-dark)', borderRadius: '999px', fontSize: '0.82rem', fontWeight: 500 }}>
                {m.icon} {m.text}
              </span>
            ))}
          </div>

          {/* Full description */}
          {post.description ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.78rem', fontWeight: 700 }}>About this request</h3>
              <p style={{ lineHeight: 1.85, color: 'var(--color-text-sub)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{post.description}</p>
            </div>
          ) : (
            <div className="card" style={{ padding: '1.25rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
              No description provided.
            </div>
          )}
        </div>

        {/* ── Right: sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Owner card */}
          {owner && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.75rem' }}>Posted by</h3>
              <Link to={`/user/${owner.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit', marginBottom: owner.bio ? '0.75rem' : 0 }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-primary-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)', flexShrink: 0 }}>
                  {owner.username?.[0]?.toUpperCase() || <User size={20} />}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{owner.username || 'Anonymous'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-primary)', fontWeight: 500 }}>View profile →</div>
                </div>
              </Link>
              {owner.bio && (
                <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
                  {owner.bio.length > 120 ? owner.bio.slice(0, 120) + '…' : owner.bio}
                </p>
              )}
            </div>
          )}

          {/* Contact CTA */}
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🐾</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.6 }}>
              Can you help {post.pet_name || 'this pet'} travel safely?
            </p>
            {session ? (
              session.user.id !== post.author_id ? (
                <Link to={`/messages?user=${owner.id}&post=${post.id}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  <MessageCircle size={15} /> Contact Owner
                </Link>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '0.6rem', borderRadius: '8px', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                    This is your post
                  </div>
                  {post.status !== 'completed' && (
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button onClick={() => setEditingPost(true)} className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', display: 'flex', justifyContent: 'center', gap: '0.4rem' }}>
                        <Edit2 size={16} /> Edit
                      </button>
                      <button onClick={handleCompleteOffPlatform} className="btn" style={{ flex: 1, padding: '0.5rem', background: '#10B981', color: 'white', display: 'flex', justifyContent: 'center', gap: '0.4rem', border: 'none' }}>
                        <CheckCircle size={16} /> Complete
                      </button>
                    </div>
                  )}
                </div>
              )
            ) : (
              <>
                <Link to="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '0.5rem' }}>Sign in to contact</Link>
                <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Free — no account required to browse</p>
              </>
            )}
          </div>

          {/* Safety reminder */}
          <div style={{ padding: '0.85rem 1rem', background: 'var(--color-primary-bg)', borderRadius: '10px', fontSize: '0.78rem', color: 'var(--color-primary-dark)', lineHeight: 1.6 }}>
            🔒 <strong>Safety tip:</strong> Use our built-in messaging. Avoid sharing personal contact details in public posts.
          </div>
        </div>
      </div>

      {showShareModal && (
        <ShareModal post={post} onClose={() => setShowShareModal(false)} />
      )}

      {editingPost && (
        <EditPostModal
          post={post}
          onClose={() => setEditingPost(false)}
          onSaved={() => {
            setEditingPost(false);
            fetchPost();
          }}
        />
      )}
    </div>
  );
};

export default PostDetail;
