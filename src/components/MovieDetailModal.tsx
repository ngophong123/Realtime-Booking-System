import { X, Clock, Calendar, Ticket, Film, Star } from 'lucide-react';
import type { Movie, Showtime, User } from '../types';

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  showtimes: Showtime[];
  onSelectShowtime: (showtime: Showtime) => void;
  user: User | null;
  onRequireAuth: () => void;
  onSelectMovie: (movie: Movie) => void;
}

export const MovieDetailModal = ({
  movie,
  isOpen,
  onClose,
  showtimes,
  onSelectShowtime,
  user,
  onRequireAuth,
}: MovieDetailModalProps) => {
  if (!isOpen || !movie) return null;

  const movieShowtimes = showtimes.filter((s) => s.movieId === movie.id);

  const handleShowtimeClick = (st: Showtime) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    onSelectShowtime(st);
  };

  const isNowPlaying = (st: Showtime) => {
    const now = new Date().getTime();
    const start = new Date(st.startTime).getTime();
    const end = new Date(st.endTime).getTime();
    return now >= start && now <= end;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 140,
        padding: '20px',
      }}
    >
      <div
        className="cine-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '840px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-modal)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-dropdown)',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={18} />
        </button>

        {/* Backdrop Banner Header */}
        <div style={{ position: 'relative', height: '240px', width: '100%', backgroundColor: 'var(--bg-soft)' }}>
          <img
            src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1000'}
            alt={movie.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7)' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 80%)',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
              <img
                src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=300'}
                alt={movie.title}
                style={{
                  width: '110px',
                  height: '155px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  border: '2px solid #FFFFFF',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  marginBottom: '-10px',
                }}
              />
              <div>
                <span
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    display: 'inline-block',
                    marginBottom: '6px',
                  }}
                >
                  {movie.status === 'NOW_SHOWING' ? '🔥 ĐANG CHIẾU' : '⏳ SẮP CHIẾU'}
                </span>
                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#FFFFFF', margin: '0 0 8px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                  {movie.title}
                </h2>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#E5E7EB', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="var(--primary)" />
                    <span>{movie.duration} phút</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} color="var(--primary)" />
                    <span>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--rating)' }}>
                    <Star size={14} fill="var(--rating)" />
                    <span style={{ fontWeight: '700' }}>8.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: '#FFFFFF' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Film size={18} color="var(--primary)" />
              <span>Nội Dung Phim</span>
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {movie.description || 'Chưa có tóm tắt chi tiết cho bộ phim này.'}
            </p>
          </div>

          {/* Showtimes List */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Ticket size={18} color="var(--primary)" />
              <span>Lịch Chiếu &amp; Mua Vé</span>
            </h3>

            {movieShowtimes.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: 'var(--bg-soft)',
                  borderRadius: 'var(--radius-card)',
                  color: 'var(--text-muted)',
                  fontSize: '13px',
                }}
              >
                Hiện chưa có lịch chiếu cho phim này. Vui lòng quay lại sau!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                {movieShowtimes.map((st) => {
                  const playing = isNowPlaying(st);
                  return (
                    <div
                      key={st.id}
                      onClick={() => handleShowtimeClick(st)}
                      className="cine-card cine-card-hover"
                      style={{
                        padding: '12px 14px',
                        backgroundColor: playing ? 'var(--primary-soft)' : 'var(--bg-soft)',
                        border: playing ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        borderRadius: 'var(--radius-card)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        position: 'relative',
                      }}
                    >
                      {playing && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '8px',
                            backgroundColor: 'var(--danger)',
                            color: '#FFFFFF',
                            fontSize: '9px',
                            fontWeight: '800',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)',
                          }}
                        >
                          🔴 ĐANG CHIẾU
                        </span>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                          {new Date(st.startTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                          })}
                        </span>
                        <span className="badge-status badge-secondary" style={{ fontSize: '11px' }}>
                          {st.room?.name || 'Phòng'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <span>Giá vé:</span>
                        <span style={{ fontWeight: '700', color: 'var(--text)' }}>
                          {Number(st.price).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
