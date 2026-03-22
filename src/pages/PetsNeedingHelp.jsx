import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, SlidersHorizontal, MessageCircle } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'still_needed', label: 'Needs Volunteer' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_LABELS = {
  still_needed: { label: 'Needs Volunteer', cls: 'status-still_needed' },
  on_hold:      { label: 'On Hold',         cls: 'status-on_hold' },
  confirmed:    { label: 'Confirmed',        cls: 'status-confirmed' },
  completed:    { label: 'Completed',        cls: 'status-completed' },
};

// ── Pet Card ──
const PetCard = ({ post, session }) => {
  const s = STATUS_LABELS[post.status] || STATUS_LABELS.still_needed;
  const desc = post.description || '';
  const firstPhoto = post.photos?.[0];

  return (
    <div className="pet-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

      {/* ── Photo hero ── */}
      <Link to={`/post/${post.id}`} style={{ display: 'block', textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ width: '100%', aspectRatio: '4 / 3', background: 'var(--color-primary-bg)', overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {firstPhoto
            ? <img src={firstPhoto} alt={post.pet_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            : <span style={{ fontSize: '4rem' }}>{post.pet_emoji || '🐾'}</span>
          }
        </div>
      </Link>

      {/* ── Content ── */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>

        {/* Name + status */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
          <Link to={`/post/${post.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>{post.pet_name || 'Unknown'}</div>
          </Link>
          <span className={`badge ${s.cls}`} style={{ flexShrink: 0, fontSize: '0.7rem' }}>{s.label}</span>
        </div>

        {/* Breed */}
        {post.breed && (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '-0.25rem' }}>{post.breed}{post.weight_kg ? ` · ${post.weight_kg}kg` : ''}</div>
        )}

        {/* Route */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', color: 'var(--color-text-sub)', fontWeight: 500 }}>
          <span>🐾</span>
          <span>{post.origin} → {post.destination}</span>
        </div>

        {/* Date */}
        {post.flight_date && (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>📅 {post.flight_date}</div>
        )}

        {/* Description */}
        {desc && (
          <p style={{ fontSize: '0.83rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>
            {desc.length > 100 ? desc.slice(0, 100) + '…' : desc}
          </p>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* CTA */}
        <div style={{ marginTop: '0.75rem' }}>
          {session ? (
            session.user.id !== post.author_id ? (
              <Link
                to={`/messages?user=${post.author_id}&post=${post.id}`}
                style={{ display: 'block', textAlign: 'center', padding: '0.6rem', borderRadius: '8px', background: 'var(--color-primary)', color: '#fff', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none' }}
              >
                Contact Owner
              </Link>
            ) : (
              <div style={{ textAlign: 'center', padding: '0.6rem', borderRadius: '8px', background: 'var(--color-primary-bg)', color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                Your post
              </div>
            )
          ) : (
            <Link
              to="/login"
              style={{ display: 'block', textAlign: 'center', padding: '0.6rem', borderRadius: '8px', border: '1.5px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}
            >
              Sign in to contact
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Filter Panel ──
const FilterPanel = ({ allPosts, filters, setFilters, onClear }) => {
  const origins = useMemo(() => [...new Set(allPosts.map(p => p.origin).filter(Boolean))].sort(), [allPosts]);
  const destinations = useMemo(() => [...new Set(allPosts.map(p => p.destination).filter(Boolean))].sort(), [allPosts]);

  const toggle = (key, val) => setFilters(f => ({
    ...f,
    [key]: f[key].includes(val) ? f[key].filter(v => v !== val) : [...f[key], val],
  }));
  const hasFilters = filters.origins.length > 0 || filters.destinations.length > 0 || filters.dateFrom || filters.dateTo || filters.status;

  const CityCheckboxes = ({ label, items, filterKey }) => (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '180px', overflowY: 'auto' }}>
        {items.map(city => (
          <label key={city} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.84rem' }}>
            <input
              type="checkbox"
              checked={filters[filterKey].includes(city)}
              onChange={() => toggle(filterKey, city)}
              style={{ accentColor: 'var(--color-primary)', width: '14px', height: '14px', cursor: 'pointer' }}
            />
            <span style={{ color: filters[filterKey].includes(city) ? 'var(--color-primary)' : 'var(--color-text-main)', fontWeight: filters[filterKey].includes(city) ? 600 : 400 }}>
              {city}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              {allPosts.filter(p => p[filterKey === 'origins' ? 'origin' : 'destination'] === city).length}
            </span>
          </label>
        ))}
        {items.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>None yet</span>}
      </div>
    </div>
  );

  return (
    <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: '75px', alignSelf: 'flex-start' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <SlidersHorizontal size={15} /> Filters
        </span>
        {hasFilters && (
          <button onClick={onClear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}>
            Clear all
          </button>
        )}
      </div>

      {/* Status */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Status</div>
        <select
          className="form-control"
          style={{ fontSize: '0.82rem', padding: '0.45rem 0.7rem' }}
          value={filters.status}
          onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Date Range */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>Flight Date</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <input type="date" className="form-control" style={{ fontSize: '0.82rem', padding: '0.45rem 0.7rem' }} value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))} />
          <input type="date" className="form-control" style={{ fontSize: '0.82rem', padding: '0.45rem 0.7rem' }} value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))} />
        </div>
      </div>

      <CityCheckboxes label="Origin City" items={origins} filterKey="origins" />
      <CityCheckboxes label="Destination City" items={destinations} filterKey="destinations" />
    </div>
  );
};

// ── Main Page ──
const PetsNeedingHelp = ({ session }) => {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '', origins: [], destinations: [] });

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('post_type', 'need_help')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });
    if (!error) setAllPosts(data || []);
    setLoading(false);
  };

  const clearFilters = () => setFilters({ status: '', dateFrom: '', dateTo: '', origins: [], destinations: [] });

  const filtered = useMemo(() => allPosts.filter(p => {
    if (search) {
      const q = search.toLowerCase();
      if (!(p.pet_name || '').toLowerCase().includes(q) &&
          !(p.origin || '').toLowerCase().includes(q) &&
          !(p.destination || '').toLowerCase().includes(q) &&
          !(p.breed || '').toLowerCase().includes(q)) return false;
    }
    if (filters.status && p.status !== filters.status) return false;
    if (filters.dateFrom && p.flight_date && p.flight_date < filters.dateFrom) return false;
    if (filters.dateTo && p.flight_date && p.flight_date > filters.dateTo) return false;
    if (filters.origins.length > 0 && !filters.origins.includes(p.origin)) return false;
    if (filters.destinations.length > 0 && !filters.destinations.includes(p.destination)) return false;
    return true;
  }), [allPosts, search, filters]);

  const activeFilterCount =
    (filters.status ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0) +
    filters.origins.length +
    filters.destinations.length;

  return (
    <div className="container" style={{ padding: '2.5rem var(--spacing-lg)' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>Pets Needing Help</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Animals looking for a caring flight volunteer</p>
      </div>

      {/* Search + filter toggle */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input className="form-control" style={{ paddingLeft: '2.25rem' }} placeholder="Search by name, breed, city…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowFilters(f => !f)} className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '999px', padding: '0 5px', fontSize: '0.7rem', fontWeight: 700 }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Layout: filter sidebar + grid */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {showFilters && (
          <div style={{ width: '220px', flexShrink: 0 }}>
            <FilterPanel allPosts={allPosts} filters={filters} setFilters={setFilters} onClear={clearFilters} />
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🐾</div>
              <p>No posts match your filters. <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Clear filters</button></p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filtered.map(p => <PetCard key={p.id} post={p} session={session} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetsNeedingHelp;
