import { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Ticket, Gift, AlertCircle, Info } from 'lucide-react';
import type { Notification, User } from '../types';
import API from '../services/api';
import { socket } from '../services/socket';

interface NotificationDropdownProps {
  user: User | null;
}

export const NotificationDropdown = ({ user }: NotificationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await API.get('/notifications');
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error('Lỗi tải thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const handleNewNotif = (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev]);
    };

    socket.on(`notification:${user.id}`, handleNewNotif);
    socket.on('notification:all', handleNewNotif);

    return () => {
      socket.off(`notification:${user.id}`, handleNewNotif);
      socket.off('notification:all', handleNewNotif);
    };
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Lỗi đánh dấu đã đọc:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Lỗi đánh dấu tất cả đã đọc:', err);
    }
  };

  if (!user) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'BOOKING':
      case 'APPROVED':
        return <Ticket size={16} color="#00f2fe" />;
      case 'VOUCHER':
        return <Gift size={16} color="#ffd600" />;
      case 'CANCELLED':
        return <AlertCircle size={16} color="#ff5252" />;
      default:
        return <Info size={16} color="#38bdf8" />;
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Thông Báo"
        style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: '#f8fafc',
          padding: '8px',
          borderRadius: '10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        <Bell size={18} color={unreadCount > 0 ? '#00f2fe' : '#cbd5e1'} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#ff1744',
              color: '#fff',
              fontSize: '10px',
              fontWeight: '800',
              padding: '1px 5px',
              borderRadius: '10px',
              boxShadow: '0 0 8px rgba(255, 23, 68, 0.8)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '48px',
            right: '0',
            width: '360px',
            maxHeight: '480px',
            background: 'linear-gradient(135deg, #161c28 0%, #0c0f16 100%)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            borderRadius: '16px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
            zIndex: 120,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 242, 254, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={16} color="#00f2fe" />
              <span style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>
                Thông Báo ({unreadCount})
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#00f2fe',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCheck size={13} /> Đã đọc tất cả
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '12px' }}>
                Không có thông báo nào.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '10px',
                    marginBottom: '6px',
                    background: n.isRead ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 242, 254, 0.08)',
                    border: n.isRead ? '1px solid transparent' : '1px solid rgba(0, 242, 254, 0.25)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ marginTop: '2px' }}>{getNotifIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: '700', color: n.isRead ? '#cbd5e1' : '#fff', margin: 0 }}>
                        {n.title}
                      </h4>
                      {!n.isRead && (
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00f2fe' }} />
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: '0 0 4px', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>
                      {new Date(n.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
