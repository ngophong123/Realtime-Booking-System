import { useState, useEffect } from 'react';
import { X, Clock, Calendar, Ticket, Sparkles, Film } from 'lucide-react';
import type { Movie, Showtime, User } from '../types';
import API from '../services/api';

interface MovieDetailModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  showtimes: Showtime[];
  onSelectShowtime: (showtime: Showtime) => void;
  user: User | null;
  onRequireAuth: () => void;
  onSelectMovie?: (movie: Movie) => void;
}

export const MovieDetailModal = ({
  movie,
  isOpen,
  onClose,
  showtimes,
  onSelectShowtime,
  user,
  onRequireAuth,
  onSelectMovie,
}: MovieDetailModalProps) => {
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);

  useEffect(() => {
    if (movie && isOpen) {
      API.get(`/movies/${movie.id}/similar`)
        .then((res) => setSimilarMovies(res.data.similar || []))
        .catch((err) => console.error('Lỗi tải phim tương tự:', err));
    } else {
      setSimilarMovies([]);
    }
  }, [movie, isOpen]);

  if (!isOpen || !movie) return null;

  const movieShowtimes = showtimes.filter((s) => s.movieId === movie.id);

  const handleShowtimeClick = (st: Showtime) => {
    if (!user) {
      onRequireAuth();
      return;
    }
    onSelectShowtime(st);
    onClose();
  };

  const handleSimilarMovieClick = (m: Movie) => {
    if (onSelectMovie) {
      onSelectMovie(m);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, padding: '20px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '850px', 
          maxHeight: '90vh', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0, 242, 254, 0.2)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          background: 'linear-gradient(135deg, #161b26 0%, #0a0d14 100%)'
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
        >
          <X size={18} />
        </button>

        {/* Backdrop Banner */}
        <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
          <img
            src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200'}
            alt={movie.title} onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80"; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #161b26 0%, rgba(22, 27, 38, 0.4) 60%, transparent 100%)' }} />

          <div style={{ position: 'absolute', bottom: '16px', left: '24px', right: '24px', display: 'flex', alignItems: 'flex-end', gap: '16px' }}>
            <img
              src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
              alt={movie.title} onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80"; }}
              style={{ width: '100px', height: '140px', objectFit: 'cover', borderRadius: '12px', border: '2px solid rgba(0, 242, 254, 0.4)', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}
            />
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(0, 242, 254, 0.15)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', marginBottom: '6px' }}>
                <Sparkles size={12} />
                <span>CINEVERSE EXCLUSIVE</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '0 0 6px', lineHeight: 1.2 }}>
                {movie.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#94a3b8' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} color="#00f2fe" /> {movie.duration} Phút
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} color="#00f2fe" /> Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
              Nội Dung Phim
            </h3>
            <p style={{ fontSize: '13px', color: '#cbd5e1', lineHeight: 1.6, margin: 0 }}>
              {movie.description || 'Trải nghiệm đỉnh cao công nghệ rạp phim với hệ thống màn hình sắc nét và âm thanh vòm sống động nhất tại CINEVERSE.'}
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Ticket size={16} color="#00f2fe" />
                <span>Chọn Suất Chiếu &amp; Phòng Chiếu (24h)</span>
              </h3>
              {!user && (
                <span style={{ fontSize: '11px', color: '#ffd600' }}>
                  * Yêu cầu đăng nhập trước khi chọn ghế
                </span>
              )}
            </div>

            {movieShowtimes.length === 0 ? (
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                Phim này hiện chưa có lịch chiếu hôm nay.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {movieShowtimes.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleShowtimeClick(st)}
                    className="glass-panel"
                    style={{
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      cursor: 'pointer',
                      border: '1px solid rgba(0, 242, 254, 0.25)',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                      background: 'rgba(255, 255, 255, 0.03)',
                    }}
                  >
                    <span style={{ fontSize: '17px', fontWeight: '800', color: '#00f2fe' }}>
                      {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                    <span style={{ fontSize: '12px', color: '#f8fafc', fontWeight: '600' }}>
                      {st.room?.name || 'Phòng Standard'}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '6px', fontSize: '11px', color: '#94a3b8', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px' }}>
                      <span>Giá từ:</span>
                      <span style={{ color: '#00e676', fontWeight: '700' }}>{Number(st.price).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SIMILAR MOVIES RECOMMENDATION */}
          {similarMovies.length > 0 && (
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '700', color: '#ffd600', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Film size={15} color="#ffd600" />
                <span>Phim Tương Tự Có Thể Bạn Thích</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {similarMovies.map((sm) => (
                  <div
                    key={sm.id}
                    onClick={() => handleSimilarMovieClick(sm)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <img
                      src={sm.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                      alt={sm.title}
                      style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#fff', margin: '0 0 2px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {sm.title}
                      </h4>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{sm.duration} phút</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
