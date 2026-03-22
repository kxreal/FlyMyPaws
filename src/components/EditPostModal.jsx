import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import ComboboxInput, { AIRPORTS, AIRLINES } from './ComboboxInput';
import { X, Save, Loader2, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'still_needed', label: 'Needs Volunteer' },
  { value: 'on_hold',      label: 'On Hold' },
  { value: 'confirmed',    label: 'Confirmed' },
  { value: 'completed',    label: 'Completed' },
];

const EditPostModal = ({ post, onClose, onSaved }) => {
  const [form, setForm] = useState({
    pet_name:    post.pet_name    || '',
    breed:       post.breed       || '',
    origin:      post.origin      || '',
    destination: post.destination || '',
    flight_date: post.flight_date || '',
    airline:     post.airline     || '',
    description: post.description || '',
    weight_kg:   post.weight_kg != null ? String(post.weight_kg) : '',
    status:      post.status      || 'still_needed',
  });

  // Existing photo URLs from the post
  const [existingPhotos, setExistingPhotos] = useState(post.photos || []);
  // New files chosen by the user
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Detect initial date mode from existing value
  const detectMode = (v) => {
    if (!v || v === 'Flexible') return 'flexible';
    if (/^\d{4}-\d{2}$/.test(v)) return 'month';
    return 'exact';
  };
  const [dateMode, setDateMode] = useState(() => detectMode(post.flight_date));

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const removeExisting = (url) =>
    setExistingPhotos(prev => prev.filter(u => u !== url));

  const addNewFiles = (e) => {
    const files = Array.from(e.target.files).slice(0, Math.max(0, 5 - existingPhotos.length - newFiles.length));
    setNewFiles(prev => [...prev, ...files]);
    setNewPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    e.target.value = '';
  };

  const removeNew = (idx) => {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
    setNewPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    // Upload any new photos
    const uploadedUrls = [];
    for (const file of newFiles) {
      const ext = file.name.split('.').pop().toLowerCase();
      const path = `${post.author_id || 'user'}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('post-photos')
        .upload(path, file, { contentType: file.type });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('post-photos').getPublicUrl(path);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    const finalPhotos = [...existingPhotos, ...uploadedUrls];

    const { error: dbErr } = await supabase
      .from('posts')
      .update({
        pet_name:    form.pet_name    || null,
        breed:       form.breed       || null,
        origin:      form.origin,
        destination: form.destination,
        flight_date: form.flight_date || null,
        airline:     form.airline     || null,
        description: form.description || null,
        weight_kg:   form.weight_kg   ? parseFloat(form.weight_kg) : null,
        status:      form.status,
        photos:      finalPhotos,
      })
      .eq('id', post.id);

    setSaving(false);
    if (dbErr) { setError(dbErr.message); return; }
    onSaved();
  };

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.85rem',
    border: '1.5px solid var(--color-border)', borderRadius: '8px',
    fontSize: '0.875rem', fontFamily: 'inherit',
    background: 'var(--color-surface)', color: 'var(--color-text-main)',
    marginTop: '0.25rem', outline: 'none', boxSizing: 'border-box',
  };
  const Label = ({ children }) => (
    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>{children}</label>
  );

  const totalPhotos = existingPhotos.length + newFiles.length;

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: 'var(--color-surface)', borderRadius: '16px', width: '100%', maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Edit Post</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {/* Status */}
          <div>
            <Label>Status</Label>
            <select value={form.status} onChange={set('status')} style={{ ...inputStyle }}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Pet-specific */}
          {post.post_type === 'need_help' && (
            <>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <div style={{ flex: 2 }}>
                  <Label>Pet Name</Label>
                  <input style={inputStyle} value={form.pet_name} onChange={set('pet_name')} placeholder="Luna" />
                </div>
                <div style={{ flex: 1 }}>
                  <Label>Weight (kg)</Label>
                  <input style={inputStyle} type="number" value={form.weight_kg} onChange={set('weight_kg')} placeholder="4" min="0" step="0.1" />
                </div>
              </div>
              <div>
                <Label>Breed</Label>
                <input style={inputStyle} value={form.breed} onChange={set('breed')} placeholder="British Shorthair" />
              </div>
            </>
          )}

          {/* Route */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
                <Label>From *</Label>
                <ComboboxInput value={form.origin} onChange={v => setForm(f => ({...f, origin: v}))} placeholder="Hong Kong (HKG)" suggestions={AIRPORTS} required />
              </div>
              <div style={{ flex: 1 }}>
                <Label>To *</Label>
                <ComboboxInput value={form.destination} onChange={v => setForm(f => ({...f, destination: v}))} placeholder="London Heathrow (LHR)" suggestions={AIRPORTS} required />
              </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1 }}>
              <Label>Flight Date</Label>

              {/* Mode selector */}
              <div style={{ display: 'flex', borderRadius: '8px', border: '1.5px solid var(--color-border)', overflow: 'hidden', marginBottom: '0.5rem', marginTop: '0.25rem' }}>
                {[['flexible','Flexible'],['month','By Month'],['exact','Exact']].map(([mode, lbl]) => (
                  <button
                    key={mode} type="button"
                    onClick={() => { setDateMode(mode); setForm(f => ({...f, flight_date: mode === 'flexible' ? 'Flexible' : ''})); }}
                    style={{ flex:1, padding:'0.3rem 0', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', border:'none', background: dateMode===mode ? 'var(--color-primary)' : 'var(--color-surface)', color: dateMode===mode ? '#fff' : 'var(--color-text-muted)' }}
                  >{lbl}</button>
                ))}
              </div>

              {dateMode === 'exact' && (
                <input style={inputStyle} type="date" value={form.flight_date} onChange={set('flight_date')} />
              )}
              {dateMode === 'month' && (
                <input style={inputStyle} type="month" value={form.flight_date} onChange={set('flight_date')} />
              )}
              {dateMode === 'flexible' && (
                <div style={{ padding:'0.45rem 0.75rem', background:'var(--color-primary-bg)', borderRadius:'8px', fontSize:'0.8rem', color:'var(--color-primary-dark)', fontWeight:500 }}>✅ Will show as "Flexible"</div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <Label>Airline</Label>
              <ComboboxInput value={form.airline} onChange={v => setForm(f => ({...f, airline: v}))} placeholder="e.g. Cathay Pacific" suggestions={AIRLINES} />
            </div>
          </div>

          <div>
            <Label>Description</Label>
            <textarea
              style={{ ...inputStyle, resize: 'vertical', minHeight: '100px' }}
              rows="4"
              value={form.description}
              onChange={set('description')}
              placeholder="Tell volunteers about your pet..."
            />
          </div>

          {/* ── Photos ── */}
          <div>
            <Label>Photos <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>({totalPhotos}/5)</span></Label>

            {/* Grid of existing + new */}
            {totalPhotos > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                {/* Existing URLs */}
                {existingPhotos.map((url, i) => (
                  <div key={`ex-${i}`} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid var(--color-border)' }} />
                    <button
                      type="button"
                      onClick={() => removeExisting(url)}
                      title="Remove photo"
                      style={{ position: 'absolute', top: '-7px', right: '-7px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--color-error)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {/* New previews */}
                {newPreviews.map((url, i) => (
                  <div key={`new-${i}`} style={{ position: 'relative', width: '80px', height: '80px' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1.5px dashed var(--color-primary)' }} />
                    <button
                      type="button"
                      onClick={() => removeNew(i)}
                      style={{ position: 'absolute', top: '-7px', right: '-7px', width: '22px', height: '22px', borderRadius: '50%', background: 'var(--color-error)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={12} />
                    </button>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,165,0,0.8)', fontSize: '0.55rem', color: '#fff', textAlign: 'center', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px', padding: '1px' }}>NEW</div>
                  </div>
                ))}
              </div>
            )}

            {/* Add more button */}
            {totalPhotos < 5 && (
              <label
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.5rem', height: '52px', border: '1.5px dashed var(--color-border)', borderRadius: '10px', cursor: 'pointer', color: 'var(--color-text-muted)', fontSize: '0.82rem', transition: 'border-color 0.15s' }}
                onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
              >
                📷 Add photos ({5 - totalPhotos} remaining)
                <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={addNewFiles} />
              </label>
            )}
          </div>

          {error && (
            <div style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', padding: '0.65rem 0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', padding: '1rem 1.5rem', borderTop: '1px solid var(--color-border)', flexShrink: 0 }}>
          <button onClick={onClose} className="btn btn-outline">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {saving ? <><Loader2 size={15} className="spinner" /> Saving…</> : <><Save size={15} /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
