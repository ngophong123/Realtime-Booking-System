import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { QuickBookingBar } from './components/QuickBookingBar';
import { MovieCard } from './components/MovieCard';
import { SeatMap } from './components/SeatMap';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { MovieDetailModal } from './components/MovieDetailModal';
import { MovieRecommendations } from './components/MovieRecommendations';
import { MyTicketsModal } from './components/MyTicketsModal';
import { TicketModal } from './components/TicketModal';
import { ProfileModal } from './components/ProfileModal';
import { AIChatWidget } from './components/AIChatWidget';
import { TopLoadingBar } from './components/common/TopLoadingBar';
import { SkeletonCard } from './components/common/SkeletonCard';
import { SlideInMenu } from './components/common/SlideInMenu';
import type { Movie, Showtime, User, Room } from './types';
import API from './services/api';
import { socket } from './services/socket';
import { MapPin, Bell } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [movieFilter, setMovieFilter] = useState<'now_showing' | 'coming_soon' | 'all'>('now_showing');

  // Selection States
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);

  // Modal & Drawer States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  const [isSlideMenuOpen, setIsSlideMenuOpen] = useState(false);
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  // Realtime Toast Notifications
  const [realtimeToast, setRealtimeToast] = useState<{ id: string; title: string; message: string; type: 'seat_freed' | 'admin_booking' | 'approved' } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchInitialData();

    socket.on('connect', () => setIsSocketConnected(true));
    socket.on('disconnect', () => setIsSocketConnected(false));

    socket.on('seat:freed', (data: { showtimeId: string; seatLabels: string[]; movieTitle: string }) => {
      setRealtimeToast({
        id: Date.now().toString(),
        title: '🎟️ CƠ HỘI ĐẶT VÉ MỚI!',
        message: `Vừa có khách hủy vé phim "${data.movieTitle}". Ghế [${data.seatLabels.join(', ')}] hiện đã trống, đặt ngay!`,
        type: 'seat_freed',
      });
      setTimeout(() => setRealtimeToast(null), 7000);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('seat:freed');
    };
  }, []);

  const fetchInitialData = async () => {
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
      console.error('Lỗi nạp dữ liệu ban đầu:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleOpenDetail = (movie: Movie) => {
    setDetailMovie(movie);
    setIsDetailOpen(true);
  };

  const handleSelectMovieForBooking = (movie: Movie) => {
    const movieShowtimes = showtimes.filter((s) => s.movieId === movie.id);
    if (movieShowtimes.length > 0) {
      setSelectedShowtime(movieShowtimes[0]);
    } else {
      handleOpenDetail(movie);
    }
  };

  // Filter movies
  const filteredMovies = movies.filter((m) => {
    if (movieFilter === 'now_showing') return m.status === 'NOW_SHOWING';
    if (movieFilter === 'coming_soon') return m.status === 'COMING_SOON';
    return true;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Top Progress Bar */}
      <TopLoadingBar isLoading={loading} />

      {/* Realtime Toast Notification */}
      {realtimeToast && (
        <div
          style={{
            position: 'fixed',
            top: '84px',
            right: '24px',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border)',
            borderLeft: '4px solid var(--primary)',
            boxShadow: 'var(--shadow-dropdown)',
            borderRadius: 'var(--radius-card)',
            padding: '14px 18px',
            zIndex: 150,
            maxWidth: '360px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--primary-soft)',
              padding: '6px',
              borderRadius: '6px',
              color: 'var(--primary)',
            }}
          >
            <Bell size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', margin: '0 0 2px' }}>
              {realtimeToast.title}
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.4 }}>
              {realtimeToast.message}
            </p>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onGoHome={() => setSelectedShowtime(null)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSlideMenu={() => setIsSlideMenuOpen(true)}
        onSelectFilter={(f) => {
          setSelectedShowtime(null);
          setMovieFilter(f);
        }}
        isSocketConnected={isSocketConnected}
      />

      {/* Slide-in Menu Drawer */}
      <SlideInMenu
        isOpen={isSlideMenuOpen}
        onClose={() => setIsSlideMenuOpen(false)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSelectFilter={(f) => {
          setSelectedShowtime(null);
          setMovieFilter(f);
        }}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px 80px' }}>
        {selectedShowtime ? (
          <SeatMap
            showtime={selectedShowtime}
            onBack={() => setSelectedShowtime(null)}
            onBookingSuccess={(booking) => {
              setBookingSuccessData(booking);
              setSelectedShowtime(null);
            }}
            onRequireAuth={() => setIsAuthOpen(true)}
          />
        ) : (
          <div>
            {/* Hero Banner Carousel */}
            {movies.length > 0 && (
              <HeroBanner
                movies={movies}
                onBookNow={handleSelectMovieForBooking}
                onViewDetail={handleOpenDetail}
              />
            )}

            {/* Quick Booking 4-Step Bar (Sits on top/under hero) */}
            <div style={{ marginTop: '-40px', marginBottom: '40px' }}>
              <QuickBookingBar
                movies={movies}
                rooms={rooms}
                showtimes={showtimes}
                onSelectShowtime={(st) => setSelectedShowtime(st)}
              />
            </div>

            {/* AI Movie Recommendations */}
            <MovieRecommendations onSelectMovie={handleOpenDetail} />

            {/* Main Movie Catalog Section */}
            <div style={{ marginBottom: '60px' }}>
              {/* Category Tabs Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '2px solid var(--border)',
                  marginBottom: '28px',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}
              >
                {/* Left: Tab items */}
                <div style={{ display: 'flex', gap: '32px' }}>
                  <button
                    onClick={() => setMovieFilter('now_showing')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '12px 4px',
                      fontSize: '18px',
                      fontWeight: movieFilter === 'now_showing' ? '800' : '600',
                      color: movieFilter === 'now_showing' ? 'var(--text)' : 'var(--text-muted)',
                      borderBottom: movieFilter === 'now_showing' ? '3px solid var(--primary)' : '3px solid transparent',
                      marginBottom: '-2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>Phim Đang Chiếu</span>
                    <span
                      style={{
                        backgroundColor: movieFilter === 'now_showing' ? 'var(--primary-soft)' : 'var(--bg-soft)',
                        color: movieFilter === 'now_showing' ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {movies.filter((m) => m.status === 'NOW_SHOWING').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setMovieFilter('coming_soon')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '12px 4px',
                      fontSize: '18px',
                      fontWeight: movieFilter === 'coming_soon' ? '800' : '600',
                      color: movieFilter === 'coming_soon' ? 'var(--text)' : 'var(--text-muted)',
                      borderBottom: movieFilter === 'coming_soon' ? '3px solid var(--primary)' : '3px solid transparent',
                      marginBottom: '-2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>Phim Sắp Chiếu</span>
                    <span
                      style={{
                        backgroundColor: movieFilter === 'coming_soon' ? 'var(--primary-soft)' : 'var(--bg-soft)',
                        color: movieFilter === 'coming_soon' ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '10px',
                      }}
                    >
                      {movies.filter((m) => m.status === 'COMING_SOON').length}
                    </span>
                  </button>

                  <button
                    onClick={() => setMovieFilter('all')}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '12px 4px',
                      fontSize: '18px',
                      fontWeight: movieFilter === 'all' ? '800' : '600',
                      color: movieFilter === 'all' ? 'var(--text)' : 'var(--text-muted)',
                      borderBottom: movieFilter === 'all' ? '3px solid var(--primary)' : '3px solid transparent',
                      marginBottom: '-2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>Tất Cả Phim</span>
                  </button>
                </div>

                {/* Right: Location Indicator */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--bg-soft)',
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: 'var(--text)',
                  }}
                >
                  <MapPin size={15} color="var(--primary)" />
                  <span>Khu vực: <b>Toàn Quốc</b></span>
                </div>
              </div>

              {/* Movie Cards Grid or Skeleton Loading */}
              {loading ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                    gap: '24px',
                  }}
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredMovies.length === 0 ? (
                <div
                  style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    backgroundColor: 'var(--bg-soft)',
                    borderRadius: 'var(--radius-card)',
                    color: 'var(--text-muted)',
                  }}
                >
                  Không tìm thấy bộ phim nào trong danh mục này.
                </div>
              ) : (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                    gap: '24px',
                  }}
                >
                  {filteredMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onBookNow={() => handleSelectMovieForBooking(movie)}
                      onViewDetail={() => handleOpenDetail(movie)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* AI Chatbot Assistant Widget */}
      <AIChatWidget onSelectMovie={handleOpenDetail} />

      {/* Modals */}
      <TicketModal
        isOpen={!!bookingSuccessData}
        onClose={() => setBookingSuccessData(null)}
        bookingData={bookingSuccessData}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(userData) => {
          setUser(userData);
          setIsAuthOpen(false);
        }}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        movies={movies}
        rooms={rooms}
        showtimes={showtimes}
        onRefreshData={fetchInitialData}
      />

      <MyTicketsModal
        isOpen={isMyTicketsOpen}
        onClose={() => setIsMyTicketsOpen(false)}
        user={user}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
      />

      <MovieDetailModal
        movie={detailMovie}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        showtimes={showtimes}
        onSelectShowtime={(st) => {
          setSelectedShowtime(st);
          setIsDetailOpen(false);
        }}
        user={user}
        onRequireAuth={() => setIsAuthOpen(true)}
        onSelectMovie={handleOpenDetail}
      />
    </div>
  );
}

export default App;
