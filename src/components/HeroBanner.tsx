import React, { useState, useEffect } from 'react';
import { Ticket, Star, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import type { Movie } from '../types';
import { RippleButton } from './common/RippleButton';

import type { Showtime } from '../types';

interface HeroBannerProps {
  movies: Movie[];
  showtimes?: Showtime[];
  onBookNow: (movie: Movie) => void;
  onViewDetail: (movie: Movie) => void;
  onSelectShowtime?: (showtime: Showtime) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  movies,
  showtimes = [],
  onBookNow,
  onViewDetail,
  onSelectShowtime,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const bannerMovies = movies.slice(0, 5);
  const currentMovie = bannerMovies[currentIndex] || movies[0];

  useEffect(() => {
    if (bannerMovies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % bannerMovies.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [bannerMovies.length]);

  if (!currentMovie) return null;

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '24px' }}>
      {/* Banner Container */}
      <div
        style={{
          width: '100%',
          height: '420px',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          position: 'relative',
          boxShadow: 'var(--shadow-card)',
          backgroundColor: '#1A1D23',
        }}
      >
        {/* Backdrop Image */}
        <img
          src={currentMovie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600'}
          alt={currentMovie.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80';
          }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'all 0.6s ease',
          }}
        />

        {/* Gradient Overlays for perfect legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, rgba(26, 29, 35, 0.92) 0%, rgba(26, 29, 35, 0.6) 50%, rgba(26, 29, 35, 0.15) 100%)',
          }}
        />

        {/* Content Box */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            width: '60%',
            padding: '48px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            color: '#FFFFFF',
            zIndex: 2,
          }}
        >
          {/* Eyebrow badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
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
                fontSize: '12px',
                fontWeight: '700',
              }}
            >
              <Star size={13} fill="#FFC107" />
              <span>9.2 ĐÁNH GIÁ</span>
            </div>
            <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
              • {currentMovie.duration} Phút
            </span>
          </div>

          {/* Movie Title */}
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '800',
              margin: '0 0 12px',
              lineHeight: 1.2,
              letterSpacing: '-0.5px',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            {currentMovie.title}
          </h1>

          {/* Description */}
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.85)',
              margin: '0 0 24px',
              maxWidth: '480px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {currentMovie.description ||
              'Trải nghiệm chất lượng rạp chiếu phim đỉnh cao tại CINEVERSE với công nghệ âm thanh vòm sống động và màn hình sắc nét.'}
          </p>

          
          {/* Upcoming Showtimes for Current Banner Movie */}
          {(() => {
            const currentMovieShowtimes = showtimes.filter((s) => s.movieId === currentMovie.id);
            if (currentMovieShowtimes.length === 0) return null;
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'rgba(255, 255, 255, 0.9)' }}>
                  🎬 Suất chiếu hôm nay:
                </span>
                {currentMovieShowtimes.slice(0, 4).map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => onSelectShowtime ? onSelectShowtime(st) : onBookNow(currentMovie)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      backgroundColor: 'rgba(0, 0, 0, 0.45)',
                      backdropFilter: 'blur(4px)',
                      color: '#FFFFFF',
                      fontSize: '12px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ color: '#00e676' }}>
                      {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                    <span style={{ fontSize: '9px', padding: '1px 3px', borderRadius: '3px', backgroundColor: 'var(--primary)', color: '#fff' }}>
                      {st.room?.type || 'STD'}
                    </span>
                  </button>
                ))}
              </div>
            );
          })()}

          {/* CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <RippleButton
              onClick={() => onBookNow(currentMovie)}
              style={{
                padding: '12px 28px',
                fontSize: '15px',
                fontWeight: '700',
              }}
            >
              <Ticket size={18} />
              <span>ĐẶT VÉ NGAY</span>
            </RippleButton>

            <button
              onClick={() => onViewDetail(currentMovie)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#FFFFFF',
                padding: '11px 20px',
                borderRadius: 'var(--radius-btn)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
            >
              <Info size={16} />
              <span>Chi Tiết Phim</span>
            </button>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {bannerMovies.length > 1 && (
          <>
            <button
              onClick={() =>
                setCurrentIndex((prev) => (prev - 1 + bannerMovies.length) % bannerMovies.length)
              }
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 3,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)')}
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => setCurrentIndex((prev) => (prev + 1) % bannerMovies.length)}
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 3,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.7)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.4)')}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Dots Indicator below banner */}
      {bannerMovies.length > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px',
            marginTop: '12px',
          }}
        >
          {bannerMovies.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: currentIndex === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: currentIndex === idx ? 'var(--primary)' : '#D1D5DB',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
