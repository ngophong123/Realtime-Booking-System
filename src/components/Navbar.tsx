import { Film, User, LogOut, Radio, ShieldAlert, Ticket } from 'lucide-react';
import type { User as UserType } from '../types';

interface NavbarProps {
  user: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onGoHome: () => void;
  onOpenAdmin: () => void;
  onOpenMyTickets: () => void;
  isSocketConnected: boolean;
}

export const Navbar = ({
  user,
  onOpenAuth,
  onLogout,
  onGoHome,
  onOpenAdmin,
  onOpenMyTickets,
  isSocketConnected,
}: NavbarProps) => {
  return (
    <header style={{ background: 'rgba(10, 12, 16, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 32px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', position: 'sticky', top: 0, zIndex: 50, marginBottom: '32px' }}>
      <div 
        onClick={onGoHome}
        style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
      >
        <div style={{ background: 'linear-gradient(135deg, #00f2fe, #4facfe)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
          <Film size={24} color="#000" />
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '800', background: 'linear-gradient(to right, #00f2fe, #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
            CINEVERSE
          </h1>
          <span style={{ fontSize: '10px', color: '#94a3b8', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Realtime Cinema
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Live sync badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: isSocketConnected ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 23, 68, 0.1)', padding: '6px 12px', borderRadius: '20px', border: '1px solid ' + (isSocketConnected ? 'rgba(0, 230, 118, 0.3)' : 'rgba(255, 23, 68, 0.3)'), color: isSocketConnected ? '#00e676' : '#ff1744' }}>
          <Radio size={14} />
          <span>{isSocketConnected ? 'LIVE SYNC' : 'OFFLINE'}</span>
        </div>

        {/* If Admin -> Show Admin Portal button */}
        {user?.role === 'ADMIN' && (
          <button
            onClick={onOpenAdmin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, rgba(255, 23, 68, 0.2), rgba(255, 82, 82, 0.3))',
              border: '1px solid rgba(255, 23, 68, 0.5)',
              color: '#ff5252',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(255, 23, 68, 0.2)',
            }}
          >
            <ShieldAlert size={15} />
            <span>Quản Trị Rạp (Admin)</span>
          </button>
        )}

        {/* If User -> Show My Tickets button */}
        {user && (
          <button
            onClick={onOpenMyTickets}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#f8fafc',
              padding: '7px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            <Ticket size={15} color="#00f2fe" />
            <span>Vé Của Tôi</span>
          </button>
        )}

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', padding: '6px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <User size={16} color="#00f2fe" />
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#f8fafc' }}>{user.name}</span>
              <span style={{ fontSize: '10px', background: user.role === 'ADMIN' ? '#ff1744' : '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                {user.role}
              </span>
            </div>
            <button
              onClick={onLogout}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', padding: '6px 8px', borderRadius: '8px' }}
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="glow-btn"
            style={{ padding: '8px 18px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <User size={16} />
            <span>Đăng Nhập / Đăng Ký</span>
          </button>
        )}
      </div>
    </header>
  );
};
