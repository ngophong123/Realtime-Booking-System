import { Film, Phone, Mail, ShieldCheck, FileText, Headphones, MessageCircle, Heart, Video, Share2 } from 'lucide-react';

interface FooterProps {
  onOpenPolicy: (type: 'terms' | 'privacy' | 'care' | 'about') => void;
  footerData?: any;
}

export const Footer = ({ onOpenPolicy, footerData }: FooterProps) => {
  const currentYear = new Date().getFullYear();

  const hotline = footerData?.hotline || '1900 8888';
  const supportEmail = footerData?.email || 'support@cineverse.vn';

  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border)',
        marginTop: '60px',
        padding: '48px 24px 28px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Main 4 Columns Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '36px',
            marginBottom: '40px',
          }}
        >
          {/* Col 1: Brand & Intro */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                }}
              >
                <Film size={18} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                <span style={{ color: 'var(--secondary)' }}>CINE</span>
                <span style={{ color: 'var(--primary)' }}>VERSE</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Hệ thống đặt vé xem phim trực tuyến thời gian thực hiện đại hàng đầu Việt Nam. Trải nghiệm phòng chiếu IMAX Laser &amp; VIP Gold Class đẳng cấp.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <a
                href={footerData?.socialFacebook || 'https://facebook.com'}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-soft)',
                  border: '1px solid var(--border)',
                  color: 'var(--secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                <Share2 size={16} />
              </a>
              <a
                href={footerData?.socialYoutube || 'https://youtube.com'}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-soft)',
                  border: '1px solid var(--border)',
                  color: 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                <Video size={16} />
              </a>
              <a
                href={footerData?.socialZalo || 'https://zalo.me'}
                target="_blank"
                rel="noreferrer"
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-soft)',
                  border: '1px solid var(--border)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                }}
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Col 2: Quy định & Điều khoản */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '16px' }}>
              Chính Sách &amp; Quy Định
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <FileText size={14} />
                  <span>Điều Khoản Sử Dụng</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <ShieldCheck size={14} />
                  <span>Chính Sách Bảo Mật Thông Tin</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('about')}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                >
                  <Film size={14} />
                  <span>Về Chúng Tôi (CINEVERSE)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Chăm Sóc Khách Hàng */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '16px' }}>
              Chăm Sóc Khách Hàng
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--primary-soft)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Phone size={15} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Hotline CSKH 24/7</span>
                  <a href={`tel:${hotline.replace(/\s+/g, '')}`} style={{ fontSize: '14px', fontWeight: '800', color: 'var(--primary)', textDecoration: 'none' }}>
                    {hotline}
                  </a>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--secondary-soft)',
                    color: 'var(--secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Mail size={15} />
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Email Hỗ Trợ</span>
                  <a href={`mailto:${supportEmail}`} style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', textDecoration: 'none' }}>
                    {supportEmail}
                  </a>
                </div>
              </div>

              <button
                onClick={() => onOpenPolicy('care')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  color: 'var(--secondary)',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '4px',
                  textAlign: 'left',
                }}
              >
                <Headphones size={14} />
                <span>Xem chi tiết quy trình hỗ trợ &amp; khiếu nại</span>
              </button>
            </div>
          </div>

          {/* Col 4: Kết Nối Với Chúng Tôi */}
          <div>
            <h4 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', marginBottom: '16px' }}>
              Kết Nối Với Chúng Tôi
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '0 0 12px' }}>
              Đăng ký nhận thông tin khuyến mãi &amp; vé chiếu sớm các siêu phẩm điện ảnh:
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="email"
                placeholder="Nhập email của bạn..."
                className="cine-input"
                style={{ fontSize: '12px', padding: '8px 12px' }}
              />
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '8px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                onClick={() => alert('Cảm ơn bạn đã đăng ký nhận tin từ CINEVERSE!')}
              >
                Gửi
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div
          style={{
            borderTop: '1px solid var(--border)',
            paddingTop: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}
        >
          <div>
            © {currentYear} <b>CINEVERSE Vietnam Co., Ltd.</b> Tất cả các quyền được bảo lưu.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Phát triển với</span>
            <Heart size={13} color="var(--danger)" fill="var(--danger)" />
            <span>cho trải nghiệm điện ảnh đỉnh cao</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
