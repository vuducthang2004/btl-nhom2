import React from 'react';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  className = '',
  style = {} 
}) => {
  const baseStyle = {
    padding: '12px 20px',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: (loading || disabled) ? 'not-allowed' : 'pointer',
    border: 'none',
    transition: 'all 0.2s ease',
    opacity: (loading || disabled) ? 0.7 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    ...style
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--color-primary)',
      color: '#fff',
      boxShadow: 'var(--shadow-sm)',
    },
    danger: {
      backgroundColor: 'var(--color-error)',
      color: '#fff',
    },
    outline: {
      backgroundColor: 'transparent',
      border: '1px solid var(--color-border)',
      color: 'var(--color-text-main)',
    },
    text: {
      backgroundColor: 'transparent',
      color: 'var(--color-primary)',
      padding: '8px 12px',
    }
  };

  return (
    <button 
      type={type} 
      onClick={onClick} 
      disabled={disabled || loading}
      style={{ ...baseStyle, ...variants[variant] }}
      className={className}
    >
      {loading && <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />}
      {children}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        button:not(:disabled):hover { filter: brightness(0.9); transform: translateY(-1px); }
        button:not(:disabled):active { transform: translateY(0); }
      `}</style>
    </button>
  );
};

export default Button;
