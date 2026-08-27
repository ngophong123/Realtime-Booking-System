import { Clock, Calendar, Ticket, Info, Sparkles } from 'lucide-react';
import type { Movie } from '../types';

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie) => void;
  onViewDetail: (movie: Movie) => void;
}

export const MovieCard = ({ movie, onSelect, onViewDetail }: MovieCardProps) => {
  const releaseDateObj = new Date(movie.releaseDate);
  const isComingSoon = releaseDateObj.getTime() > Date.now();

  return (
    <div 
      className="glass-panel"
      style={{
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
      }}
      onClick={() => onViewDetail(movie)}
    >
      <div style={{ height: '320px', overflow: 'hidden', position: 'relative' }}>
        <img
          src={movie.posterUrl || DEFAULT_POSTER}
          alt={movie.title} 
          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_POSTER; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #12161f 5%, transparent 60%)' }} />
        
        <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
          {isComingSoon ? (
            <span style={{ background: 'rgba(255, 214, 0, 0.85)', border: '1px solid rgba(255, 214, 0, 0.5)', color: '#000', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={11} /> SẮP CHIẾU
            </span>
          ) : (
            <span style={{ background: 'rgba(0, 230, 118, 0.85)', border: '1px solid rgba(0, 230, 118, 0.5)', color: '#000', padding: '4px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: '800' }}>
              🔥 ĐANG CHIẾU
            </span>
          )}
        </div>

        <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(6px)', padding: '4px 10px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#00f2fe' }}>
          <Clock size={12} />
          <span>{movie.duration} Phút</span>
        </div>
      </div>

      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginBottom: '8px', lineHeight: 1.3 }}>
            {movie.title}
          </h3>
          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, marginBottom: '16px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {movie.description || 'Trải nghiệm siêu phẩm điện ảnh với chất lượng hình ảnh âm thanh đỉnh cao tại rạp CINEVERSE.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255, 255, 255, 0.06)', paddingTop: '14px', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b' }}>
            <Calendar size={13} />
            <span>{releaseDateObj.toLocaleDateString('vi-VN')}</span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail(movie);
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                padding: '7px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Info size={13} />
              <span>Chi Tiết</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect(movie);
              }}
              className="glow-btn"
              style={{ padding: '7px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Ticket size={13} />
              <span>Mua Vé</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
