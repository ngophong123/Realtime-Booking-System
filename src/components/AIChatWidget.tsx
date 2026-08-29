import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Bot, X, Send, Sparkles, ChevronRight } from 'lucide-react';
import type { Movie } from '../types';
import API from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  suggestedMovies?: Movie[];
  timestamp: string;
}

interface AIChatWidgetProps {
  onSelectMovie: (movie: Movie) => void;
}

export const AIChatWidget = ({ onSelectMovie }: AIChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBadge, setShowBadge] = useState(true);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: '👋 **Chào bạn! Mình là CINEVERSE AI Assistant.**\n\nMình có thể giúp bạn tìm phim hay, tra cứu lịch chiếu, săn voucher hoặc giải đáp thắc mắc rạp chiếu. Bạn cần hỗ trợ gì nào?',
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowBadge(false);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await API.post('/ai/chat', {
        message: text.trim(),
        history,
      });

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: res.data.reply,
        suggestedMovies: res.data.suggestedMovies || [],
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: 'Rất tiếc, đã có lỗi kết nối tạm thời với máy chủ AI. Bạn vui lòng thử lại sau giây lát nhé!',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const quickPrompts = [
    { label: '🍿 Phim hot đang chiếu', prompt: 'Gợi ý cho tôi các bộ phim hot đang chiếu tại rạp' },
    { label: '⏰ Suất chiếu hôm nay', prompt: 'Hôm nay có những suất chiếu nào vậy bot?' },
    { label: '🎁 Mã voucher hôm nay', prompt: 'Hôm nay rạp có những mã giảm giá voucher nào?' },
    { label: '🛡️ Chính sách hủy vé', prompt: 'Chính sách hủy vé của rạp như thế nào?' },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 110, display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showBadge && (
            <div
              onClick={() => setIsOpen(true)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1.5px solid var(--primary)',
                borderRadius: 'var(--radius-pill)',
                padding: '8px 14px',
                color: 'var(--text)',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-dropdown)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sparkles size={14} color="var(--primary)" />
              <span>Hỏi CINEVERSE AI</span>
            </div>
          )}

          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary)',
              border: 'none',
              color: '#FFFFFF',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px var(--primary-glow)',
              transition: 'all 0.2s ease',
            }}
          >
            <Bot size={26} />
          </button>
        </div>
      )}

      {/* Main Chat Drawer */}
      {isOpen && (
        <div
          className="cine-card animate-fade-in"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '390px',
            maxWidth: 'calc(100vw - 32px)',
            height: '600px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-modal)',
            boxShadow: 'var(--shadow-dropdown)',
            zIndex: 150,
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
              padding: '14px 18px',
              borderBottom: '1px solid var(--border)',
              backgroundColor: 'var(--bg-soft)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>CINEVERSE AI</span>
                  <span style={{ fontSize: '10px', backgroundColor: 'var(--success-soft)', color: 'var(--success)', padding: '1px 5px', borderRadius: '4px', fontWeight: '700' }}>ONLINE</span>
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Trợ lý rạp phim thông minh</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages Stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#FFFFFF' }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'var(--bg-soft)',
                    color: m.sender === 'user' ? '#FFFFFF' : 'var(--text)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    fontWeight: m.sender === 'user' ? '600' : '400',
                    whiteSpace: 'pre-wrap',
                    boxShadow: m.sender === 'user' ? '0 2px 6px var(--primary-glow)' : 'none',
                  }}
                >
                  {m.text}
                </div>

                {/* Suggested Movies Action Cards */}
                {m.suggestedMovies && m.suggestedMovies.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', width: '100%', maxWidth: '90%' }}>
                    {m.suggestedMovies.map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => onSelectMovie(movie)}
                        className="cine-card cine-card-hover"
                        style={{
                          backgroundColor: 'var(--bg-soft)',
                          borderRadius: '8px',
                          padding: '8px 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <img
                            src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                            alt={movie.title}
                            style={{ width: '34px', height: '46px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', margin: '0 0 2px' }}>
                              {movie.title}
                            </h4>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {movie.duration} phút
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: 'var(--primary)', fontSize: '12px', fontWeight: '700' }}>
                          <span>Đặt vé</span>
                          <ChevronRight size={13} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span style={{ fontSize: '10px', color: 'var(--text-light)', marginTop: '2px', padding: '0 4px' }}>
                  {m.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontSize: '12px', padding: '4px' }}>
                <Sparkles size={13} />
                <span>CINEVERSE AI đang trả lời...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div
            style={{
              padding: '8px 12px',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              borderTop: '1px solid var(--border)',
              backgroundColor: 'var(--bg-soft)',
            }}
          >
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(qp.prompt)}
                disabled={loading}
                style={{
                  whiteSpace: 'nowrap',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-pill)',
                  padding: '4px 10px',
                  color: 'var(--text-muted)',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.color = 'var(--primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px 14px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '8px',
              backgroundColor: '#FFFFFF',
            }}
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi cho CINEVERSE AI..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              className="cine-input"
              style={{ fontSize: '13px', padding: '8px 12px' }}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="btn-primary"
              style={{
                borderRadius: 'var(--radius-btn)',
                width: '38px',
                height: '38px',
                padding: 0,
                flexShrink: 0,
              }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
