import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, PawPrint, Plane } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ComboboxInput, { AIRPORTS, AIRLINES } from '../components/ComboboxInput';

const PET_EMOJIS = ['🐱', '🐶', '🐰', '🐹', '🐦', '🐟', '🦜', '🐾'];

const AIRLINE_WARNING = `⚠️ Not all airlines or aircraft allow in-cabin pets. Before posting, please verify directly with your airline that your specific flight permits adding a pet to your booking. You are fully responsible for checking the policy.`;

const CreatePost = () => {
  const [postType, setPostType] = useState('need_help');
  const [showWarning, setShowWarning] = useState(false);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  // Pet fields
  const [petName, setPetName] = useState('');
  const [petEmoji, setPetEmoji] = useState('🐾');
  const [breed, setBreed] = useState('');
  const [weightKg, setWeightKg] = useState('');

  // Shared fields
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [flightDate, setFlightDate] = useState('');
  const [dateMode, setDateMode] = useState('exact'); // 'flexible' | 'month' | 'exact'
  const [airline, setAirline] = useState('');
  const [description, setDescription] = useState('');
  const [photoFiles, setPhotoFiles] = useState([]);  // File objects
  const [photoPreviews, setPhotoPreviews] = useState([]); // blob URLs

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) navigate('/login');
    });
  }, [navigate]);

  const handleTypeChange = (type) => {
    setPostType(type);
    if (type === 'volunteer') {
      setShowWarning(true);
      setWarningAcknowledged(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (postType === 'volunteer' && !warningAcknowledged) {
      setError('Please tick the checkbox to confirm you have checked your airline\'s pet policy.');
      return;
    }

    setLoading(true);

    // Upload photos to Supabase Storage
    let photoUrls = [];
    const uploadErrors = [];
    for (const file of photoFiles) {
      const ext = file.name.split('.').pop().toLowerCase();
      const path = `${session.user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('post-photos')
        .upload(path, file, { upsert: false, contentType: file.type });
      if (uploadError) {
        console.error('Photo upload error:', uploadError);
        uploadErrors.push(uploadError.message);
      } else {
        const { data: urlData } = supabase.storage.from('post-photos').getPublicUrl(path);
        photoUrls.push(urlData.publicUrl);
      }
    }

    if (uploadErrors.length > 0 && photoUrls.length === 0) {
      // All uploads failed — show error but let user decide
      setError(`Photo upload failed: ${uploadErrors[0]}. Check the Storage bucket policy in Supabase (see instructions below).`);
      setLoading(false);
      return;
    }

    const payload = {
      author_id: session.user.id,
      post_type: postType,
      status: postType === 'need_help' ? 'still_needed' : 'still_needed',
      origin,
      destination,
      flight_date: flightDate || null,
      description,
      airline: airline || null,
      ...(postType === 'need_help' && {
        pet_name: petName,
        pet_emoji: petEmoji,
        breed,
        weight_kg: weightKg ? parseFloat(weightKg) : null,
        // Only include photos if migration_003 has been run
        ...(photoUrls.length > 0 && { photos: photoUrls }),
      }),
    };

    const { error } = await supabase.from('posts').insert(payload);
    setLoading(false);

    if (error) {
      setError('Failed to publish: ' + error.message);
      setLoading(false);
    } else {
      navigate(postType === 'need_help' ? '/pets' : '/volunteers');
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', padding: '2.5rem var(--spacing-lg)' }}>
      <h1 style={{ marginBottom: '0.3rem' }}>Create a Post</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
        Share a pet that needs help, or offer your flight as a volunteer.
      </p>

      {/* Type Toggle */}
      <div style={{ display: 'flex', borderRadius: '12px', border: '1.5px solid var(--color-border)', overflow: 'hidden', marginBottom: '1.75rem' }}>
        {[
          { value: 'need_help', label: '🐾 My Pet Needs Help', icon: PawPrint },
          { value: 'volunteer', label: '✈️ I Can Volunteer',    icon: Plane },
        ].map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => handleTypeChange(opt.value)}
            style={{
              flex: 1, padding: '0.75rem', fontWeight: 600, fontSize: '0.9rem',
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: postType === opt.value ? 'var(--color-primary)' : 'transparent',
              color: postType === opt.value ? '#fff' : 'var(--color-text-muted)',
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Airline Warning */}
      {showWarning && (
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A',
          borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong style={{ color: '#92400E', fontSize: '0.875rem' }}>Airline Policy Reminder</strong>
              <p style={{ color: '#78350F', fontSize: '0.83rem', marginTop: '0.35rem', lineHeight: 1.6 }}>
                {AIRLINE_WARNING}
              </p>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#92400E' }}>
                <input
                  type="checkbox"
                  checked={warningAcknowledged}
                  onChange={e => setWarningAcknowledged(e.target.checked)}
                />
                I understand and have verified my airline allows pets
              </label>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Pet-specific fields */}
        {postType === 'need_help' && (
          <>
            {/* Emoji picker */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pet Emoji</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {PET_EMOJIS.map(em => (
                  <button
                    key={em} type="button"
                    onClick={() => setPetEmoji(em)}
                    style={{
                      width: '40px', height: '40px', borderRadius: '8px', fontSize: '1.3rem', cursor: 'pointer',
                      border: petEmoji === em ? '2px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                      background: petEmoji === em ? 'var(--color-primary-bg)' : 'var(--color-surface)',
                    }}
                  >
                    {em}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                <label className="form-label">Pet Name *</label>
                <input className="form-control" placeholder="e.g. Luna" value={petName} onChange={e => setPetName(e.target.value)} required />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label">Weight (kg)</label>
                <input className="form-control" type="number" placeholder="4" value={weightKg} onChange={e => setWeightKg(e.target.value)} min="0" />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Breed</label>
              <input className="form-control" placeholder="e.g. British Shorthair" value={breed} onChange={e => setBreed(e.target.value)} />
            </div>

            {/* Photo upload */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Pet Photos <span style={{ color: 'var(--color-text-muted)', fontWeight: 400 }}>(up to 5)</span></label>

              {/* Preview row */}
              {photoPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
                  {photoPreviews.map((url, i) => (
                    <div key={i} style={{ position: 'relative', width: '72px', height: '72px' }}>
                      <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', border: '1.5px solid var(--color-border)' }} />
                      <button type="button" onClick={() => {
                        setPhotoFiles(f => f.filter((_, fi) => fi !== i));
                        setPhotoPreviews(p => p.filter((_, pi) => pi !== i));
                      }} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--color-error)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {photoFiles.length < 5 && (
                <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', height: '80px', border: '1.5px dashed var(--color-border)', borderRadius: '10px', cursor: 'pointer', background: 'var(--color-background)', color: 'var(--color-text-muted)', fontSize: '0.85rem', transition: 'border-color 0.15s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseOut={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                >
                  <span style={{ fontSize: '1.5rem' }}>📷</span>
                  <span>Click to add photos</span>
                  <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => {
                    const files = Array.from(e.target.files).slice(0, 5 - photoFiles.length);
                    setPhotoFiles(prev => [...prev, ...files]);
                    setPhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                    e.target.value = '';
                  }} />
                </label>
              )}
            </div>
          </>
        )}

        {/* Route */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">From *</label>
            <ComboboxInput
              value={origin} onChange={setOrigin}
              placeholder="Hong Kong (HKG)" suggestions={AIRPORTS} required
            />
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">To *</label>
            <ComboboxInput
              value={destination} onChange={setDestination}
              placeholder="London Heathrow (LHR)" suggestions={AIRPORTS} required
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Flight Date</label>

            {/* Mode selector */}
            <div style={{ display: 'flex', borderRadius: '8px', border: '1.5px solid var(--color-border)', overflow: 'hidden', marginBottom: '0.5rem' }}>
              {[['flexible','Flexible'],['month','By Month'],['exact','Exact Date']].map(([mode, label]) => (
                <button
                  key={mode} type="button"
                  onClick={() => { setDateMode(mode); setFlightDate(mode === 'flexible' ? 'Flexible' : ''); }}
                  style={{ flex: 1, padding: '0.35rem 0', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: 'none', background: dateMode === mode ? 'var(--color-primary)' : 'var(--color-surface)', color: dateMode === mode ? '#fff' : 'var(--color-text-muted)', transition: 'background 0.15s' }}
                >{label}</button>
              ))}
            </div>

            {dateMode === 'exact' && (
              <input className="form-control" type="date" value={flightDate} onChange={e => setFlightDate(e.target.value)} />
            )}
            {dateMode === 'month' && (
              <input className="form-control" type="month" value={flightDate} onChange={e => setFlightDate(e.target.value)} placeholder="e.g. 2025-06" />
            )}
            {dateMode === 'flexible' && (
              <div style={{ padding: '0.5rem 0.85rem', background: 'var(--color-primary-bg)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--color-primary-dark)', fontWeight: 500 }}>✅ Will show as "Flexible"</div>
            )}
          </div>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="form-label">Airline {postType === 'volunteer' ? '*' : '(optional)'}</label>
            <ComboboxInput
              value={airline} onChange={setAirline}
              placeholder="e.g. Cathay Pacific" suggestions={AIRLINES}
              required={postType === 'volunteer'}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Description</label>
          <textarea
            className="form-control" rows="4"
            placeholder={postType === 'need_help'
              ? "Tell volunteers about your pet — temperament, vaccinations, documentation status..."
              : "Any extra info — layovers, pet size limits you're comfortable with..."}
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        {error && (
          <div style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)', border: '1px solid #FECACA', borderRadius: '8px', padding: '0.7rem 1rem', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.5rem' }}
          disabled={loading || (postType === 'volunteer' && !warningAcknowledged)}
        >
          {loading ? 'Publishing…' : 'Publish Post'}
        </button>
      </form>
    </div>
  );
};

export default CreatePost;
