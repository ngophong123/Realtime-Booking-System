import React, { useState, useEffect } from 'react';
import { X, Ticket, Clock, MapPin, QrCode, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Booking, User } from '../types';
import API from '../services/api';

interface MyTicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const MyTicketsModal: React.FC<MyTicketsModalProps> = ({ isOpen, onClose, user }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserBookings();
    }
  }, [isOpen, user]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get('/bookings');
      setBookings(res.data.bookings || []);
    } catch (err: any) {
      console.error('Lỗi khi tải lịch sử vé:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn vé này không?\nLưu ý: Chỉ áp dụng hủy trước suất chiếu ít nhất 12 tiếng.')) {
      return;
    }

    try {
      await API.post(`/bookings/${bookingId}/cancel`);
      setActionMessage({ type: 'success', text: 'Hủy vé thành công! Ghế đã được hoàn lại hệ thống.' });
      fetchUserBookings();
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Không thể hủy vé!' });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 150,
        padding: '20px',
      }}
    >
      <div
        className="cine-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '780px',
          maxHeight: '88vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-modal)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: 'var(--shadow-dropdown)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: '#FFFFFF',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ticket size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                VÉ XEM PHIM CỦA TÔI
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Lịch sử đặt vé và mã quét QR vào phòng chiếu
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-soft)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {actionMessage && (
          <div
            style={{
              margin: '12px 24px 0',
              padding: '10px 14px',
              borderRadius: 'var(--radius-input)',
              fontSize: '13px',
              backgroundColor: actionMessage.type === 'success' ? 'var(--success-soft)' : 'var(--danger-soft)',
              border: `1px solid ${actionMessage.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
              color: actionMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {actionMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{actionMessage.text}</span>
          </div>
        )}

        {/* Content Body */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, backgroundColor: 'var(--bg-soft)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Đang tải danh sách vé...
            </div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Ticket size={40} color="var(--text-light)" style={{ margin: '0 auto 12px' }} />
              <p style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px', color: 'var(--text)' }}>
                Bạn chưa có đơn vé nào.
              </p>
              <span style={{ fontSize: '13px' }}>Hãy đặt vé xem phim ngay trên trang chủ nhé!</span>
            </div>
          ) : (
            bookings.map((booking) => {
              const movie = booking.showtime?.movie;
              const room = booking.showtime?.room;
              const startTime = booking.showtime?.startTime ? new Date(booking.showtime.startTime) : new Date();
              const isCancelled = booking.status === 'CANCELLED';
              const isConfirmed = booking.status === 'CONFIRMED';
              const isPending = booking.status === 'PENDING';

              return (
                <div
                  key={booking.id}
                  className="cine-card"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: 'var(--radius-card)',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1fr',
                    opacity: isCancelled ? 0.6 : 1,
                  }}
                >
                  {/* Left Ticket Info */}
                  <div style={{ padding: '16px 20px', borderRight: '1.5px dashed var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: '800' }}>
                            MÃ VÉ: #{booking.id.slice(0, 8).toUpperCase()}
                          </span>
                          <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', margin: '2px 0 0', lineHeight: 1.3 }}>
                            {movie?.title}
                          </h3>
                        </div>
                        <span
                          className={`badge-status ${
                            isConfirmed ? 'badge-success' : isPending ? 'badge-primary' : 'badge-danger'
                          }`}
                        >
                          {isConfirmed ? 'ĐÃ XÁC NHẬN' : isPending ? 'CHỜ DUYỆT' : 'ĐÃ HỦY'}
                        </span>
                      </div>

                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="var(--primary)" /> {room?.name || 'Phòng chiếu'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} color="var(--primary)" /> {startTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} • {startTime.toLocaleDateString('vi-VN')}
                        </span>
                      </div>

                      <div style={{ backgroundColor: 'var(--bg-soft)', padding: '8px 12px', borderRadius: '6px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Ghế:</span>
                          <b style={{ color: 'var(--primary)' }}>
                            {booking.bookingSeats?.map((s) => s.seat?.label || s.seatId).join(', ') || 'Ghế'}
                          </b>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--text-muted)' }}>Tổng thanh toán:</span>
                          <b style={{ color: 'var(--text)' }}>
                            {Number(booking.totalPrice).toLocaleString('vi-VN')}đ
                          </b>
                        </div>
                      </div>
                    </div>

                    {!isCancelled && (
                      <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--danger)',
                            color: 'var(--danger)',
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-btn)',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--danger-soft)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Trash2 size={12} /> Hủy Vé
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right QR Code Stub */}
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
                    <div style={{ backgroundColor: '#FFFFFF', padding: '6px', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '6px' }}>
                      <QrCode size={80} color="#1A1D23" />
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)' }}>
                      MÃ QUÉT VÀO RẠP
                    </span>
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
