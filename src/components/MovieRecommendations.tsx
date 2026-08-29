import React, { useState, useEffect } from 'react';
import { Compass, Flame, Heart, Zap, Smile, ChevronRight } from 'lucide-react';
import type { Movie } from '../types';
import API from '../services/api';

interface MovieRecommendationsProps {
  onSelectMovie: (movie: Movie) => void;
}

export const MovieRecommendations: React.FC<MovieRecommendationsProps> = ({ onSelectMovie }) => {
  const [mood, setMood] = useState<string>('trending');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  const moods = [
    { id: 'trending', label: '🔥 Thịnh Hành Nhất', icon: Flame },
    { id: 'action', label: '⚡ Kịch Tính & Hành Động', icon: Zap },
    { id: 'romance', label: '💖 Lãng Mạn & Cảm Xúc', icon: Heart },
    { id: 'comedy', label: '🍿 Hài Hước & Giải Trí', icon: Smile },
  ];

  useEffect(() => {
    fetchRecommendations(mood);
  }, [mood]);

  const fetchRecommendations = async (selectedMood: string) => {
    try {
      setLoading(true);
      const res = await API.get(`/movies/recommendations?mood=${selectedMood}`);
      setMovies(res.data.recommendations || []);
    } catch (err) {
      console.error('Lỗi nạp gợi ý phim:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        padding: '24px',
        marginBottom: '40px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Compass size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
              GỢI Ý PHIM DÀNH RIÊNG CHO BẠN
            </h2>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Được tuyển chọn theo gu xem phim và xu hướng rạp chiếu mới nhất
            </span>
          </div>
        </div>

        {/* Mood Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {moods.map((m) => {
            const Icon = m.icon;
            const isActive = mood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMood(m.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-pill)',
                  border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: isActive ? 'var(--primary-soft)' : '#FFFFFF',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended Movies Row */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Đang tìm kiếm phim phù hợp với tâm trạng của bạn...
        </div>
      ) : movies.length === 0 ? (
        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Chưa có phim nào trong danh mục này.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
          }}
        >
          {movies.slice(0, 4).map((movie) => (
            <div
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              className="cine-card cine-card-hover"
              style={{
                display: 'flex',
                gap: '12px',
                padding: '10px',
                backgroundColor: 'var(--bg-soft)',
                borderRadius: '10px',
                cursor: 'pointer',
                alignItems: 'center',
              }}
            >
              <img
                src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200'}
                alt={movie.title}
                style={{
                  width: '55px',
                  height: '75px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  flexShrink: 0,
                }}
              />
              <div style={{ overflow: 'hidden', flex: 1 }}>
                <h4
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--text)',
                    margin: '0 0 4px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {movie.title}
                </h4>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                  {movie.duration} phút
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: 'var(--primary)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  Đặt vé ngay <ChevronRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
