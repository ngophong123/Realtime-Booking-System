import { useState, useEffect, type FormEvent } from 'react';
import { X, Gift, Tag, Check, Copy, User, Lock, Mail, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { User as UserType, Voucher } from '../types';
import API from '../services/api';
import { RippleButton } from './common/RippleButton';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  onUserUpdate?: (updatedUser: UserType) => void;
}

export const ProfileModal = ({ isOpen, onClose, user, onUserUpdate }: ProfileModalProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'vouchers'>('profile');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Edit Profile Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name);
      setEmail(user.email);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setMessage(null);

      API.get('/vouchers/my-vouchers')
        .then((res) => setVouchers(res.data.vouchers || []))
        .catch((err) => console.error('Lỗi nạp voucher:', err));
    }
  }, [isOpen, user, activeTab]);

  if (!isOpen || !user) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận mới không khớp!' });
      return;
    }

    try {
      setLoading(true);
      const payload: any = { name, email };
      if (newPassword.trim()) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }

      const res = await API.put('/auth/profile', payload);
      setMessage({ type: 'success', text: 'Cập nhật thông tin tài khoản thành công!' });

      const updated = res.data.user;
      localStorage.setItem('user', JSON.stringify(updated));
      if (onUserUpdate) onUserUpdate(updated);

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể cập nhật thông tin tài khoản!' });
    } finally {
      setLoading(false);
    }
  };

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
          maxWidth: '580px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-modal)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: 'var(--shadow-dropdown)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
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
            zIndex: 10,
          }}
        >
          <X size={16} />
        </button>

        {/* User Profile Header */}
        <div
          style={{
            padding: '24px 28px 16px',
            backgroundColor: 'var(--bg-soft)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '20px',
              boxShadow: '0 4px 10px var(--primary-glow)',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                {user.name}
              </h2>
              <span
                style={{
                  backgroundColor: user.role === 'ADMIN' ? 'var(--primary-soft)' : 'var(--secondary-soft)',
                  color: user.role === 'ADMIN' ? 'var(--primary)' : 'var(--secondary)',
                  border: `1px solid ${user.role === 'ADMIN' ? 'var(--primary)' : 'var(--secondary)'}`,
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {user.role}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</span>
          </div>
        </div>

        {/* Tabs Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-soft)', padding: '0 28px' }}>
          <button
            onClick={() => { setActiveTab('profile'); setMessage(null); }}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'profile' ? '800' : '600',
              color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'profile' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <User size={15} />
            <span>Sửa Tài Khoản &amp; Mật Khẩu</span>
          </button>

          <button
            onClick={() => { setActiveTab('vouchers'); setMessage(null); }}
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: activeTab === 'vouchers' ? '800' : '600',
              color: activeTab === 'vouchers' ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'vouchers' ? '2.5px solid var(--primary)' : '2.5px solid transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Gift size={15} />
            <span>Ví Voucher ({vouchers.length})</span>
          </button>
        </div>

        {/* Message Banner */}
        {message && (
          <div
            style={{
              margin: '12px 28px 0',
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

        {/* Body Content */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, backgroundColor: '#FFFFFF' }}>
          {/* TAB 1: EDIT PROFILE FORM */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
                  Họ và Tên
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="cine-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text)', display: 'block', marginBottom: '4px' }}>
                  Địa Chỉ Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="cine-input"
                    style={{ paddingLeft: '36px' }}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', display: 'block', marginBottom: '10px' }}>
                  Đổi Mật Khẩu (Bỏ trống nếu không đổi)
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Mật khẩu hiện tại
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                      <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder="Nhập mật khẩu cũ..."
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="cine-input"
                          style={{ paddingLeft: '36px', paddingRight: '36px' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          style={{ position: 'absolute', right: '10px', top: '9px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        >
                          {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Mật khẩu mới
                      </label>
                      <div style={{ position: 'relative' }}>
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            placeholder="Mật khẩu mới..."
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="cine-input"
                            style={{ paddingRight: '36px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            style={{ position: 'absolute', right: '10px', top: '9px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          >
                            {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Xác nhận mật khẩu
                      </label>
                      <div style={{ position: 'relative' }}>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Nhập lại mật khẩu..."
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="cine-input"
                            style={{ paddingRight: '36px' }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: 'absolute', right: '10px', top: '9px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          >
                            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              <RippleButton
                type="submit"
                loading={loading}
                loadingText="Đang Lưu..."
                style={{ width: '100%', padding: '11px', marginTop: '8px', fontSize: '13px' }}
              >
                LƯU THAY ĐỔI TÀI KHOẢN
              </RippleButton>
            </form>
          )}

          {/* TAB 2: VOUCHERS WALLET */}
          {activeTab === 'vouchers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>
                  Ví Voucher Của Tôi ({vouchers.length})
                </span>
                <button
                  type="button"
                  onClick={() => {
                    API.get('/vouchers/my-vouchers')
                      .then((res) => setVouchers(res.data.vouchers || []))
                      .catch((err) => console.error('Lỗi nạp voucher:', err));
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  🔄 Làm mới
                </button>
              </div>
              {vouchers.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Bạn chưa có mã giảm giá nào. Hãy đón chờ các chương trình khuyến mãi và quà tặng từ rạp nhé!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {vouchers.map((v) => (
                    <div
                      key={v.id}
                      style={{
                        backgroundColor: 'var(--bg-soft)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-card)',
                        padding: '14px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <Tag size={14} color="var(--primary)" />
                          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                            {v.code}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700' }}>
                            {v.discountPercent ? `Giảm ${v.discountPercent}%` : `Giảm ${Number(v.discountAmount).toLocaleString('vi-VN')}đ`}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Đơn tối thiểu: {Number(v.minOrderAmount).toLocaleString('vi-VN')}đ • HSD: {new Date(v.expireAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopy(v.code)}
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--border)' }}
                      >
                        {copiedCode === v.code ? <><Check size={13} color="var(--success)" /> Đã chép</> : <><Copy size={13} /> Sao chép</>}
                      </button>
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
