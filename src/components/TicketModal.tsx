import { CheckCircle, X, QrCode } from 'lucide-react';
import type { Seat } from '../types';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: {
    id: string;
    movieTitle?: string;
    roomName?: string;
    startTime?: string;
    totalPrice: number | string;
    selectedSeats?: Seat[];
  } | null;
}

export const TicketModal = ({ isOpen, onClose, bookingData }: TicketModalProps) => {
  if (!isOpen || !bookingData) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '460px', 
          background: 'linear-gradient(135deg, #161b26 0%, #0d1117 100%)', 
          border: '1px solid rgba(0, 242, 254, 0.3)', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          position: 'relative',
          boxShadow: '0 25px 60px rgba(0, 242, 254, 0.2)'
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', zIndex: 10 }}
        >
          <X size={20} />
        </button>

        <div style={{ background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2), rgba(0, 230, 118, 0.2))', padding: '28px 24px 20px', textAlign: 'center', borderBottom: '1px dashed rgba(255, 255, 255, 0.15)' }}>
          <div style={{ display: 'inline-flex', background: '#00e676', padding: '10px', borderRadius: '50%', marginBottom: '12px' }}>
            <CheckCircle size={32} color="#000" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
            ĐẶT VÉ THÀNH CÔNG!
          </h2>
          <p style={{ fontSize: '12px', color: '#00f2fe', letterSpacing: '1px' }}>
            MÃ VÉ: #{bookingData.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ marginBottom: '18px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Phim Chiếu</span>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#fff', marginTop: '2px' }}>
              {bookingData.movieTitle}
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Phòng Chiếu</span>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginTop: '2px' }}>
                {bookingData.roomName}
              </p>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Thời Gian</span>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc', marginTop: '2px' }}>
                {bookingData.startTime ? new Date(bookingData.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''} ({bookingData.startTime ? new Date(bookingData.startTime).toLocaleDateString('vi-VN') : ''})
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Vị Trí Ghế</span>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                {bookingData.selectedSeats?.map((s) => (
                  <span key={s.id} style={{ background: '#00f2fe', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '800' }}>
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Tổng Tiền</span>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#00e676' }}>
                {Number(bookingData.totalPrice).toLocaleString('vi-VN')}đ
              </span>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '16px', background: '#fff', borderRadius: '12px', maxWidth: '160px', margin: '0 auto 20px' }}>
            <QrCode size={120} color="#000" style={{ margin: '0 auto' }} />
            <span style={{ fontSize: '10px', color: '#666', fontWeight: '700', marginTop: '4px', display: 'block' }}>QUÉT KHI VÀO CỔNG</span>
          </div>

          <button
            onClick={onClose}
            className="glow-btn"
            style={{ width: '100%', padding: '12px', fontSize: '14px' }}
          >
            Hoàn Tất
          </button>
        </div>
      </div>
    </div>
  );
};
