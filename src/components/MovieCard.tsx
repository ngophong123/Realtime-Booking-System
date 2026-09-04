import React from 'react';
import { Star, Play, Ticket, Clock, Calendar, Flame, Hourglass, Info } from 'lucide-react';
import type { Movie, Showtime } from '../types';
import { RippleButton } from './common/RippleButton';

interface MovieCardProps {
  movie: Movie;
  showtimes?: Showtime[];
  onBookNow: () => void;
  onViewDetail: () => void;
  onSelectShowtime?: (showtime: Showtime) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  showtimes = [],
  onBookNow,
  onViewDetail,
  onSelectShowtime,
}) => {
  // Generate stable mock rating for each movie based on id
  const rating = ((movie.id.charCodeAt(0) % 15) / 10 + 8.2).toFixed(1);
  const ageRating = movie.title.length % 2 === 0 ? 'T18' : 'T16';
  const isNowShowing = movie.status === 'NOW_SHOWING';
  const releaseDateStr = movie.releaseDate
    ? new Date(movie.releaseDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '';

  return (
    <div
      className="cine-card cine-card-hover"
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        cursor: 'pointer',
        border: isNowShowing ? '1px solid rgba(225, 29, 72, 0.18)' : '1px solid rgba(14, 116, 144, 0.22)',
        boxShadow: isNowShowing ? '0 4px 14px rgba(225, 29, 72, 0.08)' : '0 4px 14px rgba(14, 116, 144, 0.08)',
        transition: 'all 0.25s ease',
      }}
      onClick={onViewDetail}
    >
      {/* Poster Image Wrap with inner zoom */}
      <div
        className="poster-wrap"
        style={{
          width: '100%',
          aspectRatio: '2 / 3',
          position: 'relative',
        }}
      >
        <img
          src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'}
          alt={movie.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&q=80';
          }}
          loading="lazy"
        />

        {/* Top-Right Badge: Star Rating */}
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 2,
          }}
        >
          <div className="badge-rating">
            <Star size={13} fill="var(--rating)" color="var(--rating)" />
            <span>{rating}</span>
          </div>
        </div>

        {/* Bottom-Right Badge: Age Rating */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            zIndex: 2,
          }}
        >
          <span className="badge-age">{ageRating}</span>
        </div>

        {/* Top-Left: PROMINENT STATUS BADGE */}
        {isNowShowing ? (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 2,
              background: 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              boxShadow: '0 3px 10px rgba(225, 29, 72, 0.45)',
              letterSpacing: '0.3px',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                boxShadow: '0 0 6px #22C55E',
                display: 'inline-block',
              }}
            />
            <Flame size={12} fill="#FFFFFF" color="#FFFFFF" />
            <span>ĐANG CHIẾU</span>
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 2,
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 3px 10px rgba(2, 132, 199, 0.45)',
              letterSpacing: '0.3px',
            }}
          >
            <Hourglass size={12} color="#FFFFFF" />
            <span>SẮP CHIẾU</span>
          </div>
        )}

        {/* Hover Overlay with Action Buttons */}
        <div className="poster-overlay">
          {isNowShowing ? (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBookNow();
                }}
                className="btn-primary"
                style={{
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: '800',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Ticket size={16} /> MUA VÉ NGAY
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetail();
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: 'var(--radius-btn)',
                  padding: '7px 16px',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: 'var(--text)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <Play size={13} fill="var(--text)" /> Xem Chi Tiết
              </button>
            </>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail();
              }}
              style={{
                background: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-btn)',
                padding: '9px 18px',
                fontSize: '13px',
                fontWeight: '800',
                color: '#0369A1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
              }}
            >
              <Info size={15} /> XEM CHI TIẾT & TRAILER
            </button>
          )}
        </div>
      </div>

      {/* Info Section below poster */}
      <div
        style={{
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          justifyContent: 'space-between',
        }}
      >
        <div>
          {/* Status Label & Duration Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            {isNowShowing ? (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: 'var(--primary)',
                  backgroundColor: 'var(--primary-soft)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Flame size={11} /> Đang chiếu rạp
              </span>
            ) : (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#0284C7',
                  backgroundColor: 'rgba(2, 132, 199, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                <Calendar size={11} /> Khởi chiếu: {releaseDateStr || 'Sắp ra mắt'}
              </span>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '11px',
                color: 'var(--text-muted)',
              }}
            >
              <Clock size={12} color="var(--text-light)" />
              <span>{movie.duration} phút</span>
            </div>
          </div>

          {/* Movie Title */}
          <h3
            title={movie.title}
            style={{
              fontSize: '15px',
              fontWeight: '800',
              color: 'var(--text)',
              margin: '0 0 6px',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '38px',
            }}
          >
            {movie.title}
          </h3>
        </div>

        {/* Showtimes or Coming Soon Banner */}
        <div style={{ marginTop: '10px' }}>
          {isNowShowing ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={12} /> Suất Chiếu:
                </span>
                {showtimes.length > 0 && (
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '600' }}>
                    {showtimes.length} suất hôm nay
                  </span>
                )}
              </div>

              {showtimes.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {showtimes.slice(0, 3).map((st) => {
                    const timeStr = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false });
                    const roomType = st.room?.type || 'STD';
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectShowtime) onSelectShowtime(st);
                          else onBookNow();
                        }}
                        title={`${st.room?.name || 'Phòng chiếu'} • ${Number(st.price).toLocaleString('vi-VN')}đ`}
                        style={{
                          padding: '4px 7px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-soft)',
                          color: 'var(--text)',
                          fontSize: '11px',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--primary)';
                          e.currentTarget.style.backgroundColor = 'var(--primary-soft)';
                          e.currentTarget.style.color = 'var(--primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border)';
                          e.currentTarget.style.backgroundColor = 'var(--bg-soft)';
                          e.currentTarget.style.color = 'var(--text)';
                        }}
                      >
                        <span>{timeStr}</span>
                        <span style={{ fontSize: '8px', padding: '1px 3px', borderRadius: '3px', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                          {roomType}
                        </span>
                      </button>
                    );
                  })}

                  {showtimes.length > 3 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetail();
                      }}
                      style={{
                        padding: '4px 6px',
                        borderRadius: '6px',
                        border: '1px dashed var(--border)',
                        backgroundColor: 'transparent',
                        color: 'var(--primary)',
                        fontSize: '10px',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      +{showtimes.length - 3} suất
                    </button>
                  )}
                </div>
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Chưa có suất chiếu hôm nay
                </span>
              )}
            </div>
          ) : (
            <div
              style={{
                backgroundColor: 'rgba(2, 132, 199, 0.06)',
                border: '1px dashed rgba(2, 132, 199, 0.3)',
                borderRadius: '6px',
                padding: '8px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Hourglass size={13} color="#0284C7" />
              <span style={{ fontSize: '11px', color: '#0369A1', fontWeight: '700' }}>
                Dự kiến khởi chiếu: {releaseDateStr || 'Sắp ra mắt'}
              </span>
            </div>
          )}
        </div>

        {/* Quick CTA button */}
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          {isNowShowing ? (
            <RippleButton
              onClick={(e) => {
                e.stopPropagation();
                onBookNow();
              }}
              variant="outline-primary"
              style={{
                width: '100%',
                padding: '8px 0',
                fontSize: '13px',
                fontWeight: '800',
              }}
            >
              <Ticket size={15} />
              <span>Mua Vé</span>
            </RippleButton>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetail();
              }}
              style={{
                width: '100%',
                padding: '8px 0',
                fontSize: '12px',
                fontWeight: '700',
                backgroundColor: 'var(--bg-soft)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-btn)',
                color: '#0369A1',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(2, 132, 199, 0.1)';
                e.currentTarget.style.borderColor = '#0284C7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-soft)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <Play size={13} fill="#0369A1" />
              <span>Xem Trailer & Chi Tiết</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
