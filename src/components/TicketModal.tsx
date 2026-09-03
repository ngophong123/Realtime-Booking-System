import { X, CheckCircle2, QrCode, MapPin, Clock } from 'lucide-react';
import { RippleButton } from './common/RippleButton';

interface TicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: any;
}

export const TicketModal = ({ isOpen, onClose, bookingData }: TicketModalProps) => {
  if (!isOpen || !bookingData) return null;

  const movie = bookingData.showtime?.movie;
  const room = bookingData.showtime?.room;
  const startTime = bookingData.showtime?.startTime ? new Date(bookingData.showtime.startTime) : new Date();

  const seatNames =
    (Array.isArray(bookingData.seatLabels) && bookingData.seatLabels.length > 0
      ? bookingData.seatLabels.join(', ')
      : null) ||
    bookingData.bookingSeats?.map((s: any) => s.seat?.label || s.label || s.seatId).join(', ') ||
    bookingData.seats?.map((s: any) => s.seat?.label || s.label || s.seatId).join(', ') ||
    'Ghế đã chọn';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
          maxWidth: '620px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-modal)',
          overflow: 'hidden',
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
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            zIndex: 10,
          }}
        >
          <X size={16} />
        </button>

        {/* Top Header Banner */}
        <div
          style={{
            padding: '20px 24px',
            backgroundColor: 'var(--success-soft)',
            borderBottom: '1px solid rgba(22, 163, 74, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--success)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--success)', margin: 0 }}>
                ĐẶT VÉ THÀNH CÔNG!
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Vé điện tử đã được xác nhận và lưu vào mục "Vé Của Tôi"
              </span>
            </div>
          </div>

          <span
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
              color: 'var(--primary)',
              fontWeight: '800',
              fontSize: '12px',
              padding: '4px 10px',
              borderRadius: '6px',
            }}
          >
            #{bookingData.id?.slice(0, 8).toUpperCase()}
          </span>
        </div>

        {/* Ticket Content: 2 Stubs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', padding: '24px' }}>
          {/* Left Stub: Movie Details */}
          <div style={{ paddingRight: '20px', borderRight: '1.5px dashed var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', gap: '14px', marginBottom: '16px' }}>
                <img
                  src={movie?.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400'}
                  alt={movie?.title}
                  style={{ width: '70px', height: '95px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)' }}
                />
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--secondary)', fontWeight: '800', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    CINEVERSE CINEMA
                  </span>
                  <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', margin: '2px 0 6px', lineHeight: 1.3 }}>
                    {movie?.title}
                  </h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="var(--primary)" /> {room?.name || 'Phòng chiếu'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} color="var(--primary)" /> {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} • {startTime.toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seats & Payment Breakdown */}
              <div style={{ backgroundColor: 'var(--bg-soft)', borderRadius: '8px', padding: '12px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ghế ngồi:</span>
                  <b style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '13px' }}>
                    {seatNames}
                  </b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Thanh toán:</span>
                  <b style={{ color: 'var(--text)' }}>{bookingData.paymentMethod || 'Ví MoMo'}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '6px', fontSize: '13px' }}>
                  <span style={{ color: 'var(--text)', fontWeight: '700' }}>Tổng thanh toán:</span>
                  <b style={{ color: 'var(--primary)', fontSize: '15px' }}>
                    {Number(bookingData.totalPrice).toLocaleString('vi-VN')}đ
                  </b>
                </div>
              </div>
            </div>

            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '14px', display: 'block' }}>
              * Quý khách vui lòng đưa mã QR bên cạnh cho nhân viên soát vé tại rạp.
            </span>
          </div>

          {/* Right Stub: QR Code */}
          <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text)', textTransform: 'uppercase', marginBottom: '12px' }}>
              MÃ QUÉT VÀO CỔNG
            </span>
            <div style={{ backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '10px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
              <QrCode size={110} color="#1A1D23" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', marginTop: '8px' }}>
              CINEVERSE-{bookingData.id?.slice(0, 8).toUpperCase()}
            </span>

            <RippleButton
              onClick={onClose}
              style={{ width: '100%', padding: '9px', marginTop: '16px', fontSize: '13px' }}
            >
              HOÀN TẤT
            </RippleButton>
          </div>
        </div>
      </div>
    </div>
  );
};
