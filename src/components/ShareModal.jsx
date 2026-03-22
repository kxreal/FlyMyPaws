import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Share2, Copy, Check } from 'lucide-react';

const ShareModal = ({ post, onClose }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.href;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Set dimensions
    canvas.width = 600;
    canvas.height = 600;

    // 1. Background Gradient
    const grad = ctx.createLinearGradient(0, 0, 600, 600);
    grad.addColorStop(0, '#FFF3EF');
    grad.addColorStop(1, '#FFFFFF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 600, 600);

    // 2. Decorative elements
    ctx.fillStyle = 'rgba(255, 112, 67, 0.05)';
    ctx.beginPath();
    ctx.arc(600, 0, 200, 0, Math.PI * 2);
    ctx.fill();

    // 3. Brand Text
    ctx.fillStyle = '#FF7043';
    ctx.font = '800 24px Inter, system-ui';
    ctx.fillText('🐾 FlyMyPaws', 40, 60);

    // 4. Pet Emoji (Large)
    ctx.font = '120px serif';
    ctx.textAlign = 'center';
    ctx.fillText(post.pet_emoji || '🐾', 300, 200);

    // 5. Pet Name
    ctx.fillStyle = '#1F2937';
    ctx.font = '800 48px Inter, system-ui';
    ctx.fillText(post.pet_name || 'Help this pet!', 300, 280);

    // 6. Route Card
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = 'rgba(0,0,0,0.1)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.beginPath();
    ctx.roundRect(100, 320, 400, 120, 20);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    ctx.fillStyle = '#374151';
    ctx.font = '600 20px Inter, system-ui';
    ctx.fillText('FLIGHT ROUTE', 300, 355);
    
    ctx.fillStyle = '#FF7043';
    ctx.font = '700 28px Inter, system-ui';
    ctx.fillText(`${post.origin} → ${post.destination}`, 300, 405);

    // 7. Call to Action
    ctx.fillStyle = '#6B7280';
    ctx.font = '500 18px Inter, system-ui';
    ctx.fillText('FlyMyPaws.com · Scan to help', 300, 500);

    // 8. Urgent Badge (Optional)
    if (post.is_urgent) {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.roundRect(240, 70, 120, 34, 17);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '700 16px Inter, system-ui';
      ctx.fillText('🚨 URGENT', 300, 93);
    }

  }, [post]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `share-${post.pet_name || 'pet'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { name: 'WhatsApp', icon: '💬', url: `https://wa.me/?text=${encodeURIComponent(`Help this pet find a flight buddy! ${shareUrl}`)}` },
    { name: 'X / Twitter', icon: '𝕏', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Help this pet find a flight buddy!`)}&url=${encodeURIComponent(shareUrl)}` },
    { name: 'Facebook', icon: '🔵', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'Line', icon: '🟢', url: `https://line.me/R/msg/text/?${encodeURIComponent(`Help this pet! ${shareUrl}`)}` },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 20000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: '24px', maxWidth: '440px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '1.25rem', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Share Post</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '1.5rem', textAlign: 'center' }}>
          {/* Canvas hidden but used for download */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Visual Preview */}
          <div style={{ width: '220px', height: '220px', margin: '0 auto 1.5rem', borderRadius: '16px', overflow: 'hidden', border: '4px solid #f3f4f6', background: '#FFF3EF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '4rem' }}>{post.pet_emoji || '🐾'}</span>
            <div style={{ fontWeight: 800, color: '#1F2937', marginTop: '0.5rem' }}>{post.pet_name}</div>
            <div style={{ fontSize: '0.7rem', color: '#FF7043', fontWeight: 700 }}>{post.origin} → {post.destination}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            {shareOptions.map(opt => (
              <a key={opt.name} href={opt.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                  {opt.icon}
                </div>
                {opt.name}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={handleDownload} className="btn btn-outline" style={{ flex: 1, gap: '0.5rem' }}>
              <Download size={16} /> Save Image
            </button>
            <button onClick={handleCopy} className="btn btn-primary" style={{ flex: 1, gap: '0.5rem' }}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
