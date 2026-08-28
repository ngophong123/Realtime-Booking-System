import { useState, useEffect, type FormEvent } from 'react';
import { X, Film, DoorOpen, CalendarClock, TrendingUp, Plus, Trash2, Edit3, ShieldCheck, RotateCcw, Gift } from 'lucide-react';
import type { Movie, Room, Showtime, Booking, Voucher } from '../types';
import API from '../services/api';

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  rooms: Room[];
  showtimes: Showtime[];
  onRefreshData: () => void;
}

export const AdminModal = ({
  isOpen,
  onClose,
  movies,
  rooms: propRooms,
  showtimes,
  onRefreshData,
}: AdminModalProps) => {
  const [activeTab, setActiveTab] = useState<'movies' | 'rooms' | 'showtimes' | 'vouchers' | 'stats'>('movies');
  const [rooms, setRooms] = useState<Room[]>(propRooms || []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Movie Edit State
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    duration: 120,
    posterUrl: '',
    releaseDate: new Date().toISOString().split('T')[0],
  });

  // Room State & Seat Config State
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [selectedRoomForSeats, setSelectedRoomForSeats] = useState<Room | null>(null);
  const [selectedSeatIdsToConfig, setSelectedSeatIdsToConfig] = useState<string[]>([]);
  const [newRoom, setNewRoom] = useState({
    name: '',
    rows: 6,
    columns: 8,
  });

  // Showtime State
  const [editingShowtimeId, setEditingShowtimeId] = useState<string | null>(null);
  const [newShowtime, setNewShowtime] = useState({
    movieId: '',
    roomId: '',
    startTime: '',
    endTime: '',
    price: 85000,
  });

  // Voucher State
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'amount',
    discountValue: 10,
    minOrderAmount: 0,
    maxDiscount: 50000,
    expireAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    usageLimit: 100,
  });

  const fetchAdminData = async () => {
    try {
      const [roomsRes, bookingsRes, vouchersRes] = await Promise.all([
        API.get('/rooms'),
        API.get('/bookings'),
        API.get('/vouchers'),
      ]);
      const fetchedRooms = roomsRes.data.rooms || [];
      setRooms(fetchedRooms);
      setBookings(bookingsRes.data.bookings || []);
      setVouchers(vouchersRes.data.vouchers || []);

      if (fetchedRooms.length > 0) {
        if (!selectedRoomForSeats) setSelectedRoomForSeats(fetchedRooms[0]);
        setNewShowtime((prev) => ({
          ...prev,
          roomId: prev.roomId || fetchedRooms[0].id,
        }));
      }
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu admin:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
      if (movies.length > 0) {
        setNewShowtime((prev) => ({ ...prev, movieId: prev.movieId || movies[0].id }));
      }
    }
  }, [isOpen, movies]);

  if (!isOpen) return null;

  // --- Movie Handlers ---
  const handleSaveMovie = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const payload = {
        title: movieForm.title.trim(),
        description: movieForm.description.trim(),
        duration: Number(movieForm.duration),
        posterUrl: movieForm.posterUrl.trim() || DEFAULT_POSTER,
        releaseDate: new Date(movieForm.releaseDate).toISOString(),
      };

      if (editingMovieId) {
        await API.put(`/movies/${editingMovieId}`, payload);
        setMessage({ type: 'success', text: 'Cập nhật thông tin phim thành công!' });
      } else {
        await API.post('/movies', payload);
        setMessage({ type: 'success', text: 'Thêm phim mới thành công!' });
      }

      handleCancelEditMovie();
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi lưu phim!' });
    }
  };

  const handleStartEditMovie = (m: Movie) => {
    setEditingMovieId(m.id);
    setMovieForm({
      title: m.title,
      description: m.description || '',
      duration: m.duration,
      posterUrl: m.posterUrl || '',
      releaseDate: m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
  };

  const handleCancelEditMovie = () => {
    setEditingMovieId(null);
    setMovieForm({
      title: '',
      description: '',
      duration: 120,
      posterUrl: '',
      releaseDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteMovie = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phim này không?')) return;
    try {
      await API.delete(`/movies/${id}`);
      setMessage({ type: 'success', text: 'Xóa phim thành công!' });
      if (editingMovieId === id) handleCancelEditMovie();
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể xóa phim!' });
    }
  };

  // --- Room & Seat Type Handlers ---
  const handleCreateOrUpdateRoom = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      if (editingRoomId) {
        await API.put(`/rooms/${editingRoomId}`, { name: newRoom.name.trim() });
        setMessage({ type: 'success', text: 'Cập nhật tên phòng chiếu thành công!' });
        setEditingRoomId(null);
      } else {
        await API.post('/rooms', {
          name: newRoom.name.trim(),
          rows: Number(newRoom.rows),
          columns: Number(newRoom.columns),
        });
        setMessage({ type: 'success', text: 'Tạo phòng chiếu mới thành công!' });
      }
      setNewRoom({ name: '', rows: 6, columns: 8 });
      fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi lưu phòng chiếu!' });
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phòng chiếu này không? Tất cả suất chiếu liên quan cũng sẽ bị xóa.')) return;
    try {
      await API.delete(`/rooms/${id}`);
      setMessage({ type: 'success', text: 'Xóa phòng chiếu thành công!' });
      fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể xóa phòng chiếu!' });
    }
  };

  const handleUpdateSeatTypes = async (type: 'STANDARD' | 'VIP' | 'COUPLE') => {
    if (!selectedRoomForSeats || selectedSeatIdsToConfig.length === 0) {
      setMessage({ type: 'error', text: 'Vui lòng chọn ít nhất một ghế trên sơ đồ bên dưới!' });
      return;
    }

    try {
      await API.put(`/rooms/${selectedRoomForSeats.id}/seats`, {
        seatIds: selectedSeatIdsToConfig,
        type,
      });
      setMessage({ type: 'success', text: `Đã đổi ${selectedSeatIdsToConfig.length} ghế sang loại ${type}!` });
      setSelectedSeatIdsToConfig([]);
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi đổi loại ghế!' });
    }
  };

  // --- Showtime Handlers ---
  const handleSaveShowtime = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const selectedRoomId = newShowtime.roomId || (rooms.length > 0 ? rooms[0].id : '');
    const selectedMovieId = newShowtime.movieId || (movies.length > 0 ? movies[0].id : '');

    if (!selectedMovieId || !selectedRoomId) {
      setMessage({ type: 'error', text: 'Vui lòng chọn đầy đủ Phim và Phòng chiếu!' });
      return;
    }

    try {
      const payload = {
        movieId: selectedMovieId,
        roomId: selectedRoomId,
        startTime: new Date(newShowtime.startTime).toISOString(),
        endTime: new Date(newShowtime.endTime).toISOString(),
        price: Number(newShowtime.price),
      };

      if (editingShowtimeId) {
        await API.put(`/showtimes/${editingShowtimeId}`, payload);
        setMessage({ type: 'success', text: 'Cập nhật suất chiếu thành công!' });
        setEditingShowtimeId(null);
      } else {
        await API.post('/showtimes', payload);
        setMessage({ type: 'success', text: 'Tạo suất chiếu mới thành công!' });
      }

      onRefreshData();
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi lưu suất chiếu!' });
    }
  };

  const handleStartEditShowtime = (st: Showtime) => {
    setEditingShowtimeId(st.id);
    setNewShowtime({
      movieId: st.movieId,
      roomId: st.roomId,
      startTime: new Date(st.startTime).toISOString().slice(0, 16),
      endTime: new Date(st.endTime).toISOString().slice(0, 16),
      price: Number(st.price),
    });
  };

  const handleDeleteShowtime = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa suất chiếu này?')) return;
    try {
      await API.delete(`/showtimes/${id}`);
      setMessage({ type: 'success', text: 'Xóa suất chiếu thành công!' });
      if (editingShowtimeId === id) setEditingShowtimeId(null);
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể xóa suất chiếu!' });
    }
  };

  // --- Voucher Handlers ---
  const handleCreateVoucher = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const payload = {
        code: voucherForm.code.trim().toUpperCase(),
        discountPercent: voucherForm.discountType === 'percent' ? Number(voucherForm.discountValue) : null,
        discountAmount: voucherForm.discountType === 'amount' ? Number(voucherForm.discountValue) : null,
        minOrderAmount: Number(voucherForm.minOrderAmount),
        maxDiscount: voucherForm.discountType === 'percent' ? Number(voucherForm.maxDiscount) : null,
        expireAt: new Date(voucherForm.expireAt).toISOString(),
        usageLimit: Number(voucherForm.usageLimit),
      };

      await API.post('/vouchers', payload);
      setMessage({ type: 'success', text: `Tạo mã Voucher ${payload.code} thành công!` });
      setVoucherForm({
        code: '',
        discountType: 'percent',
        discountValue: 10,
        minOrderAmount: 0,
        maxDiscount: 50000,
        expireAt: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        usageLimit: 100,
      });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi tạo Voucher!' });
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa mã Voucher này?')) return;
    try {
      await API.delete(`/vouchers/${id}`);
      setMessage({ type: 'success', text: 'Xóa mã Voucher thành công!' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi xóa Voucher!' });
    }
  };

  const handleAdminCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Quyền Admin: Bạn có chắc muốn hủy đơn vé này không? Ghế sẽ được mở lại cho khách khác.')) return;
    try {
      await API.post(`/bookings/${bookingId}/cancel`);
      setMessage({ type: 'success', text: 'Hủy đơn vé thành công!' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi hủy vé!' });
    }
  };

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.bookingSeats?.length || b.seats?.length || 0), 0);

﻿  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '1100px', 
          maxHeight: '94vh', 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          border: '1px solid rgba(255, 23, 68, 0.3)',
          boxShadow: '0 25px 60px rgba(255, 23, 68, 0.15)',
          background: 'linear-gradient(135deg, #12161f 0%, #0d1017 100%)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 23, 68, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#ff1744', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <ShieldCheck size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
                HỆ THỐNG ĐIỀU HÀNH RẠP CINEVERSE (ADMIN PORTAL)
              </h2>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Quản lý toàn diện: Phim, Phòng chiếu & Ghế VIP/Couple, Suất chiếu 24h, Voucher & Doanh thu</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 28px', gap: '8px', background: 'rgba(0, 0, 0, 0.2)', overflowX: 'auto' }}>
          {[
            { id: 'movies', label: 'Quản Lý Phim', icon: Film, count: movies.length },
            { id: 'rooms', label: 'Phòng Chiếu & Ghế VIP', icon: DoorOpen, count: rooms.length },
            { id: 'showtimes', label: 'Suất Chiếu (24h)', icon: CalendarClock, count: showtimes.length },
            { id: 'vouchers', label: 'Voucher & Thanh Toán', icon: Gift, count: vouchers.length },
            { id: 'stats', label: 'Doanh Thu & Đơn Vé', icon: TrendingUp, count: bookings.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setMessage(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #00f2fe' : '2px solid transparent',
                  color: isActive ? '#00f2fe' : '#94a3b8',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                <span style={{ fontSize: '11px', background: isActive ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '10px' }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {message && (
          <div style={{ margin: '14px 28px 0', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', background: message.type === 'success' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)', border: '1px solid ' + (message.type === 'success' ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 23, 68, 0.4)'), color: message.type === 'success' ? '#00e676' : '#ff5252' }}>
            {message.text}
          </div>
        )}

        {/* Tab Contents */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: MOVIES */}
          {activeTab === 'movies' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                  Danh Sách Phim ({movies.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '440px', overflowY: 'auto' }}>
                  {movies.map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', border: editingMovieId === m.id ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={m.posterUrl || DEFAULT_POSTER} alt={m.title} style={{ width: '42px', height: '56px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>{m.title}</h4>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {m.duration} phút • Khởi chiếu: {new Date(m.releaseDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleStartEditMovie(m)} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
                          <Edit3 size={14} /> Sửa
                        </button>
                        <button onClick={() => handleDeleteMovie(m.id)} style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid ' + (editingMovieId ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.08)'), borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: editingMovieId ? '#00f2fe' : '#00e676', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    {editingMovieId ? <><Edit3 size={18} /> Chỉnh Sửa Phim</> : <><Plus size={18} /> Thêm Phim Mới</>}
                  </h3>
                  {editingMovieId && (
                    <button type="button" onClick={handleCancelEditMovie} style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#94a3b8', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <RotateCcw size={12} /> Hủy sửa
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveMovie} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tiêu đề phim *</label>
                    <input type="text" placeholder="VD: Avatar 3" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Thời lượng (phút)</label>
                      <input type="number" min="1" value={movieForm.duration} onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Ngày khởi chiếu</label>
                      <input type="date" value={movieForm.releaseDate} onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Link Poster (URL)</label>
                    <input type="text" placeholder="https://..." value={movieForm.posterUrl} onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Mô tả phim</label>
                    <textarea rows={3} placeholder="Tóm tắt phim..." value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', resize: 'none' }} />
                  </div>
                  <button type="submit" className="glow-btn" style={{ padding: '10px', marginTop: '6px' }}>
                    {editingMovieId ? '💾 Lưu Cập Nhật Phim' : '+ Thêm Phim Mới'}
                  </button>
                </form>
              </div>
            </div>
          )}

﻿          {/* TAB 2: ROOMS & SEAT TYPES */}
          {activeTab === 'rooms' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '28px', marginBottom: '32px' }}>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                    Danh Sách Phòng Chiếu ({rooms.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {rooms.map((r) => {
                      const isSelected = selectedRoomForSeats?.id === r.id;
                      return (
                        <div key={r.id} style={{ background: isSelected ? 'rgba(0, 242, 254, 0.08)' : 'rgba(255, 255, 255, 0.03)', border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div onClick={() => { setSelectedRoomForSeats(r); setSelectedSeatIdsToConfig([]); }} style={{ cursor: 'pointer', flex: 1 }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '700', color: isSelected ? '#00f2fe' : '#fff', margin: 0 }}>{r.name}</h4>
                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {r.rows} hàng x {r.columns} cột ({r.seats?.length || (r.rows * r.columns)} ghế) • Click để chỉnh sửa loại ghế
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => { setEditingRoomId(r.id); setNewRoom({ name: r.name, rows: r.rows, columns: r.columns }); }} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                              <Edit3 size={14} />
                            </button>
                            <button onClick={() => handleDeleteRoom(r.id)} style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#00f2fe', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={18} /> {editingRoomId ? 'Sửa Tên Phòng Chiếu' : 'Tạo Phòng Chiếu Mới'}
                  </h3>
                  <form onSubmit={handleCreateOrUpdateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tên phòng chiếu *</label>
                      <input type="text" placeholder="VD: Phòng IMAX Laser 02" value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                    </div>
                    {!editingRoomId && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Số hàng ghế (A-Z)</label>
                          <input type="number" min="2" max="15" value={newRoom.rows} onChange={(e) => setNewRoom({ ...newRoom, rows: Number(e.target.value) })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Số ghế mỗi hàng</label>
                          <input type="number" min="4" max="20" value={newRoom.columns} onChange={(e) => setNewRoom({ ...newRoom, columns: Number(e.target.value) })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                        </div>
                      </div>
                    )}
                    <button type="submit" className="glow-btn" style={{ padding: '10px', marginTop: '6px' }}>
                      {editingRoomId ? 'Lưu Tên Phòng' : '+ Khởi Tạo Phòng Chiếu'}
                    </button>
                    {editingRoomId && (
                      <button type="button" onClick={() => setEditingRoomId(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>
                        Hủy sửa
                      </button>
                    )}
                  </form>
                </div>
              </div>

              {/* Sơ đồ cấu hình loại ghế trực quan */}
              {selectedRoomForSeats && (
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#00f2fe', margin: 0 }}>
                        Cấu Hình Loại Ghế Cho: {selectedRoomForSeats.name}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                        Click chọn các ghế trên sơ đồ rồi bấm nút gán loại ghế (STANDARD / VIP / COUPLE).
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '700' }}>
                        Đã chọn ({selectedSeatIdsToConfig.length}):
                      </span>
                      <button onClick={() => handleUpdateSeatTypes('STANDARD')} style={{ background: 'rgba(0, 242, 254, 0.15)', border: '1px solid #00f2fe', color: '#00f2fe', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        Đặt là Ghế Thường
                      </button>
                      <button onClick={() => handleUpdateSeatTypes('VIP')} style={{ background: 'rgba(255, 214, 0, 0.15)', border: '1px solid #ffd600', color: '#ffd600', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        Đặt là Ghế VIP
                      </button>
                      <button onClick={() => handleUpdateSeatTypes('COUPLE')} style={{ background: 'rgba(255, 64, 129, 0.15)', border: '1px solid #ff4081', color: '#ff4081', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                        Đặt là Ghế Đôi (Couple)
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', overflowX: 'auto', padding: '14px 0' }}>
                    {Array.from(new Set(selectedRoomForSeats.seats?.map((s) => s.row))).sort().map((row) => {
                      const rowSeats = selectedRoomForSeats.seats?.filter((s) => s.row === row).sort((a, b) => a.column - b.column) || [];
                      return (
                        <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '20px', color: '#64748b', fontWeight: '800', fontSize: '11px' }}>{row}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {rowSeats.map((seat) => {
                              const isSelected = selectedSeatIdsToConfig.includes(seat.id);
                              let bg = 'rgba(0, 242, 254, 0.1)';
                              let border = '1px solid rgba(0, 242, 254, 0.3)';
                              let color = '#00f2fe';

                              if (seat.type === 'VIP') {
                                bg = 'rgba(255, 214, 0, 0.15)';
                                border = '1px solid #ffd600';
                                color = '#ffd600';
                              } else if (seat.type === 'COUPLE') {
                                bg = 'rgba(255, 64, 129, 0.15)';
                                border = '1px solid #ff4081';
                                color = '#ff4081';
                              }

                              if (isSelected) {
                                bg = '#fff';
                                color = '#000';
                                border = '2px solid #00f2fe';
                              }

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedSeatIdsToConfig((prev) =>
                                      prev.includes(seat.id) ? prev.filter((id) => id !== seat.id) : [...prev, seat.id]
                                    );
                                  }}
                                  style={{
                                    width: seat.type === 'COUPLE' ? '64px' : '34px',
                                    height: '34px',
                                    borderRadius: '6px',
                                    background: bg,
                                    border,
                                    color,
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}
                                >
                                  {seat.label}
                                </button>
                              );
                            })}
                          </div>
                          <span style={{ width: '20px', color: '#64748b', fontWeight: '800', fontSize: '11px' }}>{row}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SHOWTIMES (24h FORMAT) */}
          {activeTab === 'showtimes' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                  Suất Chiếu Hiện Có ({showtimes.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '440px', overflowY: 'auto' }}>
                  {showtimes.map((st) => (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', border: editingShowtimeId === st.id ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>
                          {st.movie?.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#00f2fe', margin: '4px 0 0' }}>
                          {st.room?.name} • {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(st.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} ({new Date(st.startTime).toLocaleDateString('vi-VN')}) • {Number(st.price).toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleStartEditShowtime(st)} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDeleteShowtime(st.id)} style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#00f2fe', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={18} /> {editingShowtimeId ? 'Chỉnh Sửa Suất Chiếu' : 'Lên Lịch Suất Chiếu (24h)'}
                </h3>
                <form onSubmit={handleSaveShowtime} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Chọn Phim *</label>
                    <select value={newShowtime.movieId} onChange={(e) => setNewShowtime({ ...newShowtime, movieId: e.target.value })} required style={{ width: '100%', background: '#1c2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}>
                      <option value="">-- Chọn Phim --</option>
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Chọn Phòng Chiếu *</label>
                    <select value={newShowtime.roomId} onChange={(e) => setNewShowtime({ ...newShowtime, roomId: e.target.value })} required style={{ width: '100%', background: '#1c2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}>
                      <option value="">-- Chọn Phòng Chiếu --</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Giờ Bắt Đầu (24h) *</label>
                      <input type="datetime-local" value={newShowtime.startTime} onChange={(e) => {
                        const startVal = e.target.value;
                        const endDate = new Date(new Date(startVal).getTime() + 120 * 60000);
                        const endVal = endDate.toISOString().slice(0, 16);
                        setNewShowtime({ ...newShowtime, startTime: startVal, endTime: endVal });
                      }} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Giờ Kết Thúc (24h) *</label>
                      <input type="datetime-local" value={newShowtime.endTime} onChange={(e) => setNewShowtime({ ...newShowtime, endTime: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Giá vé cơ bản (VNĐ) *</label>
                    <input type="number" step="5000" value={newShowtime.price} onChange={(e) => setNewShowtime({ ...newShowtime, price: Number(e.target.value) })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                  </div>

                  <button type="submit" className="glow-btn" style={{ padding: '10px', marginTop: '6px' }}>
                    {editingShowtimeId ? 'Lưu Suất Chiếu' : '+ Lưu Suất Chiếu Mới'}
                  </button>
                  {editingShowtimeId && (
                    <button type="button" onClick={() => setEditingShowtimeId(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}>
                      Hủy sửa
                    </button>
                  )}
                </form>
              </div>
            </div>
          )}

﻿          {/* TAB 4: VOUCHERS & PAYMENTS */}
          {activeTab === 'vouchers' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                  Mã Voucher Giảm Giá Đang Hoạt Động ({vouchers.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '440px', overflowY: 'auto' }}>
                  {vouchers.map((v) => (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 214, 0, 0.2)', borderRadius: '12px', padding: '12px 16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffd600', background: 'rgba(255, 214, 0, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                            {v.code}
                          </span>
                          <span style={{ fontSize: '12px', color: '#00e676', fontWeight: '700' }}>
                            {v.discountPercent ? `Giảm ${v.discountPercent}%` : `Giảm ${Number(v.discountAmount).toLocaleString('vi-VN')}đ`}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Đơn tối thiểu: {Number(v.minOrderAmount).toLocaleString('vi-VN')}đ • HSD: {new Date(v.expireAt).toLocaleDateString('vi-VN')} • Đã dùng: {v.usedCount}/{v.usageLimit}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteVoucher(v.id)} style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#ffd600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={18} /> Tạo Mã Voucher Mới
                </h3>
                <form onSubmit={handleCreateVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Mã Code (Chữ in hoa) *</label>
                    <input type="text" placeholder="VD: SIEUSALE20" value={voucherForm.code} onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', fontWeight: '700' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Loại giảm giá</label>
                      <select value={voucherForm.discountType} onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value as any })} style={{ width: '100%', background: '#1c2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }}>
                        <option value="percent">Giảm theo % (Phần trăm)</option>
                        <option value="amount">Giảm tiền mặt cố định (VNĐ)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Giá trị giảm *</label>
                      <input type="number" value={voucherForm.discountValue} onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: Number(e.target.value) })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Đơn tối thiểu (VNĐ)</label>
                      <input type="number" step="5000" value={voucherForm.minOrderAmount} onChange={(e) => setVoucherForm({ ...voucherForm, minOrderAmount: Number(e.target.value) })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Số lượt tối đa</label>
                      <input type="number" value={voucherForm.usageLimit} onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: Number(e.target.value) })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Ngày hết hạn</label>
                    <input type="date" value={voucherForm.expireAt} onChange={(e) => setVoucherForm({ ...voucherForm, expireAt: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                  </div>
                  <button type="submit" className="glow-btn" style={{ padding: '10px', marginTop: '6px' }}>
                    + Lưu &amp; Phát Hành Voucher
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: STATS & BOOKINGS */}
          {activeTab === 'stats' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.3)', borderRadius: '16px', padding: '18px 22px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tổng Doanh Thu</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: '#00e676' }}>
                    {totalRevenue.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '16px', padding: '18px 22px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tổng Vé Đã Bán</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: '#00f2fe' }}>
                    {totalTicketsSold} vé
                  </span>
                </div>
                <div style={{ background: 'rgba(255, 214, 0, 0.08)', border: '1px solid rgba(255, 214, 0, 0.3)', borderRadius: '16px', padding: '18px 22px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tổng Đơn Xác Nhận</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: '#ffd600' }}>
                    {confirmedBookings.length} đơn
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
                Danh Sách Đơn Đặt Vé Khách Hàng
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bookings.map((b) => (
                  <div key={b.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#00f2fe' }}>#{b.id.slice(0, 8).toUpperCase()}</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{b.user?.name} ({b.user?.email})</span>
                        <span style={{ fontSize: '10px', background: b.status === 'CONFIRMED' ? 'rgba(0,230,118,0.2)' : 'rgba(255,23,68,0.2)', color: b.status === 'CONFIRMED' ? '#00e676' : '#ff5252', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          {b.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : 'ĐÃ HỦY'}
                        </span>
                        {b.paymentMethod && (
                          <span style={{ fontSize: '10px', background: 'rgba(255,255,255,0.08)', color: '#cbd5e1', padding: '1px 6px', borderRadius: '4px' }}>
                            {b.paymentMethod}
                          </span>
                        )}
                        {b.voucherCode && (
                          <span style={{ fontSize: '10px', background: 'rgba(255,214,0,0.15)', color: '#ffd600', padding: '1px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            Voucher: {b.voucherCode}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                        {b.showtime?.movie?.title} • {b.showtime?.room?.name} • Ghế: {b.bookingSeats?.map((s: any) => s.seat?.label || s.seatId).join(', ') || 'Ghế'}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: b.status === 'CONFIRMED' ? '#00e676' : '#94a3b8', display: 'block' }}>
                          {Number(b.totalPrice).toLocaleString('vi-VN')}đ
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {new Date(b.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} ({new Date(b.createdAt).toLocaleDateString('vi-VN')})
                        </span>
                      </div>
                      {b.status === 'CONFIRMED' && (
                        <button onClick={() => handleAdminCancelBooking(b.id)} style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}>
                          Hủy Vé
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
