import React, { useState, useEffect } from 'react';
import { X, Gift, Tag, Check, Copy, Sparkles, RefreshCw, Calendar, AlertCircle } from 'lucide-react';
import type { User as UserType, Voucher } from '../types';
import API from '../services/api';
import { socket } from '../services/socket';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

export const VoucherModal: React.FC<VoucherModalProps> = ({ isOpen, onClose, user }) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'personal' | 'public'>('all');

  const fetchVouchers = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await API.get('/vouchers/my-vouchers');
      setVouchers(res.data.vouchers || []);
    } catch (err) {
      console.error('Lỗi nạp voucher:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchVouchers();
    }
  }, [isOpen, user]);

  // Realtime update qua Socket.io khi được tặng voucher mới
  useEffect(() => {
    if (!user) return;

    const handleVoucherUpdate = () => {
      fetchVouchers();
    };

    socket.on(`voucher:gifted:${user.id}`, handleVoucherUpdate);
    socket.on('voucher:created', handleVoucherUpdate);
    socket.on('voucher:deleted', handleVoucherUpdate);
    socket.on(`notification:${user.id}`, handleVoucherUpdate);

    return () => {
      socket.off(`voucher:gifted:${user.id}`, handleVoucherUpdate);
      socket.off('voucher:created', handleVoucherUpdate);
      socket.off('voucher:deleted', handleVoucherUpdate);
      socket.off(`notification:${user.id}`, handleVoucherUpdate);
    };
  }, [user]);

  if (!isOpen || !user) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const filteredVouchers = vouchers.filter((v) => {
    if (filter === 'personal') return v.userId === user.id;
    if (filter === 'public') return !v.userId;
    return true;
  });

  const personalCount = vouchers.filter((v) => v.userId === user.id).length;
  const publicCount = vouchers.filter((v) => !v.userId).length;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 160,
        padding: '20px',
      }}
    >
      <div
        className="cine-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '640px',
          maxHeight: '90vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-modal)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: 'var(--shadow-dropdown)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            backgroundColor: 'var(--bg-soft)',
            border: 'none',
            color: 'var(--text-muted)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div
          style={{
            padding: '24px 28px 18px',
            backgroundColor: 'var(--bg-soft)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 4px 12px var(--primary-glow)',
              }}
            >
              <Gift size={22} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text)' }}>
                Ví Voucher & Ưu Đãi Của Tôi
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                Áp dụng mã tại bước thanh toán để nhận giảm giá vé xem phim
              </p>
            </div>
          </div>

          {/* Filter Tabs & Refresh */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '16px',
              gap: '8px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setFilter('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: filter === 'all' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: filter === 'all' ? 'var(--primary-soft)' : '#FFFFFF',
                  color: filter === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                Tất cả ({vouchers.length})
              </button>
              <button
                onClick={() => setFilter('personal')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: filter === 'personal' ? '1px solid #9333ea' : '1px solid var(--border)',
                  backgroundColor: filter === 'personal' ? 'rgba(147, 51, 234, 0.1)' : '#FFFFFF',
                  color: filter === 'personal' ? '#9333ea' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                🎁 Quà tặng bạn ({personalCount})
              </button>
              <button
                onClick={() => setFilter('public')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  border: filter === 'public' ? '1px solid var(--primary)' : '1px solid var(--border)',
                  backgroundColor: filter === 'public' ? 'var(--primary-soft)' : '#FFFFFF',
                  color: filter === 'public' ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                🌐 Hệ thống ({publicCount})
              </button>
            </div>

            <button
              onClick={fetchVouchers}
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'transparent',
                border: 'none',
                color: 'var(--primary)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Đang tải...' : 'Làm mới'}</span>
            </button>
          </div>
        </div>

        {/* Voucher List Content */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, maxHeight: 'calc(90vh - 170px)' }}>
          {loading && vouchers.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary)' }} />
              <div>Đang tải danh sách voucher của bạn...</div>
            </div>
          ) : filteredVouchers.length === 0 ? (
            <div
              style={{
                padding: '48px 24px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-soft)',
                borderRadius: 'var(--radius-card)',
                border: '1px dashed var(--border)',
              }}
            >
              <Gift size={40} color="var(--primary)" style={{ opacity: 0.5, marginBottom: '12px' }} />
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '6px' }}>
                {filter === 'personal'
                  ? 'Bạn chưa có Voucher quà tặng cá nhân nào'
                  : 'Chưa có mã giảm giá khả dụng'}
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '380px', margin: '0 auto' }}>
                {filter === 'personal'
                  ? 'Khi Ban Quản Trị gửi tặng bạn Voucher ưu đãi, mã sẽ xuất hiện ngay tại đây.'
                  : 'Hãy đón chờ các sự kiện tri ân và chương trình khuyến mãi sắp tới của rạp nhé!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredVouchers.map((v) => {
                const isPersonal = v.userId === user.id;
                const discountText = v.discountPercent
                  ? `GIẢM ${v.discountPercent}%`
                  : `GIẢM ${Number(v.discountAmount).toLocaleString('vi-VN')}Đ`;
                const maxText = v.maxDiscount ? ` (Tối đa ${Number(v.maxDiscount).toLocaleString('vi-VN')}đ)` : '';
                const isCopied = copiedCode === v.code;

                return (
                  <div
                    key={v.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: isPersonal ? '1.5px solid #c084fc' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-card)',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: isPersonal ? '0 4px 14px rgba(147, 51, 234, 0.08)' : '0 2px 6px rgba(0, 0, 0, 0.03)',
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Top Ribbon for Personal Voucher */}
                    {isPersonal && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '0',
                          right: '0',
                          backgroundColor: '#9333ea',
                          color: '#FFFFFF',
                          fontSize: '10px',
                          fontWeight: '800',
                          padding: '3px 12px',
                          borderBottomLeftRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          letterSpacing: '0.5px',
                        }}
                      >
                        <Sparkles size={11} /> QUÀ TẶNG DÀNH RIÊNG CHO BẠN
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <span
                            style={{
                              backgroundColor: isPersonal ? 'rgba(147, 51, 234, 0.12)' : 'var(--primary-soft)',
                              color: isPersonal ? '#9333ea' : 'var(--primary)',
                              fontSize: '15px',
                              fontWeight: '900',
                              padding: '3px 10px',
                              borderRadius: '6px',
                              letterSpacing: '1px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                            }}
                          >
                            <Tag size={14} />
                            {v.code}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text)' }}>
                            {discountText}{maxText}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <span>
                            🛒 Đơn tối thiểu: <b>{Number(v.minOrderAmount).toLocaleString('vi-VN')}đ</b>
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={13} color="var(--primary)" />
                            HSD: <b>{new Date(v.expireAt).toLocaleDateString('vi-VN')}</b>
                          </span>
                        </div>
                      </div>

                      {/* Copy Button */}
                      <button
                        onClick={() => handleCopy(v.code)}
                        className={isCopied ? 'btn-primary' : 'btn-outline'}
                        style={{
                          padding: '8px 14px',
                          fontSize: '12px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          borderColor: isCopied ? 'var(--success)' : isPersonal ? '#9333ea' : 'var(--border)',
                          backgroundColor: isCopied ? 'var(--success)' : 'transparent',
                          color: isCopied ? '#FFFFFF' : isPersonal ? '#9333ea' : 'var(--text)',
                          borderRadius: '8px',
                          minWidth: '100px',
                          justifyContent: 'center',
                        }}
                      >
                        {isCopied ? (
                          <>
                            <Check size={14} /> Đã chép
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Sao chép
                          </>
                        )}
                      </button>
                    </div>

                    {/* Footer Tip */}
                    <div
                      style={{
                        paddingTop: '8px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: 'var(--text-light)',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} color="var(--secondary)" />
                        Nhập mã này vào ô "Mã giảm giá" lúc chọn ghế thanh toán
                      </span>
                      <span>{v.usageLimit - v.usedCount > 0 ? `Còn ${v.usageLimit - v.usedCount} lượt` : 'Đã hết lượt'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
