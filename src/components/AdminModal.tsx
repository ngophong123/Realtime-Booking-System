import { useState, useEffect, type FormEvent } from 'react';
import {
  X, Film, Tv, Calendar, Trash2, Edit, DollarSign,
  Gift, QrCode, CheckCircle2, UserCheck, Mail, Send
} from 'lucide-react';
import type { Movie, Room, Showtime, Voucher, Booking, User, EmailSetting } from '../types';
import API from '../services/api';

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
  rooms,
  showtimes,
  onRefreshData,
}: AdminModalProps) => {
  const [activeTab, setActiveTab] = useState<'movies' | 'rooms' | 'showtimes' | 'vouchers' | 'payments' | 'emails' | 'stats'>('movies');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Users for gifting vouchers
  const [users, setUsers] = useState<User[]>([]);

  // Movie Form State (Default COMING_SOON)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    duration: 120,
    releaseDate: new Date().toISOString().split('T')[0],
    posterUrl: '',
    status: 'COMING_SOON',
  });

  // Room Form State
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    rows: 6,
    columns: 8,
    type: 'STANDARD',
  });

  // Seat Type Editor State (Interactive Live Preview)
  const [selectedRoomForSeats, setSelectedRoomForSeats] = useState<Room | null>(null);
  const [localSeats, setLocalSeats] = useState<{ id: string; row: string; column: number; label: string; type: string }[]>([]);
  const [brushSeatType, setBrushSeatType] = useState<'STANDARD' | 'VIP' | 'COUPLE'>('VIP');

  // Showtime Form State
  const [editingShowtime, setEditingShowtime] = useState<Showtime | null>(null);
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    roomId: '',
    startTime: '',
    endTime: '',
    price: 80000,
  });

  // Voucher State & Gift State
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'amount',
    discountValue: 10,
    minOrderAmount: 0,
    expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: 100,
  });
  const [giftUserId, setGiftUserId] = useState('');
  const [giftDiscountAmount, setGiftDiscountAmount] = useState(50000);

  // Payment Settings Form State
  const [paymentForm, setPaymentForm] = useState({
    momoQrUrl: '',
    vietQrUrl: '',
    zaloPayQrUrl: '',
    bankAccountName: '',
    bankAccountNumber: '',
    bankName: '',
  });

  // Email Settings Form State
  const [emailForm, setEmailForm] = useState<Partial<EmailSetting>>({
    smtpEmail: '',
    smtpPassword: '',
    senderName: 'CINEVERSE Cinema',
    adminEmail: '',
  });
  const [testEmailLoading, setTestEmailLoading] = useState(false);

  // Bookings & Stats
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const fetchAdminData = async () => {
    try {
      const [vouchersRes, bookingsRes, usersRes, paymentRes, emailRes] = await Promise.all([
        API.get('/vouchers'),
        API.get('/bookings'),
        API.get('/auth/users'),
        API.get('/payments/settings'),
        API.get('/settings/email'),
      ]);
      setVouchers(vouchersRes.data.vouchers || []);
      setBookings(bookingsRes.data.bookings || []);
      setUsers(usersRes.data.users || []);
      if (paymentRes.data.settings) {
        setPaymentForm({
          momoQrUrl: paymentRes.data.settings.momoQrUrl || '',
          vietQrUrl: paymentRes.data.settings.vietQrUrl || '',
          zaloPayQrUrl: paymentRes.data.settings.zaloPayQrUrl || '',
          bankAccountName: paymentRes.data.settings.bankAccountName || '',
          bankAccountNumber: paymentRes.data.settings.bankAccountNumber || '',
          bankName: paymentRes.data.settings.bankName || '',
        });
      }
      if (emailRes.data.setting) {
        setEmailForm({
          smtpEmail: emailRes.data.setting.smtpEmail || '',
          smtpPassword: emailRes.data.setting.smtpPassword || '',
          senderName: emailRes.data.setting.senderName || 'CINEVERSE Cinema',
          adminEmail: emailRes.data.setting.adminEmail || '',
        });
      }
    } catch (err: any) {
      console.error('Lỗi nạp dữ liệu admin:', err);
    }
  };

﻿  // 1. Movie Handlers
  const handleCreateOrUpdateMovie = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingMovie) {
        await API.put(`/movies/${editingMovie.id}`, movieForm);
        setMessage({ type: 'success', text: 'Cập nhật thông tin phim thành công!' });
      } else {
        await API.post('/movies', movieForm);
        setMessage({ type: 'success', text: 'Thêm phim mới thành công!' });
      }
      setEditingMovie(null);
      setMovieForm({
        title: '',
        description: '',
        duration: 120,
        releaseDate: new Date().toISOString().split('T')[0],
        posterUrl: '',
        status: 'COMING_SOON',
      });
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra với phim!' });
    }
  };

  const handleDeleteMovie = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bộ phim này?')) return;
    try {
      await API.delete(`/movies/${id}`);
      setMessage({ type: 'success', text: 'Xóa phim thành công!' });
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể xóa phim!' });
    }
  };

  // 2. Room Handlers
  const handleCreateOrUpdateRoom = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await API.put(`/rooms/${editingRoom.id}`, { name: roomForm.name, type: roomForm.type });
        setMessage({ type: 'success', text: 'Cập nhật phòng chiếu thành công!' });
      } else {
        await API.post('/rooms', roomForm);
        setMessage({ type: 'success', text: `Tạo phòng ${roomForm.type} thành công!` });
      }
      setEditingRoom(null);
      setRoomForm({ name: '', rows: 6, columns: 8, type: 'STANDARD' });
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra với phòng chiếu!' });
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) return;
    try {
      await API.delete(`/rooms/${id}`);
      setMessage({ type: 'success', text: 'Xóa phòng chiếu thành công!' });
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể xóa phòng!' });
    }
  };

  // 3. Live Seat Painting
  const handleSelectRoomForSeats = (room: Room) => {
    setSelectedRoomForSeats(room);
    if (room.seats) {
      setLocalSeats(room.seats.map((s) => ({ ...s })));
    }
  };

  const handleSeatClick = (seatId: string) => {
    setLocalSeats((prev) =>
      prev.map((s) => (s.id === seatId ? { ...s, type: brushSeatType } : s))
    );
  };

  const handleSaveSeatTypes = async () => {
    if (!selectedRoomForSeats) return;
    try {
      const vips = localSeats.filter((s) => s.type === 'VIP').map((s) => s.id);
      const couples = localSeats.filter((s) => s.type === 'COUPLE').map((s) => s.id);
      const standards = localSeats.filter((s) => s.type === 'STANDARD').map((s) => s.id);

      if (vips.length > 0) await API.put(`/rooms/${selectedRoomForSeats.id}/seats`, { seatIds: vips, type: 'VIP' });
      if (couples.length > 0) await API.put(`/rooms/${selectedRoomForSeats.id}/seats`, { seatIds: couples, type: 'COUPLE' });
      if (standards.length > 0) await API.put(`/rooms/${selectedRoomForSeats.id}/seats`, { seatIds: standards, type: 'STANDARD' });

      setMessage({ type: 'success', text: 'Đã lưu cấu hình sơ đồ ghế thành công!' });
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Không thể lưu cấu hình ghế!' });
    }
  };

  // 4. Showtime Handlers
  const handleCreateOrUpdateShowtime = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingShowtime) {
        await API.put(`/showtimes/${editingShowtime.id}`, showtimeForm);
        setMessage({ type: 'success', text: 'Cập nhật suất chiếu thành công!' });
      } else {
        await API.post('/showtimes', showtimeForm);
        setMessage({ type: 'success', text: 'Thêm suất chiếu thành công! Phim đã tự động chuyển sang Đang Chiếu.' });
      }
      setEditingShowtime(null);
      setShowtimeForm({ movieId: '', roomId: '', startTime: '', endTime: '', price: 80000 });
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra với suất chiếu!' });
    }
  };

  const handleDeleteShowtime = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa suất chiếu này?')) return;
    try {
      await API.delete(`/showtimes/${id}`);
      setMessage({ type: 'success', text: 'Xóa suất chiếu thành công!' });
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể xóa suất chiếu!' });
    }
  };

  // 5. Voucher & Gift Handlers
  const handleCreateVoucher = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        code: voucherForm.code.toUpperCase(),
        minOrderAmount: voucherForm.minOrderAmount,
        expireAt: voucherForm.expireAt,
        usageLimit: voucherForm.usageLimit,
      };
      if (voucherForm.discountType === 'percent') {
        payload.discountPercent = voucherForm.discountValue;
      } else {
        payload.discountAmount = voucherForm.discountValue;
      }
      await API.post('/vouchers', payload);
      setMessage({ type: 'success', text: 'Phát hành Voucher thành công!' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể tạo voucher!' });
    }
  };

  const handleGiftVoucher = async (e: FormEvent) => {
    e.preventDefault();
    if (!giftUserId) {
      alert('Vui lòng chọn khách hàng muốn tặng Voucher!');
      return;
    }
    try {
      await API.post('/vouchers/gift', {
        targetUserId: giftUserId,
        voucherData: {
          discountAmount: giftDiscountAmount,
          expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }
      });
      setMessage({ type: 'success', text: 'Đã gửi tặng Voucher vào ví và gửi email thông báo cho khách thành công!' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể tặng voucher!' });
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa hoặc thu hồi Voucher này?')) return;
    try {
      await API.delete(`/vouchers/${id}`);
      setMessage({ type: 'success', text: 'Thu hồi / Xóa Voucher thành công!' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể xóa voucher!' });
    }
  };

  // 6. Payment Settings Handlers
  const handleSavePaymentSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await API.put('/payments/settings', paymentForm);
      setMessage({ type: 'success', text: 'Đã lưu cấu hình mã QR thanh toán thành công!' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể lưu cài đặt thanh toán!' });
    }
  };

  // 7. Email Settings & Test Handlers
  const handleSaveEmailSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await API.put('/settings/email', emailForm);
      setMessage({ type: 'success', text: 'Đã lưu cấu hình Email Google thành công!' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể lưu cấu hình email!' });
    }
  };

  const handleSendTestEmail = async () => {
    setTestEmailLoading(true);
    try {
      const res = await API.post('/settings/test-email', { targetEmail: emailForm.adminEmail || emailForm.smtpEmail });
      setMessage({ type: 'success', text: res.data.message || 'Đã gửi email kiểm tra thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể gửi email kiểm tra!' });
    } finally {
      setTestEmailLoading(false);
    }
  };

  // 8. Approve Booking Handler
  const handleApproveBooking = async (bookingId: string) => {
    try {
      await API.post(`/bookings/${bookingId}/approve`);
      setMessage({ type: 'success', text: 'Duyệt vé thành công! Đã gửi email vé xem phim ảo cho khách hàng.' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể duyệt đơn vé!' });
    }
  };

  const handleAdminCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Admin có chắc chắn muốn hủy đơn vé này không?')) return;
    try {
      await API.post(`/bookings/${bookingId}/cancel`);
      setMessage({ type: 'success', text: 'Hủy vé thành công và ghế đã được mở lại!' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể hủy vé!' });
    }
  };

  if (!isOpen) return null;

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);
  const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.bookingSeats?.length || 0), 0);

﻿  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 80, padding: '20px' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '1050px', maxHeight: '92vh', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #121824 0%, #080b10 100%)', border: '1px solid rgba(0, 242, 254, 0.35)', boxShadow: '0 25px 60px rgba(0, 242, 254, 0.2)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0, 242, 254, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#ff1744', padding: '6px', borderRadius: '8px' }}>
              <Film size={20} color="#fff" />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
              CINEVERSE ADMIN MANAGEMENT PORTAL
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 28px', gap: '8px', background: 'rgba(0, 0, 0, 0.2)', overflowX: 'auto' }}>
          {[
            { id: 'movies', label: 'Quản Lý Phim', icon: Film, count: movies.length },
            { id: 'rooms', label: 'Phòng Chiếu & Ghế', icon: Tv, count: rooms.length },
            { id: 'showtimes', label: 'Suất Chiếu (24h)', icon: Calendar, count: showtimes.length },
            { id: 'vouchers', label: 'Vouchers & Tặng Quà', icon: Gift, count: vouchers.length },
            { id: 'payments', label: 'Cấu Hình Mã QR', icon: QrCode },
            { id: 'emails', label: 'Cấu Hình Email (Gmail)', icon: Mail },
            { id: 'stats', label: 'Đơn Vé & Duyệt Vé', icon: DollarSign, count: bookings.length },
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
                  gap: '6px',
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
                {tab.count !== undefined && (
                  <span style={{ fontSize: '11px', background: isActive ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '10px' }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {message && (
          <div style={{ margin: '14px 28px 0', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', background: message.type === 'success' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)', border: '1px solid ' + (message.type === 'success' ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 23, 68, 0.4)'), color: message.type === 'success' ? '#00e676' : '#ff5252' }}>
            {message.text}
          </div>
        )}

        <div style={{ padding: '20px 28px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: MOVIES */}
          {activeTab === 'movies' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
                  Danh Sách Phim Hiện Có ({movies.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto' }}>
                  {movies.map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'} alt={m.title} style={{ width: '40px', height: '56px', objectFit: 'cover', borderRadius: '6px' }} />
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 2px' }}>{m.title}</h4>
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {m.duration} phút • {new Date(m.releaseDate).toLocaleDateString('vi-VN')}
                          </span>
                          <div style={{ marginTop: '2px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: m.status === 'NOW_SHOWING' ? '#00e676' : '#ffd600', background: m.status === 'NOW_SHOWING' ? 'rgba(0,230,118,0.15)' : 'rgba(255,214,0,0.15)', padding: '1px 6px', borderRadius: '4px' }}>
                              {m.status === 'NOW_SHOWING' ? '🔥 ĐANG CHIẾU' : '⏳ SẮP CHIẾU'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => { setEditingMovie(m); setMovieForm({ title: m.title, description: m.description || '', duration: m.duration, releaseDate: new Date(m.releaseDate).toISOString().split('T')[0], posterUrl: m.posterUrl || '', status: m.status || 'COMING_SOON' }); }} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                          <Edit size={14} />
                        </button>
                        <button onClick={() => handleDeleteMovie(m.id)} style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#00f2fe', marginBottom: '16px' }}>
                  {editingMovie ? 'Chỉnh Sửa Phim' : 'Thêm Phim Mới'}
                </h3>
                <form onSubmit={handleCreateOrUpdateMovie} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tên Phim *</label>
                    <input type="text" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Trạng Thái Chiếu</label>
                      <select value={movieForm.status} onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })} style={{ width: '100%', background: '#1a2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }}>
                        <option value="COMING_SOON">⏳ Sắp Chiếu (Mặc Định)</option>
                        <option value="NOW_SHOWING">🔥 Đang Chiếu (Now Showing)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Thời lượng (Phút) *</label>
                      <input type="number" value={movieForm.duration} onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Ngày Khởi Chiếu</label>
                    <input type="date" value={movieForm.releaseDate} onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>URL Poster Ảnh</label>
                    <input type="text" placeholder="https://..." value={movieForm.posterUrl} onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Mô Tả Phim</label>
                    <textarea rows={2} value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button type="submit" className="glow-btn" style={{ flex: 1, padding: '10px' }}>
                      {editingMovie ? 'Cập Nhật Phim' : '+ Thêm Phim'}
                    </button>
                    {editingMovie && (
                      <button type="button" onClick={() => { setEditingMovie(null); setMovieForm({ title: '', description: '', duration: 120, releaseDate: new Date().toISOString().split('T')[0], posterUrl: '', status: 'COMING_SOON' }); }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                        Hủy
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: ROOMS & SEATS */}
          {activeTab === 'rooms' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '28px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
                  Danh Sách Phòng Chiếu ({rooms.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
                  {rooms.map((r) => (
                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: selectedRoomForSeats?.id === r.id ? 'rgba(0, 242, 254, 0.12)' : 'rgba(255, 255, 255, 0.03)', border: selectedRoomForSeats?.id === r.id ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '10px 14px' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 2px' }}>
                          {r.name} <span style={{ fontSize: '10px', background: 'rgba(0, 242, 254, 0.2)', color: '#00f2fe', padding: '1px 6px', borderRadius: '4px' }}>{r.type || 'STANDARD'}</span>
                        </h4>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {r.rows} hàng × {r.columns} cột ({r.seats?.length || r.rows * r.columns} ghế)
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => handleSelectRoomForSeats(r)} style={{ background: 'rgba(255, 214, 0, 0.15)', border: '1px solid #ffd600', color: '#ffd600', padding: '5px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>
                          Sửa Ghế
                        </button>
                        <button onClick={() => handleDeleteRoom(r.id)} style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '5px 8px', borderRadius: '6px', cursor: 'pointer' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '18px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#00f2fe', marginBottom: '12px' }}>
                    + Thêm Phòng Chiếu Mới
                  </h4>
                  <form onSubmit={handleCreateOrUpdateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                      <input type="text" placeholder="Tên phòng (VD: Screen 1)" value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} required style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                      <select value={roomForm.type} onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })} style={{ background: '#1c2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }}>
                        <option value="STANDARD">Phòng Thường</option>
                        <option value="IMAX">Phòng IMAX</option>
                        <option value="VIP">Phòng VIP (100% VIP)</option>
                        <option value="COUPLE">Phòng COUPLE (100% Đôi)</option>
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="number" placeholder="Số hàng (A-Z)" min={1} max={26} value={roomForm.rows} onChange={(e) => setRoomForm({ ...roomForm, rows: Number(e.target.value) })} required style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                      <input type="number" placeholder="Số cột" min={1} max={30} value={roomForm.columns} onChange={(e) => setRoomForm({ ...roomForm, columns: Number(e.target.value) })} required style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                    <button type="submit" className="glow-btn" style={{ padding: '8px', fontSize: '12px' }}>
                      Tạo Phòng Chiếu
                    </button>
                  </form>
                </div>
              </div>

              {/* LIVE SEAT EDITOR */}
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#ffd600', marginBottom: '8px' }}>
                  🎨 Chỉnh Sửa Sơ Đồ Ghế (Đổi Màu Trực Tiếp)
                </h3>
                {selectedRoomForSeats ? (
                  <div>
                    <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 12px' }}>
                      Đang chỉnh phòng: <b style={{ color: '#fff' }}>{selectedRoomForSeats.name}</b>. Nhấp vào ghế để đổi sang màu loại đã chọn:
                    </p>

                    {/* Paint Brush Selector */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      {[
                        { type: 'STANDARD', label: 'Ghế Thường', color: '#00f2fe', bg: 'rgba(0, 242, 254, 0.1)' },
                        { type: 'VIP', label: 'Ghế VIP (+20k)', color: '#ffd600', bg: 'rgba(255, 214, 0, 0.1)' },
                        { type: 'COUPLE', label: 'Ghế Couple (+40k)', color: '#f43f5e', bg: 'rgba(244, 63, 94, 0.1)' },
                      ].map((b) => (
                        <button
                          key={b.type}
                          type="button"
                          onClick={() => setBrushSeatType(b.type as any)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: brushSeatType === b.type ? `2px solid ${b.color}` : '1px solid rgba(255,255,255,0.1)',
                            background: brushSeatType === b.type ? b.bg : 'transparent',
                            color: b.color,
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          ● {b.label}
                        </button>
                      ))}
                    </div>

                    {/* Live Seat Grid */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', overflowX: 'auto' }}>
                      {Array.from(new Set(localSeats.map((s) => s.row))).map((row) => (
                        <div key={row} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', width: '16px', textAlign: 'center', fontWeight: '800' }}>{row}</span>
                          {localSeats.filter((s) => s.row === row).map((seat) => {
                            const isVip = seat.type === 'VIP';
                            const isCouple = seat.type === 'COUPLE';
                            const bg = isCouple ? 'linear-gradient(135deg, #f43f5e, #be123c)' : isVip ? 'linear-gradient(135deg, #ffd600, #ff9100)' : 'linear-gradient(135deg, #1e293b, #0f172a)';
                            const color = isVip || isCouple ? '#000' : '#00f2fe';
                            return (
                              <button
                                key={seat.id}
                                type="button"
                                onClick={() => handleSeatClick(seat.id)}
                                title={`${seat.label} (${seat.type}) - Nhấn để đổi loại`}
                                style={{
                                  width: isCouple ? '52px' : '26px',
                                  height: '24px',
                                  borderRadius: '4px',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  background: bg,
                                  color: color,
                                  fontSize: '10px',
                                  fontWeight: '800',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {seat.label}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>

                    <button onClick={handleSaveSeatTypes} className="glow-btn" style={{ width: '100%', padding: '10px', marginTop: '16px', fontSize: '13px' }}>
                      ✓ Lưu Thay Đổi Sơ Đồ Ghế
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8', fontSize: '13px' }}>
                    Vui lòng chọn một phòng chiếu bên trái và bấm <b>"Sửa Ghế"</b> để cấu hình sơ đồ ghế trực tiếp.
                  </div>
                )}
              </div>
            </div>
          )}

﻿          {/* TAB 3: SHOWTIMES (24h) */}
          {activeTab === 'showtimes' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
                  Danh Sách Suất Chiếu ({showtimes.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto' }}>
                  {showtimes.map((st) => (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '12px 16px' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>{st.movie?.title}</h4>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
                          <span style={{ color: '#00f2fe', fontWeight: '800' }}>
                            {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(st.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                          <span>• {st.room?.name}</span>
                          <span style={{ color: '#00e676', fontWeight: '700' }}>• {Number(st.price).toLocaleString('vi-VN')}đ</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => { setEditingShowtime(st); setShowtimeForm({ movieId: st.movieId, roomId: st.roomId, startTime: st.startTime.slice(0, 16), endTime: st.endTime.slice(0, 16), price: Number(st.price) }); }} style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                          <Edit size={14} />
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
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#00f2fe', marginBottom: '16px' }}>
                  {editingShowtime ? 'Sửa Suất Chiếu' : 'Tạo Suất Chiếu Mới'}
                </h3>
                <form onSubmit={handleCreateOrUpdateShowtime} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Chọn Phim * (Tự chuyển sang Đang Chiếu)</label>
                    <select value={showtimeForm.movieId} onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })} required style={{ width: '100%', background: '#1c2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '13px' }}>
                      <option value="">-- Chọn Phim --</option>
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>{m.title} ({m.duration}p)</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Chọn Phòng Chiếu *</label>
                    <select value={showtimeForm.roomId} onChange={(e) => setShowtimeForm({ ...showtimeForm, roomId: e.target.value })} required style={{ width: '100%', background: '#1c2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '13px' }}>
                      <option value="">-- Chọn Phòng Chiếu --</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>{r.name} ({r.type || 'STANDARD'})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Bắt đầu (Khung 24h) *</label>
                      <input type="datetime-local" value={showtimeForm.startTime} onChange={(e) => setShowtimeForm({ ...showtimeForm, startTime: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Kết thúc (Khung 24h) *</label>
                      <input type="datetime-local" value={showtimeForm.endTime} onChange={(e) => setShowtimeForm({ ...showtimeForm, endTime: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Giá vé cơ bản (VNĐ) *</label>
                    <input type="number" step="5000" value={showtimeForm.price} onChange={(e) => setShowtimeForm({ ...showtimeForm, price: Number(e.target.value) })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <button type="submit" className="glow-btn" style={{ flex: 1, padding: '10px' }}>
                      {editingShowtime ? 'Lưu Suất Chiếu' : '+ Tạo Suất Chiếu'}
                    </button>
                    {editingShowtime && (
                      <button type="button" onClick={() => { setEditingShowtime(null); setShowtimeForm({ movieId: '', roomId: '', startTime: '', endTime: '', price: 80000 }); }} style={{ background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }}>
                        Hủy
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: VOUCHERS & GIFTING */}
          {activeTab === 'vouchers' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
                  Danh Sách Mã Voucher ({vouchers.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '450px', overflowY: 'auto' }}>
                  {vouchers.map((v) => (
                    <div key={v.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', border: v.userId ? '1px solid #ffd600' : '1px solid rgba(255, 214, 0, 0.2)', borderRadius: '12px', padding: '12px 16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffd600', background: 'rgba(255, 214, 0, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
                            {v.code}
                          </span>
                          <span style={{ fontSize: '12px', color: '#00e676', fontWeight: '700' }}>
                            {v.discountPercent ? `Giảm ${v.discountPercent}%` : `Giảm ${Number(v.discountAmount).toLocaleString('vi-VN')}đ`}
                          </span>
                          {v.user && (
                            <span style={{ fontSize: '10px', background: '#ffd600', color: '#000', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>
                              🎁 TẶNG: {v.user.name}
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          Đơn tối thiểu: {Number(v.minOrderAmount).toLocaleString('vi-VN')}đ • HSD: {new Date(v.expireAt).toLocaleDateString('vi-VN')} • Đã dùng: {v.usedCount}/{v.usageLimit}
                        </span>
                      </div>
                      <button onClick={() => handleDeleteVoucher(v.id)} title="Thu hồi / Xóa voucher" style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Gift Voucher to User */}
                <div style={{ background: 'rgba(255, 214, 0, 0.05)', border: '1px solid rgba(255, 214, 0, 0.3)', borderRadius: '16px', padding: '18px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#ffd600', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={16} /> 🎁 Tặng Voucher &amp; Gửi Email Cho Khách
                  </h4>
                  <form onSubmit={handleGiftVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <select value={giftUserId} onChange={(e) => setGiftUserId(e.target.value)} required style={{ width: '100%', background: '#1c2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }}>
                      <option value="">-- Chọn Khách Hàng Nhận Quà --</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="number" step="10000" placeholder="Số tiền giảm (VNĐ)" value={giftDiscountAmount} onChange={(e) => setGiftDiscountAmount(Number(e.target.value))} required style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                      <button type="submit" style={{ background: 'linear-gradient(135deg, #ffd600, #ff9100)', border: 'none', color: '#000', fontWeight: '800', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>
                        Gửi Tặng Ngay
                      </button>
                    </div>
                  </form>
                </div>

                {/* Create General Voucher */}
                <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '18px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#00f2fe', marginBottom: '12px' }}>
                    + Phát Hành Mã Voucher Chung
                  </h4>
                  <form onSubmit={handleCreateVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input type="text" placeholder="MÃ VOUCHER (VD: SUMMER2026)" value={voucherForm.code} onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })} required style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px', fontWeight: '700' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select value={voucherForm.discountType} onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value as any })} style={{ background: '#1c2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }}>
                        <option value="percent">Giảm theo %</option>
                        <option value="amount">Giảm tiền mặt (VNĐ)</option>
                      </select>
                      <input type="number" placeholder="Giá trị" value={voucherForm.discountValue} onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: Number(e.target.value) })} required style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <input type="date" value={voucherForm.expireAt} onChange={(e) => setVoucherForm({ ...voucherForm, expireAt: e.target.value })} required style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                      <input type="number" placeholder="Số lượt dùng" value={voucherForm.usageLimit} onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: Number(e.target.value) })} required style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                    </div>
                    <button type="submit" className="glow-btn" style={{ padding: '8px', fontSize: '12px' }}>
                      Lưu &amp; Phát Hành
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PAYMENT SETTINGS & QR CONFIG */}
          {activeTab === 'payments' && (
            <div style={{ maxWidth: '680px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#00f2fe', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode size={18} /> Cấu Hình Mã QR &amp; Tài Khoản Thanh Toán
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '20px' }}>
                Mã QR và thông tin tài khoản bạn cấu hình ở đây sẽ tự động hiển thị trên màn hình chọn thanh toán của khách hàng.
              </p>
              <form onSubmit={handleSavePaymentSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#f43f5e', fontWeight: '700', display: 'block', marginBottom: '4px' }}>URL Mã QR Ví MoMo</label>
                  <input type="text" placeholder="https://..." value={paymentForm.momoQrUrl} onChange={(e) => setPaymentForm({ ...paymentForm, momoQrUrl: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#00f2fe', fontWeight: '700', display: 'block', marginBottom: '4px' }}>URL Mã VietQR Ngân Hàng</label>
                  <input type="text" placeholder="https://..." value={paymentForm.vietQrUrl} onChange={(e) => setPaymentForm({ ...paymentForm, vietQrUrl: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#0ea5e9', fontWeight: '700', display: 'block', marginBottom: '4px' }}>URL Mã QR Ví ZaloPay</label>
                  <input type="text" placeholder="https://..." value={paymentForm.zaloPayQrUrl} onChange={(e) => setPaymentForm({ ...paymentForm, zaloPayQrUrl: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tên Chủ Tài Khoản</label>
                    <input type="text" placeholder="VD: RAP PHIM CINEVERSE" value={paymentForm.bankAccountName} onChange={(e) => setPaymentForm({ ...paymentForm, bankAccountName: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Số Tài Khoản &amp; Ngân Hàng</label>
                    <input type="text" placeholder="VD: 190388888 - Techcombank" value={paymentForm.bankAccountNumber} onChange={(e) => setPaymentForm({ ...paymentForm, bankAccountNumber: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                  </div>
                </div>
                <button type="submit" className="glow-btn" style={{ padding: '12px', marginTop: '10px' }}>
                  Lưu Cấu Hình Thanh Toán &amp; Mã QR
                </button>
              </form>
            </div>
          )}

          {/* TAB 6: EMAIL SETTINGS (GMAIL SMTP) */}
          {activeTab === 'emails' && (
            <div style={{ maxWidth: '680px', margin: '0 auto', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#00f2fe', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={18} /> Cấu Hình Email Google (Gmail SMTP) Thật 100%
              </h3>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '18px' }}>
                Nhập địa chỉ Gmail và Mật khẩu ứng dụng Google (App Password 16 ký tự) để hệ thống gửi email xác nhận vé và thông báo thực tế tới hộp thư Gmail của khách hàng &amp; Admin.
              </p>

              <form onSubmit={handleSaveEmailSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Địa Chỉ Gmail Gửi Thư (GMAIL_USER)</label>
                  <input type="email" placeholder="example@gmail.com" value={emailForm.smtpEmail || ''} onChange={(e) => setEmailForm({ ...emailForm, smtpEmail: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Mật Khẩu Ứng Dụng Google (16 Ký Tự App Password)</label>
                  <input type="password" placeholder="abcd efgh ijkl mnop" value={emailForm.smtpPassword || ''} onChange={(e) => setEmailForm({ ...emailForm, smtpPassword: e.target.value })} required style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px' }} />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                    * Tạo tại: Google Account → Bảo mật → Xác minh 2 bước → Mật khẩu ứng dụng.
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tên Người Gửi Hiển Thị</label>
                    <input type="text" placeholder="CINEVERSE Cinema" value={emailForm.senderName || ''} onChange={(e) => setEmailForm({ ...emailForm, senderName: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Email Nhận Thông Báo Đơn Của Admin</label>
                    <input type="email" placeholder="admin@gmail.com" value={emailForm.adminEmail || ''} onChange={(e) => setEmailForm({ ...emailForm, adminEmail: e.target.value })} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" className="glow-btn" style={{ flex: 1, padding: '12px' }}>
                    Lưu Cấu Hình Email Google
                  </button>
                  <button type="button" onClick={handleSendTestEmail} disabled={testEmailLoading} style={{ background: 'rgba(0, 230, 118, 0.15)', border: '1px solid #00e676', color: '#00e676', fontWeight: '700', padding: '12px 18px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                    <Send size={15} /> {testEmailLoading ? 'Đang gửi...' : 'Gửi Thử Email'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 7: STATS & APPROVE BOOKINGS */}
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
                Danh Sách Đơn Đặt Vé Khách Hàng ({bookings.length})
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bookings.map((b) => (
                  <div key={b.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#00f2fe' }}>#{b.id.slice(0, 8).toUpperCase()}</span>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{b.user?.name} ({b.user?.email})</span>
                        <span style={{ fontSize: '10px', background: b.status === 'CONFIRMED' ? 'rgba(0,230,118,0.2)' : b.status === 'PENDING' ? 'rgba(255,214,0,0.2)' : 'rgba(255,23,68,0.2)', color: b.status === 'CONFIRMED' ? '#00e676' : b.status === 'PENDING' ? '#ffd600' : '#ff5252', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                          {b.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : b.status === 'PENDING' ? 'CHỜ DUYỆT' : 'ĐÃ HỦY'}
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
                    <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: b.status === 'CONFIRMED' ? '#00e676' : '#ffd600', display: 'block' }}>
                          {Number(b.totalPrice).toLocaleString('vi-VN')}đ
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {new Date(b.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      </div>
                      {b.status !== 'CONFIRMED' && b.status !== 'CANCELLED' && (
                        <button onClick={() => handleApproveBooking(b.id)} style={{ background: 'rgba(0, 230, 118, 0.15)', border: '1px solid #00e676', color: '#00e676', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={13} /> Duyệt Vé &amp; Gửi Email
                        </button>
                      )}
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
