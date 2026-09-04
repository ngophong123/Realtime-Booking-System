import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, ExternalLink, Ticket, Gift, AlertCircle, Info, ShieldAlert } from 'lucide-react';
import type { Notification, User } from '../types';
import API from '../services/api';
import { socket } from '../services/socket';

interface NotificationDropdownProps {
  user: User | null;
  onOpenMyTickets?: () => void;
  onOpenProfile?: () => void;
  onOpenVouchers?: () => void;
  onOpenAdmin?: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  user,
  onOpenMyTickets,
  onOpenProfile,
  onOpenVouchers,
  onOpenAdmin,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
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
    fetchNotifications();
  }, [user]);

  // Realtime Socket listener
  useEffect(() => {
    if (!user) return;

    const handleNewNotif = (notif: Notification) => {
      setNotifications((prev) => [notif, ...prev.filter((n) => n.id !== notif.id)]);
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

  const handleNotificationClick = (n: Notification) => {
    if (!n.isRead) {
      handleMarkAsRead(n.id);
    }
    setIsOpen(false);

    // Chuyển hướng tới đúng mục theo loại thông báo
    if (n.type === 'ADMIN_BOOKING') {
      if (onOpenAdmin) onOpenAdmin();
    } else if (n.type === 'BOOKING' || n.type === 'APPROVED' || n.type === 'CANCELLED') {
      if (onOpenMyTickets) onOpenMyTickets();
    } else if (n.type === 'VOUCHER') {
      if (onOpenVouchers) onOpenVouchers();
      else if (onOpenProfile) onOpenProfile();
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
      case 'ADMIN_BOOKING':
        return <ShieldAlert size={15} color="var(--primary)" />;
      case 'BOOKING':
      case 'APPROVED':
        return <Ticket size={15} color="var(--primary)" />;
      case 'VOUCHER':
        return <Gift size={15} color="var(--primary)" />;
      case 'CANCELLED':
        return <AlertCircle size={15} color="var(--danger)" />;
      default:
        return <Info size={15} color="var(--secondary)" />;
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Thông Báo"
        style={{
          backgroundColor: 'var(--bg-soft)',
          border: '1px solid var(--border)',
          color: 'var(--text)',
          padding: '8px',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transition: 'all 0.2s ease',
        }}
      >
        <Bell size={18} color={unreadCount > 0 ? 'var(--primary)' : 'var(--text-muted)'} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              backgroundColor: 'var(--danger)',
              color: '#FFFFFF',
              fontSize: '10px',
              fontWeight: '800',
              padding: '1px 5px',
              borderRadius: '10px',
              boxShadow: '0 0 6px rgba(220, 38, 38, 0.5)',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          className="cine-card animate-fade-in"
          style={{
            position: 'absolute',
            top: '48px',
            right: '0',
            width: '370px',
            maxHeight: '480px',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-card)',
            boxShadow: 'var(--shadow-dropdown)',
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
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-soft)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={16} color="var(--primary)" />
              <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>
                Thông Báo ({unreadCount})
              </span>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--primary)',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <CheckCheck size={14} /> Đã đọc hết
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {loading && notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Đang tải thông báo...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                Không có thông báo nào.
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    marginBottom: '4px',
                    backgroundColor: n.isRead ? 'transparent' : 'var(--primary-soft)',
                    border: n.isRead ? '1px solid transparent' : '1px solid var(--primary-glow)',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-soft)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = n.isRead ? 'transparent' : 'var(--primary-soft)')}
                >
                  <div style={{ marginTop: '2px' }}>{getNotifIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', margin: 0 }}>
                        {n.title}
                      </h4>
                      <ExternalLink size={12} color="var(--primary)" />
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 4px', lineHeight: 1.4 }}>
                      {n.message}
                    </p>
                    <span style={{ fontSize: '10px', color: 'var(--text-light)' }}>
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
