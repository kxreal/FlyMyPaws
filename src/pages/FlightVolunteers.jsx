import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search, MessageCircle, LayoutGrid, Calendar, ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';

// ─────────────────────────────────────────────
// Shared helpers
// ─────────────────────────────────────────────
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const parseDate = (str) => {
  if (!str) return null;
  const d = new Date(str + 'T00:00:00');
  return isNaN(d) ? null : d;
};

const STATUS_LABELS = {
  still_needed: { label: 'Available', cls: 'status-still_needed' },
  on_hold:      { label: 'On Hold',   cls: 'status-on_hold' },
  confirmed:    { label: 'Confirmed', cls: 'status-confirmed' },
  completed:    { label: 'Completed', cls: 'status-completed' },
};

// ─────────────────────────────────────────────
// VolCard (card view)
// ─────────────────────────────────────────────
const VolCard = ({ post, session }) => (
  <div className="pet-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Link to={`/user/${post.author_id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'inherit' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFF7ED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
          ✈️
        </div>
        <div style={{ fontWeight: 700, fontSize: '1rem' }}>{post.origin} → {post.destination}</div>
      </Link>
      <span className={`badge ${STATUS_LABELS[post.status]?.cls || 'status-still_needed'}`}>
        {STATUS_LABELS[post.status]?.label || 'Available'}
      </span>
    </div>

    <div style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {post.airline && <span>✈️ {post.airline}</span>}
      <span>📅 {post.flight_date || 'Flexible'}</span>
    </div>

    {post.description && (
      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6, borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem' }}>
        {post.description.length > 120 ? post.description.slice(0, 120) + '…' : post.description}
      </p>
    )}

    <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
      {session ? (
        session.user.id !== post.author_id ? (
          <Link to={`/messages?user=${post.author_id}&post=${post.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none' }}>
            <MessageCircle size={15} /> Message volunteer
          </Link>
        ) : (
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-primary)', opacity: 0.7 }}>
            Your flight post
          </div>
        )
      ) : (
        <Link to="/login" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Sign in to contact</Link>
      )}
    </div>
  </div>
);

// ─────────────────────────────────────────────
// Calendar View
// ─────────────────────────────────────────────
const CalendarView = ({ posts, session }) => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null); // selected date string YYYY-MM-DD

  // Build map: date string → posts
  const postsByDate = useMemo(() => {
    const map = {};
    posts.forEach(p => {
      if (!p.flight_date) return;
      if (!map[p.flight_date]) map[p.flight_date] = [];
      map[p.flight_date].push(p);
    });
    return map;
  }, [posts]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    cells.push({ day: d, dateStr: ds, posts: postsByDate[ds] || [] });
  }

  const selectedPosts = selected ? (postsByDate[selected] || []) : [];

  return (
    <div>
      {/* Month navigator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={prevMonth} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}><ChevronLeft size={18} /></button>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', minWidth: '160px', textAlign: 'center' }}>{MONTHS[month]} {year}</span>
        <button onClick={nextMonth} className="btn btn-ghost btn-sm" style={{ padding: '0.3rem' }}><ChevronRight size={18} /></button>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '2px', marginBottom: '2px' }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', padding: '0.4rem 0' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '2px' }}>
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} style={{ aspectRatio: '1', background: 'var(--color-background)', borderRadius: '6px' }} />;
          const isToday = cell.dateStr === todayStr;
          const hasEvents = cell.posts.length > 0;
          const isSelected = cell.dateStr === selected;
          return (
            <div
              key={cell.dateStr}
              onClick={() => hasEvents && setSelected(isSelected ? null : cell.dateStr)}
              style={{
                aspectRatio: '1',
                background: isSelected ? 'var(--color-primary)' : isToday ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                border: isToday && !isSelected ? '1.5px solid var(--color-primary)' : '1px solid var(--color-border)',
                borderRadius: '8px',
                padding: '4px',
                cursor: hasEvents ? 'pointer' : 'default',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                overflow: 'hidden',
                transition: 'background 0.15s',
                position: 'relative',
              }}
            >
              <span style={{
                fontSize: '0.75rem', fontWeight: isToday ? 700 : 500,
                color: isSelected ? '#fff' : isToday ? 'var(--color-primary)' : 'var(--color-text-main)',
              }}>{cell.day}</span>

              {/* Event dots */}
              {hasEvents && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
                  {cell.posts.slice(0, 3).map((p, idx) => (
                    <div key={idx} style={{
                      fontSize: '0.6rem', padding: '0 3px', borderRadius: '3px',
                      background: isSelected ? 'rgba(255,255,255,0.3)' : 'var(--color-primary-bg)',
                      color: isSelected ? '#fff' : 'var(--color-primary)',
                      fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', maxWidth: '100%', textOverflow: 'ellipsis',
                    }}>
                      ✈ {p.destination}
                    </div>
                  ))}
                  {cell.posts.length > 3 && (
                    <div style={{ fontSize: '0.6rem', color: isSelected ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)' }}>+{cell.posts.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected day posts */}
      {selected && selectedPosts.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem' }}>Flights on {selected}</h3>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}><X size={16} /></button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {selectedPosts.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '10px' }}>
                <div>
                  <Link to={`/user/${p.author_id}`} style={{ fontWeight: 700, fontSize: '0.9rem' }}>{p.origin} → {p.destination}</Link>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>{p.airline || 'Airline not specified'}</div>
                </div>
                {session ? (
                  session.user.id !== p.author_id ? (
                    <Link to={`/messages?user=${p.author_id}&post=${p.id}`} className="btn btn-primary btn-sm"><MessageCircle size={13} /> Contact</Link>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-primary)', fontWeight: 600 }}>Your flight</span>
                  )
                ) : (
                  <Link to="/login" className="btn btn-outline btn-sm">Sign in</Link>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────
// Filter Sidebar
// ─────────────────────────────────────────────
const FilterPanel = ({ posts, cityFilter, setCityFilter, dateFrom, setDateFrom, dateTo, setDateTo, onClear }) => {
  const allCities = useMemo(() => {
    const set = new Set();
    posts.forEach(p => {
      if (p.origin) set.add(p.origin.trim());
      if (p.destination) set.add(p.destination.trim());
    });
    return [...set].sort();
  }, [posts]);

  const toggleCity = (city) => {
    setCityFilter(prev =>
      prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]
    );
  };

  const hasFilters = cityFilter.length > 0 || dateFrom || dateTo;

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

      {/* Date range */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Date Range</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <input type="date" className="form-control" style={{ fontSize: '0.82rem', padding: '0.45rem 0.7rem' }} value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="From" />
          <input type="date" className="form-control" style={{ fontSize: '0.82rem', padding: '0.45rem 0.7rem' }} value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="To" />
        </div>
      </div>

      {/* City checkboxes */}
      <div>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cities</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '260px', overflowY: 'auto' }}>
          {allCities.map(city => (
            <label key={city} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', padding: '0.2rem 0', minWidth: 0 }}>
              <input
                type="checkbox"
                checked={cityFilter.includes(city)}
                onChange={() => toggleCity(city)}
                style={{ accentColor: 'var(--color-primary)', width: '15px', height: '15px', cursor: 'pointer', flexShrink: 0 }}
              />
              <span style={{ color: cityFilter.includes(city) ? 'var(--color-primary)' : 'var(--color-text-main)', fontWeight: cityFilter.includes(city) ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                {city}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--color-text-muted)', flexShrink: 0 }}>
                {posts.filter(p => p.origin === city || p.destination === city).length}
              </span>
            </label>
          ))}
          {allCities.length === 0 && <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>No cities yet.</p>}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
const FlightVolunteers = ({ session }) => {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('card'); // 'card' | 'calendar'
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .eq('post_type', 'volunteer')
        .neq('status', 'completed')
        .eq('is_hidden', false)
        .order('flight_date', { ascending: true });
      setAllPosts(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const clearFilters = () => { setCityFilter([]); setDateFrom(''); setDateTo(''); };

  const filtered = useMemo(() => allPosts.filter(p => {
    // Text search
    if (search) {
      const q = search.toLowerCase();
      const matches = (p.origin || '').toLowerCase().includes(q) ||
        (p.destination || '').toLowerCase().includes(q) ||
        (p.airline || '').toLowerCase().includes(q);
      if (!matches) return false;
    }
    // City checkbox filter
    if (cityFilter.length > 0) {
      const match = cityFilter.some(c => p.origin === c || p.destination === c);
      if (!match) return false;
    }
    // Date range
    if (dateFrom && p.flight_date && p.flight_date < dateFrom) return false;
    if (dateTo && p.flight_date && p.flight_date > dateTo) return false;
    return true;
  }), [allPosts, search, cityFilter, dateFrom, dateTo]);

  const activeFilterCount = cityFilter.length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0);

  return (
    <div className="container" style={{ padding: '2.5rem var(--spacing-lg)', maxWidth: view === 'calendar' ? '90%' : undefined }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>Flight Volunteers</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Volunteers ready to accompany your pet</p>
        </div>
        {/* View Toggle */}
        <div style={{ display: 'flex', borderRadius: '8px', border: '1.5px solid var(--color-border)', overflow: 'hidden' }}>
          {[
            { key: 'card', icon: <LayoutGrid size={15} />, label: 'Cards' },
            { key: 'calendar', icon: <Calendar size={15} />, label: 'Calendar' },
          ].map(v => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 0.85rem', border: 'none', cursor: 'pointer',
                fontSize: '0.82rem', fontWeight: 600,
                background: view === v.key ? 'var(--color-primary)' : 'transparent',
                color: view === v.key ? '#fff' : 'var(--color-text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {v.icon} {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search bar + filter toggle */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, position: 'relative', minWidth: '200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            className="form-control"
            style={{ paddingLeft: '2.25rem' }}
            placeholder="Search by city, airline..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => setShowFilters(f => !f)}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: '999px', padding: '0 5px', fontSize: '0.7rem', fontWeight: 700 }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Body: filters sidebar + content */}
      <div className="main-content-grid" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
        {/* Filter Panel */}
        {showFilters && (
          <div className="filter-sidebar">
            <FilterPanel
              posts={allPosts}
              cityFilter={cityFilter}
              setCityFilter={setCityFilter}
              dateFrom={dateFrom}
              setDateFrom={setDateFrom}
              dateTo={dateTo}
              setDateTo={setDateTo}
              onClear={clearFilters}
            />
          </div>
        )}

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <p style={{ color: 'var(--color-text-muted)' }}>Loading…</p>
          ) : filtered.length === 0 && view === 'card' ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✈️</div>
              <p>No volunteers match your filters. <button onClick={clearFilters} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 600, padding: 0 }}>Clear filters</button></p>
            </div>
          ) : view === 'card' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {filtered.map(p => <VolCard key={p.id} post={p} session={session} />)}
            </div>
          ) : (
            <div className="card" style={{ padding: '1.25rem' }}>
              <CalendarView posts={filtered} session={session} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlightVolunteers;
