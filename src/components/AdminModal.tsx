import { useState, useEffect, type FormEvent } from 'react';
import { X, Film, DoorOpen, CalendarClock, TrendingUp, Plus, Trash2, Edit3, ShieldCheck, Image as ImageIcon, RotateCcw } from 'lucide-react';
import type { Movie, Room, Showtime, Booking } from '../types';
import API from '../services/api';

const DEFAULT_POSTER = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  rooms: Room[];
  showtimes: Showtime[];
  onRefreshData: () => void;
}

export const AdminModal = ({
  isOpen,
  onClose,
  movies,
  rooms: propRooms,
  showtimes,
  onRefreshData,
}: AdminModalProps) => {
  const [activeTab, setActiveTab] = useState<'movies' | 'rooms' | 'showtimes' | 'stats'>('movies');
  const [rooms, setRooms] = useState<Room[]>(propRooms || []);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);

  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    duration: 120,
    posterUrl: '',
    releaseDate: new Date().toISOString().split('T')[0],
  });

  const [newRoom, setNewRoom] = useState({
    name: '',
    rows: 6,
    columns: 8,
  });

  const [newShowtime, setNewShowtime] = useState({
    movieId: '',
    roomId: '',
    startTime: '',
    endTime: '',
    price: 85000,
  });

  const fetchAdminData = async () => {
    try {
      const [roomsRes, bookingsRes] = await Promise.all([
        API.get('/rooms'),
        API.get('/bookings'),
      ]);
      const fetchedRooms = roomsRes.data.rooms || [];
      setRooms(fetchedRooms);
      setBookings(bookingsRes.data.bookings || []);

      if (fetchedRooms.length > 0) {
        setNewShowtime((prev) => ({
          ...prev,
          roomId: prev.roomId || fetchedRooms[0].id,
        }));
      }
    } catch (err: any) {
      console.error('Lỗi tải dữ liệu admin:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAdminData();
      if (movies.length > 0) {
        setNewShowtime((prev) => ({ ...prev, movieId: prev.movieId || movies[0].id }));
      }
    }
  }, [isOpen, movies]);

  useEffect(() => {
    if (propRooms && propRooms.length > 0) {
      setRooms(propRooms);
      setNewShowtime((prev) => ({ ...prev, roomId: prev.roomId || propRooms[0].id }));
    }
  }, [propRooms]);

  if (!isOpen) return null;

  const handleSaveMovie = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const payload = {
        title: movieForm.title.trim(),
        description: movieForm.description.trim(),
        duration: Number(movieForm.duration),
        posterUrl: movieForm.posterUrl.trim() || DEFAULT_POSTER,
        releaseDate: new Date(movieForm.releaseDate).toISOString(),
      };

      if (editingMovieId) {
        await API.put(`/movies/${editingMovieId}`, payload);
        setMessage({ type: 'success', text: 'Cập nhật thông tin phim thành công!' });
      } else {
        await API.post('/movies', payload);
        setMessage({ type: 'success', text: 'Thêm phim mới thành công!' });
      }

      handleCancelEditMovie();
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi lưu phim!' });
    }
  };

  const handleStartEditMovie = (m: Movie) => {
    setEditingMovieId(m.id);
    setMovieForm({
      title: m.title,
      description: m.description || '',
      duration: m.duration,
      posterUrl: m.posterUrl || '',
      releaseDate: m.releaseDate ? new Date(m.releaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    });
  };

  const handleCancelEditMovie = () => {
    setEditingMovieId(null);
    setMovieForm({
      title: '',
      description: '',
      duration: 120,
      posterUrl: '',
      releaseDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteMovie = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa phim này không?')) return;
    try {
      await API.delete(`/movies/${id}`);
      setMessage({ type: 'success', text: 'Xóa phim thành công!' });
      if (editingMovieId === id) handleCancelEditMovie();
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể xóa phim (có thể đã có suất chiếu)!' });
    }
  };

  const handleCreateRoom = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await API.post('/rooms', {
        name: newRoom.name.trim(),
        rows: Number(newRoom.rows),
        columns: Number(newRoom.columns),
      });
      setMessage({ type: 'success', text: 'Tạo phòng chiếu mới thành công!' });
      setNewRoom({ name: '', rows: 6, columns: 8 });
      fetchAdminData();
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi tạo phòng chiếu!' });
    }
  };

  const handleCreateShowtime = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const selectedRoomId = newShowtime.roomId || (rooms.length > 0 ? rooms[0].id : '');
    const selectedMovieId = newShowtime.movieId || (movies.length > 0 ? movies[0].id : '');

    if (!selectedMovieId) {
      setMessage({ type: 'error', text: 'Vui lòng chọn phim trước khi tạo suất chiếu!' });
      return;
    }
    if (!selectedRoomId) {
      setMessage({ type: 'error', text: 'Vui lòng chọn phòng chiếu!' });
      return;
    }

    try {
      await API.post('/showtimes', {
        movieId: selectedMovieId,
        roomId: selectedRoomId,
        startTime: new Date(newShowtime.startTime).toISOString(),
        endTime: new Date(newShowtime.endTime).toISOString(),
        price: Number(newShowtime.price),
      });
      setMessage({ type: 'success', text: 'Tạo suất chiếu mới thành công!' });
      onRefreshData();
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi tạo suất chiếu!' });
    }
  };

  const handleDeleteShowtime = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa suất chiếu này?')) return;
    try {
      await API.delete(`/showtimes/${id}`);
      setMessage({ type: 'success', text: 'Xóa suất chiếu thành công!' });
      onRefreshData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Không thể xóa suất chiếu!' });
    }
  };

  const handleAdminCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Quyền Admin: Bạn có chắc muốn hủy đơn vé này không? Ghế sẽ được mở lại cho khách khác.')) return;
    try {
      await API.post(`/bookings/${bookingId}/cancel`);
      setMessage({ type: 'success', text: 'Hủy đơn vé thành công!' });
      fetchAdminData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi hủy vé!' });
    }
  };

  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
  const totalTicketsSold = confirmedBookings.reduce((sum, b) => sum + (b.seats?.length || 0), 0);

﻿  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.88)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: '100%', 
          maxWidth: '1050px', 
          maxHeight: '92vh', 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '24px', 
          overflow: 'hidden', 
          border: '1px solid rgba(255, 23, 68, 0.3)',
          boxShadow: '0 25px 60px rgba(255, 23, 68, 0.15)',
          background: 'linear-gradient(135deg, #12161f 0%, #0d1017 100%)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 23, 68, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: '#ff1744', padding: '6px', borderRadius: '8px', display: 'flex' }}>
              <ShieldCheck size={20} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', margin: 0 }}>
                HỆ THỐNG ĐIỀU HÀNH RẠP CHIẾU (ADMIN PORTAL)
              </h2>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>Toàn quyền chỉnh sửa phim, phòng chiếu, suất chiếu và quản lý doanh thu</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={22} />
          </button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', padding: '0 28px', gap: '12px', background: 'rgba(0, 0, 0, 0.2)' }}>
          {[
            { id: 'movies', label: 'Quản Lý Phim', icon: Film, count: movies.length },
            { id: 'rooms', label: 'Phòng Chiếu', icon: DoorOpen, count: rooms.length },
            { id: 'showtimes', label: 'Suất Chiếu', icon: CalendarClock, count: showtimes.length },
            { id: 'stats', label: 'Doanh Thu & Đơn Vé', icon: TrendingUp, count: bookings.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setMessage(null); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '14px 18px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #00f2fe' : '2px solid transparent',
                  color: isActive ? '#00f2fe' : '#94a3b8',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: '0.2s',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                <span style={{ fontSize: '11px', background: isActive ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255, 255, 255, 0.05)', padding: '2px 6px', borderRadius: '10px' }}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {message && (
          <div style={{ margin: '16px 28px 0', padding: '12px 16px', borderRadius: '8px', fontSize: '13px', background: message.type === 'success' ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 23, 68, 0.15)', border: '1px solid ' + (message.type === 'success' ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 23, 68, 0.4)'), color: message.type === 'success' ? '#00e676' : '#ff5252' }}>
            {message.text}
          </div>
        )}

        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1 }}>
          {activeTab === 'movies' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                  Danh Sách Phim ({movies.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '440px', overflowY: 'auto' }}>
                  {movies.map((m) => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', border: editingMovieId === m.id ? '1px solid #00f2fe' : '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={m.posterUrl || DEFAULT_POSTER} 
                          alt={m.title} 
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_POSTER; }}
                          style={{ width: '42px', height: '56px', objectFit: 'cover', borderRadius: '6px' }} 
                        />
                        <div>
                          <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>{m.title}</h4>
                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                            {m.duration} phút • Khởi chiếu: {new Date(m.releaseDate).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleStartEditMovie(m)}
                          style={{ background: 'rgba(0, 242, 254, 0.1)', border: '1px solid rgba(0, 242, 254, 0.3)', color: '#00f2fe', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                          title="Chỉnh sửa phim"
                        >
                          <Edit3 size={14} />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(m.id)}
                          style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                          title="Xóa phim"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid ' + (editingMovieId ? 'rgba(0, 242, 254, 0.4)' : 'rgba(255, 255, 255, 0.08)'), borderRadius: '16px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: editingMovieId ? '#00f2fe' : '#00e676', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                    {editingMovieId ? <><Edit3 size={18} /> Chỉnh Sửa Phim</> : <><Plus size={18} /> Thêm Phim Mới</>}
                  </h3>
                  {editingMovieId && (
                    <button
                      type="button"
                      onClick={handleCancelEditMovie}
                      style={{ background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#94a3b8', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RotateCcw size={12} /> Hủy sửa
                    </button>
                  )}
                </div>

                <form onSubmit={handleSaveMovie} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tiêu đề phim *</label>
                    <input
                      type="text"
                      placeholder="VD: Avatar 3: Lửa và Tro Tàn"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                      required
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Thời lượng (phút)</label>
                      <input
                        type="number"
                        min="1"
                        value={movieForm.duration}
                        onChange={(e) => setMovieForm({ ...movieForm, duration: Number(e.target.value) })}
                        required
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Ngày khởi chiếu</label>
                      <input
                        type="date"
                        value={movieForm.releaseDate}
                        onChange={(e) => setMovieForm({ ...movieForm, releaseDate: e.target.value })}
                        required
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Link Ảnh Poster (URL)</label>
                    <input
                      type="text"
                      placeholder="Dán link ảnh (https://...)"
                      value={movieForm.posterUrl}
                      onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value })}
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                    />
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '3px' }}>
                      * Chuột phải ảnh trên mạng &rarr; chọn "Sao chép địa chỉ hình ảnh" (Copy Image Address)
                    </span>
                  </div>

                  {movieForm.posterUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <ImageIcon size={14} color="#00f2fe" />
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>Xem trước poster:</span>
                      <img 
                        src={movieForm.posterUrl} 
                        alt="Preview" 
                        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_POSTER; }}
                        style={{ width: '32px', height: '42px', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Mô tả phim</label>
                    <textarea
                      rows={3}
                      placeholder="Tóm tắt nội dung hấp dẫn của bộ phim..."
                      value={movieForm.description}
                      onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', resize: 'none' }}
                    />
                  </div>
                  <button type="submit" className="glow-btn" style={{ padding: '10px', marginTop: '6px' }}>
                    {editingMovieId ? '💾 Lưu Cập Nhật Phim' : '+ Thêm Phim Vào Hệ Thống'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                  Phòng Chiếu Hiện Tại ({rooms.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {rooms.map((r) => (
                    <div key={r.id} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#00f2fe', margin: 0 }}>{r.name}</h4>
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                          Kích thước: {r.rows} hàng x {r.columns} cột ({r.rows * r.columns} ghế)
                        </span>
                      </div>
                      <span style={{ background: 'rgba(0, 230, 118, 0.15)', color: '#00e676', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                        HOẠT ĐỘNG
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#00f2fe', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={18} /> Tạo Phòng Chiếu Mới
                </h3>
                <form onSubmit={handleCreateRoom} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tên phòng chiếu *</label>
                    <input
                      type="text"
                      placeholder="VD: Phòng IMAX Laser 02"
                      value={newRoom.name}
                      onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                      required
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Số hàng ghế (A-Z)</label>
                      <input
                        type="number"
                        min="2"
                        max="15"
                        value={newRoom.rows}
                        onChange={(e) => setNewRoom({ ...newRoom, rows: Number(e.target.value) })}
                        required
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Số ghế mỗi hàng</label>
                      <input
                        type="number"
                        min="4"
                        max="20"
                        value={newRoom.columns}
                        onChange={(e) => setNewRoom({ ...newRoom, columns: Number(e.target.value) })}
                        required
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '4px 0' }}>
                    * Hệ thống sẽ tự động khởi tạo ma trận ghế Standard, VIP, Couple cho phòng này.
                  </p>
                  <button type="submit" className="glow-btn" style={{ padding: '10px', marginTop: '6px' }}>
                    + Khởi Tạo Phòng Chiếu
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'showtimes' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
                  Suất Chiếu Hiện Có ({showtimes.length})
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '440px', overflowY: 'auto' }}>
                  {showtimes.map((st) => (
                    <div key={st.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '12px 16px' }}>
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#fff', margin: 0 }}>
                          {st.movie?.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: '#00f2fe', margin: '4px 0 0' }}>
                          {st.room?.name} • {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({new Date(st.startTime).toLocaleDateString('vi-VN')}) • {st.price.toLocaleString('vi-VN')}đ
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteShowtime(st.id)}
                        style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                        title="Xóa suất chiếu"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#00f2fe', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={18} /> Lên Lịch Suất Chiếu Mới
                </h3>
                <form onSubmit={handleCreateShowtime} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Chọn Phim *</label>
                    <select
                      value={newShowtime.movieId}
                      onChange={(e) => setNewShowtime({ ...newShowtime, movieId: e.target.value })}
                      required
                      style={{ width: '100%', background: '#1c2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                    >
                      <option value="">-- Chọn Phim --</option>
                      {movies.map((m) => (
                        <option key={m.id} value={m.id}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Chọn Phòng Chiếu *</label>
                    <select
                      value={newShowtime.roomId}
                      onChange={(e) => setNewShowtime({ ...newShowtime, roomId: e.target.value })}
                      required
                      style={{ width: '100%', background: '#1c2230', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                    >
                      <option value="">-- Chọn Phòng Chiếu --</option>
                      {rooms.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.rows * r.columns} ghế)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Giờ Bắt Đầu *</label>
                      <input
                        type="datetime-local"
                        value={newShowtime.startTime}
                        onChange={(e) => {
                          const startVal = e.target.value;
                          const endDate = new Date(new Date(startVal).getTime() + 120 * 60000);
                          const endVal = endDate.toISOString().slice(0, 16);
                          setNewShowtime({ ...newShowtime, startTime: startVal, endTime: endVal });
                        }}
                        required
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Giờ Kết Thúc *</label>
                      <input
                        type="datetime-local"
                        value={newShowtime.endTime}
                        onChange={(e) => setNewShowtime({ ...newShowtime, endTime: e.target.value })}
                        required
                        style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 10px', color: '#fff', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Giá vé cơ bản (VNĐ) *</label>
                    <input
                      type="number"
                      step="5000"
                      value={newShowtime.price}
                      onChange={(e) => setNewShowtime({ ...newShowtime, price: Number(e.target.value) })}
                      required
                      style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px' }}
                    />
                  </div>

                  <button type="submit" className="glow-btn" style={{ padding: '10px', marginTop: '6px' }}>
                    + Lưu Suất Chiếu Mới
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(0, 230, 118, 0.08)', border: '1px solid rgba(0, 230, 118, 0.3)', borderRadius: '16px', padding: '18px 22px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tổng Doanh Thu</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: '#00e676' }}>
                    {totalRevenue.toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid rgba(0, 242, 254, 0.3)', borderRadius: '16px', padding: '18px 22px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tổng Vé Đã Bán</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: '#00f2fe' }}>
                    {totalTicketsSold} vé
                  </span>
                </div>
                <div style={{ background: 'rgba(255, 214, 0, 0.08)', border: '1px solid rgba(255, 214, 0, 0.3)', borderRadius: '16px', padding: '18px 22px' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tổng Đơn Vé Xác Nhận</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: '#ffd600' }}>
                    {confirmedBookings.length} đơn
                  </span>
                </div>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#fff', marginBottom: '14px' }}>
                Danh Sách Đơn Đặt Vé Khách Hàng
              </h3>

              {bookings.length === 0 ? (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Chưa có đơn đặt vé nào trong hệ thống.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bookings.map((b) => (
                    <div key={b.id} style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '12px', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '800', color: '#00f2fe' }}>#{b.id.slice(0, 8).toUpperCase()}</span>
                          <span style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{b.user?.name} ({b.user?.email})</span>
                          <span style={{ fontSize: '10px', background: b.status === 'CONFIRMED' ? 'rgba(0,230,118,0.2)' : 'rgba(255,23,68,0.2)', color: b.status === 'CONFIRMED' ? '#00e676' : '#ff5252', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                            {b.status === 'CONFIRMED' ? 'ĐÃ XÁC NHẬN' : 'ĐÃ HỦY'}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                          {b.showtime?.movie?.title} • {b.showtime?.room?.name} • Ghế: {b.seats?.map((s: any) => s.seat?.label || s.seatId).join(', ')}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div>
                          <span style={{ fontSize: '16px', fontWeight: '800', color: b.status === 'CONFIRMED' ? '#00e676' : '#94a3b8', display: 'block' }}>
                            {Number(b.totalPrice).toLocaleString('vi-VN')}đ
                          </span>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            {new Date(b.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ({new Date(b.createdAt).toLocaleDateString('vi-VN')})
                          </span>
                        </div>
                        {b.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleAdminCancelBooking(b.id)}
                            style={{ background: 'rgba(255, 23, 68, 0.1)', border: '1px solid rgba(255, 23, 68, 0.3)', color: '#ff5252', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '700' }}
                            title="Hủy vé với quyền Admin"
                          >
                            Hủy Vé
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
