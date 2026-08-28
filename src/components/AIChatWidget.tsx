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
      text: '👋 **Chào bạn! Mình là CINEVERSE AI Assistant.**\n\nMình có thể giúp bạn tìm phim hay, tra cứu lịch chiếu 24h, săn mã giảm giá hoặc giải đáp chính sách của rạp. Bạn cần mình hỗ trợ gì nào?',
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
    { label: '💺 Giá vé & Ghế VIP/Couple', prompt: 'Giá vé và các loại ghế VIP, Ghế đôi của rạp ra sao?' },
  ];

﻿  return (
    <>
      {/* Floating Action Button (FAB) */}
      {!isOpen && (
        <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 110, display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showBadge && (
            <div
              onClick={() => setIsOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #161c28, #0c0f16)',
                border: '1px solid #00f2fe',
                borderRadius: '20px',
                padding: '8px 14px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 10px 25px rgba(0, 242, 254, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                animation: 'bounce 2s infinite',
              }}
            >
              <Sparkles size={14} color="#00f2fe" />
              <span>Hỏi CINEVERSE AI</span>
            </div>
          )}

          <button
            onClick={() => setIsOpen(true)}
            style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(0, 242, 254, 0.6), 0 10px 20px rgba(0, 0, 0, 0.4)',
              transition: 'all 0.3s ease',
            }}
          >
            <Bot size={28} />
          </button>
        </div>
      )}

      {/* Main Chat Drawer / Window */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '400px',
            maxWidth: 'calc(100vw - 32px)',
            height: '620px',
            maxHeight: 'calc(100vh - 48px)',
            background: 'linear-gradient(135deg, #121824 0%, #080b10 100%)',
            border: '1px solid rgba(0, 242, 254, 0.35)',
            borderRadius: '24px',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(0, 242, 254, 0.2)',
            zIndex: 110,
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
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 242, 254, 0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
                  color: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(0, 242, 254, 0.4)',
                }}
              >
                <Bot size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>CINEVERSE AI</span>
                  <span style={{ fontSize: '9px', background: '#00e676', color: '#000', padding: '1px 6px', borderRadius: '8px', fontWeight: '800' }}>ONLINE</span>
                </h3>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>Trợ lý phim &amp; Suất chiếu thông minh</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
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

          {/* Messages Stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
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
                    padding: '12px 16px',
                    borderRadius: m.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: m.sender === 'user' ? 'linear-gradient(135deg, #00f2fe 0%, #0284c7 100%)' : 'rgba(255, 255, 255, 0.05)',
                    color: m.sender === 'user' ? '#000' : '#f8fafc',
                    border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    fontWeight: m.sender === 'user' ? '600' : '400',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.text}
                </div>

                {/* Suggested Movies Action Cards */}
                {m.suggestedMovies && m.suggestedMovies.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', width: '100%', maxWidth: '90%' }}>
                    {m.suggestedMovies.map((movie) => (
                      <div
                        key={movie.id}
                        onClick={() => onSelectMovie(movie)}
                        style={{
                          background: 'rgba(0, 242, 254, 0.08)',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          borderRadius: '12px',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=100'}
                            alt={movie.title}
                            style={{ width: '36px', height: '50px', objectFit: 'cover', borderRadius: '6px' }}
                          />
                          <div>
                            <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#fff', margin: '0 0 2px' }}>
                              {movie.title}
                            </h4>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                              {movie.duration} phút • {movie.status === 'NOW_SHOWING' ? '🔥 Đang Chiếu' : '⏳ Sắp Chiếu'}
                            </span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#00f2fe', fontSize: '11px', fontWeight: '700' }}>
                          <span>Xem &amp; Đặt Vé</span>
                          <ChevronRight size={14} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '3px', padding: '0 4px' }}>
                  {m.timestamp}
                </span>
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00f2fe', fontSize: '12px', padding: '6px' }}>
                <Sparkles size={14} className="animate-spin" />
                <span>CINEVERSE AI đang soạn câu trả lời...</span>
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
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(0, 0, 0, 0.2)',
            }}
          >
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(qp.prompt)}
                disabled={loading}
                style={{
                  whiteSpace: 'nowrap',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '5px 10px',
                  color: '#cbd5e1',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{
              padding: '12px 16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.3)',
            }}
          >
            <input
              type="text"
              placeholder="Nhập câu hỏi cho CINEVERSE AI..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                padding: '10px 14px',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              style={{
                background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
                border: 'none',
                color: '#000',
                borderRadius: '12px',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: loading || !inputMessage.trim() ? 'not-allowed' : 'pointer',
                opacity: loading || !inputMessage.trim() ? 0.5 : 1,
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
