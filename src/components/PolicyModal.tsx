import { X, ShieldCheck, FileText, Headphones, Users } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'terms' | 'privacy' | 'care' | 'about';
  content: string;
}

export const PolicyModal = ({ isOpen, onClose, title, type, content }: PolicyModalProps) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'terms':
        return <FileText size={22} color="var(--primary)" />;
      case 'privacy':
        return <ShieldCheck size={22} color="var(--success)" />;
      case 'care':
        return <Headphones size={22} color="var(--secondary)" />;
      case 'about':
        return <Users size={22} color="var(--primary)" />;
    }
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
        zIndex: 210,
        padding: '20px',
      }}
    >
      <div
        className="cine-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-modal)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-dropdown)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 24px',
            borderBottom: '1px solid var(--border)',
            backgroundColor: 'var(--bg-soft)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {getIcon()}
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text)', margin: 0 }}>
              {title}
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border)',
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
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, lineHeight: 1.7, fontSize: '14px', color: 'var(--text)' }}>
          <div style={{ whiteSpace: 'pre-line' }}>{content}</div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--border)',
            backgroundColor: 'var(--bg-soft)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
            Đã Hiểu &amp; Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
