import { useState, useEffect, type FormEvent } from 'react';
import { X, User as UserIcon, Gift, Ticket, QrCode, Copy, Check } from 'lucide-react';
import type { User, Voucher, Booking } from '../types';
import API from '../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdateUser: (updatedUser: User) => void;
}

export const ProfileModal = ({ isOpen, onClose, user, onUpdateUser }: ProfileModalProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'vouchers' | 'tickets'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [voucherRes, bookingRes] = await Promise.all([
        API.get('/vouchers/my-vouchers'),
        API.get('/bookings'),
      ]);
      setVouchers(voucherRes.data.vouchers || []);
      setBookings(bookingRes.data.bookings || []);
    } catch (err) {
      console.error('Lỗi tải dữ liệu cá nhân:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMessage(null);
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận mới không khớp!' });
      return;
    }

    try {
      const payload: any = { name, email };
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await API.put('/auth/profile', payload);
      onUpdateUser(res.data.user);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setMessage({ type: 'success', text: 'Cập nhật thông tin tài khoản thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể cập nhật hồ sơ!' });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

﻿  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '780px', 
          maxHeight: '90vh', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #161c28 0%, #0c0f16 100%)',
          border: '1px solid rgba(0, 242, 254, 0.35)',
          boxShadow: '0 25px 60px rgba(0, 242, 254, 0.2)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(0, 242, 254, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
                {user.name} {user.role === 'ADMIN' && <span style={{ fontSize: '11px', background: '#ff1744', color: '#fff', padding: '2px 8px', borderRadius: '10px', marginLeft: '6px' }}>ADMIN</span>}
              </h2>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{user.email}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 28px', gap: '12px', background: 'rgba(0, 0, 0, 0.2)' }}>
          {[
            { id: 'profile', label: 'Hồ Sơ & Bảo Mật', icon: UserIcon },
            { id: 'vouchers', label: 'Ví Voucher Của Tôi', icon: Gift, count: vouchers.length },
            { id: 'tickets', label: 'Kho Vé Điện Tử', icon: Ticket, count: bookings.length },
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
                  padding: '14px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #00f2fe' : '2px solid transparent',
                  color: isActive ? '#00f2fe' : '#94a3b8',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: '0.2s',
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
          <div style={{ margin: '16px 28px 0', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', background: message.type === 'success' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)', border: '1px solid ' + (message.type === 'success' ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 23, 68, 0.4)'), color: message.type === 'success' ? '#00e676' : '#ff5252' }}>
            {message.text}
          </div>
        )}

        {/* Tab Content */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {/* TAB 1: SỬA HỒ SƠ & MẬT KHẨU */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '480px' }}>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Họ và Tên</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '14px' }}
                />
              </div>

              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px', marginTop: '6px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '12px' }}>
                  Đổi Mật Khẩu (Để trống nếu không muốn đổi)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Mật khẩu hiện tại</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Mật khẩu mới</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Xác nhận mật khẩu mới</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 14px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="glow-btn" style={{ padding: '12px', marginTop: '10px', fontSize: '14px' }}>
                Lưu Thay Đổi Hồ Sơ
              </button>
            </form>
          )}

          {/* TAB 2: VÍ VOUCHER CỦA TÔI */}
          {activeTab === 'vouchers' && (
            <div>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>Đang tải ví voucher...</p>
              ) : vouchers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <p>Bạn chưa có mã Voucher nào trong ví.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                  {vouchers.map((v) => (
                    <div
                      key={v.id}
                      className="glass-panel"
                      style={{
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: v.userId ? '1px solid #ffd600' : '1px solid rgba(0, 242, 254, 0.3)',
                        background: v.userId ? 'linear-gradient(135deg, rgba(255,214,0,0.06), rgba(255,214,0,0.02))' : 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        {v.userId && (
                          <span style={{ fontSize: '10px', background: '#ffd600', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: '800', display: 'inline-block', marginBottom: '6px' }}>
                            🎁 QUÀ TẶNG DÀNH RIÊNG CHO BẠN
                          </span>
                        )}
                        <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#00f2fe', margin: '0 0 4px' }}>
                          {v.code}
                        </h4>
                        <p style={{ fontSize: '13px', fontWeight: '700', color: '#00e676', margin: '0 0 6px' }}>
                          {v.discountPercent ? `Giảm ${v.discountPercent}%` : `Giảm ${Number(v.discountAmount).toLocaleString('vi-VN')}đ`}
                        </p>
                        <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>
                          HSD: {new Date(v.expireAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ background: '#fff', padding: '6px', borderRadius: '8px' }}>
                          <QrCode size={48} color="#000" />
                        </div>
                        <button
                          onClick={() => handleCopyCode(v.code)}
                          style={{ background: copiedCode === v.code ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 255, 255, 0.08)', border: 'none', color: copiedCode === v.code ? '#00e676' : '#cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                        >
                          {copiedCode === v.code ? <><Check size={11} /> Đã chép</> : <><Copy size={11} /> Sao chép</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: KHO VÉ ẢO */}
          {activeTab === 'tickets' && (
            <div>
              {loading ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '30px' }}>Đang tải kho vé...</p>
              ) : bookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                  <p>Bạn chưa có vé xem phim nào.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {bookings.map((b) => (
                    <div key={b.id} className="glass-panel" style={{ padding: '18px', border: b.status === 'CONFIRMED' ? '1px solid rgba(0, 242, 254, 0.25)' : '1px solid rgba(255, 23, 68, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#00f2fe' }}>#{b.id.slice(0, 8).toUpperCase()}</span>
                          <span style={{ fontSize: '11px', color: b.status === 'CONFIRMED' ? '#00e676' : b.status === 'PENDING' ? '#ffd600' : '#ff5252', fontWeight: '700' }}>
                            {b.status === 'CONFIRMED' ? '• ĐÃ XÁC NHẬN' : b.status === 'PENDING' ? '• CHỜ DUYỆT' : '• ĐÃ HỦY'}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: '0 0 4px' }}>
                          {b.showtime?.movie?.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: '0 0 6px' }}>
                          {b.showtime?.room?.name} • {new Date(b.showtime?.startTime || b.createdAt).toLocaleString('vi-VN')}
                        </p>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <span style={{ fontSize: '11px', color: '#cbd5e1' }}>Ghế:</span>
                          {b.bookingSeats?.map((s: any) => (
                            <span key={s.id || s.seatId} style={{ background: '#00f2fe', color: '#000', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                              {s.seat?.label || 'Ghế'}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#00e676' }}>
                          {Number(b.totalPrice).toLocaleString('vi-VN')}đ
                        </span>
                        <div style={{ background: '#fff', padding: '6px', borderRadius: '8px' }}>
                          <QrCode size={54} color="#000" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
