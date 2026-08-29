import { useState, useEffect, type FormEvent } from 'react';
import {
  X, Film, Tv, Calendar, Trash2, Edit, DollarSign,
  Gift, QrCode, CheckCircle2, UserCheck, Mail, Send, AlertCircle
} from 'lucide-react';
import type { Movie, Room, Showtime, Voucher, Booking, User, EmailSetting } from '../types';
import API from '../services/api';
import { RippleButton } from './common/RippleButton';

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

  // 1. Movie Handlers
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
        setMessage({ type: 'success', text: 'Thêm suất chiếu thành công! Phim đã chuyển sang Đang Chiếu.' });
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
      setMessage({ type: 'success', text: 'Duyệt vé thành công! Đã gửi email vé điện tử cho khách hàng.' });
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

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
        padding: '20px',
      }}
    >
      <div
        className="cine-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: '88vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-modal)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: '240px 1fr',
          position: 'relative',
          boxShadow: 'var(--shadow-dropdown)',
        }}
      >
        {/* FIXED VERTICAL SIDEBAR (LEFT) */}
        <div
          style={{
            backgroundColor: 'var(--bg-soft)',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px 0',
          }}
        >
          <div>
            {/* Brand */}
            <div style={{ padding: '0 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px var(--primary-glow)',
                }}
              >
                <Film size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                  ADMIN PORTAL
                </h3>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Cineverse System
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '14px 10px' }}>
              {[
                { id: 'movies', label: 'Quản Lý Phim', icon: Film, count: movies.length },
                { id: 'rooms', label: 'Phòng Chiếu & Ghế', icon: Tv, count: rooms.length },
                { id: 'showtimes', label: 'Suất Chiếu (24h)', icon: Calendar, count: showtimes.length },
                { id: 'vouchers', label: 'Vouchers & Quà Tặng', icon: Gift, count: vouchers.length },
                { id: 'payments', label: 'Cấu Hình Mã QR', icon: QrCode },
                { id: 'emails', label: 'Cấu Hình Email Google', icon: Mail },
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
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      backgroundColor: isActive ? 'var(--primary-soft)' : 'transparent',
                      border: 'none',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: isActive ? '800' : '600',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={16} />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span
                        style={{
                          fontSize: '11px',
                          backgroundColor: isActive ? '#FFFFFF' : 'rgba(0, 0, 0, 0.06)',
                          color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          fontWeight: '700',
                        }}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '0 20px', fontSize: '11px', color: 'var(--text-light)' }}>
            Phiên bản CINEVERSE 2.0
          </div>
        </div>

        {/* MAIN CONTENT AREA (RIGHT) */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
          {/* Top Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 24px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
              {activeTab === 'movies' && 'Quản Lý Danh Sách Phim'}
              {activeTab === 'rooms' && 'Quản Lý Phòng Chiếu & Sơ Đồ Ghế'}
              {activeTab === 'showtimes' && 'Quản Lý Suất Chiếu'}
              {activeTab === 'vouchers' && 'Phát Hành Voucher & Tặng Khách Hàng'}
              {activeTab === 'payments' && 'Cấu Hình Tài Khoản Thanh Toán QR'}
              {activeTab === 'emails' && 'Cấu Hình Gmail SMTP Gửi Thư Thật'}
              {activeTab === 'stats' && 'Danh Sách Đơn Vé & Duyệt Vé Realtime'}
            </h2>

            <button
              onClick={onClose}
              style={{
                backgroundColor: 'var(--bg-soft)',
                border: 'none',
                color: 'var(--text-muted)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {message && (
            <div
              style={{
                margin: '12px 24px 0',
                padding: '10px 14px',
                borderRadius: 'var(--radius-input)',
                fontSize: '13px',
                backgroundColor: message.type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)',
                border: `1px solid ${message.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                color: message.type === 'success' ? 'var(--success)' : 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          <div style={{ padding: '24px', overflowY: 'auto', flex: 1, backgroundColor: 'var(--bg-soft)' }}>
            {/* TAB 1: MOVIES */}
            {activeTab === 'movies' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '12px' }}>
                    Danh Sách Phim ({movies.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px', overflowY: 'auto' }}>
                    {movies.map((m) => (
                      <div
                        key={m.id}
                        className="cine-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          backgroundColor: '#FFFFFF',
                          padding: '10px 14px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={m.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'} alt={m.title} style={{ width: '38px', height: '52px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                          <div>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', margin: '0 0 2px' }}>{m.title}</h4>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              {m.duration} phút • {new Date(m.releaseDate).toLocaleDateString('vi-VN')}
                            </span>
                            <div style={{ marginTop: '2px' }}>
                              <span className={`badge-status ${m.status === 'NOW_SHOWING' ? 'badge-primary' : 'badge-secondary'}`}>
                                {m.status === 'NOW_SHOWING' ? '🔥 Đang Chiếu' : '⏳ Sắp Chiếu'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setEditingMovie(m); setMovieForm({ title: m.title, description: m.description || '', duration: m.duration, releaseDate: new Date(m.releaseDate).toISOString().split('T')[0], posterUrl: m.posterUrl || '', status: m.status || 'COMING_SOON' }); }} className="btn-outline" style={{ padding: '6px 10px' }}>
                            <Edit size={13} color="var(--primary)" />
                          </button>
                          <button onClick={() => handleDeleteMovie(m.id)} className="btn-outline" style={{ padding: '6px 10px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form */}
                <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)', marginBottom: '14px' }}>
                    {editingMovie ? 'Chỉnh Sửa Phim' : 'Thêm Phim Mới'}
                  </h3>
                  <form onSubmit={handleCreateOrUpdateMovie} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Tên Phim *</label>
                      <input type="text" value={movieForm.title} onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })} required className="cine-input" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Trạng Thái Chiếu</label>
                        <select value={movieForm.status} onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value })} className="cine-input">
                          <option value="COMING_SOON">⏳ Sắp Chiếu (Mặc Định)</option>
                          <option value="NOW_SHOWING">🔥 Đang Chiếu (Now Showing)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Thời lượng (Phút) *</label>
                        <input type="number" value={movieForm.duration} onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })} required className="cine-input" />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Ngày Khởi Chiếu</label>
                      <input type="date" value={movieForm.releaseDate} onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })} required className="cine-input" />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>URL Poster Ảnh</label>
                      <input type="text" placeholder="https://..." value={movieForm.posterUrl} onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })} className="cine-input" />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Mô Tả Phim</label>
                      <textarea rows={2} value={movieForm.description} onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })} className="cine-input" />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <RippleButton type="submit" style={{ flex: 1, padding: '10px', fontSize: '13px' }}>
                        {editingMovie ? 'LƯU PHIM' : '+ THÊM PHIM MỚI'}
                      </RippleButton>
                      {editingMovie && (
                        <button type="button" onClick={() => { setEditingMovie(null); setMovieForm({ title: '', description: '', duration: 120, releaseDate: new Date().toISOString().split('T')[0], posterUrl: '', status: 'COMING_SOON' }); }} className="btn-outline">
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '12px' }}>
                    Danh Sách Phòng Chiếu ({rooms.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '240px', overflowY: 'auto', marginBottom: '16px' }}>
                    {rooms.map((r) => (
                      <div key={r.id} className="cine-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: selectedRoomForSeats?.id === r.id ? 'var(--primary-soft)' : '#FFFFFF', border: selectedRoomForSeats?.id === r.id ? '1.5px solid var(--primary)' : '1px solid var(--border)', padding: '10px 14px' }}>
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', margin: '0 0 2px' }}>
                            {r.name} <span className="badge-status badge-primary">{r.type || 'STANDARD'}</span>
                          </h4>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {r.rows} hàng × {r.columns} cột ({r.seats?.length || r.rows * r.columns} ghế)
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => handleSelectRoomForSeats(r)} className="btn-outline" style={{ padding: '5px 10px', fontSize: '12px', borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                            Sửa Ghế
                          </button>
                          <button onClick={() => handleDeleteRoom(r.id)} className="btn-outline" style={{ padding: '5px 10px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '18px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
                      + Thêm Phòng Chiếu Mới
                    </h4>
                    <form onSubmit={handleCreateOrUpdateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                        <input type="text" placeholder="Tên phòng (VD: Screen 1)" value={roomForm.name} onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} required className="cine-input" />
                        <select value={roomForm.type} onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })} className="cine-input">
                          <option value="STANDARD">Phòng Thường</option>
                          <option value="IMAX">Phòng IMAX</option>
                          <option value="VIP">Phòng VIP (100% VIP)</option>
                          <option value="COUPLE">Phòng COUPLE (100% Đôi)</option>
                        </select>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input type="number" placeholder="Số hàng" min={1} max={26} value={roomForm.rows} onChange={(e) => setRoomForm({ ...roomForm, rows: Number(e.target.value) })} required className="cine-input" />
                        <input type="number" placeholder="Số cột" min={1} max={30} value={roomForm.columns} onChange={(e) => setRoomForm({ ...roomForm, columns: Number(e.target.value) })} required className="cine-input" />
                      </div>
                      <RippleButton type="submit" style={{ padding: '9px', fontSize: '13px' }}>
                        TẠO PHÒNG CHIẾU
                      </RippleButton>
                    </form>
                  </div>
                </div>

                {/* LIVE SEAT EDITOR */}
                <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)', marginBottom: '8px' }}>
                    Chỉnh Sửa Sơ Đồ Ghế Trực Tiếp
                  </h3>
                  {selectedRoomForSeats ? (
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 12px' }}>
                        Đang chỉnh: <b>{selectedRoomForSeats.name}</b>. Nhấp vào ghế để đổi sang màu loại đã chọn:
                      </p>

                      {/* Paint Brush Selector */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                        {[
                          { type: 'STANDARD', label: 'Ghế Thường', border: '1px solid var(--border)', color: 'var(--text)' },
                          { type: 'VIP', label: 'Ghế VIP (+20k)', border: '1.5px solid #FFC107', color: '#B45309' },
                          { type: 'COUPLE', label: 'Ghế Couple (+40k)', border: '1.5px solid var(--primary)', color: 'var(--primary)' },
                        ].map((b) => (
                          <button
                            key={b.type}
                            type="button"
                            onClick={() => setBrushSeatType(b.type as any)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: brushSeatType === b.type ? '2px solid var(--primary)' : b.border,
                              backgroundColor: brushSeatType === b.type ? 'var(--primary-soft)' : '#FFFFFF',
                              color: b.color,
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor: 'pointer',
                            }}
                          >
                            ● {b.label}
                          </button>
                        ))}
                      </div>

                      {/* Live Seat Grid */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', backgroundColor: 'var(--bg-soft)', padding: '16px', borderRadius: '8px', overflowX: 'auto', border: '1px solid var(--border)' }}>
                        {Array.from(new Set(localSeats.map((s) => s.row))).map((row) => (
                          <div key={row} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', width: '16px', textAlign: 'center', fontWeight: '700' }}>{row}</span>
                            {localSeats.filter((s) => s.row === row).map((seat) => {
                              const isVip = seat.type === 'VIP';
                              const isCouple = seat.type === 'COUPLE';
                              const bg = isCouple ? 'var(--primary-soft)' : isVip ? 'rgba(255, 193, 7, 0.18)' : '#FFFFFF';
                              const border = isCouple ? '1.5px solid var(--primary)' : isVip ? '1.5px solid #FFC107' : '1px solid var(--border)';
                              const color = isCouple ? 'var(--primary)' : isVip ? '#B45309' : 'var(--text)';
                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  onClick={() => handleSeatClick(seat.id)}
                                  style={{
                                    width: isCouple ? '56px' : '28px',
                                    height: '26px',
                                    borderRadius: '4px',
                                    border,
                                    background: bg,
                                    color,
                                    fontSize: '10px',
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
                        ))}
                      </div>

                      <RippleButton onClick={handleSaveSeatTypes} style={{ width: '100%', padding: '10px', marginTop: '14px', fontSize: '13px' }}>
                        ✓ LƯU SƠ ĐỒ GHẾ
                      </RippleButton>
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      Vui lòng chọn một phòng chiếu bên trái và bấm <b>"Sửa Ghế"</b> để cấu hình sơ đồ ghế trực tiếp.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: SHOWTIMES */}
            {activeTab === 'showtimes' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '12px' }}>
                    Danh Sách Suất Chiếu ({showtimes.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px', overflowY: 'auto' }}>
                    {showtimes.map((st) => (
                      <div key={st.id} className="cine-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '12px 16px' }}>
                        <div>
                          <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text)', margin: '0 0 2px' }}>{st.movie?.title}</h4>
                          <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                              {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(st.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                            <span>• {st.room?.name}</span>
                            <span style={{ fontWeight: '600' }}>• {Number(st.price).toLocaleString('vi-VN')}đ</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => { setEditingShowtime(st); setShowtimeForm({ movieId: st.movieId, roomId: st.roomId, startTime: st.startTime.slice(0, 16), endTime: st.endTime.slice(0, 16), price: Number(st.price) }); }} className="btn-outline" style={{ padding: '6px 10px' }}>
                            <Edit size={13} color="var(--primary)" />
                          </button>
                          <button onClick={() => handleDeleteShowtime(st.id)} className="btn-outline" style={{ padding: '6px 10px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)', marginBottom: '14px' }}>
                    {editingShowtime ? 'Sửa Suất Chiếu' : 'Tạo Suất Chiếu Mới'}
                  </h3>
                  <form onSubmit={handleCreateOrUpdateShowtime} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Chọn Phim * (Tự chuyển sang Đang Chiếu)</label>
                      <select value={showtimeForm.movieId} onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })} required className="cine-input">
                        <option value="">-- Chọn Phim --</option>
                        {movies.map((m) => (
                          <option key={m.id} value={m.id}>{m.title} ({m.duration}p)</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Chọn Phòng Chiếu *</label>
                      <select value={showtimeForm.roomId} onChange={(e) => setShowtimeForm({ ...showtimeForm, roomId: e.target.value })} required className="cine-input">
                        <option value="">-- Chọn Phòng Chiếu --</option>
                        {rooms.map((r) => (
                          <option key={r.id} value={r.id}>{r.name} ({r.type || 'STANDARD'})</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Bắt đầu (Khung 24h) *</label>
                        <input type="datetime-local" value={showtimeForm.startTime} onChange={(e) => setShowtimeForm({ ...showtimeForm, startTime: e.target.value })} required className="cine-input" />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Kết thúc (Khung 24h) *</label>
                        <input type="datetime-local" value={showtimeForm.endTime} onChange={(e) => setShowtimeForm({ ...showtimeForm, endTime: e.target.value })} required className="cine-input" />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>Giá vé cơ bản (VNĐ) *</label>
                      <input type="number" step="5000" value={showtimeForm.price} onChange={(e) => setShowtimeForm({ ...showtimeForm, price: Number(e.target.value) })} required className="cine-input" />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <RippleButton type="submit" style={{ flex: 1, padding: '10px', fontSize: '13px' }}>
                        {editingShowtime ? 'LƯU SUẤT CHIẾU' : '+ TẠO SUẤT CHIẾU'}
                      </RippleButton>
                      {editingShowtime && (
                        <button type="button" onClick={() => { setEditingShowtime(null); setShowtimeForm({ movieId: '', roomId: '', startTime: '', endTime: '', price: 80000 }); }} className="btn-outline">
                          Hủy
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* TAB 4: VOUCHERS */}
            {activeTab === 'vouchers' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '12px' }}>
                    Danh Sách Mã Voucher ({vouchers.length})
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '460px', overflowY: 'auto' }}>
                    {vouchers.map((v) => (
                      <div key={v.id} className="cine-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: '12px 16px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                              {v.code}
                            </span>
                            <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700' }}>
                              {v.discountPercent ? `Giảm ${v.discountPercent}%` : `Giảm ${Number(v.discountAmount).toLocaleString('vi-VN')}đ`}
                            </span>
                            {v.user && (
                              <span className="badge-status badge-primary">
                                🎁 {v.user.name}
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Đơn tối thiểu: {Number(v.minOrderAmount).toLocaleString('vi-VN')}đ • HSD: {new Date(v.expireAt).toLocaleDateString('vi-VN')} • Đã dùng: {v.usedCount}/{v.usageLimit}
                          </span>
                        </div>
                        <button onClick={() => handleDeleteVoucher(v.id)} className="btn-outline" style={{ padding: '6px 10px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Gift Voucher to User */}
                  <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '18px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <UserCheck size={16} /> 🎁 Tặng Voucher &amp; Gửi Email Cho Khách
                    </h4>
                    <form onSubmit={handleGiftVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <select value={giftUserId} onChange={(e) => setGiftUserId(e.target.value)} required className="cine-input">
                        <option value="">-- Chọn Khách Hàng Nhận Quà --</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input type="number" step="10000" placeholder="Số tiền giảm (VNĐ)" value={giftDiscountAmount} onChange={(e) => setGiftDiscountAmount(Number(e.target.value))} required className="cine-input" />
                        <RippleButton type="submit" style={{ fontSize: '12px', padding: '8px' }}>
                          GỬI TẶNG NGAY
                        </RippleButton>
                      </div>
                    </form>
                  </div>

                  {/* Create General Voucher */}
                  <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '18px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px' }}>
                      + Phát Hành Mã Voucher Chung
                    </h4>
                    <form onSubmit={handleCreateVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input type="text" placeholder="MÃ VOUCHER (VD: CINEVERSE2026)" value={voucherForm.code} onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })} required className="cine-input" style={{ fontWeight: '700' }} />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <select value={voucherForm.discountType} onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value as any })} className="cine-input">
                          <option value="percent">Giảm theo %</option>
                          <option value="amount">Giảm tiền mặt (VNĐ)</option>
                        </select>
                        <input type="number" placeholder="Giá trị" value={voucherForm.discountValue} onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: Number(e.target.value) })} required className="cine-input" />
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <input type="date" value={voucherForm.expireAt} onChange={(e) => setVoucherForm({ ...voucherForm, expireAt: e.target.value })} required className="cine-input" />
                        <input type="number" placeholder="Số lượt dùng" value={voucherForm.usageLimit} onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: Number(e.target.value) })} required className="cine-input" />
                      </div>
                      <RippleButton type="submit" style={{ padding: '9px', fontSize: '13px' }}>
                        LƯU &amp; PHÁT HÀNH
                      </RippleButton>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PAYMENTS */}
            {activeTab === 'payments' && (
              <div className="cine-card" style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: '#FFFFFF', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={18} /> Cấu Hình Mã QR &amp; Tài Khoản Nhận Tiền
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  Mã QR và thông tin tài khoản cấu hình tại đây sẽ tự động hiển thị trên màn hình chọn thanh toán của khách.
                </p>
                <form onSubmit={handleSavePaymentSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>URL Mã QR Ví MoMo</label>
                    <input type="text" placeholder="https://..." value={paymentForm.momoQrUrl} onChange={(e) => setPaymentForm({ ...paymentForm, momoQrUrl: e.target.value })} className="cine-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>URL Mã VietQR Ngân Hàng</label>
                    <input type="text" placeholder="https://..." value={paymentForm.vietQrUrl} onChange={(e) => setPaymentForm({ ...paymentForm, vietQrUrl: e.target.value })} className="cine-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>URL Mã QR Ví ZaloPay</label>
                    <input type="text" placeholder="https://..." value={paymentForm.zaloPayQrUrl} onChange={(e) => setPaymentForm({ ...paymentForm, zaloPayQrUrl: e.target.value })} className="cine-input" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Tên Chủ Tài Khoản</label>
                      <input type="text" placeholder="VD: RAP PHIM CINEVERSE" value={paymentForm.bankAccountName} onChange={(e) => setPaymentForm({ ...paymentForm, bankAccountName: e.target.value })} className="cine-input" />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Số Tài Khoản &amp; Ngân Hàng</label>
                      <input type="text" placeholder="VD: 190388888 - Techcombank" value={paymentForm.bankAccountNumber} onChange={(e) => setPaymentForm({ ...paymentForm, bankAccountNumber: e.target.value })} className="cine-input" />
                    </div>
                  </div>
                  <RippleButton type="submit" style={{ padding: '12px', marginTop: '6px' }}>
                    LƯU CẤU HÌNH THANH TOÁN
                  </RippleButton>
                </form>
              </div>
            )}

            {/* TAB 6: EMAIL SETTINGS */}
            {activeTab === 'emails' && (
              <div className="cine-card" style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: '#FFFFFF', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={18} /> Cấu Hình Email Google (Gmail SMTP) Thật
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  Nhập Gmail và Mật khẩu ứng dụng Google (App Password 16 ký tự) để hệ thống gửi email xác nhận vé thật tới khách và Admin.
                </p>

                <form onSubmit={handleSaveEmailSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Địa Chỉ Gmail Gửi Thư</label>
                    <input type="email" placeholder="example@gmail.com" value={emailForm.smtpEmail || ''} onChange={(e) => setEmailForm({ ...emailForm, smtpEmail: e.target.value })} required className="cine-input" />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Mật Khẩu Ứng Dụng Google (16 Ký Tự App Password)</label>
                    <input type="password" placeholder="abcd efgh ijkl mnop" value={emailForm.smtpPassword || ''} onChange={(e) => setEmailForm({ ...emailForm, smtpPassword: e.target.value })} required className="cine-input" />
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                      * Tạo tại: Google Account → Bảo mật → Xác minh 2 bước → Mật khẩu ứng dụng.
                    </span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Tên Người Gửi Hiển Thị</label>
                      <input type="text" placeholder="CINEVERSE Cinema" value={emailForm.senderName || ''} onChange={(e) => setEmailForm({ ...emailForm, senderName: e.target.value })} className="cine-input" />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Email Nhận Thông Báo Của Admin</label>
                      <input type="email" placeholder="admin@gmail.com" value={emailForm.adminEmail || ''} onChange={(e) => setEmailForm({ ...emailForm, adminEmail: e.target.value })} className="cine-input" />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <RippleButton type="submit" style={{ flex: 1, padding: '12px' }}>
                      LƯU CẤU HÌNH EMAIL
                    </RippleButton>
                    <button type="button" onClick={handleSendTestEmail} disabled={testEmailLoading} className="btn-outline" style={{ padding: '12px 18px', whiteSpace: 'nowrap' }}>
                      <Send size={14} /> {testEmailLoading ? 'Đang gửi...' : 'Gửi Thử Email'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 7: STATS & BOOKINGS */}
            {activeTab === 'stats' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '16px 20px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Tổng Doanh Thu</span>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--primary)' }}>
                      {totalRevenue.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '16px 20px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Tổng Vé Đã Bán</span>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text)' }}>
                      {totalTicketsSold} vé
                    </span>
                  </div>
                  <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '16px 20px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Đơn Xác Nhận</span>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--success)' }}>
                      {confirmedBookings.length} đơn
                    </span>
                  </div>
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', marginBottom: '14px' }}>
                  Danh Sách Đơn Đặt Vé Khách Hàng ({bookings.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {bookings.map((b) => (
                    <div key={b.id} className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>#{b.id.slice(0, 8).toUpperCase()}</span>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)' }}>{b.user?.name} ({b.user?.email})</span>
                          <span
                            className={`badge-status ${
                              b.status === 'CONFIRMED' ? 'badge-success' : b.status === 'PENDING' ? 'badge-primary' : 'badge-danger'
                            }`}
                          >
                            {b.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : b.status === 'PENDING' ? 'CHỜ DUYỆT' : 'ĐÃ HỦY'}
                          </span>
                          {b.paymentMethod && (
                            <span style={{ fontSize: '11px', backgroundColor: 'var(--bg-soft)', color: 'var(--text-muted)', padding: '1px 6px', borderRadius: '4px' }}>
                              {b.paymentMethod}
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                          {b.showtime?.movie?.title} • {b.showtime?.room?.name} • Ghế: <b style={{ color: 'var(--text)' }}>{b.bookingSeats?.map((s: any) => s.seat?.label || s.seatId).join(', ') || 'Ghế'}</b>
                        </p>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: b.status === 'CONFIRMED' ? 'var(--success)' : 'var(--primary)', display: 'block' }}>
                            {Number(b.totalPrice).toLocaleString('vi-VN')}đ
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            {new Date(b.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </span>
                        </div>
                        {b.status !== 'CONFIRMED' && b.status !== 'CANCELLED' && (
                          <RippleButton onClick={() => handleApproveBooking(b.id)} style={{ padding: '6px 14px', fontSize: '12px' }}>
                            <CheckCircle2 size={14} /> DUYỆT VÉ
                          </RippleButton>
                        )}
                        {b.status === 'CONFIRMED' && (
                          <button onClick={() => handleAdminCancelBooking(b.id)} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
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
    </div>
  );
};
