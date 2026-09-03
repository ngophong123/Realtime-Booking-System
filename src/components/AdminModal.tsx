import { useState, useEffect, type FormEvent } from 'react';
import {
  X, Film, Check, ScanLine, ShieldAlert, History, FileText, Tv, Calendar, Trash2, Edit, DollarSign,
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
  const [activeTab, setActiveTab] = useState<'movies' | 'rooms' | 'showtimes' | 'vouchers' | 'payments' | 'emails' | 'stats' | 'footer' | 'checkin' | 'logs'>('movies');
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
  const [testEmailInput, setTestEmailInput] = useState('');
  const [checkinCode, setCheckinCode] = useState('');
  const [checkinResult, setCheckinResult] = useState<any>(null);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [paymentLogs, setPaymentLogs] = useState<any[]>([]);
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'amount',
    discountValue: 10,
    minOrderAmount: 0,
    issueDate: new Date().toISOString().split('T')[0],
    expireAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    targetUserId: '',
    usageLimit: 100,
  });
  const [giftUserId, setGiftUserId] = useState('');
  const [giftDiscountAmount, setGiftDiscountAmount] = useState(50000);
    const [giftIssueDate, setGiftIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [giftExpireAt, setGiftExpireAt] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

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

  // Footer & Policy Settings State
  const [footerForm, setFooterForm] = useState({
    termsOfService: '',
    privacyPolicy: '',
    customerCare: '',
    aboutUs: '',
    hotline: '1900 8888',
    email: 'support@cineverse.vn',
    socialFacebook: 'https://facebook.com/cineverse',
    socialYoutube: 'https://youtube.com/cineverse',
    socialZalo: 'https://zalo.me/cineverse',
    cancellationCutoffHours: 12,
  });


  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
    }
  }, [isOpen]);

  const fetchAdminData = async () => {
    try {
      const [vouchersRes, bookingsRes, usersRes, paymentRes, emailRes, footerRes, logsRes] = await Promise.all([
        API.get('/vouchers').catch(() => ({ data: { vouchers: [] } })),
        API.get('/bookings').catch(() => ({ data: { bookings: [] } })),
        API.get('/auth/users').catch(() => ({ data: { users: [] } })),
        API.get('/payments/settings').catch(() => ({ data: { settings: null } })),
        API.get('/settings/email').catch(() => ({ data: { setting: null } })),
        API.get('/settings/footer').catch(() => ({ data: { footer: null } })),
        API.get('/payments/logs').catch(() => ({ data: { logs: [] } })),
      ]);

      if (vouchersRes.data?.vouchers) setVouchers(vouchersRes.data.vouchers);
      if (bookingsRes.data?.bookings) setBookings(bookingsRes.data.bookings);
      if (usersRes.data?.users) setUsers(usersRes.data.users);
      if (logsRes.data?.logs) setPaymentLogs(logsRes.data.logs);

      if (paymentRes.data?.settings) {
        setPaymentForm({
          momoQrUrl: paymentRes.data.settings.momoQrUrl || '',
          vietQrUrl: paymentRes.data.settings.vietQrUrl || '',
          zaloPayQrUrl: paymentRes.data.settings.zaloPayQrUrl || '',
          bankAccountName: paymentRes.data.settings.bankAccountName || '',
          bankAccountNumber: paymentRes.data.settings.bankAccountNumber || '',
          bankName: paymentRes.data.settings.bankName || '',
        });
      }
      if (emailRes.data?.setting) {
        setEmailForm({
          smtpEmail: emailRes.data.setting.smtpEmail || '',
          smtpPassword: emailRes.data.setting.smtpPassword || '',
          senderName: emailRes.data.setting.senderName || 'CINEVERSE Cinema',
          adminEmail: emailRes.data.setting.adminEmail || '',
        });
      }
      if (footerRes.data?.footer) {
        setFooterForm({
          termsOfService: footerRes.data.footer.termsOfService || '',
          privacyPolicy: footerRes.data.footer.privacyPolicy || '',
          customerCare: footerRes.data.footer.customerCare || '',
          aboutUs: footerRes.data.footer.aboutUs || '',
          hotline: footerRes.data.footer.hotline || '1900 8888',
          email: footerRes.data.footer.email || 'support@cineverse.vn',
          socialFacebook: footerRes.data.footer.socialFacebook || '',
          socialYoutube: footerRes.data.footer.socialYoutube || '',
          socialZalo: footerRes.data.footer.socialZalo || '',
          cancellationCutoffHours: footerRes.data.footer.cancellationCutoffHours !== undefined ? footerRes.data.footer.cancellationCutoffHours : 12,
        });
      }
    } catch (err: any) {
      console.error('Lỗi nạp dữ liệu admin:', err);
    }
  };

  // 1. Movie Handlers
  
  const handleToggleMovieStatus = async (movie: Movie) => {
    try {
      const nextStatus = movie.status === 'NOW_SHOWING' ? 'COMING_SOON' : 'NOW_SHOWING';
      await API.put(`/movies/${movie.id}`, { status: nextStatus });
      setMessage({ type: 'success', text: `Đã chuyển phim "${movie.title}" sang "${nextStatus === 'NOW_SHOWING' ? 'Đang Chiếu' : 'Sắp Chiếu'}"!` });
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể đổi trạng thái phim!' });
    }
  };



  const handleCheckInSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!checkinCode.trim()) return;
    try {
      setCheckinLoading(true);
      setCheckinResult(null);
      const res = await API.post('/tickets/verify-checkin', { bookingId: checkinCode.trim() });
      setCheckinResult(res.data);
      setMessage({ type: 'success', text: res.data.message });
      fetchAdminData();
    } catch (err: any) {
      const data = err.response?.data;
      setCheckinResult(data || { success: false, message: 'Lỗi kiểm tra vé!' });
      setMessage({ type: 'error', text: data?.message || 'Vé không hợp lệ!' });
    } finally {
      setCheckinLoading(false);
    }
  };

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
            issueDate: giftIssueDate,
            expireAt: giftExpireAt,
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
        const target = testEmailInput.trim() || emailForm.adminEmail || emailForm.smtpEmail;
        if (!target) {
          setMessage({ type: 'error', text: 'Vui lòng nhập email nhận thư thử nghiệm!' });
          setTestEmailLoading(false);
          return;
        }
        const res = await API.post('/settings/email/test', { targetEmail: target });
        setMessage({ type: 'success', text: res.data.message || 'Đã gửi email kiểm tra thành công!' });
      } catch (err: any) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể gửi email kiểm tra. Hãy kiểm tra lại Gmail App Password!' });
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

  
  const handleSaveFooterSettings = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await API.put('/settings/footer', footerForm);
      setMessage({ type: 'success', text: 'Cập nhật Điều khoản & Chính sách Footer thành công!' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể lưu chính sách footer!' });
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
                { id: 'footer', label: 'Chính Sách & Footer', icon: FileText },
                { id: 'checkin', label: 'Soát Vé Tại Quầy', icon: ScanLine },
                { id: 'logs', label: 'Audit Logs Giao Dịch', icon: History, count: paymentLogs.length },
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
              {activeTab === 'footer' && 'Quản Lý Chính Sách, Điều Khoản & Footer'}
              {activeTab === 'checkin' && 'Soát Vé & Check-in Điện Tử Tại Quầy'}
              {activeTab === 'logs' && 'Nhật Ký Giao Dịch & Tra Soát An Toàn (Audit Trail)'}
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
                              <button
                                type="button"
                                onClick={() => handleToggleMovieStatus(m)}
                                className="btn-outline"
                                title="Nhấp để đổi nhanh trạng thái chiếu"
                                style={{
                                  padding: '2px 8px',
                                  fontSize: '11px',
                                  fontWeight: '800',
                                  borderRadius: '4px',
                                  borderColor: m.status === 'NOW_SHOWING' ? 'var(--primary)' : 'var(--secondary)',
                                  backgroundColor: m.status === 'NOW_SHOWING' ? 'var(--primary-soft)' : 'var(--secondary-soft)',
                                  color: m.status === 'NOW_SHOWING' ? 'var(--primary)' : 'var(--secondary)',
                                  cursor: 'pointer',
                                }}
                              >
                                {m.status === 'NOW_SHOWING' ? '🔥 ĐANG CHIẾU' : '⏳ SẮP CHIẾU'} ⇄
                              </button>
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
                            📅 Phát hành: {new Date(v.issueDate || v.createdAt || Date.now()).toLocaleDateString('vi-VN')} • ⏳ Hết hạn: {new Date(v.expireAt).toLocaleDateString('vi-VN')} • Đơn tối thiểu: {Number(v.minOrderAmount).toLocaleString('vi-VN')}đ • Đã dùng: {v.usedCount}/{v.usageLimit}
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
                      <UserCheck size={16} /> 🎁 Tặng Voucher Cá Nhân &amp; Gửi Email
                    </h4>
                    <form onSubmit={handleGiftVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                          👤 Khách Hàng Nhận Quà *
                        </label>
                        <select value={giftUserId} onChange={(e) => setGiftUserId(e.target.value)} required className="cine-input">
                          <option value="">-- Chọn Khách Hàng Nhận Quà --</option>
                          {users.map((u) => (
                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                          💰 Mức Tiền Giảm (VNĐ) *
                        </label>
                        <input
                          type="number"
                          step="10000"
                          placeholder="Số tiền giảm (VNĐ)"
                          value={giftDiscountAmount}
                          onChange={(e) => setGiftDiscountAmount(Number(e.target.value))}
                          required
                          className="cine-input"
                        />
                      </div>

                      {/* Admin Controls Expiration Date for Gift Voucher */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--bg-soft)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>
                            📅 Ngày Bắt Đầu
                          </label>
                          <input
                            type="date"
                            value={giftIssueDate}
                            onChange={(e) => setGiftIssueDate(e.target.value)}
                            required
                            className="cine-input"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--danger)', display: 'block', marginBottom: '2px' }}>
                            ⏳ Ngày Hết Hạn *
                          </label>
                          <input
                            type="date"
                            value={giftExpireAt}
                            onChange={(e) => setGiftExpireAt(e.target.value)}
                            required
                            className="cine-input"
                          />
                        </div>
                      </div>

                      {/* Quick Presets for Gift Voucher */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>Hạn dùng:</span>
                        {[
                          { label: '7 Ngày', days: 7 },
                          { label: '14 Ngày', days: 14 },
                          { label: '30 Ngày (1 Tháng)', days: 30 },
                          { label: '90 Ngày (3 Tháng)', days: 90 },
                          { label: '1 Năm', days: 365 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              const d = new Date();
                              d.setDate(d.getDate() + p.days);
                              setGiftExpireAt(d.toISOString().split('T')[0]);
                            }}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              backgroundColor: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: '700',
                              color: 'var(--primary)',
                              cursor: 'pointer',
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      <RippleButton type="submit" style={{ fontSize: '13px', padding: '9px', marginTop: '4px' }}>
                        🎁 GỬI TẶNG VOUCHER &amp; GỬI EMAIL THÔNG BÁO
                      </RippleButton>
                    </form>
                  </div>

                  {/* Create General / Public Voucher */}
                  <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '18px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Gift size={16} /> + Phát Hành Mã Voucher Chung
                    </h4>
                    <form onSubmit={handleCreateVoucher} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                          🏷️ Mã Voucher * (Ví dụ: CINEVERSE2026, VIP50K)
                        </label>
                        <input
                          type="text"
                          placeholder="MÃ VOUCHER..."
                          value={voucherForm.code}
                          onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                          required
                          className="cine-input"
                          style={{ fontWeight: '800', letterSpacing: '1px' }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                            Loại Giảm Giá
                          </label>
                          <select
                            value={voucherForm.discountType}
                            onChange={(e) => setVoucherForm({ ...voucherForm, discountType: e.target.value as any })}
                            className="cine-input"
                          >
                            <option value="percent">Giảm theo %</option>
                            <option value="amount">Giảm tiền mặt (VNĐ)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                            Mức Giảm *
                          </label>
                          <input
                            type="number"
                            placeholder={voucherForm.discountType === 'percent' ? '10%' : '50000'}
                            value={voucherForm.discountValue}
                            onChange={(e) => setVoucherForm({ ...voucherForm, discountValue: Number(e.target.value) })}
                            required
                            className="cine-input"
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', backgroundColor: 'var(--bg-soft)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--primary)', display: 'block', marginBottom: '2px' }}>
                            📅 Ngày Bắt Đầu *
                          </label>
                          <input
                            type="date"
                            value={voucherForm.issueDate}
                            onChange={(e) => setVoucherForm({ ...voucherForm, issueDate: e.target.value })}
                            required
                            className="cine-input"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--danger)', display: 'block', marginBottom: '2px' }}>
                            ⏳ Ngày Hết Hạn *
                          </label>
                          <input
                            type="date"
                            value={voucherForm.expireAt}
                            onChange={(e) => setVoucherForm({ ...voucherForm, expireAt: e.target.value })}
                            required
                            className="cine-input"
                          />
                        </div>
                      </div>

                      {/* Quick Presets for General Voucher */}
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>Hạn dùng:</span>
                        {[
                          { label: '7 Ngày', days: 7 },
                          { label: '14 Ngày', days: 14 },
                          { label: '30 Ngày (1 Tháng)', days: 30 },
                          { label: '90 Ngày (3 Tháng)', days: 90 },
                          { label: '1 Năm', days: 365 },
                        ].map((p) => (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              const d = new Date();
                              d.setDate(d.getDate() + p.days);
                              setVoucherForm({ ...voucherForm, expireAt: d.toISOString().split('T')[0] });
                            }}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              border: '1px solid var(--border)',
                              backgroundColor: '#FFFFFF',
                              fontSize: '10px',
                              fontWeight: '700',
                              color: 'var(--primary)',
                              cursor: 'pointer',
                            }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                            Đơn Tối Thiểu (VNĐ)
                          </label>
                          <input
                            type="number"
                            placeholder="0đ"
                            value={voucherForm.minOrderAmount}
                            onChange={(e) => setVoucherForm({ ...voucherForm, minOrderAmount: Number(e.target.value) })}
                            className="cine-input"
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', display: 'block', marginBottom: '3px' }}>
                            Số Lượt Dùng
                          </label>
                          <input
                            type="number"
                            placeholder="100"
                            value={voucherForm.usageLimit}
                            onChange={(e) => setVoucherForm({ ...voucherForm, usageLimit: Number(e.target.value) })}
                            required
                            className="cine-input"
                          />
                        </div>
                      </div>

                      <RippleButton type="submit" style={{ padding: '10px', fontSize: '13px', marginTop: '4px' }}>
                        LƯU &amp; PHÁT HÀNH VOUCHER
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

                  <RippleButton type="submit" style={{ width: '100%', padding: '12px', marginTop: '6px' }}>
                      LƯU CẤU HÌNH EMAIL
                    </RippleButton>

                    <div style={{ marginTop: '20px', borderTop: '1px dashed var(--border)', paddingTop: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '6px' }}>
                        🧪 Gửi Thử Nghiệm Kết Nối Email
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="email"
                          placeholder="Nhập email nhận thử (để trống sẽ gửi tới Email Admin)..."
                          value={testEmailInput}
                          onChange={(e) => setTestEmailInput(e.target.value)}
                          className="cine-input"
                          style={{ flex: 1 }}
                        />
                        <button
                          type="button"
                          onClick={handleSendTestEmail}
                          disabled={testEmailLoading}
                          className="btn-outline"
                          style={{ padding: '10px 18px', whiteSpace: 'nowrap', fontWeight: '700' }}
                        >
                          <Send size={14} /> {testEmailLoading ? 'Đang gửi...' : 'Gửi Thử'}
                        </button>
                      </div>
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
          
            {/* TAB 8: FOOTER & POLICIES */}
            {activeTab === 'footer' && (
              <div className="cine-card" style={{ maxWidth: '780px', margin: '0 auto', backgroundColor: '#FFFFFF', padding: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={18} /> Quản Lý Nội Dung Chính Sách &amp; Chăm Sóc Khách Hàng
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  Nội dung điều khoản, chính sách bảo mật và thông tin liên hệ được cấu hình tại đây sẽ tự động hiển thị ở chân trang web.
                </p>

                <form onSubmit={handleSaveFooterSettings} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      1. Điều Khoản Sử Dụng
                    </label>
                    <textarea
                      rows={5}
                      value={footerForm.termsOfService}
                      onChange={(e) => setFooterForm({ ...footerForm, termsOfService: e.target.value })}
                      className="cine-input"
                      placeholder="Nhập điều khoản sử dụng dịch vụ..."
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      2. Chính Sách Bảo Mật Thông Tin
                    </label>
                    <textarea
                      rows={5}
                      value={footerForm.privacyPolicy}
                      onChange={(e) => setFooterForm({ ...footerForm, privacyPolicy: e.target.value })}
                      className="cine-input"
                      placeholder="Nhập chính sách bảo mật thông tin khách hàng..."
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                      3. Quy Trình Chăm Sóc Khách Hàng &amp; Hỗ Trợ
                    </label>
                    <textarea
                      rows={4}
                      value={footerForm.customerCare}
                      onChange={(e) => setFooterForm({ ...footerForm, customerCare: e.target.value })}
                      className="cine-input"
                      placeholder="Nhập quy trình hỗ trợ khách hàng..."
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Hotline Chăm Sóc Khách Hàng
                      </label>
                      <input
                        type="text"
                        value={footerForm.hotline}
                        onChange={(e) => setFooterForm({ ...footerForm, hotline: e.target.value })}
                        className="cine-input"
                        placeholder="1900 8888"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Email Tiếp Nhận Hỗ Trợ
                      </label>
                      <input
                        type="email"
                        value={footerForm.email}
                        onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                        className="cine-input"
                        placeholder="support@cineverse.vn"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Link Facebook
                      </label>
                      <input
                        type="text"
                        value={footerForm.socialFacebook}
                        onChange={(e) => setFooterForm({ ...footerForm, socialFacebook: e.target.value })}
                        className="cine-input"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Link Youtube
                      </label>
                      <input
                        type="text"
                        value={footerForm.socialYoutube}
                        onChange={(e) => setFooterForm({ ...footerForm, socialYoutube: e.target.value })}
                        className="cine-input"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                        Link Zalo
                      </label>
                      <input
                        type="text"
                        value={footerForm.socialZalo}
                        onChange={(e) => setFooterForm({ ...footerForm, socialZalo: e.target.value })}
                        className="cine-input"
                      />
                    </div>
                  </div>

                  <RippleButton type="submit" style={{ padding: '12px', marginTop: '6px' }}>
                    LƯU CHÍNH SÁCH &amp; FOOTER
                  </RippleButton>
                </form>
              </div>
            )}

            {/* TAB 9: CHECKIN AT COUNTER */}
            {activeTab === 'checkin' && (
              <div style={{ maxWidth: '680px', margin: '0 auto' }}>
                <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '24px', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ScanLine size={18} /> Quét &amp; Soát Vé Khách Hàng Vào Rạp
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Nhập mã đơn vé (VD: <code style={{ color: 'var(--primary)', fontWeight: '700' }}>834EA455...</code>) hoặc quét mã QR trên vé của khách để kiểm tra và đánh dấu đã vào phòng chiếu.
                  </p>

                  <form onSubmit={handleCheckInSubmit} style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      placeholder="Nhập mã đơn vé hoặc dán mã QR..."
                      value={checkinCode}
                      onChange={(e) => setCheckinCode(e.target.value)}
                      className="cine-input"
                      style={{ flex: 1, fontSize: '14px', fontWeight: '700' }}
                      required
                    />
                    <RippleButton type="submit" loading={checkinLoading} loadingText="Đang Soát..." style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}>
                      SOÁT VÉ
                    </RippleButton>
                  </form>
                </div>

                {checkinResult && (
                  <div
                    className="cine-card animate-fade-in"
                    style={{
                      backgroundColor: checkinResult.success ? 'var(--success-soft)' : 'var(--danger-soft)',
                      border: `2px solid ${checkinResult.success ? 'var(--success)' : 'var(--danger)'}`,
                      padding: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      {checkinResult.success ? (
                        <Check size={24} color="var(--success)" />
                      ) : (
                        <ShieldAlert size={24} color="var(--danger)" />
                      )}
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: checkinResult.success ? 'var(--success)' : 'var(--danger)', margin: 0 }}>
                        {checkinResult.message}
                      </h4>
                    </div>

                    {checkinResult.booking && (
                      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '8px', padding: '14px', marginTop: '12px', fontSize: '13px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div><b>Phim:</b> {checkinResult.booking.showtime?.movie?.title}</div>
                          <div><b>Phòng:</b> {checkinResult.booking.showtime?.room?.name}</div>
                          <div><b>Khách hàng:</b> {checkinResult.booking.user?.name}</div>
                          <div><b>Suất chiếu:</b> {new Date(checkinResult.booking.showtime?.startTime).toLocaleString('vi-VN')}</div>
                          <div><b>Trạng thái check-in:</b> <span style={{ color: checkinResult.booking.isCheckedIn ? 'var(--success)' : 'var(--warning)', fontWeight: '800' }}>{checkinResult.booking.isCheckedIn ? 'ĐÃ CHECK-IN' : 'CHƯA CHECK-IN'}</span></div>
                          {checkinResult.booking.checkInAt && <div><b>Thời gian:</b> {new Date(checkinResult.booking.checkInAt).toLocaleString('vi-VN')}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 10: AUDIT LOGS */}
            {activeTab === 'logs' && (
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '12px' }}>
                  Lịch Sử Giao Dịch &amp; Audit Trail ({paymentLogs.length} bản ghi)
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '520px', overflowY: 'auto' }}>
                  {paymentLogs.length === 0 ? (
                    <div className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      Chưa có nhật ký giao dịch nào được ghi nhận.
                    </div>
                  ) : (
                    paymentLogs.map((log) => (
                      <div key={log.id} className="cine-card" style={{ backgroundColor: '#FFFFFF', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>
                              #{log.orderId ? log.orderId.slice(0, 8).toUpperCase() : 'N/A'}
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: log.isVerified ? 'var(--success-soft)' : 'var(--danger-soft)', color: log.isVerified ? 'var(--success)' : 'var(--danger)' }}>
                              {log.statusAfter}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)' }}>
                              {Number(log.amount || 0).toLocaleString('vi-VN')}đ
                            </span>
                          </div>
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            Khách: {log.user?.name || 'Khách'} ({log.user?.email || 'N/A'}) • IP: {log.ipAddress || '127.0.0.1'}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
</div>
        </div>
      </div>
    </div>
  );
};
