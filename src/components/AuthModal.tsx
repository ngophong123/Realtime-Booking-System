import { useState, type FormEvent } from 'react';
import { X, Lock, Mail, User as UserIcon } from 'lucide-react';
import API from '../services/api';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User, token: string) => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('matkhau123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onSuccess(res.data.user, res.data.token);
        onClose();
      } else {
        await API.post('/auth/register', { name, email, password });
        const res = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        onSuccess(res.data.user, res.data.token);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '420px', padding: '32px', position: 'relative' }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', color: '#fff', textAlign: 'center' }}>
          {isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
        </h2>
        <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '24px' }}>
          {isLogin ? 'Đăng nhập để đặt vé và giữ ghế Realtime' : 'Đăng ký tài khoản để trải nghiệm CINEVERSE'}
        </p>

        {error && (
          <div style={{ background: 'rgba(255, 23, 68, 0.15)', border: '1px solid rgba(255, 23, 68, 0.4)', color: '#ff5252', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {!isLogin && (
            <div>
              <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Họ và tên</label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 14px', gap: '10px' }}>
                <UserIcon size={16} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }}
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Email</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 14px', gap: '10px' }}>
              <Mail size={16} color="#94a3b8" />
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '6px', display: 'block' }}>Mật khẩu</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px 14px', gap: '10px' }}>
              <Lock size={16} color="#94a3b8" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100%', fontSize: '14px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glow-btn"
            style={{ width: '100%', marginTop: '8px', padding: '12px' }}
          >
            {loading ? 'Đang xử lý...' : isLogin ? 'Đăng Nhập' : 'Tạo Tài Khoản'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
          {isLogin ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
          <span
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            style={{ color: '#00f2fe', cursor: 'pointer', fontWeight: '600' }}
          >
            {isLogin ? 'Đăng ký ngay' : 'Đăng nhập'}
          </span>
        </div>
      </div>
    </div>
  );
};
