import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { X, Star, Loader2 } from 'lucide-react';

const ReviewModal = ({ revieweeId, revieweeUsername, onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError('Please select a star rating (1-5).');
      return;
    }

    setSubmitting(true);
    setError('');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('You must be logged in to leave a review.');
      setSubmitting(false);
      return;
    }

    const { error: dbError } = await supabase.from('reviews').insert({
      reviewer_id: session.user.id,
      reviewee_id: revieweeId,
      rating: rating,
      comment: comment || null,
    });

    setSubmitting(false);

    if (dbError) {
      setError(dbError.message);
    } else {
      if (onSubmitted) onSubmitted();
      onClose();
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '1rem'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--color-surface)', borderRadius: '16px', width: '100%', maxWidth: '400px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Review {revieweeUsername || 'User'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)', marginBottom: '0.5rem', fontWeight: 600 }}>Rate your experience</div>
            <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', padding: '0.2rem',
                    color: (hoverRating || rating) >= star ? '#F59E0B' : 'var(--color-border)',
                    transition: 'color 0.15s ease'
                  }}
                >
                  <Star size={32} fill={(hoverRating || rating) >= star ? '#F59E0B' : 'none'} strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
              Write a Review (Optional)
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder={`Share your thoughts on traveling with ${revieweeUsername || 'this person'}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && (
            <div style={{ padding: '0.75rem', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '8px', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-outline" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting || rating < 1} className="btn btn-primary" style={{ flex: 1 }}>
              {submitting ? <Loader2 size={18} className="spinner" /> : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
