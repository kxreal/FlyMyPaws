import React, { useRef, useEffect, useState } from 'react';
import { X, Download, Share2, Copy, Check } from 'lucide-react';

const ShareModal = ({ post, onClose }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/post/${post.id}`;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Set dimensions
    canvas.width = 600;
    canvas.height = 600;

    const render = (img = null) => {
      ctx.clearRect(0, 0, 600, 600);
      
      // 1. Background Gradient
      const grad = ctx.createLinearGradient(0, 0, 600, 600);
      grad.addColorStop(0, '#FFF3EF');
      grad.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 600);

      // 2. Decorative elements
      ctx.fillStyle = 'rgba(255, 112, 67, 0.05)';
      ctx.beginPath(); ctx.arc(600, 0, 200, 0, Math.PI * 2); ctx.fill();

      // 3. Brand Text
      ctx.fillStyle = '#FF7043'; ctx.font = '800 24px Inter, system-ui';
      ctx.fillText('🐾 FlyMyPaws', 40, 60);

      // 4. Pet Photo or Emoji
      if (img) {
        ctx.save();
        ctx.beginPath(); ctx.arc(300, 180, 100, 0, Math.PI * 2); ctx.clip();
        
        let sWidth = img.width;
        let sHeight = img.height;
        let sx = 0;
        let sy = 0;

        if (img.width > img.height) {
          sWidth = img.height;
          sx = (img.width - sWidth) / 2;
        } else {
          sHeight = img.width;
          sy = (img.height - sHeight) / 2;
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 200, 80, 200, 200);
        ctx.restore();
      } else {
        ctx.font = '120px serif'; ctx.textAlign = 'center';
        ctx.fillText(post.pet_emoji || '🐾', 300, 220);
      }

      // 5. Pet Name
      ctx.fillStyle = '#1F2937'; ctx.font = '800 44px Inter, system-ui'; ctx.textAlign = 'center';
      ctx.fillText(post.pet_name || 'Help this pet!', 300, 310);

      // 6. Route Card
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.1)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 10;
      ctx.beginPath(); ctx.roundRect(80, 340, 440, 140, 20); ctx.fill();
      
      // Reset Shadow
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.shadowColor = 'transparent';

      ctx.fillStyle = '#374151'; ctx.font = '600 18px Inter, system-ui';
      ctx.fillText('FLIGHT ROUTE', 300, 375);

      ctx.fillStyle = '#FF7043'; ctx.font = '700 32px Inter, system-ui';
      ctx.fillText(`${post.origin} → ${post.destination}`, 300, 420);

      ctx.fillStyle = '#6B7280'; ctx.font = '600 20px Inter, system-ui';
      ctx.fillText(formatDate(post.flight_date), 300, 460);

      // 7. Call to Action
      ctx.fillStyle = '#9CA3AF'; ctx.font = '500 16px Inter, system-ui';
      ctx.fillText('FlyMyPaws.com · Scan to help', 300, 540);

      // 8. Urgent Badge
      if (post.is_urgent) {
        ctx.fillStyle = '#EF4444';
        ctx.beginPath(); ctx.roundRect(240, 50, 120, 34, 17); ctx.fill();
        ctx.fillStyle = '#FFFFFF'; ctx.font = '700 16px Inter, system-ui';
        ctx.fillText('🚨 URGENT', 300, 73);
      }
    };

    const photoUrl = post.photos?.[0];
    if (photoUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = photoUrl;
      img.onload = () => render(img);
      img.onerror = () => render();
    } else {
      render();
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
    { name: 'WhatsApp', icon: 'https://www.vectorlogo.zone/logos/whatsapp/whatsapp-icon.svg', url: `https://wa.me/?text=${encodeURIComponent(`Help this pet find a flight buddy! ${shareUrl}`)}` },
    { name: 'Facebook', icon: 'https://www.vectorlogo.zone/logos/facebook/facebook-official.svg', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { name: 'Telegram', icon: 'https://www.vectorlogo.zone/logos/telegram/telegram-icon.svg', url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Help this pet find a flight buddy!`)}` },
    { name: 'Line', icon: 'https://www.vectorlogo.zone/logos/line/line-official.svg', url: `https://line.me/R/msg/text/?${encodeURIComponent(`Help this pet! ${shareUrl}`)}` },
    { name: 'X', icon: 'https://www.vectorlogo.zone/logos/x/x-icon.svg', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Help this pet find a flight buddy!`)}&url=${encodeURIComponent(shareUrl)}` },
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
          <div style={{ width: '220px', height: '220px', margin: '0 auto 1.5rem', borderRadius: '16px', overflow: 'hidden', border: '4px solid #f3f4f6', background: '#FFF3EF', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
            {post.photos?.[0] ? (
              <img src={post.photos[0]} alt={post.pet_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '4rem' }}>{post.pet_emoji || '🐾'}</span>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', padding: '1.5rem 0.5rem 0.5rem', color: '#fff' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem' }}>{post.pet_name}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600 }}>{post.origin} → {post.destination}</div>
              <div style={{ fontSize: '0.65rem', opacity: 0.9 }}>{formatDate(post.flight_date)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {shareOptions.map(opt => (
              <a key={opt.name} href={opt.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <img src={opt.icon} alt={opt.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
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
