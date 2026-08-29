import { useState, useEffect } from 'react';
import { X, Gift, Tag, Check, Copy } from 'lucide-react';
import type { User as UserType, Voucher } from '../types';
import API from '../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
}

export const ProfileModal = ({ isOpen, onClose, user }: ProfileModalProps) => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      API.get('/vouchers/my-vouchers')
        .then((res) => setVouchers(res.data.vouchers || []))
        .catch((err) => console.error('Lỗi nạp voucher:', err));
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
          maxWidth: '560px',
          maxHeight: '85vh',
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
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        {/* User Profile Header */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-soft)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '22px',
              boxShadow: '0 4px 10px var(--primary-glow)',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
                {user.name}
              </h2>
              <span
                style={{
                  backgroundColor: user.role === 'ADMIN' ? 'var(--primary-soft)' : 'var(--secondary-soft)',
                  color: user.role === 'ADMIN' ? 'var(--primary)' : 'var(--secondary)',
                  border: `1px solid ${user.role === 'ADMIN' ? 'var(--primary)' : 'var(--secondary)'}`,
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}
              >
                {user.role}
              </span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user.email}</span>
          </div>
        </div>

        {/* Voucher Wallet */}
        <div style={{ padding: '24px 28px', overflowY: 'auto', flex: 1, backgroundColor: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Gift size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
              Ví Voucher Của Tôi ({vouchers.length})
            </h3>
          </div>

          {vouchers.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
              Bạn chưa có mã giảm giá nào. Hãy đón chờ các chương trình khuyến mãi và quà tặng từ rạp nhé!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {vouchers.map((v) => (
                <div
                  key={v.id}
                  style={{
                    backgroundColor: 'var(--bg-soft)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-card)',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <Tag size={14} color="var(--primary)" />
                      <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)' }}>
                        {v.code}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text)', fontWeight: '700' }}>
                        {v.discountPercent ? `Giảm ${v.discountPercent}%` : `Giảm ${Number(v.discountAmount).toLocaleString('vi-VN')}đ`}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Đơn tối thiểu: {Number(v.minOrderAmount).toLocaleString('vi-VN')}đ • HSD: {new Date(v.expireAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopy(v.code)}
                    className="btn-outline"
                    style={{ padding: '6px 12px', fontSize: '12px', borderColor: 'var(--border)' }}
                  >
                    {copiedCode === v.code ? <><Check size={13} color="var(--success)" /> Đã chép</> : <><Copy size={13} /> Sao chép</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
