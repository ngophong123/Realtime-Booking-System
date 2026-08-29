import React from 'react';
import { Star, Play, Ticket, Clock } from 'lucide-react';
import type { Movie } from '../types';
import { RippleButton } from './common/RippleButton';

interface MovieCardProps {
  movie: Movie;
  onBookNow: () => void;
  onViewDetail: () => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onBookNow,
  onViewDetail,
}) => {
  // Generate stable mock rating for each movie based on id
  const rating = ((movie.id.charCodeAt(0) % 15) / 10 + 8.2).toFixed(1);
  const ageRating = movie.title.length % 2 === 0 ? 'T18' : 'T16';

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

        {/* Top-Left: Status pill if coming soon */}
        {movie.status === 'COMING_SOON' && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              zIndex: 2,
              backgroundColor: 'rgba(24, 87, 196, 0.9)',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            SẮP CHIẾU
          </div>
        )}

        {/* Hover Overlay with Action Buttons */}
        <div className="poster-overlay">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookNow();
            }}
            className="btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              fontWeight: '700',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
            }}
          >
            <Ticket size={16} /> MUA VÉ
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--text)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Play size={13} fill="var(--text)" /> Xem Chi Tiết
          </button>
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
          {/* Movie Title */}
          <h3
            title={movie.title}
            style={{
              fontSize: '15px',
              fontWeight: '700',
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

          {/* Duration & Genre */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <Clock size={13} color="var(--text-light)" />
            <span>{movie.duration} phút</span>
          </div>
        </div>

        {/* Quick CTA button */}
        <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
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
              fontWeight: '700',
            }}
          >
            <Ticket size={15} />
            <span>Mua Vé</span>
          </RippleButton>
        </div>
      </div>
    </div>
  );
};
