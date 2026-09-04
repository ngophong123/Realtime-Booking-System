import React, { useState, useRef, useEffect } from 'react';
import {
  Film,
  Menu,
  ShieldAlert,
  User as UserIcon,
  Ticket,
  Gift,
  UserCheck,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import type { User } from '../types';
import { NotificationDropdown } from './NotificationDropdown';
import { RippleButton } from './common/RippleButton';

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  onOpenAdmin: () => void;
  onOpenMyTickets: () => void;
  onOpenProfile: () => void;
  onOpenVouchers: () => void;
  onOpenSlideMenu: () => void;
  onSelectFilter?: (filter: 'now_showing' | 'coming_soon' | 'all') => void;
  isSocketConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onLogout,
  onGoHome,
  onOpenAdmin,
  onOpenMyTickets,
  onOpenProfile,
  onOpenVouchers,
  onOpenSlideMenu,
  onSelectFilter,
  isSocketConnected,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close user menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left: Logo & Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Logo */}
          <div
            onClick={onGoHome}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 10px var(--primary-glow)',
              }}
            >
              <Film size={22} />
            </div>
            <span
              style={{
                fontSize: '24px',
                fontWeight: '800',
                letterSpacing: '-0.5px',
                color: 'var(--secondary)',
              }}
            >
              CINE<span style={{ color: 'var(--primary)' }}>VERSE</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            <button
              onClick={() => {
                onGoHome();
                onSelectFilter?.('now_showing');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '6px 0',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
            >
              Phim Đang Chiếu
            </button>

            <button
              onClick={() => {
                onGoHome();
                onSelectFilter?.('coming_soon');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '6px 0',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
            >
              Phim Sắp Chiếu
            </button>

            <button
              onClick={() => {
                if (user) onOpenVouchers();
                else onOpenAuth();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text)',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '6px 0',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
            >
              <Gift size={15} color="var(--primary)" />
              <span>Ưu Đãi & Voucher</span>
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Socket Live Sync Badge */}
          <div
            title={isSocketConnected ? 'Hệ thống ghế kết nối trực tiếp Realtime' : 'Mất kết nối máy chủ'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: isSocketConnected ? 'var(--success-soft)' : 'var(--danger-soft)',
              color: isSocketConnected ? 'var(--success)' : 'var(--danger)',
              padding: '5px 10px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '11px',
              fontWeight: '700',
            }}
          >
            <span
              style={{
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: isSocketConnected ? 'var(--success)' : 'var(--danger)',
                display: 'inline-block',
                boxShadow: isSocketConnected ? '0 0 6px rgba(22, 163, 74, 0.6)' : 'none',
              }}
            />
            <span>LIVE SYNC</span>
          </div>

          {/* Admin Panel Button (nếu là Admin) */}
          {user?.role === 'ADMIN' && (
            <button
              onClick={onOpenAdmin}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--primary-soft)',
                border: '1px solid var(--primary)',
                color: 'var(--primary)',
                padding: '7px 12px',
                borderRadius: 'var(--radius-btn)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <ShieldAlert size={15} />
              <span>Admin Panel</span>
            </button>
          )}

          {/* Chuông Thông Báo (đặt ngay cạnh Avatar tài khoản) */}
          {user && (
            <NotificationDropdown
              user={user}
              onOpenMyTickets={onOpenMyTickets}
              onOpenProfile={onOpenProfile}
              onOpenVouchers={onOpenVouchers}
              onOpenAdmin={onOpenAdmin}
            />
          )}

          {/* User Logged In State / Avatar Dropdown */}
          {user ? (
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <div
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 10px 4px 4px',
                  backgroundColor: 'var(--bg-soft)',
                  borderRadius: '24px',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '14px',
                    boxShadow: '0 2px 6px var(--primary-glow)',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
              </div>

              {/* Dropdown Menu Box */}
              {isUserMenuOpen && (
                <div
                  className="cine-card animate-fade-in"
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: '0',
                    width: '250px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: 'var(--shadow-dropdown)',
                    zIndex: 130,
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', marginBottom: '4px' }}>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: 'var(--text)' }}>
                      {user.name}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.email}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenMyTickets();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'var(--text)',
                      textAlign: 'left',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-soft)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Ticket size={16} color="var(--primary)" />
                    <span>Vé của tôi</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenVouchers();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'var(--text)',
                      textAlign: 'left',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-soft)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Gift size={16} color="var(--primary)" />
                    <span>Ví Voucher của tôi</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenProfile();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      background: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: 'var(--text)',
                      textAlign: 'left',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-soft)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <UserCheck size={16} color="var(--primary)" />
                    <span>Chỉnh sửa tài khoản</span>
                  </button>

                  <div style={{ borderTop: '1px solid var(--border)', marginTop: '4px', paddingTop: '4px' }}>
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: 'var(--danger)',
                        textAlign: 'left',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-soft)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <LogOut size={16} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <RippleButton
              onClick={onOpenAuth}
              style={{
                padding: '8px 18px',
                fontSize: '13px',
              }}
            >
              <UserIcon size={16} />
              <span>Đăng Nhập</span>
            </RippleButton>
          )}

          {/* Hamburger Menu Toggle (triggers Slide-in Menu) */}
          <button
            onClick={onOpenSlideMenu}
            title="Mở menu"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-soft)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.color = 'var(--primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text)';
            }}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
