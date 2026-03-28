import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  PawPrint, Plane, Users, CheckCircle, Globe,
  Heart, ShieldCheck, Star, ArrowRight,
  DollarSign, Globe2, Pencil
} from 'lucide-react';

// ── Stat Card ──
const StatCard = ({ icon, value, label }) => (
  <div style={{ flex: 1, textAlign: 'center', padding: '2rem 1rem', borderRight: '1px solid var(--color-border)' }} className="last-no-border">
    <div style={{ display: 'inline-flex', padding: '0.6rem', borderRadius: '10px', background: 'var(--color-primary-bg)', marginBottom: '0.75rem' }}>
      {icon}
    </div>
    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{value}</div>
    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.2rem' }}>{label}</div>
  </div>
);

// ── Pet Card (mini) ──
const PetCardMini = ({ post }) => {
  const statusMap = {
    still_needed: { label: 'Needs Volunteer', cls: 'status-still_needed' },
    on_hold:      { label: 'On Hold',         cls: 'status-on_hold' },
    confirmed:    { label: 'Confirmed',        cls: 'status-confirmed' },
    completed:    { label: 'Completed',        cls: 'status-completed' },
  };
  const s = statusMap[post.status] || statusMap.still_needed;
  const photo = post.photos?.[0];

  return (
    <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
      <div style={{
        width: '200px', borderRadius: '14px', overflow: 'hidden',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        transition: 'transform 0.18s, box-shadow 0.18s',
        cursor: 'pointer',
      }}
        onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.14)'; }}
        onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
      >
        {/* Photo hero with status overlay */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: 'var(--color-primary-bg)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {photo
            ? <img src={photo} alt={post.pet_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            : <span style={{ fontSize: '3.5rem' }}>{post.pet_emoji || '🐾'}</span>
          }
          {/* Urgent badge */}
          {post.is_urgent && (
            <span className="badge badge-red" style={{ position: 'absolute', top: '8px', left: '8px', fontSize: '0.65rem', boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)', border: '1px solid #fff' }}>🚨 URGENT</span>
          )}
          {/* Status badge overlay */}
          <span className={`badge ${s.cls}`} style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.68rem' }}>{s.label}</span>
        </div>

        {/* Info */}
        <div style={{ padding: '0.65rem 0.85rem' }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.pet_name || 'Unknown'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>✈️ {post.origin} → {post.destination}</div>
        </div>
      </div>
    </Link>
  );
};

// ── Volunteer Card (mini) ──
const VolCardMini = ({ post }) => (
  <Link to={`/user/${post.author_id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
    <div style={{
      width: '200px', borderRadius: '14px', overflow: 'hidden',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
      transition: 'transform 0.18s, box-shadow 0.18s',
      cursor: 'pointer',
    }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.14)'; }}
      onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
    >
      {/* Slim banner — emoji only, no need for full square */}
      <div style={{ position: 'relative', width: '100%', height: '56px', background: 'linear-gradient(135deg, var(--color-primary-bg) 0%, #e0f7ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '1.75rem' }}>✈️</span>
        <span className="badge status-available" style={{ position: 'absolute', top: '6px', right: '8px', fontSize: '0.68rem' }}>Available</span>
      </div>

      {/* Info */}
      <div style={{ padding: '0.65rem 0.85rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{post.origin} → {post.destination}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>📅 {post.flight_date || 'Flexible'}{post.airline ? ` · ${post.airline}` : ''}</div>
      </div>
    </div>
  </Link>
);

const Home = ({ session }) => {
  const [stats, setStats] = useState({ pets: 0, volunteers: 0, matches: 0 });
  const [petPosts, setPetPosts] = useState([]);
  const [volPosts, setVolPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      // Fetch recent pet posts
      const { data: pets } = await supabase
        .from('posts')
        .select('*')
        .eq('post_type', 'need_help')
        .eq('is_hidden', false)
        .in('status', ['still_needed', 'on_hold'])
        .order('is_urgent', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(16);

      // Fetch recent volunteer posts
      const { data: vols } = await supabase
        .from('posts')
        .select('*')
        .eq('post_type', 'volunteer')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(16);

      // Stats counts
      const { count: petCount } = await supabase
        .from('posts').select('*', { count: 'exact', head: true }).eq('post_type', 'need_help');
      const { count: volCount } = await supabase
        .from('posts').select('*', { count: 'exact', head: true }).eq('post_type', 'volunteer');
      const { count: matchCount } = await supabase
        .from('posts').select('*', { count: 'exact', head: true }).eq('status', 'completed');

      setPetPosts(pets || []);
      setVolPosts(vols || []);
      setStats({ pets: petCount || 0, volunteers: volCount || 0, matches: matchCount || 0 });
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hero-bg">
        <div className="container">
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: '999px', padding: '0.3rem 0.9rem',
            fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)',
            marginBottom: '1.5rem'
          }}>
            <PawPrint size={13} /> Pet-Friendly Flight Matching
          </span>

          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.25rem', maxWidth: '560px' }}>
            Fly a Pet to Their{' '}
            <span style={{ color: 'var(--color-primary)' }}>Forever Home</span>
          </h1>

          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.05rem', maxWidth: '480px', marginBottom: '2rem', lineHeight: 1.7 }}>
            FlyMyPaws connects passionate flight volunteers with rescues and relocating families.
            Help a stray or a beloved pet travel safely across the globe.
          </p>

          <div className="hero-buttons" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/pets" className="btn btn-primary btn-lg">
              <PawPrint size={16} /> View Pets Needing Help
            </Link>
            <Link to="/create-post" className="btn btn-outline btn-lg">
              <Plane size={16} /> Become a Flight Buddy
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container" style={{ display: 'flex' }}>
          <StatCard icon={<PawPrint size={20} color="var(--color-primary)" />} value={loading ? '…' : stats.pets} label="Pets Listed" />
          <StatCard icon={<Users size={20} color="var(--color-primary)" />} value={loading ? '…' : stats.volunteers} label="Active Volunteers" />
          <StatCard icon={<CheckCircle size={20} color="var(--color-primary)" />} value={loading ? '…' : stats.matches} label="Successful Matches" />
          <StatCard icon={<Globe size={20} color="var(--color-primary)" />} value="50+" label="Airlines Covered" />
        </div>
      </section>

      {/* ── Pets Needing Help Feed ── */}
      <section style={{ padding: '3.5rem 0' }}>
        <div className="container">
          <div className="flex-between mb-2" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Pets Needing Help</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Recent posts looking for flight volunteers</p>
            </div>
            <Link to="/pets" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              View all <ArrowRight size={15} />
            </Link>
          </div>

          {loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
          ) : petPosts.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)' }}>No pets listed yet. <Link to="/create-post">Be the first to post!</Link></p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 200px)', gap: '1rem', justifyContent: 'center' }}>
              {petPosts.map(p => <PetCardMini key={p.id} post={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* ── Volunteer Feed ── */}
      {volPosts.length > 0 && (
        <section style={{ padding: '0 0 3.5rem' }}>
          <div className="container">
            <div className="flex-between mb-2" style={{ marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>Flight Volunteers</h2>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Available buddies ready to help</p>
              </div>
              <Link to="/volunteers" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                View all <ArrowRight size={15} />
              </Link>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 200px)', gap: '1rem', justifyContent: 'center' }}>
              {volPosts.map(p => <VolCardMini key={p.id} post={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Mission Section ── */}
      <section style={{ background: 'var(--color-surface)', borderTop: '1px solid var(--color-border)', padding: '4rem 0' }}>
        <div className="container mission-grid">
          {/* Left: Text */}
          <div>
            <span style={{
              display: 'inline-flex', gap: '0.4rem', alignItems: 'center',
              background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
              borderRadius: '999px', padding: '0.3rem 0.85rem',
              fontSize: '0.78rem', fontWeight: 600, marginBottom: '1rem'
            }}>
              Our Mission
            </span>
            <h2 style={{ fontSize: '1.65rem', marginBottom: '1rem' }}>Built for pets who can't travel alone</h2>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', lineHeight: 1.8 }}>
              We believe every animal deserves a loving home. Our platform bridges the gap between countries, facilitating safe travel for rescued animals and relocating families by connecting them with generous travelers.

            </p>
            {/* Second paragraph placeholder
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
              We believe every pet deserves a calm, caring companion on their journey.
              Our platform makes the match easy, safe, and transparent.
            </p>*/}
          </div>

          {/* Right: Feature Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {[
              { icon: <Heart size={20} color="var(--color-primary)" />, title: 'Pet Welfare First', desc: 'Every match prioritises the animal\'s comfort and safety' },
              { icon: <ShieldCheck size={20} color="var(--color-primary)" />, title: 'Verified Community', desc: 'User profiles with reviews from past transport experiences' },
              { icon: <Plane size={20} color="var(--color-primary)" />, title: 'Global Routes', desc: 'Matching across hundreds of international flight routes' },
              { icon: <Star size={20} color="var(--color-primary)" />, title: 'Trusted Reviews', desc: 'Honest ratings help you choose the right buddy' },
            ].map(f => (
              <div key={f.title} className="card" style={{ padding: '1.25rem' }}>
                <div style={{ marginBottom: '0.6rem' }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{f.title}</div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Become a Flight Buddy ── */}
      <section className="benefits-bg" style={{ padding: '4rem 0' }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.65rem', marginBottom: '0.5rem' }}>Why become a Flight Buddy?</h2>
            <p style={{ color: 'var(--color-text-muted)' }}>The rewards of helping a pet reach their new home</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {[
              { emoji: '🐾', title: 'Make a real difference', desc: 'Give a pet the calm, caring companion they need on a stressful journey.' },
              { emoji: '🤝', title: 'Build community', desc: 'Connect with fellow animal lovers and pet-friendly travellers worldwide.' },
              { emoji: '⭐', title: 'Earn recognition', desc: 'Build your reputation with reviews from grateful pet owners.' },
              { emoji: '💰', title: 'Compensation possible', desc: 'Many owners offer to cover meals or transport fees. Always agree terms in advance.' },
              { emoji: '🌍', title: 'Travel with purpose', desc: 'Turn your existing trip into a meaningful act of kindness.' },
              { emoji: '✏️', title: 'Your choice, always', desc: 'You decide the route, date, and whether to accept each request.' },
            ].map(b => (
              <div key={b.title} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '1.25rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{b.emoji}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{b.title}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem', lineHeight: 1.5 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ── */}
      <section id="disclaimer" style={{ padding: '2.5rem 0' }}>
        <div className="container">
          <div className="disclaimer-box">
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <strong style={{ color: 'var(--color-error)', fontSize: '0.9rem' }}>Disclaimer</strong>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', lineHeight: 1.6 }}>
                FlyMyPaws is a matching platform only. We do not handle physical transportation, fees,
                or legal documentation required for animal travel. Pet owners must ensure all import/export
                regulations are met. Volunteers should never be asked to pay fees out of pocket.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
