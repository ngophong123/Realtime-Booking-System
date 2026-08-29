import React, { useState } from 'react';

interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'outline-primary';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const RippleButton: React.FC<RippleButtonProps> = ({
  variant = 'primary',
  loading = false,
  loadingText,
  children,
  className = '',
  onClick,
  disabled,
  style,
  ...props
}) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 500);

    if (onClick && !loading && !disabled) {
      onClick(e);
    }
  };

  const getVariantClass = () => {
    switch (variant) {
      case 'outline':
        return 'btn-outline';
      case 'outline-primary':
        return 'btn-outline-primary';
      default:
        return 'btn-primary';
    }
  };

  return (
    <button
      className={`${getVariantClass()} ${className}`}
      onClick={handleClick}
      disabled={disabled || loading}
      style={{ ...style }}
      {...props}
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className={`ripple ${variant === 'outline' ? 'ripple-dark' : ''}`}
          style={{
            left: `${ripple.x}px`,
            top: `${ripple.y}px`,
            width: '100px',
            height: '100px',
          }}
        />
      ))}

      {loading ? (
        <>
          <span
            style={{
              width: '14px',
              height: '14px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: '#FFFFFF',
              borderRadius: '50%',
              display: 'inline-block',
              animation: 'spin 0.6s linear infinite',
            }}
          />
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
