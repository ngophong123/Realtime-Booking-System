import React, { useState } from 'react';
import { Calendar, Clock, Film, Sparkles } from 'lucide-react';
import type { Movie, Showtime, Room } from '../types';

interface ShowtimeScheduleSectionProps {
  movies: Movie[];
  showtimes: Showtime[];
  rooms: Room[];
  onSelectShowtime: (showtime: Showtime) => void;
  onSelectMovieDetail: (movie: Movie) => void;
}

export const ShowtimeScheduleSection: React.FC<ShowtimeScheduleSectionProps> = ({
  movies,
  showtimes,
  onSelectShowtime,
  onSelectMovieDetail,
}) => {
  // Generate date tabs: Today, Tomorrow, and next 5 days
  const today = new Date();
  const dateTabs = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = i === 0 ? 'Hôm Nay' : i === 1 ? 'Ngày Mai' : `Thứ ${d.getDay() === 0 ? 'CN' : d.getDay() + 1}`;
    const formattedDate = `${d.getDate()}/${d.getMonth() + 1}`;
    return { dateStr, dayName, formattedDate, fullDate: d };
  });

  const [selectedDate, setSelectedDate] = useState<string>(dateTabs[0].dateStr);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('ALL');

  // Filter showtimes by selected date
  const filteredShowtimes = showtimes.filter((st) => {
    const stDate = new Date(st.startTime).toISOString().split('T')[0];
    const matchDate = stDate === selectedDate;
    const matchRoomType = selectedRoomType === 'ALL' || st.room?.type === selectedRoomType;
    return matchDate && matchRoomType;
  });

  // Group filtered showtimes by Movie
  const moviesWithShowtimes = movies
    .map((m) => {
      const movieSts = filteredShowtimes
        .filter((st) => st.movieId === m.id)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      return { movie: m, showtimes: movieSts };
    })
    .filter((item) => item.showtimes.length > 0);

  return (
    <div
      className="cine-card animate-fade-in"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        padding: '24px 28px',
        marginBottom: '36px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px',
          borderBottom: '1.5px solid var(--border)',
          paddingBottom: '16px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '20px',
              fontWeight: '800',
              color: 'var(--text)',
              margin: '0 0 4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
              }}
            >
              <Calendar size={20} />
            </div>
            <span>LỊCH CHIẾU &amp; TẤT CẢ SUẤT CHIẾU TRỰC TUYẾN</span>
            <Sparkles size={16} color="var(--primary)" />
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Chọn ngay suất chiếu phù hợp để đặt vé và giữ chỗ ngồi trực tiếp theo thời gian thực
          </p>
        </div>

        {/* Room Type Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'Tất Cả Phòng' },
            { id: 'IMAX', label: '⚡ IMAX' },
            { id: 'VIP', label: '👑 VIP Gold' },
            { id: 'STANDARD', label: '🍿 Standard' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setSelectedRoomType(type.id)}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                border: selectedRoomType === type.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: selectedRoomType === type.id ? 'var(--primary-soft)' : 'var(--bg-soft)',
                color: selectedRoomType === type.id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Selector Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
        }}
      >
        {dateTabs.map((tab) => {
          const isSelected = selectedDate === tab.dateStr;
          // Count showtimes for this date
          const count = showtimes.filter((st) => new Date(st.startTime).toISOString().split('T')[0] === tab.dateStr).length;

          return (
            <button
              key={tab.dateStr}
              type="button"
              onClick={() => setSelectedDate(tab.dateStr)}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: isSelected ? 'var(--primary)' : '#FFFFFF',
                color: isSelected ? '#FFFFFF' : 'var(--text)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '100px',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? '0 4px 12px var(--primary-glow)' : 'none',
              }}
            >
              <span style={{ fontSize: '11px', fontWeight: '600', opacity: isSelected ? 0.9 : 0.7 }}>
                {tab.dayName}
              </span>
              <span style={{ fontSize: '16px', fontWeight: '800', margin: '2px 0' }}>
                {tab.formattedDate}
              </span>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-soft)',
                  color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                }}
              >
                {count} suất
              </span>
            </button>
          );
        })}
      </div>

      {/* Movies & Showtimes List */}
      {moviesWithShowtimes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {moviesWithShowtimes.map(({ movie, showtimes: movieSts }) => (
            <div
              key={movie.id}
              className="cine-card"
              style={{
                backgroundColor: 'var(--bg-soft)',
                borderRadius: '12px',
                padding: '16px 20px',
                border: '1px solid var(--border)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                alignItems: 'center',
              }}
            >
              {/* Movie Info (Left / Top) */}
              <div
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'center',
                  minWidth: '260px',
                  flex: '1 1 260px',
                  cursor: 'pointer',
                }}
                onClick={() => onSelectMovieDetail(movie)}
              >
                <img
                  src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200'}
                  alt={movie.title}
                  style={{
                    width: '60px',
                    height: '84px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                  }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span className="badge-age">T18</span>
                    <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                      {movie.title}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Clock size={12} /> {movie.duration} phút
                    </span>
                    <span>•</span>
                    <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                      2D Phụ Đề
                    </span>
                  </div>
                </div>
              </div>

              {/* Showtimes Grid for this Movie (Right / Bottom) */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '10px',
                  flex: '2 1 400px',
                  alignItems: 'center',
                }}
              >
                {movieSts.map((st) => {
                  const startTimeStr = new Date(st.startTime).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });
                  const endTimeStr = new Date(st.endTime).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                  });
                  const roomType = st.room?.type || 'STANDARD';
                  const isImax = roomType === 'IMAX';
                  const isVip = roomType === 'VIP';

                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => onSelectShowtime(st)}
                      className="cine-card-hover"
                      style={{
                        padding: '8px 14px',
                        borderRadius: '8px',
                        border: isImax ? '1.5px solid var(--primary)' : isVip ? '1.5px solid #FFC107' : '1px solid var(--border)',
                        backgroundColor: '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        minWidth: '95px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 6px 14px var(--primary-glow)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>
                          {startTimeStr}
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        ~ {endTimeStr}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: '700',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            backgroundColor: isImax ? 'var(--primary-soft)' : isVip ? 'rgba(255, 193, 7, 0.2)' : 'var(--bg-soft)',
                            color: isImax ? 'var(--primary)' : isVip ? '#B45309' : 'var(--text-muted)',
                          }}
                        >
                          {st.room?.name || roomType}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text)' }}>
                          {Number(st.price).toLocaleString('vi-VN')}đ
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '36px 20px',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-soft)',
            borderRadius: '10px',
          }}
        >
          <Film size={32} color="var(--text-light)" style={{ marginBottom: '8px' }} />
          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', margin: '0 0 4px' }}>
            Không có suất chiếu phù hợp cho ngày đã chọn
          </h4>
          <p style={{ fontSize: '12px', margin: 0 }}>
            Vui lòng chọn ngày khác trên thanh lịch chiếu hoặc đổi loại phòng chiếu.
          </p>
        </div>
      )}
    </div>
  );
};
