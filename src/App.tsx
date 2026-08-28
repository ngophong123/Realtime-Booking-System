import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MovieCard } from './components/MovieCard';
import { SeatMap } from './components/SeatMap';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { MovieDetailModal } from './components/MovieDetailModal';
import { MyTicketsModal } from './components/MyTicketsModal';
import { TicketModal } from './components/TicketModal';
import type { Movie, Showtime, User, Room } from './types';
import API from './services/api';
import { socket } from './services/socket';
import { Clapperboard, Sparkles, Flame, CalendarClock, Bell, Ticket } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [movieFilter, setMovieFilter] = useState<'now_showing' | 'coming_soon' | 'all'>('now_showing');

  // Selection States
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);

  // Modal States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  // Realtime Toast Notifications
  const [realtimeToast, setRealtimeToast] = useState<{ id: string; title: string; message: string; type: 'seat_freed' | 'admin_booking' } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
      }
    }

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    // Socket Event: Ghế được giải phóng do người dùng hủy vé
    const onSeatFreed = (data: any) => {
      setRealtimeToast({
        id: Date.now().toString(),
        title: '🎟️ CÓ GHẾ TRỐNG VỪA MỞ LẠI!',
        message: `Phim "${data.movieTitle}" (${data.roomName}) vừa có ${data.seatCount} ghế (${data.seatLabels?.join(', ') || 'Ghế'}) được mở lại!`,
        type: 'seat_freed',
      });
      setTimeout(() => setRealtimeToast(null), 7000);
    };

    // Socket Event: Admin nhận thông báo đơn hàng mới
    const onAdminNewBooking = (data: any) => {
      const stored = localStorage.getItem('user');
      const cur = stored ? JSON.parse(stored) : null;
      if (cur && cur.role === 'ADMIN') {
        setRealtimeToast({
          id: Date.now().toString(),
          title: '🔔 ĐƠN ĐẶT VÉ MỚI!',
          message: `${data.userName} vừa đặt ${data.seatCount} vé phim "${data.movieTitle}" - Tổng tiền: ${Number(data.totalPrice).toLocaleString('vi-VN')}đ`,
          type: 'admin_booking',
        });
        setTimeout(() => setRealtimeToast(null), 7000);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('showtime:seat_freed', onSeatFreed);
    socket.on('admin:new_booking', onAdminNewBooking);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('showtime:seat_freed', onSeatFreed);
      socket.off('admin:new_booking', onAdminNewBooking);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [moviesRes, showtimesRes, roomsRes] = await Promise.all([
        API.get('/movies'),
        API.get('/showtimes'),
        API.get('/rooms'),
      ]);
      setMovies(moviesRes.data.movies || []);
      setShowtimes(showtimesRes.data.showtimes || []);
      setRooms(roomsRes.data.rooms || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleSelectMovieForBooking = (movie: Movie) => {
    setDetailMovie(movie);
    setIsDetailOpen(true);
  };

  const handleOpenDetail = (movie: Movie) => {
    setDetailMovie(movie);
    setIsDetailOpen(true);
  };

  // Phân loại phim Đang Chiếu vs Sắp Chiếu
  const nowTime = Date.now();
  const nowShowingMovies = movies.filter((m) => new Date(m.releaseDate).getTime() <= nowTime);
  const comingSoonMovies = movies.filter((m) => new Date(m.releaseDate).getTime() > nowTime);

  let displayMovies = movies;
  if (movieFilter === 'now_showing') displayMovies = nowShowingMovies;
  else if (movieFilter === 'coming_soon') displayMovies = comingSoonMovies;

﻿  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      {/* Realtime Floating Toast */}
      {realtimeToast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '24px',
          zIndex: 150,
          background: realtimeToast.type === 'admin_booking' ? 'linear-gradient(135deg, #1e293b, #0f172a)' : 'linear-gradient(135deg, #12283a, #081622)',
          border: realtimeToast.type === 'admin_booking' ? '1px solid #ffd600' : '1px solid #00f2fe',
          borderRadius: '16px',
          padding: '16px 20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
          maxWidth: '380px',
          display: 'flex',
          gap: '12px',
          animation: 'slideIn 0.3s ease',
        }}>
          <div style={{ marginTop: '2px' }}>
            {realtimeToast.type === 'admin_booking' ? <Bell size={20} color="#ffd600" /> : <Ticket size={20} color="#00f2fe" />}
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: realtimeToast.type === 'admin_booking' ? '#ffd600' : '#00f2fe', margin: '0 0 4px' }}>
              {realtimeToast.title}
            </h4>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
              {realtimeToast.message}
            </p>
          </div>
          <button onClick={() => setRealtimeToast(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', alignSelf: 'flex-start' }}>
            ✕
          </button>
        </div>
      )}

      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onGoHome={() => setSelectedShowtime(null)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        isSocketConnected={isSocketConnected}
      />

      <main style={{ flex: 1, padding: '0 32px', maxWidth: '1300px', margin: '0 auto', width: '100%' }}>
        {selectedShowtime ? (
          <SeatMap
            showtime={selectedShowtime}
            onBack={() => setSelectedShowtime(null)}
            onBookingSuccess={(data) => {
              setBookingSuccessData(data);
              fetchData();
            }}
            onRequireAuth={() => setIsAuthOpen(true)}
          />
        ) : (
          <div>
            {movies.length > 0 && (
              <HeroBanner
                movie={movies[0]}
                onBookNow={() => handleSelectMovieForBooking(movies[0])}
                onViewDetail={() => handleOpenDetail(movies[0])}
              />
            )}

            <div style={{ marginBottom: '60px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Clapperboard size={22} color="#00f2fe" />
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: 0 }}>
                    Danh Sách Phim Rạp
                  </h2>
                </div>

                <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', gap: '4px' }}>
                  <ButtonTab
                    isActive={movieFilter === 'now_showing'}
                    onClick={() => setMovieFilter('now_showing')}
                    icon={Flame}
                    label="🔥 Phim Đang Chiếu"
                    count={nowShowingMovies.length}
                  />
                  <ButtonTab
                    isActive={movieFilter === 'coming_soon'}
                    onClick={() => setMovieFilter('coming_soon')}
                    icon={CalendarClock}
                    label="⏳ Phim Sắp Chiếu"
                    count={comingSoonMovies.length}
                  />
                  <ButtonTab
                    isActive={movieFilter === 'all'}
                    onClick={() => setMovieFilter('all')}
                    icon={Sparkles}
                    label="Tất Cả"
                    count={movies.length}
                  />
                </div>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                  <p>Đang kết nối tới Backend và tải danh sách phim...</p>
                </div>
              ) : displayMovies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                  <p>Không có phim nào trong mục này.</p>
                  {user?.role === 'ADMIN' && (
                    <button onClick={() => setIsAdminOpen(true)} className="glow-btn" style={{ marginTop: '16px', padding: '10px 20px' }}>
                      Mở Bảng Điều Hành Thêm Phim
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '28px' }}>
                  {displayMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelect={handleSelectMovieForBooking}
                      onViewDetail={handleOpenDetail}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(loggedUser) => setUser(loggedUser)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        movies={movies}
        rooms={rooms}
        showtimes={showtimes}
        onRefreshData={fetchData}
      />

      <MovieDetailModal
        movie={detailMovie}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        showtimes={showtimes}
        onSelectShowtime={(st) => setSelectedShowtime(st)}
        user={user}
        onRequireAuth={() => setIsAuthOpen(true)}
      />

      <MyTicketsModal
        isOpen={isMyTicketsOpen}
        onClose={() => setIsMyTicketsOpen(false)}
        onCancelSuccess={fetchData}
      />

      <TicketModal
        isOpen={!!bookingSuccessData}
        onClose={() => {
          setBookingSuccessData(null);
          setSelectedShowtime(null);
        }}
        bookingData={bookingSuccessData}
      />
    </div>
  );
}

interface ButtonTabProps {
  isActive: boolean;
  onClick: () => void;
  icon: any;
  label: string;
  count: number;
}

const ButtonTab = ({ isActive, onClick, icon: Icon, label, count }: ButtonTabProps) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 14px',
      borderRadius: '8px',
      border: 'none',
      background: isActive ? 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)' : 'transparent',
      color: isActive ? '#000' : '#94a3b8',
      fontWeight: isActive ? '800' : '600',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    }}
  >
    <Icon size={14} />
    <span>{label}</span>
    <span style={{
      fontSize: '10px',
      background: isActive ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.08)',
      color: isActive ? '#000' : '#cbd5e1',
      padding: '1px 6px',
      borderRadius: '10px',
      fontWeight: '800'
    }}>
      {count}
    </span>
  </button>
);

export default App;
