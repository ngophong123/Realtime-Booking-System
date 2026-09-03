import React, { useState } from 'react';
import {
  X,
  Film,
  Gift,
  Ticket,
  ShieldCheck,
  LogOut,
  User as UserIcon,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import type { User } from '../../types';

interface SlideInMenuProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenMyTickets: () => void;
  onOpenProfile: () => void;
  onOpenVouchers?: () => void;
  onSelectFilter?: (filter: 'now_showing' | 'coming_soon' | 'all') => void;
}

export const SlideInMenu: React.FC<SlideInMenuProps> = ({
  isOpen,
  onClose,
  user,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  onOpenMyTickets,
  onOpenProfile,
  onOpenVouchers,
  onSelectFilter,
}) => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    movies: true,
  });

  if (!isOpen) return null;

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(3px)',
        zIndex: 200,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-in"
        style={{
          width: '100%',
          maxWidth: '360px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              <Film size={18} />
            </div>
            <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--secondary)' }}>
              CINE<span style={{ color: 'var(--primary)' }}>VERSE</span>
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Navigation Links */}
        <div style={{ padding: '20px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Section 1: Phim & Lịch Chiếu */}
          <div>
            <button
              onClick={() => toggleSection('movies')}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                color: 'var(--text)',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Film size={18} color="var(--primary)" />
                <span>Phim Chiếu Rạp</span>
              </div>
              <ChevronDown
                size={16}
                color="var(--text-muted)"
                style={{
                  transform: openSections.movies ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s ease',
                }}
              />
            </button>

            {openSections.movies && (
              <div style={{ paddingLeft: '42px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px' }}>
                <button
                  onClick={() => {
                    onSelectFilter?.('now_showing');
                    onClose();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 0',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  🔥 Phim Đang Chiếu
                </button>
                <button
                  onClick={() => {
                    onSelectFilter?.('coming_soon');
                    onClose();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 0',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  ⏳ Phim Sắp Chiếu
                </button>
                <button
                  onClick={() => {
                    onSelectFilter?.('all');
                    onClose();
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: '8px 0',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  🎬 Tất Cả Suất Chiếu
                </button>
              </div>
            )}
          </div>

          {/* Section 2: Vouchers & Wallet */}
          <button
            onClick={() => {
              if (onOpenVouchers) onOpenVouchers();
              else if (onOpenProfile) onOpenProfile();
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 14px',
              background: 'transparent',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '700',
              fontSize: '14px',
              color: 'var(--text)',
              textAlign: 'left',
            }}
          >
            <Gift size={18} color="var(--primary)" />
            <span>Ví Voucher & Ưu Đãi</span>
          </button>

          {/* Section 3: My Tickets */}
          {user && (
            <button
              onClick={() => {
                onOpenMyTickets();
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                color: 'var(--text)',
                textAlign: 'left',
              }}
            >
              <Ticket size={18} color="var(--primary)" />
              <span>Vé Của Tôi</span>
            </button>
          )}

          {/* Section 4: Edit Profile */}
          {user && (
            <button
              onClick={() => {
                onOpenProfile();
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                color: 'var(--text)',
                textAlign: 'left',
              }}
            >
              <UserCheck size={18} color="var(--primary)" />
              <span>Chỉnh Sửa Tài Khoản</span>
            </button>
          )}

          {/* Section 5: Admin Panel */}
          {user?.role === 'ADMIN' && (
            <button
              onClick={() => {
                onOpenAdmin();
                onClose();
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 14px',
                background: 'var(--primary-soft)',
                border: '1px solid var(--primary-glow)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '14px',
                color: 'var(--primary)',
                textAlign: 'left',
              }}
            >
              <ShieldCheck size={18} color="var(--primary)" />
              <span>Trang Quản Trị Rạp</span>
            </button>
          )}
        </div>

        {/* Footer Account Actions */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg-soft)' }}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                onClick={() => {
                  onOpenProfile();
                  onClose();
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '16px',
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: 'var(--text)' }}>
                    {user.name}
                  </h4>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="btn-outline"
                style={{ width: '100%', padding: '8px', fontSize: '13px', color: 'var(--danger)', borderColor: 'var(--border)' }}
              >
                <LogOut size={15} /> Đăng Xuất
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                onOpenAuth();
                onClose();
              }}
              className="btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              <UserIcon size={16} /> Đăng Nhập / Đăng Ký
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
