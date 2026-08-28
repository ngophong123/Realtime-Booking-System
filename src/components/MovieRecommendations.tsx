import { useState, useEffect } from 'react';
import { Sparkles, Flame, Heart, Smile, Ghost, Users, Star, ChevronRight } from 'lucide-react';
import type { Movie } from '../types';
import API from '../services/api';

interface MovieRecommendationsProps {
  onSelectMovie: (movie: Movie) => void;
}

export const MovieRecommendations = ({ onSelectMovie }: MovieRecommendationsProps) => {
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [recommendedMovies, setRecommendedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const moods = [
    { id: 'all', label: 'Dành Cho Bạn', icon: Star, color: '#00f2fe' },
    { id: 'action', label: 'Hành Động', icon: Flame, color: '#f97316' },
    { id: 'romance', label: 'Lãng Mạn / Hẹn Hò', icon: Heart, color: '#f43f5e' },
    { id: 'comedy', label: 'Hài Hước', icon: Smile, color: '#ffd600' },
    { id: 'horror', label: 'Kinh Dị', icon: Ghost, color: '#a855f7' },
    { id: 'family', label: 'Gia Đình', icon: Users, color: '#00e676' },
  ];

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const url = selectedMood === 'all' ? '/movies/recommendations' : `/movies/recommendations?mood=${selectedMood}`;
        const res = await API.get(url);
        setRecommendedMovies(res.data.recommendations || []);
      } catch (err) {
        console.error('Lỗi tải gợi ý phim:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [selectedMood]);

  if (recommendedMovies.length === 0 && !loading) return null;

  return (
    <div style={{ marginBottom: '40px' }}>
      {/* Header with AI badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #ffd600, #ff9100)', padding: '6px', borderRadius: '10px', color: '#000', display: 'flex' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>GỢI Ý PHIM DÀNH CHO BẠN</span>
              <span style={{ fontSize: '10px', background: 'rgba(255, 214, 0, 0.2)', color: '#ffd600', padding: '2px 8px', borderRadius: '6px', fontWeight: '800', border: '1px solid rgba(255, 214, 0, 0.4)' }}>
                AI RECOMMENDED
              </span>
            </h2>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>Khám phá các siêu phẩm điện ảnh theo sở thích &amp; tâm trạng hôm nay</span>
          </div>
        </div>

        {/* Mood Filter Chips */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px 0' }}>
          {moods.map((m) => {
            const Icon = m.icon;
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMood(m.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: isSelected ? `1px solid ${m.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? m.color : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={13} color={isSelected ? m.color : '#94a3b8'} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recommended Movies Cards Carousel / Grid */}
      {loading ? (
        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
          Đang phân tích gợi ý phim phù hợp...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {recommendedMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              className="glass-panel"
              style={{
                padding: '14px',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                display: 'flex',
                gap: '14px',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(0, 242, 254, 0.5)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <img
                src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200'}
                alt={movie.title}
                style={{ width: '70px', height: '100px', objectFit: 'cover', borderRadius: '10px' }}
              />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '9px', fontWeight: '800', background: movie.status === 'NOW_SHOWING' ? 'rgba(0,230,118,0.2)' : 'rgba(255,214,0,0.2)', color: movie.status === 'NOW_SHOWING' ? '#00e676' : '#ffd600', padding: '1px 6px', borderRadius: '4px' }}>
                      {movie.status === 'NOW_SHOWING' ? 'ĐANG CHIẾU' : 'SẮP CHIẾU'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{movie.duration}p</span>
                  </div>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px', lineHeight: 1.3 }}>
                    {movie.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                    {movie.description || 'Bộ phim hấp dẫn không thể bỏ lỡ tại Cineverse.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: '11px', color: '#00f2fe', fontWeight: '700' }}>
                    Xem Chi Tiết &amp; Lịch Chiếu
                  </span>
                  <ChevronRight size={14} color="#00f2fe" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
