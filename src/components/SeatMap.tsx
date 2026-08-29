import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, QrCode, Smartphone, Gift, Heart, CheckCircle2, Tag, Check, Zap, Sparkles, Clock, AlertCircle } from 'lucide-react';
import type { Showtime, Seat, PaymentSetting, Voucher } from '../types';
import API from '../services/api';
import { socket } from '../services/socket';
import { findBestSeats, type AutoSelectMode } from '../utils/seatAlgorithm';
import { RippleButton } from './common/RippleButton';

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
  const [justClickedSeatId, setJustClickedSeatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Smart Auto-Selection States
  const [autoQty, setAutoQty] = useState<number>(2);
  const [autoMode, setAutoMode] = useState<AutoSelectMode>('CENTER');
  const [autoSelectFeedback, setAutoSelectFeedback] = useState<string | null>(null);

  // Hold Countdown Timer (5 minutes)
  const [timeLeft, setTimeLeft] = useState<number>(300);

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

  // Hold Timer countdown
  useEffect(() => {
    if (selectedSeatIds.length === 0) {
      setTimeLeft(300);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          API.post('/seathold/release', { showtimeId: showtime.id, seatIds: selectedSeatIds });
          setSelectedSeatIds([]);
          setErrorMessage('Hết thời gian giữ ghế 5 phút! Vui lòng chọn lại ghế.');
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeatIds.length, showtime.id]);

  const handleToggleSeat = async (seat: Seat) => {
    if (!currentUser) {
      onRequireAuth();
      return;
    }

    setErrorMessage(null);
    setAutoSelectFeedback(null);
    setJustClickedSeatId(seat.id);

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
      setErrorMessage(`Không tìm thấy cụm ${autoQty} ghế trống liền kề phù hợp!`);
      return;
    }

    const newSeatIds = bestSeats.map((s) => s.id);
    const newLabels = bestSeats.map((s) => s.label).join(', ');

    try {
      if (selectedSeatIds.length > 0) {
        await API.post('/seathold/release', {
          showtimeId: showtime.id,
          seatIds: selectedSeatIds,
        });
      }

      await API.post('/seathold/hold', {
        showtimeId: showtime.id,
        seatIds: newSeatIds,
      });

      setSelectedSeatIds(newSeatIds);
      setAutoSelectFeedback(`⚡ Đã tự động chọn ${autoQty} vị trí đẹp nhất: [${newLabels}]!`);
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

  // Price Calculation
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

  // QR URLs
  let currentQrUrl = paymentSettings?.momoQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MOMO_PAYMENT';
  if (paymentMethod === 'VIETQR') currentQrUrl = paymentSettings?.vietQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=VIETQR_PAYMENT';
  if (paymentMethod === 'ZALOPAY') currentQrUrl = paymentSettings?.zaloPayQrUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=ZALOPAY_PAYMENT';

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ padding: '10px 0 60px' }}>
      {/* Header with Back button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          className="btn-outline"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <ArrowLeft size={16} /> Quay Lại Trang Chủ
        </button>

        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
            {showtime.movie?.title}
          </h2>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {showtime.room?.name} • {new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} - {new Date(showtime.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })} ({new Date(showtime.startTime).toLocaleDateString('vi-VN')})
          </span>
        </div>
      </div>

      {/* SMART SEAT AUTO-SELECTION BAR */}
      <div
        className="cine-card"
        style={{
          padding: '14px 20px',
          marginBottom: '20px',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              backgroundColor: 'var(--primary-soft)',
              padding: '8px',
              borderRadius: '8px',
              color: 'var(--primary)',
              display: 'flex',
            }}
          >
            <Zap size={18} />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>CHỌN GHẾ THÔNG MINH</span>
              <Sparkles size={13} color="var(--primary)" />
            </h4>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tự động chọn vị trí xem phim và âm thanh tốt nhất</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {/* Quantity */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: 'var(--bg-soft)', padding: '4px', borderRadius: '6px', border: '1px solid var(--border)' }}>
            {[1, 2, 3, 4].map((qty) => (
              <button
                key={qty}
                type="button"
                onClick={() => setAutoQty(qty)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: autoQty === qty ? 'var(--primary)' : 'transparent',
                  color: autoQty === qty ? '#FFFFFF' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {qty} Vé
              </button>
            ))}
          </div>

          {/* Mode */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'CENTER', label: '👑 Vị Trí Vàng' },
              { id: 'VIP', label: '🟨 Ghế VIP' },
              { id: 'COUPLE', label: '💖 Ghế Đôi' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setAutoMode(m.id as any)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: autoMode === m.id ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: autoMode === m.id ? 'var(--primary-soft)' : '#FFFFFF',
                  color: autoMode === m.id ? 'var(--primary)' : 'var(--text-muted)',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Run Button */}
          <RippleButton
            type="button"
            onClick={handleSmartAutoSelect}
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            <Zap size={14} />
            <span>Tự Động Chọn {autoQty} Ghế</span>
          </RippleButton>
        </div>
      </div>

      {autoSelectFeedback && (
        <div style={{ backgroundColor: 'var(--success-soft)', border: '1px solid var(--success)', borderRadius: 'var(--radius-input)', padding: '10px 16px', color: 'var(--success)', fontSize: '13px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} />
          <span>{autoSelectFeedback}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ backgroundColor: 'var(--danger-soft)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-input)', padding: '12px 18px', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '13px', fontWeight: '600' }}>{errorMessage}</span>
        </div>
      )}

      {/* MAIN 2-COLUMN LAYOUT: SEAT GRID (LEFT) & BOOKING SUMMARY PANEL (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        {/* Left: Seat Screen & Map */}
        <div className="cine-card" style={{ padding: '32px 24px', backgroundColor: '#FFFFFF', textAlign: 'center' }}>
          {/* Seat Map Legend at the Top */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '18px', marginBottom: '32px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '18px' }}>
            <LegendItem label="Ghế Thường" border="1px solid var(--border)" bg="#FFFFFF" />
            <LegendItem label="Ghế VIP (+20k)" border="1px solid #FFC107" bg="rgba(255, 193, 7, 0.18)" color="#B45309" />
            <LegendItem label="Ghế Đôi (+40k)" border="1px solid var(--primary)" bg="var(--primary-soft)" color="var(--primary)" />
            <LegendItem label="Đang Chọn" border="1px solid var(--primary)" bg="var(--primary)" color="#FFFFFF" />
            <LegendItem label="Đang Giữ" border="1px dashed var(--rating)" bg="rgba(255, 193, 7, 0.3)" />
            <LegendItem label="Đã Bán" border="1px solid #E5E7EB" bg="#E5E7EB" opacity={0.6} />
          </div>

          {/* Cinema Screen Curve */}
          <div style={{ maxWidth: '580px', margin: '0 auto 40px', position: 'relative' }}>
            <div
              style={{
                height: '8px',
                width: '100%',
                borderRadius: '50%',
                borderTop: '4px solid var(--primary)',
                boxShadow: '0 4px 15px rgba(255, 122, 26, 0.25)',
              }}
            />
            <span
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--text-muted)',
                letterSpacing: '4px',
                marginTop: '12px',
                display: 'block',
              }}
            >
              MÀN HÌNH CHIẾU
            </span>
          </div>

          {/* Seat Grid */}
          {loading ? (
            <div style={{ padding: '60px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                {Array.from({ length: 6 }).map((_, r) => (
                  <div key={r} style={{ display: 'flex', gap: '8px' }}>
                    {Array.from({ length: 8 }).map((_, c) => (
                      <div key={c} className="skeleton-shimmer" style={{ width: '36px', height: '34px', borderRadius: '6px' }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', overflowX: 'auto', padding: '10px 0' }}>
              {rowKeys.map((row) => {
                const rowSeats = rowsMap[row].sort((a, b) => a.column - b.column);
                return (
                  <div key={row} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '20px', color: 'var(--text-muted)', fontWeight: '700', fontSize: '12px' }}>{row}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {rowSeats.map((seat) => {
                        const isBooked = bookedSeatIds.includes(seat.id);
                        const isHeld = !bookedSeatIds.includes(seat.id) && !!heldSeats[seat.id];
                        const isSelected = selectedSeatIds.includes(seat.id);

                        const isVip = seat.type === 'VIP';
                        const isCouple = seat.type === 'COUPLE';

                        let bg = '#FFFFFF';
                        let border = '1px solid var(--border)';
                        let color = 'var(--text)';
                        let cursor = 'pointer';
                        let opacity = 1;

                        if (isCouple) {
                          bg = 'var(--primary-soft)';
                          border = '1.5px solid var(--primary)';
                          color = 'var(--primary)';
                        } else if (isVip) {
                          bg = 'rgba(255, 193, 7, 0.15)';
                          border = '1.5px solid #FFC107';
                          color = '#B45309';
                        }

                        if (isBooked) {
                          bg = '#E5E7EB';
                          border = '1px solid #D1D5DB';
                          color = '#9CA3AF';
                          cursor = 'not-allowed';
                          opacity = 0.6;
                        } else if (isHeld && !isSelected) {
                          bg = 'rgba(255, 193, 7, 0.25)';
                          border = '1.5px dashed #FFC107';
                          color = '#B45309';
                          cursor = 'not-allowed';
                          opacity = 0.7;
                        } else if (isSelected) {
                          bg = 'var(--primary)';
                          border = '1.5px solid var(--primary-hover)';
                          color = '#FFFFFF';
                        }

                        return (
                          <button
                            key={seat.id}
                            disabled={isBooked || (isHeld && !isSelected)}
                            onClick={() => handleToggleSeat(seat)}
                            className={isSelected && justClickedSeatId === seat.id ? 'seat-spring' : ''}
                            style={{
                              width: isCouple ? '76px' : '36px',
                              height: '34px',
                              borderRadius: '6px',
                              background: bg,
                              border,
                              color,
                              fontSize: '12px',
                              fontWeight: '700',
                              cursor,
                              opacity,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '3px',
                              transition: 'all 0.15s ease',
                              boxShadow: isSelected ? '0 4px 10px var(--primary-glow)' : 'none',
                            }}
                          >
                            {isCouple && <Heart size={11} fill={isSelected ? '#FFFFFF' : 'var(--primary)'} />}
                            <span>{seat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <span style={{ width: '20px', color: 'var(--text-muted)', fontWeight: '700', fontSize: '12px' }}>{row}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Booking Summary & Payment Sidebar (Fixed / Sticky) */}
        <div
          className="cine-card"
          style={{
            padding: '24px',
            backgroundColor: '#FFFFFF',
            position: 'sticky',
            top: '90px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {/* Order Details Header & Countdown */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                Thông Tin Đặt Vé
              </h3>

              {selectedSeats.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'var(--primary-soft)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '11px',
                    fontWeight: '800',
                  }}
                >
                  <Clock size={12} />
                  <span>GIỮ CHỖ: {formatTimer(timeLeft)}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Phim:</span>
                <b style={{ color: 'var(--text)' }}>{showtime.movie?.title}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Ghế đã chọn ({selectedSeats.length}):</span>
                <b style={{ color: 'var(--primary)' }}>
                  {selectedSeats.map((s) => s.label).join(', ') || 'Chưa chọn'}
                </b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tạm tính:</span>
                <b>{subTotal.toLocaleString('vi-VN')}đ</b>
              </div>
              {appliedVoucher && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Voucher giảm ({appliedVoucher.voucher?.code}):</span>
                  <b>-{Number(appliedVoucher.discountAmount).toLocaleString('vi-VN')}đ</b>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '10px', marginTop: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>Tổng Thanh Toán:</span>
                <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>
                  {finalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
            </div>
          </div>

          {/* VOUCHER QUICK SELECTOR & INPUT */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gift size={15} color="var(--primary)" /> Mã Voucher Giảm Giá
            </h4>

            {myVouchers.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                {myVouchers.map((v) => {
                  const isSelected = appliedVoucher && appliedVoucher.voucher?.code === v.code;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleSelectQuickVoucher(v)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-pill)',
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--primary-soft)' : '#FFFFFF',
                        color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Tag size={10} />
                      <span>{v.code}</span>
                      {isSelected && <Check size={11} />}
                    </button>
                  );
                })}
              </div>
            )}

            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                placeholder="Nhập mã voucher..."
                value={voucherCodeInput}
                onChange={(e) => setVoucherCodeInput(e.target.value.toUpperCase())}
                className="cine-input"
                style={{ fontSize: '12px', padding: '6px 10px' }}
              />
              <button
                type="button"
                onClick={handleApplyVoucher}
                disabled={voucherLoading || !voucherCodeInput.trim() || subTotal === 0}
                className="btn-outline"
                style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
              >
                {voucherLoading ? '...' : 'Áp Dụng'}
              </button>
            </div>
            {voucherMessage && (
              <span style={{ fontSize: '11px', display: 'block', marginTop: '4px', color: voucherMessage.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
                {voucherMessage.text}
              </span>
            )}
          </div>

          {/* PAYMENT METHODS & QR */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CreditCard size={15} color="var(--primary)" /> Phương Thức Thanh Toán
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
              {[
                { id: 'MOMO', name: 'Ví MoMo', icon: Smartphone },
                { id: 'ZALOPAY', name: 'ZaloPay', icon: Smartphone },
                { id: 'VIETQR', name: 'VietQR / NH', icon: QrCode },
                { id: 'ATM', name: 'Thẻ ATM/Visa', icon: CreditCard },
              ].map((p) => {
                const Icon = p.icon;
                const isSelected = paymentMethod === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPaymentMethod(p.id as any)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--primary-soft)' : '#FFFFFF',
                      color: isSelected ? 'var(--primary)' : 'var(--text)',
                      fontWeight: '700',
                      fontSize: '11px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Icon size={14} />
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>

            {/* QR Code Container */}
            {paymentMethod !== 'ATM' && (
              <div style={{ backgroundColor: 'var(--bg-soft)', border: '1px solid var(--border)', borderRadius: '8px', padding: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#FFFFFF', padding: '4px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  <img src={currentQrUrl} alt="QR Code" style={{ width: '64px', height: '64px', objectFit: 'contain', display: 'block' }} />
                </div>
                <div>
                  <h5 style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text)', margin: '0 0 2px' }}>
                    Quét Mã {paymentMethod === 'MOMO' ? 'Ví MoMo' : paymentMethod === 'ZALOPAY' ? 'ZaloPay' : 'VietQR Ngân Hàng'}
                  </h5>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                    Chủ TK: <b>{paymentSettings?.bankAccountName || 'RAP PHIM CINEVERSE'}</b>
                  </p>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    STK: {paymentSettings?.bankAccountNumber || '190368889999'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <RippleButton
            onClick={handleBooking}
            disabled={bookingLoading || selectedSeatIds.length === 0}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '800',
            }}
          >
            {bookingLoading ? (
              <span>Đang Xử Lý Đơn Vé...</span>
            ) : (
              <>
                <CheckCircle2 size={16} />
                <span>XÁC NHẬN ĐẶT VÉ ({finalPrice.toLocaleString('vi-VN')}đ)</span>
              </>
            )}
          </RippleButton>
        </div>
      </div>
    </div>
  );
};

const LegendItem = ({ label, border, bg, color = 'var(--text-muted)', opacity = 1 }: { label: string; border: string; bg: string; color?: string; opacity?: number }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>
    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: bg, border, opacity }} />
    <span style={{ color, fontWeight: '600' }}>{label}</span>
  </div>
);
