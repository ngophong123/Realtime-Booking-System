import React from 'react';
import {
  Film,
  Menu,
  ShieldAlert,
  User as UserIcon,
  Ticket,
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
  onOpenSlideMenu: () => void;
  onSelectFilter?: (filter: 'now_showing' | 'coming_soon' | 'all') => void;
  isSocketConnected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onGoHome,
  onOpenAdmin,
  onOpenMyTickets,
  onOpenProfile,
  onOpenSlideMenu,
  onSelectFilter,
  isSocketConnected,
}) => {
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
                if (user) onOpenProfile();
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
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text)')}
            >
              Ưu Đãi &amp; Voucher
            </button>
          </nav>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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

          {/* Notifications Dropdown */}
          <NotificationDropdown user={user} />

          {/* User Logged In State */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={onOpenMyTickets}
                className="btn-outline"
                style={{
                  padding: '8px 14px',
                  fontSize: '13px',
                  borderColor: 'var(--border)',
                }}
              >
                <Ticket size={16} color="var(--primary)" />
                <span>Vé Của Tôi</span>
              </button>

              {user.role === 'ADMIN' && (
                <button
                  onClick={onOpenAdmin}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: 'var(--primary-soft)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-btn)',
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                  }}
                >
                  <ShieldAlert size={16} />
                  <span>Admin Panel</span>
                </button>
              )}

              {/* Profile Avatar Button */}
              <div
                onClick={onOpenProfile}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px var(--primary-glow)',
                }}
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
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
