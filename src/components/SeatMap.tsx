import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { Showtime, Seat } from '../types';
import API from '../services/api';
import { socket } from '../services/socket';

interface SeatMapProps {
  showtime: Showtime;
  onBack: () => void;
  onBookingSuccess: (bookingData: any) => void;
  onRequireAuth: () => void;
}

export const SeatMap = ({
  showtime,
  onBack,
  onBookingSuccess,
  onRequireAuth,
}: SeatMapProps) => {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState<number>(300);

  const fetchSeatMap = async () => {
    try {
      setLoading(true);
      const res = await API.get('/showtimes/' + showtime.id + '/seats');
      setSeats(res.data.seats);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Không thể tải sơ đồ ghế!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeatMap();

    socket.emit('join:showtime', showtime.id);

    const handleSeatHeld = (data: { showtimeId: string; seatIds: string[]; userId: string }) => {
      if (data.showtimeId === showtime.id) {
        setSeats((prev) =>
          prev.map((s) =>
            data.seatIds.includes(s.id) ? { ...s, status: 'HOLDING' as const } : s
          )
        );
      }
    };

    const handleSeatReleased = (data: { showtimeId: string; seatIds: string[] }) => {
      if (data.showtimeId === showtime.id) {
        setSeats((prev) =>
          prev.map((s) =>
            data.seatIds.includes(s.id) ? { ...s, status: 'AVAILABLE' as const } : s
          )
        );
      }
    };

    const handleSeatBooked = (data: { showtimeId: string; seatIds: string[] }) => {
      if (data.showtimeId === showtime.id) {
        setSeats((prev) =>
          prev.map((s) =>
            data.seatIds.includes(s.id) ? { ...s, status: 'BOOKED' as const } : s
          )
        );
        setSelectedSeatIds((prev) => prev.filter((id) => !data.seatIds.includes(id)));
      }
    };

    socket.on('seat:held', handleSeatHeld);
    socket.on('seat:released', handleSeatReleased);
    socket.on('seat:booked', handleSeatBooked);

    return () => {
      socket.emit('leave:showtime', showtime.id);
      socket.off('seat:held', handleSeatHeld);
      socket.off('seat:released', handleSeatReleased);
      socket.off('seat:booked', handleSeatBooked);
    };
  }, [showtime.id]);

  useEffect(() => {
    if (selectedSeatIds.length === 0) {
      setCountdown(300);
      return;
    }
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSelectedSeatIds([]);
          fetchSeatMap();
          return 300;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedSeatIds.length]);

  const handleSeatClick = async (seat: Seat) => {
    setErrorMessage('');
    const token = localStorage.getItem('token');
    if (!token) {
      onRequireAuth();
      return;
    }

    if (seat.status === 'BOOKED') {
      setErrorMessage('Ghế ' + seat.label + ' đã có người mua!');
      return;
    }

    const isCurrentlySelected = selectedSeatIds.includes(seat.id);

    if (isCurrentlySelected) {
      try {
        await API.post('/seathold/release', {
          showtimeId: showtime.id,
          seatIds: [seat.id],
        });
        setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id));
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || 'Lỗi khi hủy giữ ghế!');
      }
    } else {
      if (seat.status === 'HOLDING' && !seat.isMine) {
        setErrorMessage('Ghế ' + seat.label + ' đang được người khác giữ chỗ!');
        return;
      }

      try {
        await API.post('/seathold', {
          showtimeId: showtime.id,
          seatIds: [seat.id],
        });
        setSelectedSeatIds((prev) => [...prev, seat.id]);
        setCountdown(300);
      } catch (err: any) {
        setErrorMessage(err.response?.data?.message || 'Không thể giữ ghế lúc này!');
        fetchSeatMap();
      }
    }
  };

  const handleBooking = async () => {
    if (selectedSeatIds.length === 0) return;
    setErrorMessage('');
    setBookingLoading(true);

    try {
      const res = await API.post('/bookings', {
        showtimeId: showtime.id,
        seatIds: selectedSeatIds,
      });
      onBookingSuccess({
        ...res.data.booking,
        movieTitle: showtime.movie?.title,
        roomName: showtime.room?.name,
        startTime: showtime.startTime,
        selectedSeats: seats.filter((s) => selectedSeatIds.includes(s.id)),
      });
      setSelectedSeatIds([]);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Đặt vé thất bại!');
      fetchSeatMap();
    } finally {
      setBookingLoading(false);
    }
  };

  const selectedSeatsData = seats.filter((s) => selectedSeatIds.includes(s.id));
  const totalPrice = selectedSeatsData.reduce((sum, s) => sum + s.price, 0);

  const rowsMap = seats.reduce((acc: { [key: string]: Seat[] }, seat) => {
    if (!acc[seat.row]) acc[seat.row] = [];
    acc[seat.row].push(seat);
    return acc;
  }, {});

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  };

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button
          onClick={onBack}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>

        <div style={{ textAlign: 'right' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>{showtime.movie?.title}</h2>
          <p style={{ fontSize: '13px', color: '#00f2fe' }}>
            {showtime.room?.name} • {new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({new Date(showtime.startTime).toLocaleDateString('vi-VN')})
          </p>
        </div>
      </div>

      {errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 23, 68, 0.15)', border: '1px solid rgba(255, 23, 68, 0.4)', color: '#ff5252', padding: '12px 18px', borderRadius: '10px', marginBottom: '20px', fontSize: '14px' }}>
          <ShieldAlert size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '36px', position: 'relative' }}>
        <div className="cinema-screen-container">
          <div className="cinema-screen" />
          <div className="screen-text">MÀN HÌNH CHÍNH (SCREEN)</div>
        </div>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
            <p>Đang tải sơ đồ phòng chiếu...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', margin: '30px 0' }}>
            {Object.keys(rowsMap).map((rowLetter) => (
              <div key={rowLetter} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '24px', fontSize: '13px', fontWeight: '800', color: '#64748b', textAlign: 'center' }}>
                  {rowLetter}
                </span>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {rowsMap[rowLetter].map((seat) => {
                    const isSelected = selectedSeatIds.includes(seat.id);
                    let seatClass = 'seat available';
                    if (seat.type === 'VIP') seatClass += ' vip';
                    if (seat.type === 'COUPLE') seatClass += ' couple';
                    if (seat.status === 'BOOKED') seatClass = 'seat booked';
                    else if (seat.status === 'HOLDING' && !isSelected) seatClass = 'seat holding';
                    else if (isSelected) seatClass = 'seat selected';

                    return (
                      <div
                        key={seat.id}
                        className={seatClass}
                        onClick={() => handleSeatClick(seat)}
                        title={seat.label + ' - ' + seat.type + ' (' + seat.price.toLocaleString('vi-VN') + 'đ)'}
                      >
                        {seat.label}
                      </div>
                    );
                  })}
                </div>

                <span style={{ width: '24px', fontSize: '13px', fontWeight: '800', color: '#64748b', textAlign: 'center' }}>
                  {rowLetter}
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '24px', marginTop: '30px', fontSize: '12px', color: '#94a3b8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="seat available" style={{ width: '20px', height: '20px', cursor: 'default' }} />
            <span>Ghế Thường ({showtime.price.toLocaleString('vi-VN')}đ)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="seat vip" style={{ width: '20px', height: '20px', cursor: 'default' }} />
            <span>Ghế VIP ({(showtime.price + 20000).toLocaleString('vi-VN')}đ)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="seat selected" style={{ width: '20px', height: '20px', cursor: 'default' }} />
            <span>Đang Chọn</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="seat holding" style={{ width: '20px', height: '20px', cursor: 'default' }} />
            <span>Đang Giữ Chỗ (5p)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="seat booked" style={{ width: '20px', height: '20px', cursor: 'default' }} />
            <span>Đã Mua</span>
          </div>
        </div>
      </div>

      {selectedSeatIds.length > 0 && (
        <div 
          className="glass-panel" 
          style={{ 
            marginTop: '24px', 
            padding: '20px 30px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            border: '1px solid rgba(0, 230, 118, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 230, 118, 0.15)',
            background: 'linear-gradient(135deg, rgba(22, 27, 38, 0.9), rgba(10, 12, 16, 0.95))',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Ghế đã chọn:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {selectedSeatsData.map((s) => (
                  <span key={s.id} style={{ background: '#00e676', color: '#000', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '800' }}>
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#ffd600' }}>
              <Clock size={14} />
              <span>Thời gian giữ ghế: <strong>{formatTimer(countdown)}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block' }}>Tổng tiền</span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#00f2fe' }}>
                {totalPrice.toLocaleString('vi-VN')}đ
              </span>
            </div>

            <button
              onClick={handleBooking}
              disabled={bookingLoading}
              className="glow-btn"
              style={{ padding: '14px 28px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <CheckCircle2 size={18} />
              <span>{bookingLoading ? 'Đang Đặt...' : 'Thanh Toán & Đặt Vé'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
