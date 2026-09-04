import { useState, useEffect, type FormEvent } from 'react';
import { X, Mail, Lock, User, ShieldAlert, Film, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { User as UserType } from '../types';
import API from '../services/api';
import { RippleButton } from './common/RippleButton';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
  initialMessage?: string | null;
}

export const AuthModal = ({ isOpen, onClose, onAuthSuccess, initialMessage }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialMessage) {
        setNotice(initialMessage);
      } else {
        setNotice(null);
      }
      setError(null);
    }
  }, [isOpen, initialMessage]);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await API.post('/auth/login', { email: email.trim(), password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
      } else {
        const res = await API.post('/auth/register', { name: name.trim(), email: email.trim(), password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onAuthSuccess(res.data.user);
      }
    } catch (err: any) {
      setNotice(null);
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không chính xác! Vui lòng thử lại.');
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
        zIndex: 200,
        padding: '20px',
      }}
    >
      <div
        className="cine-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: 'var(--radius-modal)',
          padding: '36px 32px',
          position: 'relative',
          backgroundColor: '#FFFFFF',
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
          }}
        >
          <X size={16} />
        </button>

        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}
          >
            <Film size={26} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', margin: '0 0 6px' }}>
            {isLogin ? 'ĐĂNG NHẬP CINEVERSE' : 'TẠO TÀI KHOẢN MỚI'}
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {isLogin ? 'Chào mừng bạn trở lại với rạp chiếu phim Cineverse' : 'Đăng ký nhận ngay voucher xem phim đặc quyền'}
          </span>
        </div>

        {/* Global Notice (Vui lòng đăng nhập!) */}
        {notice && (
          <div
            style={{
              backgroundColor: 'var(--primary-soft)',
              border: '1.5px solid var(--primary)',
              borderRadius: 'var(--radius-input)',
              padding: '12px 14px',
              color: 'var(--primary-hover)',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
              animation: 'fadeIn 0.2s ease-out',
            }}
          >
            <AlertCircle size={18} />
            <span>{notice}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: 'var(--danger-soft)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-input)',
              padding: '10px 14px',
              color: 'var(--danger)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px',
            }}
          >
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
                Họ và Tên
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="cine-input"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
              Địa Chỉ Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="cine-input"
                style={{ paddingLeft: '36px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700', display: 'block', marginBottom: '5px' }}>
              Mật Khẩu
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-light)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="cine-input"
                style={{ paddingLeft: '36px', paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <RippleButton
            type="submit"
            loading={loading}
            loadingText="Đang Xử Lý..."
            style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '14px', fontWeight: '700' }}
          >
            {isLogin ? 'ĐĂNG NHẬP NGAY' : 'ĐĂNG KÝ TÀI KHOẢN'}
          </RippleButton>
        </form>

        {/* Footer switch mode text link */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <span>{isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}</span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
              setNotice(null);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập ngay'}
          </button>
        </div>
      </div>
    </div>
  );
};
