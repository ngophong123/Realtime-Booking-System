import { useState, useEffect } from 'react';
import { ArrowLeft, ShieldAlert, CreditCard, QrCode, Smartphone, Gift, Heart, CheckCircle2, Tag, Check, Zap, Sparkles, User, Users } from 'lucide-react';
import type { Showtime, Seat, PaymentSetting, Voucher } from '../types';
import API from '../services/api';
import { socket } from '../services/socket';
import { findBestSeats, type AutoSelectMode } from '../utils/seatAlgorithm';

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

  // Smart Auto-Selection States
  const [autoQty, setAutoQty] = useState<number>(2);
  const [autoMode, setAutoMode] = useState<AutoSelectMode>('CENTER');
  const [autoSelectFeedback, setAutoSelectFeedback] = useState<string | null>(null);

  // Voucher states
  const [myVouchers, setMyVouchers] = useState<Voucher[]>([]);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherMessage, setVoucherMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<'MOMO' | 'ZALOPAY' | 'VIETQR' | 'ATM'>('MOMO');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting | null>(null);

  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    const fetchShowtimeDetail = async () => {
      try {
        setLoading(true);
        const [stRes, payRes] = await Promise.all([
          API.get(`/showtimes/${showtime.id}`),
          API.get('/payments/settings'),
        ]);
        setSeats(stRes.data.showtime?.room?.seats || []);
        setBookedSeatIds(stRes.data.bookedSeatIds || []);
        if (payRes.data.settings) {
          setPaymentSettings(payRes.data.settings);
        }

        const initialHolds: { [seatId: string]: string } = {};
        if (stRes.data.heldSeatIds) {
          stRes.data.heldSeatIds.forEach((id: string) => {
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

    // Tải danh sách voucher của User nếu đã đăng nhập
    if (currentUser) {
      API.get('/vouchers/my-vouchers')
        .then((res) => setMyVouchers(res.data.vouchers || []))
        .catch((err) => console.error('Lỗi tải voucher của tôi:', err));
    }

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
    setAutoSelectFeedback(null);
    const isSelected = selectedSeatIds.includes(seat.id);

    try {
      if (isSelected) {
        await API.post('/seathold/release', {
          showtimeId: showtime.id,
          seatIds: [seat.id],
        });
        setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
      } else {
        await API.post('/seathold/hold', {
          showtimeId: showtime.id,
          seatIds: [seat.id],
        });
        setSelectedSeatIds((prev) => [...prev, seat.id]);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể chọn ghế này! Ghế có thể đã có người giữ.';
      setErrorMessage(msg);
    }
  };

  // SMART AUTO-SELECT HANDLER
  const handleSmartAutoSelect = async () => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    setErrorMessage(null);
    setAutoSelectFeedback(null);

    const heldByOthers = Object.keys(heldSeats).filter((id) => !selectedSeatIds.includes(id));
    const bestSeats = findBestSeats({
      seats,
      bookedSeatIds,
      heldSeatIds: heldByOthers,
      quantity: autoQty,
      mode: autoMode,
    });

    if (!bestSeats || bestSeats.length === 0) {
      setErrorMessage(`Không tìm thấy cụm ${autoQty} ghế trống liền kề phù hợp với tiêu chuẩn đã chọn!`);
      return;
    }

    const newSeatIds = bestSeats.map((s) => s.id);
    const newLabels = bestSeats.map((s) => s.label).join(', ');

    try {
      // Release old selected seats if any
      if (selectedSeatIds.length > 0) {
        await API.post('/seathold/release', {
          showtimeId: showtime.id,
          seatIds: selectedSeatIds,
        });
      }

      // Hold the new best seats
      await API.post('/seathold/hold', {
        showtimeId: showtime.id,
        seatIds: newSeatIds,
      });

      setSelectedSeatIds(newSeatIds);
      setAutoSelectFeedback(`⚡ Đã tự động chọn ${autoQty} ghế đẹp nhất: [${newLabels}]!`);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Không thể giữ chỗ tự động! Vui lòng thử lại.');
    }
  };

  const applyVoucherByCode = async (codeToApply: string) => {
    if (!codeToApply.trim()) return;
    setVoucherLoading(true);
    setVoucherMessage(null);
    try {
      const res = await API.post('/vouchers/apply', {
        code: codeToApply.trim(),
        orderAmount: subTotal,
      });
      setAppliedVoucher(res.data);
      setVoucherCodeInput(codeToApply.trim());
      setVoucherMessage({ type: 'success', text: `Áp dụng thành công! Đã giảm ${Number(res.data.discountAmount).toLocaleString('vi-VN')}đ` });
    } catch (err: any) {
      setAppliedVoucher(null);
      setVoucherMessage({ type: 'error', text: err.response?.data?.message || 'Mã giảm giá không hợp lệ!' });
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleSelectQuickVoucher = (v: Voucher) => {
    if (appliedVoucher && appliedVoucher.voucher?.code === v.code) {
      setAppliedVoucher(null);
      setVoucherCodeInput('');
      setVoucherMessage(null);
    } else {
      applyVoucherByCode(v.code);
    }
  };

  const handleApplyVoucher = () => {
    applyVoucherByCode(voucherCodeInput);
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

    setBookingLoading(true);
    setErrorMessage(null);

    try {
      const res = await API.post('/bookings', {
        showtimeId: showtime.id,
        seatIds: selectedSeatIds,
        paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.voucher?.code : null,
      });

      onBookingSuccess(res.data.booking);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đặt vé thất bại! Vui lòng thử lại.';
      setErrorMessage(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  // Group seats by row
  const rowsMap: { [row: string]: Seat[] } = {};
  seats.forEach((seat) => {
    if (!rowsMap[seat.row]) rowsMap[seat.row] = [];
    rowsMap[seat.row].push(seat);
  });

  const rowKeys = Object.keys(rowsMap).sort();

  // Price Calculation with Seat Types
  const selectedSeats = seats.filter((s) => selectedSeatIds.includes(s.id));
  const basePrice = Number(showtime.price);

  const subTotal = selectedSeats.reduce((sum, seat) => {
    let price = basePrice;
    if (seat.type === 'VIP') price += 20000;
    if (seat.type === 'COUPLE') price += 40000;
    return sum + price;
  }, 0);

  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const finalPrice = Math.max(0, subTotal - discountAmount);

  // Determine QR URL to display
  let currentQrUrl = paymentSettings?.momoQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MOMO_PAYMENT';
  if (paymentMethod === 'VIETQR') currentQrUrl = paymentSettings?.vietQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VIETQR_PAYMENT';
  if (paymentMethod === 'ZALOPAY') currentQrUrl = paymentSettings?.zaloPayQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ZALOPAY_PAYMENT';

﻿  return (
    <div style={{ padding: '20px 0 60px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            padding: '8px 16px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '13px',
          }}
        >
          <ArrowLeft size={16} /> Quay Lại
        </button>
        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#fff', margin: 0 }}>
            {showtime.movie?.title}
          </h2>
          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
            {showtime.room?.name} • {new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(showtime.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} ({new Date(showtime.startTime).toLocaleDateString('vi-VN')})
          </span>
        </div>
      </div>

      {/* SMART SEAT AUTO-SELECTION TOOLBAR */}
      <div
        className="glass-panel"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.08) 0%, rgba(79, 172, 254, 0.04) 100%)',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: 'linear-gradient(135deg, #00f2fe, #4facfe)', padding: '6px', borderRadius: '8px', color: '#000', display: 'flex' }}>
            <Zap size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>TỰ ĐỘNG CHỌN GHẾ THÔNG MINH</span>
              <Sparkles size={13} color="#00f2fe" />
            </h4>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Thuật toán tìm vị trí xem phim &amp; âm thanh tốt nhất</span>
          </div>
        </div>

        {/* Quantity & Mode Controls */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {/* Quantity selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(0, 0, 0, 0.3)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            {[
              { qty: 1, label: '1 Vé', icon: User },
              { qty: 2, label: '2 Vé (Đôi)', icon: Users },
              { qty: 3, label: '3 Vé', icon: Users },
              { qty: 4, label: '4 Vé (Nhóm)', icon: Users },
            ].map((q) => (
              <button
                key={q.qty}
                type="button"
                onClick={() => setAutoQty(q.qty)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  background: autoQty === q.qty ? 'linear-gradient(135deg, #00f2fe, #4facfe)' : 'transparent',
                  color: autoQty === q.qty ? '#000' : '#cbd5e1',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Mode Selector */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'CENTER', label: '👑 Vị Trí Vàng', color: '#00f2fe' },
              { id: 'VIP', label: '🟨 Ghế VIP', color: '#ffd600' },
              { id: 'COUPLE', label: '💖 Ghế Đôi', color: '#f43f5e' },
              { id: 'BUDGET', label: '💸 Ghế Tiết Kiệm', color: '#00e676' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAutoMode(m.id as any)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '8px',
                  border: autoMode === m.id ? `1px solid ${m.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: autoMode === m.id ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: autoMode === m.id ? m.color : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSmartAutoSelect}
            className="glow-btn"
            style={{
              padding: '7px 16px',
              fontSize: '12px',
              fontWeight: '800',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={14} />
            <span>⚡ Chọn Nhanh {autoQty} Ghế</span>
          </button>
        </div>
      </div>

      {autoSelectFeedback && (
        <div style={{ background: 'rgba(0, 230, 118, 0.15)', border: '1px solid rgba(0, 230, 118, 0.4)', borderRadius: '12px', padding: '10px 16px', color: '#00e676', fontSize: '13px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} />
          <span>{autoSelectFeedback}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ background: 'rgba(255, 23, 68, 0.15)', border: '1px solid rgba(255, 23, 68, 0.4)', borderRadius: '12px', padding: '12px 18px', color: '#ff5252', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <ShieldAlert size={18} />
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{errorMessage}</span>
        </div>
      )}

      {/* Screen & Seat Grid Container */}
      <div className="glass-panel" style={{ padding: '36px', marginBottom: '24px', textAlign: 'center' }}>
        {/* Cinema Screen */}
        <div style={{ maxWidth: '680px', margin: '0 auto 48px', position: 'relative' }}>
          <div style={{ height: '4px', background: 'linear-gradient(90deg, transparent, #00f2fe, #4facfe, transparent)', borderRadius: '4px', boxShadow: '0 0 20px #00f2fe' }} />
          <span style={{ fontSize: '11px', color: '#64748b', letterSpacing: '4px', textTransform: 'uppercase', marginTop: '8px', display: 'block' }}>
            MÀN HÌNH CHIẾU
          </span>
        </div>

        {/* Seat Grid */}
        {loading ? (
          <div style={{ padding: '60px', color: '#94a3b8' }}>Đang tải sơ đồ ghế...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', overflowX: 'auto', padding: '10px' }}>
            {rowKeys.map((row) => {
              const rowSeats = rowsMap[row].sort((a, b) => a.column - b.column);
              return (
                <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '24px', color: '#64748b', fontWeight: '800', fontSize: '12px' }}>{row}</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {rowSeats.map((seat) => {
                      const isBooked = bookedSeatIds.includes(seat.id);
                      const isHeld = !!heldSeats[seat.id];
                      const isSelected = selectedSeatIds.includes(seat.id);

                      const isVip = seat.type === 'VIP';
                      const isCouple = seat.type === 'COUPLE';

                      let bg = 'rgba(255, 255, 255, 0.05)';
                      let border = '1px solid rgba(255, 255, 255, 0.15)';
                      let color = '#94a3b8';
                      let cursor = 'pointer';

                      if (isCouple) {
                        bg = 'rgba(244, 63, 94, 0.15)';
                        border = '1px solid rgba(244, 63, 94, 0.4)';
                        color = '#f43f5e';
                      } else if (isVip) {
                        bg = 'rgba(255, 214, 0, 0.15)';
                        border = '1px solid rgba(255, 214, 0, 0.4)';
                        color = '#ffd600';
                      }

                      if (isBooked) {
                        bg = 'rgba(255, 23, 68, 0.25)';
                        border = '1px solid rgba(255, 23, 68, 0.5)';
                        color = '#ff5252';
                        cursor = 'not-allowed';
                      } else if (isHeld && !isSelected) {
                        bg = 'rgba(255, 152, 0, 0.25)';
                        border = '1px solid rgba(255, 152, 0, 0.5)';
                        color = '#ff9800';
                        cursor = 'not-allowed';
                      } else if (isSelected) {
                        bg = 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)';
                        border = '1px solid #00f2fe';
                        color = '#000';
                      }

                      return (
                        <button
                          key={seat.id}
                          disabled={isBooked || (isHeld && !isSelected)}
                          onClick={() => handleToggleSeat(seat)}
                          style={{
                            width: isCouple ? '72px' : '36px',
                            height: '34px',
                            borderRadius: '8px',
                            background: bg,
                            border,
                            color,
                            fontSize: '11px',
                            fontWeight: '800',
                            cursor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '3px',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isCouple && <Heart size={10} color={isSelected ? '#000' : '#f43f5e'} />}
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
          <LegendItem label="Ghế VIP (+20k)" color="#ffd600" bg="rgba(255, 214, 0, 0.15)" />
          <LegendItem label="Ghế Đôi (+40k)" color="#f43f5e" bg="rgba(244, 63, 94, 0.15)" />
          <LegendItem label="Đang Chọn" color="#000" bg="linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)" />
          <LegendItem label="Đang Giữ" color="#ff9800" bg="rgba(255, 152, 0, 0.3)" />
          <LegendItem label="Đã Bán" color="#ff5252" bg="rgba(255, 23, 68, 0.3)" />
        </div>
      </div>

      {/* Thanh toán & Voucher */}
      <div className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={18} color="#00f2fe" /> Chọn Phương Thức Thanh Toán
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
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

            {/* Hiển thị QR Code Thanh Toán Rạp Cấu Hình */}
            {paymentMethod !== 'ATM' && (
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#fff', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  <img src={currentQrUrl} alt="Mã QR Thanh Toán" style={{ width: '90px', height: '90px', objectFit: 'contain' }} />
                </div>
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#00f2fe', margin: '0 0 4px' }}>
                    Quét Mã {paymentMethod === 'MOMO' ? 'Ví MoMo' : paymentMethod === 'ZALOPAY' ? 'Ví ZaloPay' : 'VietQR Ngân Hàng'}
                  </h4>
                  <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '0 0 4px' }}>
                    Chủ TK: <b>{paymentSettings?.bankAccountName || 'RAP PHIM CINEVERSE'}</b>
                  </p>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                    STK: {paymentSettings?.bankAccountNumber || '190368889999'} ({paymentSettings?.bankName || 'Techcombank'})
                  </span>
                </div>
              </div>
            )}

            {/* VOUCHER SELECTION & INPUT */}
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#cbd5e1', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Gift size={15} color="#ffd600" /> Mã Voucher Giảm Giá (Chọn nhanh bên dưới)
              </h4>

              {/* Quick Voucher Selector Chips */}
              {myVouchers.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  {myVouchers.map((v) => {
                    const isSelected = appliedVoucher && appliedVoucher.voucher?.code === v.code;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => handleSelectQuickVoucher(v)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '1px solid #00e676' : '1px solid rgba(255, 214, 0, 0.3)',
                          background: isSelected ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 214, 0, 0.06)',
                          color: isSelected ? '#00e676' : '#ffd600',
                          fontSize: '11px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <Tag size={12} />
                        <span>{v.code} ({v.discountPercent ? `-${v.discountPercent}%` : `-${Number(v.discountAmount).toLocaleString('vi-VN')}đ`})</span>
                        {isSelected && <Check size={12} />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Ô Nhập Voucher Thủ Công */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Nhập mã voucher (hoặc click chọn ở trên)"
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
                  {voucherLoading ? 'Đang áp dụng...' : 'Áp Dụng'}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {bookingLoading ? 'Đang Xử Lý Thanh Toán...' : <><CheckCircle2 size={18} /> Xác Nhận Đã Thanh Toán &amp; Đặt Vé</>}
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
