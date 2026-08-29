import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, Ticket, Film, Star } from 'lucide-react';
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

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  isOpen,
  onClose,
  showtimes,
  onSelectShowtime,
  user,
  onRequireAuth,
  onSelectMovie,
}) => {
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
        padding: '20px',
      }}
    >
      <div
        className="cine-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '850px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-modal)',
          overflow: 'hidden',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-dropdown)',
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
            border: 'none',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
          }}
        >
          <X size={18} />
        </button>

        {/* Backdrop Banner Header */}
        <div style={{ position: 'relative', height: '220px', overflow: 'hidden', backgroundColor: '#1A1D23' }}>
          <img
            src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200'}
            alt={movie.title}
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80';
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.55 }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(26, 29, 35, 0.85) 0%, transparent 100%)',
            }}
          />

          <div style={{ position: 'absolute', bottom: '16px', left: '24px', right: '24px', display: 'flex', alignItems: 'flex-end', gap: '18px' }}>
            <img
              src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
              alt={movie.title}
              style={{
                width: '105px',
                height: '145px',
                objectFit: 'cover',
                borderRadius: '8px',
                border: '3px solid #FFFFFF',
                boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
              }}
            />
            <div style={{ color: '#FFFFFF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge-age">T18</span>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    color: '#FFC107',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                  }}
                >
                  <Star size={12} fill="#FFC107" />
                  <span>9.2 ĐÁNH GIÁ</span>
                </div>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '0 0 6px', lineHeight: 1.2 }}>
                {movie.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={14} color="var(--primary)" /> {movie.duration} Phút
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={14} color="var(--primary)" /> Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px', backgroundColor: '#FFFFFF' }}>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Nội Dung Phim
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, margin: 0 }}>
              {movie.description ||
                'Trải nghiệm công nghệ rạp phim đỉnh cao với hệ thống màn hình IMAX laser sắc nét và âm thanh Dolby Atmos sống động nhất tại CINEVERSE.'}
            </p>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Ticket size={18} color="var(--primary)" />
                <span>Lịch Chiếu &amp; Phòng Chiếu</span>
              </h3>
              {!user && (
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
                  * Vui lòng đăng nhập trước khi chọn ghế
                </span>
              )}
            </div>

            {movieShowtimes.length === 0 ? (
              <div style={{ backgroundColor: 'var(--bg-soft)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-card)', padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Phim này hiện chưa có lịch chiếu hôm nay.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {movieShowtimes.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => handleShowtimeClick(st)}
                    style={{
                      backgroundColor: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-card)',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.backgroundColor = 'var(--primary-soft)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-soft)';
                    }}
                  >
                    <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--primary)' }}>
                      {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '600' }}>
                      {st.room?.name || 'Phòng Standard'}
                    </span>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginTop: '6px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '6px' }}>
                      <span>Giá từ:</span>
                      <b style={{ color: 'var(--text)' }}>
                        {Number(st.price).toLocaleString('vi-VN')}đ
                      </b>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* SIMILAR MOVIES */}
          {similarMovies.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                <Film size={16} color="var(--primary)" />
                <span>Phim Tương Tự Có Thể Bạn Thích</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                {similarMovies.map((sm) => (
                  <div
                    key={sm.id}
                    onClick={() => handleSimilarMovieClick(sm)}
                    style={{
                      backgroundColor: 'var(--bg-soft)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      padding: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <img
                      src={sm.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                      alt={sm.title}
                      style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div style={{ overflow: 'hidden' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', margin: '0 0 2px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {sm.title}
                      </h4>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{sm.duration} phút</span>
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
