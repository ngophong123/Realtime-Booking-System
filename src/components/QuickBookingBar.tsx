import { useState, useMemo } from 'react';
import { Ticket, ChevronDown } from 'lucide-react';
import type { Movie, Room, Showtime } from '../types';
import { RippleButton } from './common/RippleButton';

interface QuickBookingBarProps {
  movies: Movie[];
  rooms: Room[];
  showtimes: Showtime[];
  onSelectShowtime: (showtime: Showtime) => void;
}

export const QuickBookingBar = ({
  movies,
  rooms,
  showtimes,
  onSelectShowtime,
}: QuickBookingBarProps) => {
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('');

  // 1. Available Rooms for selected movie
  const availableRooms = useMemo(() => {
    if (!selectedMovieId) return rooms;
    const roomIds = showtimes
      .filter((s) => s.movieId === selectedMovieId)
      .map((s) => s.roomId);
    return rooms.filter((r) => roomIds.includes(r.id));
  }, [selectedMovieId, showtimes, rooms]);

  // 2. Available Dates for selected movie & room
  const availableDates = useMemo(() => {
    let filtered = showtimes;
    if (selectedMovieId) filtered = filtered.filter((s) => s.movieId === selectedMovieId);
    if (selectedRoomId) filtered = filtered.filter((s) => s.roomId === selectedRoomId);

    const dates = filtered.map((s) => new Date(s.startTime).toISOString().split('T')[0]);
    return Array.from(new Set(dates)).sort();
  }, [selectedMovieId, selectedRoomId, showtimes]);

  // 3. Available Showtimes for selected movie, room & date
  const availableShowtimes = useMemo(() => {
    let filtered = showtimes;
    if (selectedMovieId) filtered = filtered.filter((s) => s.movieId === selectedMovieId);
    if (selectedRoomId) filtered = filtered.filter((s) => s.roomId === selectedRoomId);
    if (selectedDate) {
      filtered = filtered.filter(
        (s) => new Date(s.startTime).toISOString().split('T')[0] === selectedDate
      );
    }
    return filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [selectedMovieId, selectedRoomId, selectedDate, showtimes]);

  const handleBooking = () => {
    if (!selectedShowtimeId) return;
    const targetShowtime = showtimes.find((s) => s.id === selectedShowtimeId);
    if (targetShowtime) {
      onSelectShowtime(targetShowtime);
    }
  };

  const isNowPlaying = (st: Showtime) => {
    const now = new Date().getTime();
    const start = new Date(st.startTime).getTime();
    const end = new Date(st.endTime).getTime();
    return now >= start && now <= end;
  };

  return (
    <div
      className="cine-card animate-fade-in"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-card)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-dropdown)',
        border: '1px solid var(--border)',
        position: 'relative',
        zIndex: 20,
      }}
    >
      <div
        className="quick-booking-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1.2fr auto',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        {/* Step 1: Phim */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              1
            </span>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
              CHỌN PHIM
            </label>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedMovieId}
              onChange={(e) => {
                setSelectedMovieId(e.target.value);
                setSelectedRoomId('');
                setSelectedDate('');
                setSelectedShowtimeId('');
              }}
              className="cine-input"
              style={{
                paddingRight: '28px',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: 'var(--bg-soft)',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Chọn phim --</option>
              {movies.filter((m) => m.status === 'NOW_SHOWING').length > 0 && (
                <optgroup label="🔥 PHIM ĐANG CHIẾU">
                  {movies
                    .filter((m) => m.status === 'NOW_SHOWING')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title}
                      </option>
                    ))}
                </optgroup>
              )}
              {movies.filter((m) => m.status === 'COMING_SOON').length > 0 && (
                <optgroup label="⏳ PHIM SẮP CHIẾU">
                  {movies
                    .filter((m) => m.status === 'COMING_SOON')
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.title} (Sắp chiếu)
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Step 2: Rạp / Phòng */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: selectedMovieId ? 'var(--primary)' : 'var(--border)',
                color: selectedMovieId ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              2
            </span>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
              CHỌN PHÒNG
            </label>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setSelectedDate('');
                setSelectedShowtimeId('');
              }}
              disabled={!selectedMovieId}
              className="cine-input"
              style={{
                paddingRight: '28px',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: !selectedMovieId ? '#FFFFFF' : 'var(--bg-soft)',
                cursor: !selectedMovieId ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="">-- Tất cả phòng --</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type})
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Step 3: Ngày */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: selectedMovieId ? 'var(--primary)' : 'var(--border)',
                color: selectedMovieId ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              3
            </span>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
              CHỌN NGÀY
            </label>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedShowtimeId('');
              }}
              disabled={!selectedMovieId}
              className="cine-input"
              style={{
                paddingRight: '28px',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: !selectedMovieId ? '#FFFFFF' : 'var(--bg-soft)',
                cursor: !selectedMovieId ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="">-- Chọn ngày --</option>
              {availableDates.map((d) => (
                <option key={d} value={d}>
                  {new Date(d).toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Step 4: Suất Chiếu (Có hiển thị Đang Chiếu) */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: availableShowtimes.length > 0 ? 'var(--primary)' : 'var(--border)',
                color: availableShowtimes.length > 0 ? '#FFFFFF' : 'var(--text-muted)',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              4
            </span>
            <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)' }}>
              CHỌN SUẤT CHIẾU
            </label>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedShowtimeId}
              onChange={(e) => setSelectedShowtimeId(e.target.value)}
              disabled={availableShowtimes.length === 0}
              className="cine-input"
              style={{
                paddingRight: '28px',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: availableShowtimes.length === 0 ? '#FFFFFF' : 'var(--bg-soft)',
                cursor: availableShowtimes.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <option value="">
                {availableShowtimes.length === 0
                  ? '-- Không có suất --'
                  : '-- Chọn giờ chiếu --'}
              </option>
              {availableShowtimes.map((st) => {
                const playing = isNowPlaying(st);
                const startTimeStr = new Date(st.startTime).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
                return (
                  <option key={st.id} value={st.id}>
                    {startTimeStr} ({st.room?.name || 'Phòng'}) {playing ? '🔴 [ĐANG CHIẾU]' : ''} - {Number(st.price).toLocaleString('vi-VN')}đ
                  </option>
                );
              })}
            </select>
            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', right: '10px', top: '12px', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* CTA Button */}
        <div style={{ paddingTop: '20px' }}>
          <RippleButton
            onClick={handleBooking}
            disabled={!selectedShowtimeId}
            style={{
              width: '100%',
              padding: '10px 18px',
              fontSize: '13px',
              fontWeight: '800',
              whiteSpace: 'nowrap',
              borderRadius: 'var(--radius-btn)',
              boxShadow: selectedShowtimeId ? '0 4px 12px var(--primary-glow)' : 'none',
              opacity: !selectedShowtimeId ? 0.6 : 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Ticket size={16} />
              <span>MUA VÉ NHANH</span>
            </div>
          </RippleButton>
        </div>
      </div>
    </div>
  );
};
