import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, CreditCard, QrCode, Smartphone, Gift, Heart } from 'lucide-react';
import type { Showtime, Seat } from '../types';
import API from '../services/api';
import { socket } from '../services/socket';

interface SeatMapProps {
  showtime: Showtime;
  onBack: () => void;
  onBookingSuccess: (bookingData: any) => void;
  onRequireAuth: () => void;
}

export const SeatMap = ({ showtime, onBack, onBookingSuccess, onRequireAuth }: SeatMapProps) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [bookedSeatIds, setBookedSeatIds] = useState<string[]>([]);
  const [heldSeats, setHeldSeats] = useState<{ [seatId: string]: string }>({});
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Voucher & Payment states
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'MOMO' | 'ZALOPAY' | 'VIETQR' | 'ATM'>('MOMO');

  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchShowtimeDetail = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/showtimes/${showtime.id}`);
        setSeats(res.data.showtime?.room?.seats || []);
        setBookedSeatIds(res.data.bookedSeatIds || []);

        const initialHolds: { [seatId: string]: string } = {};
        if (res.data.heldSeatIds) {
          res.data.heldSeatIds.forEach((id: string) => {
            initialHolds[id] = 'held_by_someone';
          });
        }
        setHeldSeats(initialHolds);
      } catch (err) {
        console.error('Lỗi khi tải thông tin suất chiếu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShowtimeDetail();

    socket.emit('showtime:join', showtime.id);

    const onSeatHeld = (data: { showtimeId: string; seatIds: string[]; userId: string }) => {
      if (data.showtimeId === showtime.id) {
        setHeldSeats((prev) => {
          const next = { ...prev };
          data.seatIds.forEach((id) => {
            next[id] = data.userId;
          });
          return next;
        });
      }
    };

    const onSeatReleased = (data: { showtimeId: string; seatIds: string[] }) => {
      if (data.showtimeId === showtime.id) {
        setHeldSeats((prev) => {
          const next = { ...prev };
          data.seatIds.forEach((id) => {
            delete next[id];
          });
          return next;
        });
        setBookedSeatIds((prev) => prev.filter((id) => !data.seatIds.includes(id)));
      }
    };

    const onSeatBooked = (data: { showtimeId: string; seatIds: string[] }) => {
      if (data.showtimeId === showtime.id) {
        setBookedSeatIds((prev) => [...prev, ...data.seatIds]);
        setHeldSeats((prev) => {
          const next = { ...prev };
          data.seatIds.forEach((id) => {
            delete next[id];
          });
          return next;
        });
        setSelectedSeatIds((prev) => prev.filter((id) => !data.seatIds.includes(id)));
      }
    };

    socket.on('seat:held', onSeatHeld);
    socket.on('seat:released', onSeatReleased);
    socket.on('seat:booked', onSeatBooked);

    return () => {
      socket.emit('showtime:leave', showtime.id);
      socket.off('seat:held', onSeatHeld);
      socket.off('seat:released', onSeatReleased);
      socket.off('seat:booked', onSeatBooked);
    };
  }, [showtime.id]);

  const handleToggleSeat = async (seat: Seat) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    setErrorMessage(null);
    const isSelected = selectedSeatIds.includes(seat.id);

    try {
      if (isSelected) {
        setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
        await API.post('/seathold/release', {
          showtimeId: showtime.id,
          seatIds: [seat.id],
        });
      } else {
        await API.post('/seathold/hold', {
          showtimeId: showtime.id,
          seatIds: [seat.id],
        });
        setSelectedSeatIds((prev) => [...prev, seat.id]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể giữ ghế này!';
      setErrorMessage(msg);
      // Nếu ghế bị người khác giữ hoặc mua mất, xóa khỏi selection
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
    }
  };

  const getSeatPrice = (type: string) => {
    const base = Number(showtime.price);
    if (type === 'VIP') return base + 20000;
    if (type === 'COUPLE') return base + 40000;
    return base;
  };

  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const subTotal = selectedSeats.reduce((sum, s) => sum + getSeatPrice(s.type), 0);

  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const finalPrice = Math.max(0, subTotal - discountAmount);

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    try {
      setVoucherLoading(true);
      setVoucherMessage(null);
      const res = await API.post('/vouchers/apply', {
        code: voucherCodeInput.trim(),
        orderAmount: subTotal,
      });
      setAppliedVoucher(res.data);
      setVoucherMessage({ type: 'success', text: `Áp dụng thành công! Đã giảm ${Number(res.data.discountAmount).toLocaleString('vi-VN')}đ` });
    } catch (err: any) {
      setAppliedVoucher(null);
      setVoucherMessage({ type: 'error', text: err.response?.data?.message || 'Mã giảm giá không hợp lệ!' });
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    if (selectedSeatIds.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một chiếc ghế!');
      return;
    }

    try {
      setBookingLoading(true);
      setErrorMessage(null);

      const res = await API.post('/bookings', {
        showtimeId: showtime.id,
        seatIds: selectedSeatIds,
        paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.voucher?.code : null,
      });

      onBookingSuccess(res.data.booking);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi thanh toán!';
      setErrorMessage(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  const rows = Array.from(new Set(seats.map((s) => s.row))).sort();

﻿  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#cbd5e1',
          padding: '8px 16px',
          borderRadius: '10px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontSize: '13px',
          fontWeight: '600',
        }}
      >
        <ArrowLeft size={16} /> Quay lại danh sách phim
      </button>

      {/* Thông tin suất chiếu */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '11px', color: '#00f2fe', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: '800' }}>
            RẠP CINEVERSE • {showtime.room?.name}
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#fff', margin: '4px 0' }}>
            {showtime.movie?.title}
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
            Khung giờ: {new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(showtime.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} ({new Date(showtime.startTime).toLocaleDateString('vi-VN')})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Ghế Thường</span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#00f2fe' }}>{Number(showtime.price).toLocaleString('vi-VN')}đ</span>
          </div>
          <div style={{ background: 'rgba(255, 214, 0, 0.05)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255, 214, 0, 0.2)' }}>
            <span style={{ fontSize: '11px', color: '#ffd600', display: 'block' }}>Ghế VIP</span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#ffd600' }}>{(Number(showtime.price) + 20000).toLocaleString('vi-VN')}đ</span>
          </div>
          <div style={{ background: 'rgba(255, 64, 129, 0.05)', padding: '10px 16px', borderRadius: '12px', border: '1px solid rgba(255, 64, 129, 0.2)' }}>
            <span style={{ fontSize: '11px', color: '#ff4081', display: 'block' }}>Ghế Đôi (Couple)</span>
            <span style={{ fontSize: '14px', fontWeight: '800', color: '#ff4081' }}>{(Number(showtime.price) + 40000).toLocaleString('vi-VN')}đ</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div style={{ marginBottom: '20px', padding: '14px 18px', borderRadius: '12px', background: 'rgba(255, 23, 68, 0.15)', border: '1px solid rgba(255, 23, 68, 0.4)', color: '#ff5252', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: '600' }}>
          <ShieldAlert size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Sơ đồ màn hình & Ma trận ghế */}
      <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', marginBottom: '28px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
          <div style={{ height: '5px', background: 'linear-gradient(90deg, transparent, #00f2fe, transparent)', borderRadius: '10px', boxShadow: '0 0 25px #00f2fe' }} />
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '4px', marginTop: '12px', display: 'inline-block' }}>
            MÀN HÌNH CHIẾU
          </span>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8', padding: '40px' }}>Đang tải sơ đồ phòng chiếu...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', overflowX: 'auto', padding: '10px' }}>
            {rows.map((row) => {
              const rowSeats = seats.filter((s) => s.row === row).sort((a, b) => a.column - b.column);
              return (
                <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', color: '#64748b', fontWeight: '800', fontSize: '12px' }}>{row}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {rowSeats.map((seat) => {
                      const isBooked = bookedSeatIds.includes(seat.id);
                      const isHeld = !!heldSeats[seat.id];
                      const isSelected = selectedSeatIds.includes(seat.id);
                      const isVIP = seat.type === 'VIP';
                      const isCouple = seat.type === 'COUPLE';

                      let bg = 'rgba(0, 242, 254, 0.08)';
                      let border = '1px solid rgba(0, 242, 254, 0.3)';
                      let color = '#00f2fe';

                      if (isVIP) {
                        bg = 'rgba(255, 214, 0, 0.1)';
                        border = '1px solid rgba(255, 214, 0, 0.4)';
                        color = '#ffd600';
                      } else if (isCouple) {
                        bg = 'rgba(255, 64, 129, 0.12)';
                        border = '1px solid rgba(255, 64, 129, 0.45)';
                        color = '#ff4081';
                      }

                      if (isBooked) {
                        bg = 'rgba(255, 23, 68, 0.18)';
                        border = '1px solid rgba(255, 23, 68, 0.3)';
                        color = '#ff5252';
                      } else if (isHeld && !isSelected) {
                        bg = 'rgba(255, 152, 0, 0.2)';
                        border = '1px solid rgba(255, 152, 0, 0.5)';
                        color = '#ff9800';
                      } else if (isSelected) {
                        bg = 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)';
                        border = '1px solid #fff';
                        color = '#000';
                      }

                      return (
                        <button
                          key={seat.id}
                          disabled={isBooked || (isHeld && !isSelected)}
                          onClick={() => handleToggleSeat(seat)}
                          title={`${seat.label} - ${isVIP ? 'VIP' : isCouple ? 'COUPLE' : 'Thường'} (${getSeatPrice(seat.type).toLocaleString('vi-VN')}đ)`}
                          style={{
                            width: isCouple ? '72px' : '38px',
                            height: '38px',
                            borderRadius: '8px',
                            border,
                            background: bg,
                            color,
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor: isBooked || (isHeld && !isSelected) ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            opacity: isBooked ? 0.35 : 1,
                            position: 'relative',
                            boxShadow: isSelected ? '0 0 14px rgba(0, 242, 254, 0.6)' : 'none',
                          }}
                        >
                          {isCouple && <Heart size={10} style={{ marginBottom: '-2px' }} />}
                          <span>{seat.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  <span style={{ width: '24px', color: '#64748b', fontWeight: '800', fontSize: '12px' }}>{row}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Chú thích loại ghế */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '36px', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '20px' }}>
          <LegendItem label="Ghế Thường" color="#00f2fe" bg="rgba(0, 242, 254, 0.15)" />
          <LegendItem label="Ghế VIP" color="#ffd600" bg="rgba(255, 214, 0, 0.15)" />
          <LegendItem label="Ghế Đôi (Couple)" color="#ff4081" bg="rgba(255, 64, 129, 0.15)" />
          <LegendItem label="Đang Chọn" color="#000" bg="linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)" />
          <LegendItem label="Đang Giữ" color="#ff9800" bg="rgba(255, 152, 0, 0.3)" />
          <LegendItem label="Đã Bán" color="#ff5252" bg="rgba(255, 23, 68, 0.3)" />
        </div>
      </div>

      {/* Thanh toán & Voucher */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="#00f2fe" /> Chọn Phương Thức Thanh Toán
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[
                { id: 'MOMO', name: 'Ví MoMo', desc: 'Quét mã MoMo tức thì', icon: Smartphone, color: '#d82d8b' },
                { id: 'ZALOPAY', name: 'Ví ZaloPay', desc: 'Thanh toán ZaloPay', icon: Smartphone, color: '#0068ff' },
                { id: 'VIETQR', name: 'VietQR / Ngân Hàng', desc: 'Chuyển khoản 24/7', icon: QrCode, color: '#00e676' },
                { id: 'ATM', name: 'Thẻ ATM / Visa', desc: 'Cổng thẻ nội địa & quốc tế', icon: CreditCard, color: '#ffd600' },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = paymentMethod === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setPaymentMethod(p.id as any)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${p.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Icon size={16} color={p.color} />
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{p.desc}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gift size={14} color="#ffd600" /> Mã Voucher Giảm Giá
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Nhập mã (VD: CINEVERSE10, VIP20K, SIEUDEAL50)"
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: '700',
                  }}
                />
                <button
                  type="button"
                  onClick={handleApplyVoucher}
                  disabled={voucherLoading || !voucherCodeInput.trim() || subTotal === 0}
                  className="glow-btn"
                  style={{ padding: '8px 16px', fontSize: '12px' }}
                >
                  {voucherLoading ? 'Đang kiểm tra...' : 'Áp Dụng'}
                </button>
              </div>

              {voucherMessage && (
                <span style={{ fontSize: '12px', display: 'block', marginTop: '6px', color: voucherMessage.type === 'success' ? '#00e676' : '#ff5252' }}>
                  {voucherMessage.text}
                </span>
              )}
            </div>
          </div>

          {/* Chi tiết đơn hàng */}
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
                Chi Tiết Đặt Vé
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                <span>Ghế đã chọn ({selectedSeats.length}):</span>
                <span style={{ color: '#fff', fontWeight: '700' }}>
                  {selectedSeats.map((s) => s.label).join(', ') || 'Chưa chọn'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '8px' }}>
                <span>Tạm tính:</span>
                <span style={{ color: '#fff' }}>{subTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              {appliedVoucher && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#00e676', marginBottom: '8px' }}>
                  <span>Voucher giảm giá ({appliedVoucher.voucher?.code}):</span>
                  <span>-{Number(appliedVoucher.discountAmount).toLocaleString('vi-VN')}đ</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', color: '#fff', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '12px', marginTop: '8px' }}>
                <span>Tổng Thanh Toán:</span>
                <span style={{ color: '#00e676', fontSize: '20px' }}>{finalPrice.toLocaleString('vi-VN')}đ</span>
              </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={bookingLoading || selectedSeatIds.length === 0}
              className="glow-btn"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '800',
                marginTop: '20px',
                opacity: selectedSeatIds.length === 0 ? 0.5 : 1,
                cursor: selectedSeatIds.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {bookingLoading ? 'Đang Xử Lý Thanh Toán...' : `Thanh Toán ${finalPrice.toLocaleString('vi-VN')}đ`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ label, color, bg }: { label: string; color: string; bg: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94a3b8' }}>
    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: bg, border: `1px solid ${color}` }} />
    <span>{label}</span>
  </div>
);
