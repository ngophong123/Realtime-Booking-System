import { Sparkles, Play, Info, ShieldCheck } from 'lucide-react';
import type { Movie } from '../types';

interface HeroBannerProps {
  movie: Movie | null;
  onBookNow: () => void;
  onViewDetail: () => void;
}

export const HeroBanner = ({ movie, onBookNow, onViewDetail }: HeroBannerProps) => {
  if (!movie) return null;

  return (
    <div 
      className="glass-panel" 
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        borderRadius: '24px', 
        marginBottom: '48px', 
        minHeight: '380px', 
        display: 'flex', 
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgba(18, 22, 31, 0.95), rgba(10, 12, 16, 0.95))',
        border: '1px solid rgba(0, 242, 254, 0.15)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
      }}
    >
      <div 
        style={{ 
          position: 'absolute', 
          right: 0, 
          top: 0, 
          bottom: 0, 
          width: '55%', 
          backgroundImage: 'url(' + (movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80') + ')',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.35,
        }} 
      />

      <div style={{ position: 'relative', zIndex: 10, padding: '40px', maxWidth: '650px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(0, 242, 254, 0.12)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', padding: '6px 14px', borderRadius: '30px', fontSize: '12px', fontWeight: '700', marginBottom: '16px' }}>
          <Sparkles size={14} />
          <span>PHIM BOM TẤN ĐANG CHIẾU</span>
        </div>

        <h1 style={{ fontSize: '38px', fontWeight: '800', lineHeight: 1.15, color: '#fff', marginBottom: '16px', letterSpacing: '-0.5px' }}>
          {movie.title}
        </h1>

        <p style={{ fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '28px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {movie.description || 'Thưởng thức trải nghiệm rạp phim với hệ thống giữ ghế và đặt vé Realtime Socket.io mượt mà nhất.'}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button 
            onClick={onBookNow}
            className="glow-btn"
            style={{ padding: '14px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <Play size={18} fill="#000" />
            <span>Mua Vé Ngay</span>
          </button>

          <button 
            onClick={onViewDetail}
            style={{
              padding: '14px 24px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#fff',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            <Info size={18} />
            <span>Chi Tiết Phim</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px' }}>
            <ShieldCheck size={16} color="#00e676" />
            <span>Giữ chỗ 5 phút</span>
          </div>
        </div>
      </div>
    </div>
  );
};
