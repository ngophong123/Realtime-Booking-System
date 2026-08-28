import { X, CheckCircle2, QrCode, MapPin, Clock, Film } from 'lucide-react';

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

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110, padding: '20px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '520px', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          background: 'linear-gradient(145deg, #182030 0%, #0c1018 100%)',
          border: '1px solid rgba(0, 242, 254, 0.4)',
          boxShadow: '0 25px 70px rgba(0, 242, 254, 0.25)',
          position: 'relative',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
        >
          <X size={18} />
        </button>

        <div style={{ padding: '28px 28px 20px', textAlign: 'center', borderBottom: '1px dashed rgba(255, 255, 255, 0.15)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.4)', color: '#00e676', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <CheckCircle2 size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: '0 0 4px' }}>
            ĐẶT VÉ THÀNH CÔNG!
          </h2>
          <span style={{ fontSize: '12px', color: '#00f2fe', fontWeight: '700' }}>
            MÃ VÉ ĐIỆN TỬ: #{bookingData.id?.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <img
              src={movie?.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'}
              alt={movie?.title}
              style={{ width: '70px', height: '95px', objectFit: 'cover', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.1)' }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', color: '#ffd600', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                <Film size={12} /> CINEVERSE PREMIUM CINEMA
              </span>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#fff', margin: '0 0 6px', lineHeight: 1.2 }}>
                {movie?.title}
              </h3>
              <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={12} color="#00f2fe" /> {room?.name || 'Phòng chiếu CINEVERSE'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={12} color="#00f2fe" /> {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} • {startTime.toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '14px', padding: '14px 18px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#94a3b8' }}>Ghế ngồi:</span>
              <span style={{ color: '#00f2fe', fontWeight: '800' }}>
                {bookingData.seats?.map((s: any) => s.seat?.label || s.seatId).join(', ') || 'Ghế đã chọn'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
              <span style={{ color: '#94a3b8' }}>Hình thức thanh toán:</span>
              <span style={{ color: '#fff', fontWeight: '700' }}>{bookingData.paymentMethod || 'Ví MoMo'}</span>
            </div>
            {bookingData.voucherCode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                <span style={{ color: '#00e676' }}>Voucher giảm giá:</span>
                <span style={{ color: '#00e676', fontWeight: '700' }}>{bookingData.voucherCode}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '10px', marginTop: '6px' }}>
              <span style={{ color: '#fff' }}>Tổng thanh toán:</span>
              <span style={{ color: '#00e676', fontSize: '18px' }}>{Number(bookingData.totalPrice).toLocaleString('vi-VN')}đ</span>
            </div>
          </div>

          {/* QR Code */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: '#fff', display: 'inline-block', padding: '12px', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)' }}>
              <QrCode size={130} color="#000" />
            </div>
            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '10px' }}>
              * Quét mã QR tại cổng kiểm soát vé hoặc quầy tự động để vào phòng chiếu
            </span>
          </div>

          <button
            onClick={onClose}
            className="glow-btn"
            style={{ width: '100%', padding: '12px', marginTop: '20px', fontSize: '14px' }}
          >
            Đã Lưu Vào "Vé Của Tôi" &amp; Hoàn Tất
          </button>
        </div>
      </div>
    </div>
  );
};
