import React, { useState, useMemo } from 'react';
import { Ticket, ChevronDown } from 'lucide-react';
import type { Movie, Room, Showtime } from '../types';
import { RippleButton } from './common/RippleButton';

interface QuickBookingBarProps {
  movies: Movie[];
  rooms: Room[];
  showtimes: Showtime[];
  onSelectShowtime: (showtime: Showtime) => void;
}

export const QuickBookingBar: React.FC<QuickBookingBarProps> = ({
  movies,
  rooms,
  showtimes,
  onSelectShowtime,
}) => {
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<string>('');

  // 1. Available Rooms for selected movie
  const availableRooms = useMemo(() => {
    if (!selectedMovieId) return rooms;
    const roomIdsForMovie = new Set(
      showtimes.filter((st) => st.movieId === selectedMovieId).map((st) => st.roomId)
    );
    return rooms.filter((r) => roomIdsForMovie.has(r.id));
  }, [selectedMovieId, rooms, showtimes]);

  // 2. Available Dates for selected movie & room
  const availableDates = useMemo(() => {
    let filtered = showtimes;
    if (selectedMovieId) filtered = filtered.filter((st) => st.movieId === selectedMovieId);
    if (selectedRoomId) filtered = filtered.filter((st) => st.roomId === selectedRoomId);

    const dates = new Set(
      filtered.map((st) => new Date(st.startTime).toISOString().split('T')[0])
    );
    return Array.from(dates).sort();
  }, [selectedMovieId, selectedRoomId, showtimes]);

  // 3. Available Showtimes for selected movie, room & date
  const availableShowtimes = useMemo(() => {
    let filtered = showtimes;
    if (selectedMovieId) filtered = filtered.filter((st) => st.movieId === selectedMovieId);
    if (selectedRoomId) filtered = filtered.filter((st) => st.roomId === selectedRoomId);
    if (selectedDate) {
      filtered = filtered.filter(
        (st) => new Date(st.startTime).toISOString().split('T')[0] === selectedDate
      );
    }
    return filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [selectedMovieId, selectedRoomId, selectedDate, showtimes]);

  const handleQuickSubmit = () => {
    if (!selectedShowtimeId) {
      // If user selected movie & has at least 1 showtime
      if (availableShowtimes.length > 0) {
        onSelectShowtime(availableShowtimes[0]);
      } else {
        alert('Vui lòng chọn đầy đủ 4 bước (Phim, Rạp, Ngày, Suất chiếu) để mua vé nhanh!');
      }
      return;
    }
    const targetShowtime = showtimes.find((s) => s.id === selectedShowtimeId);
    if (targetShowtime) {
      onSelectShowtime(targetShowtime);
    }
  };

  const nowShowingMovies = movies.filter((m) => m.status === 'NOW_SHOWING' || showtimes.some(s => s.movieId === m.id));

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 20,
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0,0,0,0.05)',
          border: '1px solid var(--border)',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr) auto',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Step 1: Chọn Phim */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>
              Chọn Phim
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedMovieId}
              onChange={(e) => {
                setSelectedMovieId(e.target.value);
                setSelectedShowtimeId('');
              }}
              style={{
                width: '100%',
                padding: '8px 24px 8px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-soft)',
                fontSize: '13px',
                fontWeight: '600',
                color: selectedMovieId ? 'var(--text)' : 'var(--text-muted)',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
              }}
            >
              <option value="">-- Chọn phim bạn muốn xem --</option>
              {nowShowingMovies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', right: '8px', top: '11px', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Step 2: Chọn Rạp */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            borderLeft: '1px solid var(--border)',
            paddingLeft: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: selectedMovieId ? 'var(--primary)' : 'var(--text-light)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              2
            </span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>
              Chọn Rạp / Phòng
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedRoomId}
              onChange={(e) => {
                setSelectedRoomId(e.target.value);
                setSelectedShowtimeId('');
              }}
              disabled={!selectedMovieId}
              style={{
                width: '100%',
                padding: '8px 24px 8px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: selectedMovieId ? 'var(--bg-soft)' : '#F3F4F6',
                fontSize: '13px',
                fontWeight: '600',
                color: selectedRoomId ? 'var(--text)' : 'var(--text-muted)',
                outline: 'none',
                cursor: selectedMovieId ? 'pointer' : 'not-allowed',
                appearance: 'none',
              }}
            >
              <option value="">-- Chọn phòng chiếu --</option>
              {availableRooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.type || 'STANDARD'})
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', right: '8px', top: '11px', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Step 3: Chọn Ngày */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            borderLeft: '1px solid var(--border)',
            paddingLeft: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: selectedMovieId ? 'var(--primary)' : 'var(--text-light)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              3
            </span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>
              Chọn Ngày Chiếu
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedShowtimeId('');
              }}
              disabled={!selectedMovieId}
              style={{
                width: '100%',
                padding: '8px 24px 8px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: selectedMovieId ? 'var(--bg-soft)' : '#F3F4F6',
                fontSize: '13px',
                fontWeight: '600',
                color: selectedDate ? 'var(--text)' : 'var(--text-muted)',
                outline: 'none',
                cursor: selectedMovieId ? 'pointer' : 'not-allowed',
                appearance: 'none',
              }}
            >
              <option value="">-- Chọn ngày --</option>
              {availableDates.map((dateStr) => {
                const d = new Date(dateStr);
                return (
                  <option key={dateStr} value={dateStr}>
                    {d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                  </option>
                );
              })}
            </select>
            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', right: '8px', top: '11px', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Step 4: Chọn Suất */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            borderLeft: '1px solid var(--border)',
            paddingLeft: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: selectedMovieId ? 'var(--primary)' : 'var(--text-light)',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              4
            </span>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)' }}>
              Chọn Suất Chiếu
            </span>
          </div>
          <div style={{ position: 'relative' }}>
            <select
              value={selectedShowtimeId}
              onChange={(e) => setSelectedShowtimeId(e.target.value)}
              disabled={availableShowtimes.length === 0}
              style={{
                width: '100%',
                padding: '8px 24px 8px 8px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: availableShowtimes.length > 0 ? 'var(--bg-soft)' : '#F3F4F6',
                fontSize: '13px',
                fontWeight: '600',
                color: selectedShowtimeId ? 'var(--text)' : 'var(--text-muted)',
                outline: 'none',
                cursor: availableShowtimes.length > 0 ? 'pointer' : 'not-allowed',
                appearance: 'none',
              }}
            >
              <option value="">-- Chọn giờ chiếu --</option>
              {availableShowtimes.map((st) => (
                <option key={st.id} value={st.id}>
                  {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} - {st.room?.name} ({Number(st.price).toLocaleString('vi-VN')}đ)
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color="var(--text-muted)"
              style={{ position: 'absolute', right: '8px', top: '11px', pointerEvents: 'none' }}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ paddingLeft: '8px' }}>
          <RippleButton
            onClick={handleQuickSubmit}
            style={{
              padding: '11px 22px',
              fontSize: '14px',
              fontWeight: '700',
              whiteSpace: 'nowrap',
              height: '42px',
            }}
          >
            <Ticket size={16} />
            <span>MUA VÉ NHANH</span>
          </RippleButton>
        </div>
      </div>
    </div>
  );
};
