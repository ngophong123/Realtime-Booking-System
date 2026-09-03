import React, { useState } from 'react';
import {
  X,
  Search,
  Film,
  Gift,
  Ticket,
  User as UserIcon,
  ShieldCheck,
  ChevronDown,
  LogOut,
  MapPin,
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
  onSelectFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    movies: true,
    account: true,
  });

  if (!isOpen) return null;

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        className="animate-slide-right"
        style={{
          width: '100%',
          maxWidth: '380px',
          height: '100%',
          backgroundColor: '#FFFFFF',
          boxShadow: 'var(--shadow-drawer)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title & Close Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                color: 'var(--secondary)',
                fontWeight: '800',
                fontSize: '20px',
                letterSpacing: '-0.5px',
              }}
            >
              CINE<span style={{ color: 'var(--primary)' }}>VERSE</span>
            </span>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-soft)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="var(--text-light)"
              style={{ position: 'absolute', left: '12px', top: '12px' }}
            />
            <input
              type="text"
              placeholder="Tìm phim, diễn viên, rạp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="cine-input"
              style={{
                paddingLeft: '38px',
                backgroundColor: 'var(--bg-soft)',
                fontSize: '13px',
              }}
            />
          </div>
        </div>

        {/* Navigation List Accordion */}
        <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Section 1: Movies */}
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

          {/* Section 2: Cinema Locations & Prices */}
          <button
            onClick={onClose}
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
            <MapPin size={18} color="var(--secondary)" />
            <span>Rạp Toàn Quốc &amp; Giá Vé</span>
          </button>

          {/* Section 3: Promotions & Vouchers */}
          <button
            onClick={() => {
              if (user) onOpenProfile();
              else onOpenAuth();
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
            <span>Ưu Đãi &amp; Khuyến Mãi</span>
          </button>

          {/* Section 4: My Tickets */}
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
