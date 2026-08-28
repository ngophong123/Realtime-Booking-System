import { useState, useEffect } from 'react';
import { X, Ticket, QrCode, RotateCcw, Clock } from 'lucide-react';
import API from '../services/api';

interface MyTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCancelSuccess?: () => void;
}

export const MyTicketsModal = ({ isOpen, onClose, onCancelSuccess }: MyTicketsModalProps) => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMyBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookings');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Lỗi tải vé:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMessage(null);
      fetchMyBookings();
    }
  }, [isOpen]);

  const handleCancelBooking = async (b: any) => {
    const startTime = new Date(b.showtime?.startTime).getTime();
    const now = Date.now();
    const hoursLeft = (startTime - now) / (1000 * 60 * 60);

    if (hoursLeft < 12) {
      alert(`⚠️ CHÍNH SÁCH RẠP CINEVERSE:\nSuất chiếu sẽ diễn ra trong vòng ${Math.max(0, hoursLeft).toFixed(1)} tiếng nữa (ít hơn 12 tiếng).\nBạn không thể hủy vé này theo quy định của rạp!`);
      return;
    }

    if (!window.confirm('Bạn có chắc muốn hủy vé này không?\nGhế sẽ được giải phóng ngay lập tức cho khách khác trên hệ thống.')) return;

    try {
      await API.post(`/bookings/${b.id}/cancel`);
      setMessage({ type: 'success', text: 'Hủy vé thành công! Ghế đã được mở lại cho người khác.' });
      fetchMyBookings();
      if (onCancelSuccess) onCancelSuccess();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể hủy vé!' });
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 95, padding: '20px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '720px', 
          maxHeight: '88vh', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #161b26 0%, #0a0d14 100%)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 242, 254, 0.15)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Ticket size={20} color="#00f2fe" />
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
              VÉ ĐÃ ĐẶT CỦA TÔI ({bookings.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Thông báo chính sách 12 tiếng */}
        <div style={{ margin: '14px 24px 0', padding: '10px 14px', borderRadius: '10px', background: 'rgba(255, 214, 0, 0.08)', border: '1px solid rgba(255, 214, 0, 0.25)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ffd600' }}>
          <Clock size={16} />
          <span><strong>Chính sách rạp:</strong> Quý khách chỉ có thể hủy vé trước khi suất chiếu bắt đầu ít nhất <strong>12 tiếng</strong>.</span>
        </div>

        {message && (
          <div style={{ margin: '14px 24px 0', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', background: message.type === 'success' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)', border: '1px solid ' + (message.type === 'success' ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 23, 68, 0.4)'), color: message.type === 'success' ? '#00e676' : '#ff5252' }}>
            {message.text}
          </div>
        )}

        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {loading ? (
            <p style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>Đang tải danh sách vé...</p>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
              <p>Bạn chưa có vé xem phim nào.</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Hãy chọn một bộ phim và đặt vé ngay nhé!</p>
            </div>
          ) : (
            bookings.map((b) => {
              const startTime = new Date(b.showtime?.startTime).getTime();
              const now = Date.now();
              const hoursLeft = (startTime - now) / (1000 * 60 * 60);
              const canCancel = hoursLeft >= 12;

              return (
                <div 
                  key={b.id} 
                  className="glass-panel" 
                  style={{ 
                    padding: '18px', 
                    border: b.status === 'CONFIRMED' ? '1px solid rgba(0, 242, 254, 0.2)' : '1px solid rgba(255, 23, 68, 0.2)', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                    opacity: b.status === 'CANCELLED' ? 0.6 : 1
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '11px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
                        #{b.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', color: b.status === 'CONFIRMED' ? '#00e676' : '#ff5252', fontWeight: '700' }}>
                        {b.status === 'CONFIRMED' ? '• ĐÃ XÁC NHẬN' : '• ĐÃ HỦY'}
                      </span>
                      {b.paymentMethod && (
                        <span style={{ fontSize: '10px', background: 'rgba(255, 255, 255, 0.08)', color: '#cbd5e1', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                          {b.paymentMethod}
                        </span>
                      )}
                    </div>

                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: '0 0 6px' }}>
                      {b.showtime?.movie?.title}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
                      <span>{b.showtime?.room?.name}</span>
                      <span>•</span>
                      <span>{new Date(b.showtime?.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} ({new Date(b.showtime?.startTime).toLocaleDateString('vi-VN')})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: b.status === 'CONFIRMED' ? '10px' : '0' }}>
                      <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Ghế:</span>
                      {b.bookingSeats?.map((s: any) => (
                        <span key={s.id || s.seatId} style={{ background: b.status === 'CONFIRMED' ? '#00f2fe' : '#475569', color: b.status === 'CONFIRMED' ? '#000' : '#f2f2f2', padding: '1px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                          {s.seat?.label || 'Ghế'}
                        </span>
                      ))}
                    </div>

                    {b.status === 'CONFIRMED' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                        <button
                          onClick={() => handleCancelBooking(b)}
                          disabled={!canCancel}
                          style={{
                            background: canCancel ? 'rgba(255, 23, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                            border: canCancel ? '1px solid rgba(255, 23, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                            color: canCancel ? '#ff5252' : '#64748b',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: canCancel ? 'pointer' : 'not-allowed',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <RotateCcw size={12} /> Hủy vé này
                        </button>
                        {!canCancel && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            (Còn &lt;12h trước giờ chiếu)
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '800', color: b.status === 'CONFIRMED' ? '#00e676' : '#94a3b8' }}>
                      {Number(b.totalPrice).toLocaleString('vi-VN')}đ
                    </span>
                    <div style={{ background: '#fff', padding: '6px', borderRadius: '8px', opacity: b.status === 'CONFIRMED' ? 1 : 0.4 }}>
                      <QrCode size={52} color="#000" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
