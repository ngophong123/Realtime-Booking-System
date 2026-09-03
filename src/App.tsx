import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { QuickBookingBar } from './components/QuickBookingBar';
import { MovieCard } from './components/MovieCard';
import { ShowtimeScheduleSection } from './components/ShowtimeScheduleSection';
import { SeatMap } from './components/SeatMap';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { MovieDetailModal } from './components/MovieDetailModal';
import { MovieRecommendations } from './components/MovieRecommendations';
import { MyTicketsModal } from './components/MyTicketsModal';
import { TicketModal } from './components/TicketModal';
import { ProfileModal } from './components/ProfileModal';
import { PolicyModal } from './components/PolicyModal';
import { Footer } from './components/Footer';
import { AIChatWidget } from './components/AIChatWidget';
import { TopLoadingBar } from './components/common/TopLoadingBar';
import { SkeletonCard } from './components/common/SkeletonCard';
import { SlideInMenu } from './components/common/SlideInMenu';
import type { Movie, Showtime, User, Room } from './types';
import API from './services/api';
import { socket } from './services/socket';
import { MapPin, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [footerData, setFooterData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [movieFilter, setMovieFilter] = useState<'now_showing' | 'coming_soon' | 'all'>('now_showing');

  // Pagination State (8 movies per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const movieSectionRef = useRef<HTMLDivElement>(null);

  // Selection States
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);

  useEffect(() => {
    if (selectedShowtime) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [selectedShowtime]);

  // Modal & Drawer States
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMessage, setAuthInitialMessage] = useState<string | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMyTicketsOpen, setIsMyTicketsOpen] = useState(false);
  const [isSlideMenuOpen, setIsSlideMenuOpen] = useState(false);
  const [detailMovie, setDetailMovie] = useState<Movie | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<any>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  // Policy Modal States
  const [isPolicyOpen, setIsPolicyOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'terms' | 'privacy' | 'care' | 'about'>('terms');

  // Realtime Toast Notifications
  const [realtimeToast, setRealtimeToast] = useState<{ id: string; title: string; message: string; type: 'seat_freed' | 'admin_booking' | 'approved' } | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    fetchInitialData();

    // Global 401 Unauthorized Listener
    const handleUnauthorized = (e: Event) => {
      const customEvent = e as CustomEvent<{ message?: string }>;
      setUser(null);
      setIsAdminOpen(false);
      setIsMyTicketsOpen(false);
      setIsProfileOpen(false);
      setAuthInitialMessage(customEvent.detail?.message || 'Vui lòng đăng nhập!');
      setIsAuthOpen(true);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

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
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('seat:freed');
    };
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [moviesRes, showtimesRes, roomsRes, footerRes] = await Promise.all([
        API.get('/movies'),
        API.get('/showtimes'),
        API.get('/rooms'),
        API.get('/settings/footer'),
      ]);

      setMovies(moviesRes.data.movies || []);
      setShowtimes(showtimesRes.data.showtimes || []);
      setRooms(roomsRes.data.rooms || []);
      if (footerRes.data.footer) {
        setFooterData(footerRes.data.footer);
      }
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

  // Refresh data on showtime select
  const handleSelectMovieForBooking = (movie: Movie) => {
    fetchInitialData();
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

  // Paginated movies
  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage) || 1;
  const paginatedMovies = filteredMovies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (movieSectionRef.current) {
      movieSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenPolicyModal = (type: 'terms' | 'privacy' | 'care' | 'about') => {
    setPolicyType(type);
    setIsPolicyOpen(true);
  };

  const getPolicyTitle = () => {
    switch (policyType) {
      case 'terms':
        return 'Điều Khoản Sử Dụng Dịch Vụ CINEVERSE';
      case 'privacy':
        return 'Chính Sách Bảo Mật Thông Tin Khách Hàng';
      case 'care':
        return 'Quy Trình Chăm Sóc Khách Hàng & Hỗ Trợ 24/7';
      case 'about':
        return 'Về Hệ Thống Rạp Chiếu Phim CINEVERSE';
    }
  };

  const getPolicyContent = () => {
    if (!footerData) {
      return 'Đang tải nội dung chính sách...';
    }
    switch (policyType) {
      case 'terms':
        return footerData.termsOfService || 'Nội dung điều khoản đang được cập nhật.';
      case 'privacy':
        return footerData.privacyPolicy || 'Nội dung chính sách bảo mật đang được cập nhật.';
      case 'care':
        return `${footerData.customerCare || 'Liên hệ Hotline 1900 8888 để được hỗ trợ 24/7.'}\n\n- Hotline: ${footerData.hotline || '1900 8888'}\n- Email: ${footerData.email || 'support@cineverse.vn'}`;
      case 'about':
        return footerData.aboutUs || 'CINEVERSE - Hệ thống rạp chiếu phim realtime đẳng cấp hàng đầu.';
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)', display: 'flex', flexDirection: 'column' }}>
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
        onOpenAuth={() => {
          setAuthInitialMessage(null);
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onGoHome={() => setSelectedShowtime(null)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSlideMenu={() => setIsSlideMenuOpen(true)}
        onSelectFilter={(f) => {
          setSelectedShowtime(null);
          setMovieFilter(f);
          setCurrentPage(1);
        }}
        isSocketConnected={isSocketConnected}
      />

      {/* Slide-in Menu Drawer */}
      <SlideInMenu
        isOpen={isSlideMenuOpen}
        onClose={() => setIsSlideMenuOpen(false)}
        user={user}
        onOpenAuth={() => {
          setAuthInitialMessage(null);
          setIsAuthOpen(true);
        }}
        onLogout={handleLogout}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenMyTickets={() => setIsMyTicketsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onSelectFilter={(f) => {
          setSelectedShowtime(null);
          setMovieFilter(f);
          setCurrentPage(1);
        }}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px 80px', flex: 1, width: '100%' }}>
        {selectedShowtime ? (
          <SeatMap
            showtime={selectedShowtime}
            onBack={() => setSelectedShowtime(null)}
            onBookingSuccess={(booking) => {
              setBookingSuccessData(booking);
              setSelectedShowtime(null);
            }}
            onRequireAuth={() => {
              setAuthInitialMessage('Vui lòng đăng nhập!');
              setIsAuthOpen(true);
            }}
          />
        ) : (
          <div>
            {/* Hero Banner Carousel */}
            {movies.length > 0 && (
              <HeroBanner
                movies={movies}
                showtimes={showtimes}
                onBookNow={handleSelectMovieForBooking}
                onViewDetail={handleOpenDetail}
                onSelectShowtime={(st) => setSelectedShowtime(st)}
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

            {/* Full Showtimes Schedule Timeline Section on Home */}
            <ShowtimeScheduleSection
              movies={movies}
              showtimes={showtimes}
              rooms={rooms}
              onSelectShowtime={(st) => setSelectedShowtime(st)}
              onSelectMovieDetail={handleOpenDetail}
            />

            {/* Main Movie Catalog Section */}
            <div ref={movieSectionRef} style={{ marginBottom: '40px' }}>
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
                    onClick={() => { setMovieFilter('now_showing'); setCurrentPage(1); }}
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
                    onClick={() => { setMovieFilter('coming_soon'); setCurrentPage(1); }}
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
                    onClick={() => { setMovieFilter('all'); setCurrentPage(1); }}
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
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                      gap: '24px',
                    }}
                  >
                    {paginatedMovies.map((movie) => (
                      <MovieCard
                        key={movie.id}
                        movie={movie}
                        onBookNow={() => handleSelectMovieForBooking(movie)}
                        onViewDetail={() => handleOpenDetail(movie)}
                      />
                    ))}
                  </div>

                  {/* Numbered Pagination Buttons */}
                  {totalPages > 1 && (
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        marginTop: '40px',
                      }}
                    >
                      <button
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: '#FFFFFF',
                          color: currentPage === 1 ? 'var(--text-light)' : 'var(--text)',
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                        const isActive = pageNum === currentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                              backgroundColor: isActive ? 'var(--primary)' : '#FFFFFF',
                              color: isActive ? '#FFFFFF' : 'var(--text)',
                              fontWeight: '800',
                              fontSize: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: isActive ? '0 4px 10px var(--primary-glow)' : 'none',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          border: '1px solid var(--border)',
                          backgroundColor: '#FFFFFF',
                          color: currentPage === totalPages ? 'var(--text-light)' : 'var(--text)',
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer & Policies Section */}
      <Footer onOpenPolicy={handleOpenPolicyModal} footerData={footerData} />

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
        onClose={() => {
          setIsAuthOpen(false);
          setAuthInitialMessage(null);
        }}
        initialMessage={authInitialMessage}
        onAuthSuccess={(userData) => {
          setUser(userData);
          setIsAuthOpen(false);
          setAuthInitialMessage(null);
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
        onUserUpdate={(updated) => setUser(updated)}
      />

      <PolicyModal
        isOpen={isPolicyOpen}
        onClose={() => setIsPolicyOpen(false)}
        title={getPolicyTitle()}
        type={policyType}
        content={getPolicyContent()}
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
        onRequireAuth={() => {
          setAuthInitialMessage('Vui lòng đăng nhập!');
          setIsAuthOpen(true);
        }}
        onSelectMovie={handleOpenDetail}
      />
    </div>
  );
}

export default App;
